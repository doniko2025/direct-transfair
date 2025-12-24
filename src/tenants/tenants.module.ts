// apps/backend/src/tenants/tenants.module.ts
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { ClientsModule } from '../clients/clients.module';

import { TenantMiddleware } from './tenant.middleware';
import { TenantService } from './tenant.service';
import { TenantResolverService } from './tenant-resolver.service';
import { TenantGuard } from './tenant.guard';

@Module({
  imports: [
    PrismaModule,
    ClientsModule,
  ],
  providers: [
    TenantService,
    TenantResolverService,
    TenantGuard,
  ],
  exports: [
    TenantService,
    TenantResolverService,
    TenantGuard,
  ],
})
export class TenantsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantMiddleware).forRoutes('*');
  }
}
