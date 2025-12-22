// apps/backend/src/payments/payments.module.ts
import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { TenancyService } from '../common/tenancy/tenancy.service';
import { OrangeMoneyService } from './orange-money.service';
import { SendwaveService } from './sendwave.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, TenancyService, OrangeMoneyService, SendwaveService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
