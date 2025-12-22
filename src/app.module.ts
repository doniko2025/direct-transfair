// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { ClientsModule } from './clients/clients.module';
import { TenantsModule } from './tenants/tenants.module';
import { AuthModule } from './auth/auth.module';
import { BeneficiariesModule } from './beneficiaries/beneficiaries.module';
import { TransactionsModule } from './transactions/transactions.module';

// ✅ Ajouts
import { PaymentsModule } from './payments/payments.module';
import { WithdrawalsModule } from './withdrawals/withdrawals.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UsersModule,
    ClientsModule,
    TenantsModule,
    AuthModule,
    BeneficiariesModule,
    TransactionsModule,

    // ✅ new
    PaymentsModule,
    WithdrawalsModule,
  ],
})
export class AppModule {}
