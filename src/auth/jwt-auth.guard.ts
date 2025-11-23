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

type AuthenticatedRequest = Request & { user?: AuthUserPayload };

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const rawHeader = req.headers.authorization ?? req.headers.Authorization;

    if (!rawHeader || Array.isArray(rawHeader)) {
      throw new UnauthorizedException('Missing Authorization header');
    }

    const header = rawHeader.trim();
    let token: string | undefined;

    // 1) Cas normal: "Bearer <token>"
    if (header.toLowerCase().startsWith('bearer ')) {
      token = header.slice(7).trim();
    } else {
      // 2) Cas toléré: "<token>" tout seul (comme dans ton script admin)
      token = header;
    }

    if (!token) {
      throw new UnauthorizedException('Invalid Authorization header');
    }

    try {
      const payload = this.jwt.verify<AuthUserPayload>(token);
      // On pose le payload sur req.user pour les contrôleurs
      req.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
