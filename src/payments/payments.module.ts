//apps/backend/src/payments/payments.module.ts
import { Module } from '@nestjs/common';

// Core services
import { PrismaService } from '../prisma/prisma.service';

// Payments
import { PaymentsController } from './controller/payments.controller';
import { PaymentsService } from './payments.service';
import { OrangeMoneyService } from './orange-money.service';
import { SendwaveService } from './sendwave.service';

// Transactions (needed to update payment results)
import { TransactionsService } from '../transactions/transactions.service';

@Module({
  controllers: [PaymentsController],
  providers: [
    PrismaService,
    PaymentsService,
    OrangeMoneyService,
    SendwaveService,
    TransactionsService,
  ],
  exports: [PaymentsService],
})
export class PaymentsModule {}
