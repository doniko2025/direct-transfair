// apps/backend/src/payments/payments.service.ts
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { OrangeMoneyService } from './orange-money.service';
import { SendwaveService } from './sendwave.service';
import {
  PaymentMethod,
  PaymentProvider,
  ProviderStatus,
  TransactionStatus,
} from '@prisma/client';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly om: OrangeMoneyService,
    private readonly sendwave: SendwaveService,
  ) {}

  async initiate(clientId: number, userId: string, dto: InitiatePaymentDto) {
    const transactionId = String(dto.transactionId ?? '').trim();
    if (!transactionId) throw new BadRequestException('transactionId manquant');

    const txLite = await this.prisma.transaction.findFirst({
      where: { id: transactionId, clientId },
      select: { id: true, senderId: true, status: true },
    });

    if (!txLite) throw new NotFoundException('Transaction not found');
    if (txLite.senderId !== userId) {
      throw new ForbiddenException('Transaction does not belong to this user');
    }

    // ✅ Compat : on accepte paymentMethod (nouveau) OU method (ancien)
    const method = dto.paymentMethod ?? dto.method;
    if (!method) {
      throw new BadRequestException('paymentMethod/method manquant');
    }

    switch (method) {
      case PaymentMethod.WALLET:
        return this.handleWallet(txLite.id);

      case PaymentMethod.ORANGE_MONEY: {
        const tx = await this.prisma.transaction.findUniqueOrThrow({
          where: { id: txLite.id },
        });
        return this.om.initiate(tx);
      }

      case PaymentMethod.SENDWAVE: {
        const tx = await this.prisma.transaction.findUniqueOrThrow({
          where: { id: txLite.id },
        });
        return this.sendwave.initiate(tx);
      }

      case PaymentMethod.CARD:
      default:
        throw new BadRequestException('Unsupported payment method');
    }
  }

  async status(clientId: number, userId: string, transactionId: string) {
    const id = String(transactionId ?? '').trim();
    if (!id) throw new BadRequestException('transactionId invalide');

    const tx = await this.prisma.transaction.findFirst({
      where: { id, clientId },
      select: {
        id: true,
        reference: true,
        status: true,
        paymentMethod: true,
        provider: true,
        providerRef: true,
        providerStatus: true,
        paidAt: true,
        cancelledAt: true,
        senderId: true,
        total: true,
        currency: true,
      },
    });

    if (!tx) throw new NotFoundException('Transaction not found');
    if (tx.senderId !== userId) {
      throw new ForbiddenException('Transaction does not belong to this user');
    }

    return tx;
  }

  private async handleWallet(id: string) {
    return this.prisma.transaction.update({
      where: { id },
      data: {
        status: TransactionStatus.PAID,
        paidAt: new Date(),
        paymentMethod: PaymentMethod.WALLET,
        provider: PaymentProvider.DIRECT,
        providerRef: null,
        providerStatus: ProviderStatus.SUCCESS,
      },
      select: {
        id: true,
        status: true,
        paymentMethod: true,
        provider: true,
        providerRef: true,
        providerStatus: true,
        paidAt: true,
      },
    });
  }
}
