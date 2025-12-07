import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import type { Client } from '@prisma/client';

type TenantKey = string; // par ex: client.code ou client.id

@Injectable()
export class PrismaMultiTenantService implements OnModuleDestroy {
  private clients = new Map<TenantKey, PrismaClient>();

  async getClientForTenant(client: Client): Promise<PrismaClient> {
    const key: TenantKey = client.code; // ou `${client.id}`

    if (this.clients.has(key)) {
      return this.clients.get(key)!;
    }

    // ⚠️ À adapter : ici tu reconstruis un DATABASE_URL à partir des champs du client
    const dbName = client.dbName ?? `directtransfair_${client.code.toLowerCase()}`;
    const dbHost = client.dbHost ?? 'localhost';
    const dbPort = client.dbPort ?? 5432;
    const dbUser = client.dbUser ?? 'postgres';
    const dbPass = process.env.DIRECTTRANSFAIR_TENANT_DB_PASSWORD ?? '';

    const url = `postgresql://${dbUser}:${dbPass}@${dbHost}:${dbPort}/${dbName}?schema=public`;

    const prisma = new PrismaClient({
      datasources: {
        db: { url },
      },
    });

    this.clients.set(key, prisma);
    return prisma;
  }

  async onModuleDestroy() {
    for (const prisma of this.clients.values()) {
      await prisma.$disconnect();
    }
  }
}
