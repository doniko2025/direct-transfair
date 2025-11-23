// apps/backend/src/auth/auth.service.ts
// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';

import { UsersService } from '../users/users.service';
import { hashPassword, comparePassword } from '../common/password';
import { RegisterDto, type UserRole } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
  ) {}

  // ---------- Enregistrement USER (/auth/register) ----------
  async registerUser(
    dto: RegisterDto,
  ): Promise<{ message: string; user: User }> {
    return this.registerWithRole(dto.email, dto.password, 'USER');
  }

  // ---------- Enregistrement ADMIN (/auth/register-admin) ----------
  async registerAdmin(
    dto: RegisterDto,
  ): Promise<{ message: string; user: User }> {
    return this.registerWithRole(dto.email, dto.password, 'ADMIN');
  }

  // ---------- Méthode interne commune ----------
  private async registerWithRole(
    email: string,
    password: string,
    role: UserRole,
  ): Promise<{ message: string; user: User }> {
    const existing = await this.users.findByEmail(email);
    if (existing) {
      // On garde pour l’instant le même type d’erreur qu’avant
      throw new UnauthorizedException('Email already used');
    }

    const hashed = await hashPassword(password);
    const user = await this.users.create(email, hashed, role);

    const message = role === 'ADMIN' ? 'Admin created' : 'User created';
    return { message, user };
  }

  // ---------- Validation des identifiants ----------
  private async validateUser(
    email: string,
    password: string,
  ): Promise<User | null> {
    const user = await this.users.findByEmail(email);
    if (!user) {
      return null;
    }

    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      return null;
    }

    return user;
  }

  // ---------- Login ----------
  async login(dto: LoginDto): Promise<{ access_token: string }> {
    const user = await this.validateUser(dto.email, dto.password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.jwt.signAsync(payload);
    return { access_token: accessToken };
  }
}
