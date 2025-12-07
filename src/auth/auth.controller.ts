//apps/backend/src/auth/auth.controller.ts
// apps/backend/src/auth/auth.controller.ts
import { Body, Controller, Post, Req, BadRequestException } from '@nestjs/common';
import { ApiHeader, ApiTags } from '@nestjs/swagger';

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
  private async resolveClientId(header: any): Promise<number> {
    if (!header) {
      throw new BadRequestException('Missing x-tenant-id header');
    }

    const raw = String(header).trim();

    // 1️⃣ Si c'est un nombre → ID direct
    if (!isNaN(Number(raw))) {
      return Number(raw);
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
  async register(@Req() req, @Body() dto: RegisterDto) {
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
  async registerAdmin(@Req() req, @Body() dto: RegisterDto) {
    const clientId = await this.resolveClientId(req.headers['x-tenant-id']);
    return this.authService.registerAdmin(dto, clientId);
  }

  // ---------------------------------------------------------
  // 🔹 LOGIN
  // ---------------------------------------------------------
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
