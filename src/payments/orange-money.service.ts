//apps/backend/src/payments/orange-money.service.ts
// apps/backend/src/payments/orange-money.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentMethod, PaymentProvider, ProviderStatus, Transaction, TransactionStatus } from '@prisma/client';
import { randomUUID } from 'crypto';

@Injectable()
export class OrangeMoneyService {
  constructor(private readonly prisma: PrismaService) {}

  async initiate(tx: Transaction) {
    const providerRef = 'OM_' + randomUUID().slice(0, 8).toUpperCase();

    await this.prisma.transaction.update({
      where: { id: tx.id },
      data: {
        paymentMethod: PaymentMethod.ORANGE_MONEY,
        provider: PaymentProvider.ORANGE_MONEY,
        providerRef,
        providerStatus: ProviderStatus.PENDING,
        status: TransactionStatus.PENDING,
      },
    });

    // Mock succès
    setTimeout(() => {
      void this.prisma.transaction
        .update({
          where: { id: tx.id },
          data: {
            status: TransactionStatus.PAID,
            paidAt: new Date(),
            providerStatus: ProviderStatus.SUCCESS,
          },
        })
        .catch(() => {});
    }, 2000);

    return { provider: 'ORANGE_MONEY', providerRef, status: 'PENDING' };
  }
}
