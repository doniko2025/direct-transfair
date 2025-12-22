// apps/backend/src/auth/jwt-auth.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import type { AuthUserPayload } from './types/auth-user-payload.type';

type JwtPayloadLike = {
  sub?: string;
  id?: string;
  userId?: string;
  email?: string;
  role?: string;
};

type AuthenticatedRequest = Request & {
  user?: AuthUserPayload;
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();

    // Express normalise en minuscules : "authorization"
    const rawHeader = req.headers['authorization'];

    if (!rawHeader || Array.isArray(rawHeader)) {
      throw new UnauthorizedException('Missing Authorization header');
    }

    const header = String(rawHeader).trim();

    // Supporte "Bearer <token>" ou "<token>"
    const token = header.toLowerCase().startsWith('bearer ')
      ? header.slice(7).trim()
      : header;

    if (!token) {
      throw new UnauthorizedException('Invalid Authorization header');
    }

    try {
      const payload = this.jwt.verify<JwtPayloadLike>(token);

      const id = payload.sub ?? payload.id ?? payload.userId;
      if (!id) throw new UnauthorizedException('Invalid token payload');

      // IMPORTANT : id + sub pour compat
      req.user = {
        id,
        sub: id,
        email: payload.email,
        role: payload.role,
      };

      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
