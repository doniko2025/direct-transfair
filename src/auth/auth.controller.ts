// apps/backend/src/auth/auth.controller.ts
import {
  Body,
  Controller,
  Post,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { PrismaService } from '../prisma/prisma.service';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly prisma: PrismaService,
  ) {}

  // ---------------------------------------------------------
  // 🔧 UTIL: convertit x-tenant-id en véritable clientId
  // ---------------------------------------------------------
  private async resolveClientId(headerValue: unknown): Promise<number> {
    if (headerValue === undefined || headerValue === null) {
      throw new BadRequestException('Missing x-tenant-id header');
    }

    const raw = String(headerValue).trim();
    if (!raw) {
      throw new BadRequestException('Missing x-tenant-id header');
    }

    // 1️⃣ Si c'est un nombre → ID direct
    if (/^\d+$/.test(raw)) {
      const id = Number(raw);
      if (!Number.isFinite(id) || id <= 0) {
        throw new BadRequestException('Invalid tenant id');
      }
      return id;
    }

    // 2️⃣ Sinon → c'est un CODE client (ex: DONIKO)
    const client = await this.prisma.client.findUnique({
      where: { code: raw },
    });

    if (!client) {
      throw new BadRequestException(`Unknown tenant code: ${raw}`);
    }

    return client.id;
  }

  // ---------------------------------------------------------
  // 🔹 REGISTER (USER)
  // ---------------------------------------------------------
  @ApiHeader({
    name: 'x-tenant-id',
    description: 'Tenant identifier (ex: DONIKO or 1)',
    required: true,
  })
  @Post('register')
  async register(@Req() req: Request, @Body() dto: RegisterDto) {
    const clientId = await this.resolveClientId(req.headers['x-tenant-id']);
    return this.authService.registerUser(dto, clientId);
  }

  // ---------------------------------------------------------
  // 🔹 REGISTER (ADMIN)
  // ---------------------------------------------------------
  @ApiHeader({
    name: 'x-tenant-id',
    description: 'Tenant identifier (ex: DONIKO or 1)',
    required: true,
  })
  @Post('register-admin')
  async registerAdmin(@Req() req: Request, @Body() dto: RegisterDto) {
    const clientId = await this.resolveClientId(req.headers['x-tenant-id']);
    return this.authService.registerAdmin(dto, clientId);
  }

  // ---------------------------------------------------------
  // 🔹 LOGIN
  // - Si x-tenant-id est présent, on vérifie l'isolation tenant.
  // - Sinon, on reste compatible (utile pour tests rapides).
  // ---------------------------------------------------------
  @Post('login')
  async login(@Req() req: Request, @Body() dto: LoginDto) {
    const header = req.headers['x-tenant-id'];
    const clientId = header ? await this.resolveClientId(header) : undefined;

    return this.authService.login(dto, clientId);
  }
}
