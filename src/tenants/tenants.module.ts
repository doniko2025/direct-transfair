// src/tenants/tenants.module.ts
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { ClientsModule } from '../clients/clients.module';
import { TenantMiddleware } from './tenant.middleware';
import { TenantService } from './tenant.service';

@Module({
  imports: [ClientsModule],
  providers: [TenantService],
  exports: [TenantService],
})
export class TenantsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // On applique le middleware sur toutes les routes
    consumer.apply(TenantMiddleware).forRoutes('*');
  }
}
