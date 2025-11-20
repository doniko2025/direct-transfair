// apps/backend/src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { hashPassword, comparePassword } from '../common/password';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
  ) {}

  async register(
    email: string,
    password: string,
  ): Promise<{ message: string; user: User }> {
    const existing = await this.users.findByEmail(email);
    if (existing) {
      throw new UnauthorizedException('Email already used');
    }

    const hashed = await hashPassword(password);
    const user = await this.users.create(email, hashed);

    return {
      message: 'User created',
      user,
    };
  }

  async login(
    email: string,
    password: string,
  ): Promise<{ access_token: string }> {
    const user = await this.users.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await comparePassword(password, user.password);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Payload JWT
    const tokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const token = await this.jwt.signAsync(tokenPayload);

    return { access_token: token };
  }
}
