//apps/backend/src/payments/orange-money.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Transaction } from '@prisma/client';
import { randomUUID } from 'crypto';

@Injectable()
export class OrangeMoneyService {
  constructor(private prisma: PrismaService) {}

  async initiate(tx: Transaction) {
    const providerRef = 'OM_' + randomUUID().slice(0, 8).toUpperCase();

    await this.prisma.transaction.update({
      where: { id: tx.id },
      data: {
        provider: 'ORANGE_MONEY',
        providerRef,
        status: 'PENDING',
      },
    });

    setTimeout(async () => {
      await this.prisma.transaction.update({
        where: { id: tx.id },
        data: {
          status: 'PAID',
          paidAt: new Date(),
        },
      });
    }, 2000);

    return {
      provider: 'ORANGE_MONEY',
      providerRef,
      status: 'PENDING',
    };
  }
}
