// apps/backend/src/prisma/prisma-multitenant.service.ts
import { Injectable } from '@nestjs/common';
import type { Client } from '@prisma/client';
import { PrismaService } from './prisma.service';

@Injectable()
export class PrismaMultiTenantService {
  constructor(private readonly prisma: PrismaService) {}

  // Mono-DB: même Prisma pour tous les tenants
  async getClientForTenant(_client: Client): Promise<PrismaService> {
    return this.prisma;
  }
}
