// apps/backend/src/auth/auth.service.ts
// apps/backend/src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { User } from '@prisma/client';

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

  // ---------------------------------------------------------
  // 🔹 REGISTER USER
  // ---------------------------------------------------------
  async registerUser(
    dto: RegisterDto,
    clientId: number,
  ): Promise<{ message: string; user: User }> {
    return this.registerWithRole(dto, 'USER', clientId);
  }

  // ---------------------------------------------------------
  // 🔹 REGISTER ADMIN
  // ---------------------------------------------------------
  async registerAdmin(
    dto: RegisterDto,
    clientId: number,
  ): Promise<{ message: string; user: User }> {
    return this.registerWithRole(dto, 'ADMIN', clientId);
  }

  // ---------------------------------------------------------
  // 🔹 Méthode interne commune
  // ---------------------------------------------------------
  private async registerWithRole(
    dto: RegisterDto,
    role: UserRole,
    clientId: number,
  ): Promise<{ message: string; user: User }> {
    const existing = await this.users.findByEmail(dto.email);
    if (existing) {
      throw new UnauthorizedException('Email already used');
    }

    const hashed = await hashPassword(dto.password);

    const user = await this.users.create(
      dto.email,
      hashed,
      role,
      clientId,
      {
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        addressNumber: dto.addressNumber,
        addressStreet: dto.addressStreet,
        postalCode: dto.postalCode,
        city: dto.city,
        country: dto.country,
        nationality: dto.nationality,
        birthDate: dto.birthDate,
        birthPlace: dto.birthPlace,
      },
    );

    const message = role === 'ADMIN' ? 'Admin created' : 'User created';
    return { message, user };
  }

  // ---------------------------------------------------------
  // 🔹 VALIDATE USER (login)
  // ---------------------------------------------------------
  private async validateUser(
    email: string,
    password: string,
  ): Promise<User | null> {
    const user = await this.users.findByEmail(email);
    if (!user) return null;

    const valid = await comparePassword(password, user.password);
    if (!valid) return null;

    return user;
  }

  // ---------------------------------------------------------
  // 🔹 LOGIN
  // ---------------------------------------------------------
  async login(dto: LoginDto): Promise<{ access_token: string }> {
    const user = await this.validateUser(dto.email, dto.password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      clientId: user.clientId,
    };

    const accessToken = await this.jwt.signAsync(payload);
    return { access_token: accessToken };
  }
}
