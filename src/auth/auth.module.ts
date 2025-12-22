// apps/backend/src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';

import { UsersModule } from '../users/users.module';
import { TenantsModule } from '../tenants/tenants.module';
import { PrismaModule } from '../prisma/prisma.module';

function parseExpiresToSeconds(raw: unknown): number {
  // Accept: number, "86400", "15m", "12h", "1d"
  if (typeof raw === 'number' && Number.isFinite(raw) && raw > 0) return raw;

  const s = String(raw ?? '').trim();
  if (!s) return 86400;

  if (/^\d+$/.test(s)) {
    const n = Number(s);
    return Number.isFinite(n) && n > 0 ? n : 86400;
  }

  const m = /^(\d+)\s*([smhd])$/i.exec(s);
  if (!m) return 86400;

  const qty = Number(m[1]);
  const unit = m[2].toLowerCase();

  if (!Number.isFinite(qty) || qty <= 0) return 86400;

  switch (unit) {
    case 's':
      return qty;
    case 'm':
      return qty * 60;
    case 'h':
      return qty * 3600;
    case 'd':
      return qty * 86400;
    default:
      return 86400;
  }
}

@Module({
  imports: [
    PassportModule,
    UsersModule,
    TenantsModule,
    ConfigModule,
    PrismaModule,

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const secret = config.get<string>('JWT_SECRET') ?? '';
        const expiresRaw = config.get<string>('JWT_EXPIRES_IN') ?? '1d';
        const expiresIn = parseExpiresToSeconds(expiresRaw);

        return {
          secret,
          signOptions: { expiresIn },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtModule, PassportModule],
})
export class AuthModule {}
