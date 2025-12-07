//apps/backend/src/payments/sendwave.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Transaction } from '@prisma/client';

@Injectable()
export class SendwaveService {
  constructor(private prisma: PrismaService) {}

  async initiate(tx: Transaction) {
    const providerRef = 'SW_' + Math.floor(100000 + Math.random() * 900000);

    await this.prisma.transaction.update({
      where: { id: tx.id },
      data: {
        provider: 'SENDWAVE',
        providerRef,
        status: 'PENDING',
      },
    });

    return {
      status: 'WAITING_USER_PAYMENT',
      message: "Payez via Sendwave puis communiquez le code à l'admin.",
      providerRef,
    };
  }
}
