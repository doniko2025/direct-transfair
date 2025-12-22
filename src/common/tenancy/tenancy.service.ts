// apps/backend/src/common/tenancy/tenancy.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TenancyService {
  constructor(private readonly prisma: PrismaService) {}

  async resolveClientId(req: Request): Promise<number> {
    const raw =
      (req.headers['x-tenant-id'] as string | undefined) ??
      (req.headers['X-Tenant-Id'] as string | undefined);

    const code = String(raw ?? '').trim().toUpperCase();
    if (!code) {
      throw new BadRequestException('Header x-tenant-id manquant (ex: DONIKO)');
    }

    const client = await this.prisma.client.findUnique({
      where: { code },
      select: { id: true },
    });

    if (!client) {
      throw new NotFoundException(`Tenant inconnu: ${code}`);
    }

    return client.id; // ✅ number (Client.id est Int)
  }
}
