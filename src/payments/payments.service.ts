//apps/backend/src/payments/payments.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { OrangeMoneyService } from './orange-money.service';
import { SendwaveService } from './sendwave.service';
import { PaymentMethod } from '@prisma/client';

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private om: OrangeMoneyService,
    private sendwave: SendwaveService,
  ) {}

  async initiate(dto: InitiatePaymentDto) {
    const tx = await this.prisma.transaction.findUnique({
      where: { id: dto.transactionId },
    });

    if (!tx) throw new NotFoundException('Transaction not found');

    switch (dto.paymentMethod) {
      case PaymentMethod.WALLET:
        return this.handleWallet(tx.id);

      case PaymentMethod.ORANGE_MONEY:
        return this.om.initiate(tx);

      case PaymentMethod.SENDWAVE:
        return this.sendwave.initiate(tx);

      default:
        throw new Error('Unsupported payment method');
    }
  }

  private async handleWallet(id: string) {
    return this.prisma.transaction.update({
      where: { id },
      data: {
        status: 'PAID',
        paidAt: new Date(),
        provider: 'DIRECT',
        providerRef: null,
      },
    });
  }
}
