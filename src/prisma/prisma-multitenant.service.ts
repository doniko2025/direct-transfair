// apps/backend/src/prisma/prisma-multitenant.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import type { TenantContext } from '../tenants/tenant-context';

@Injectable()
export class PrismaMultiTenantService {
  constructor(private readonly prisma: PrismaService) {}

  getPrisma(ctx: TenantContext): PrismaService {
    // Phase 1 : DB unique
    return this.prisma;
  }
}
