//apps/backend/src/payments/sendwave.service.ts
// apps/backend/src/payments/sendwave.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentMethod, PaymentProvider, ProviderStatus, Transaction, TransactionStatus } from '@prisma/client';

@Injectable()
export class SendwaveService {
  constructor(private readonly prisma: PrismaService) {}

  async initiate(tx: Transaction) {
    const providerRef = 'SW_' + Math.floor(100000 + Math.random() * 900000);

    await this.prisma.transaction.update({
      where: { id: tx.id },
      data: {
        paymentMethod: PaymentMethod.SENDWAVE,
        provider: PaymentProvider.SENDWAVE,
        providerRef,
        providerStatus: ProviderStatus.PENDING,
        status: TransactionStatus.PENDING,
      },
    });

    return {
      status: 'WAITING_USER_PAYMENT',
      message: "Payez via Sendwave puis communiquez le code à l'admin.",
      providerRef,
    };
  }
}
