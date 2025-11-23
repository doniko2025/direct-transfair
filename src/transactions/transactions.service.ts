// src/transactions/transactions.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Transaction, TransactionStatus, PayoutMethod } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionStatusDto } from './dto/update-transaction-status.dto';

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  // Création côté USER
  async create(senderId: string, dto: CreateTransactionDto): Promise<Transaction> {
    const amount = new Prisma.Decimal(dto.amount);
    const fees = amount.mul(new Prisma.Decimal(0.03)); // 3 %
    const total = amount.plus(fees);

    const reference = this.generateReference();

    return this.prisma.transaction.create({
      data: {
        reference,
        amount,
        fees,
        total,
        currency: dto.currency,
        payoutMethod: dto.payoutMethod ?? PayoutMethod.CASH_PICKUP,
        status: TransactionStatus.PENDING,
        sender: {
          connect: { id: senderId },
        },
        beneficiary: {
          connect: { id: dto.beneficiaryId },
        },
      },
    });
  }

  // Liste des transactions de l'utilisateur
  async findForUser(senderId: string): Promise<Transaction[]> {
    return this.prisma.transaction.findMany({
      where: { senderId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneForUser(id: string, senderId: string): Promise<Transaction> {
    const tx = await this.prisma.transaction.findFirst({
      where: { id, senderId },
    });

    if (!tx) {
      throw new NotFoundException('Transaction not found');
    }

    return tx;
  }

  // ---------- ADMIN ----------

  async adminFindAll(): Promise<Transaction[]> {
    return this.prisma.transaction.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        sender: true,
        beneficiary: true,
      },
    });
  }

  async adminUpdateStatus(
    id: string,
    dto: UpdateTransactionStatusDto,
  ): Promise<Transaction> {
    const tx = await this.prisma.transaction.findUnique({ where: { id } });

    if (!tx) {
      throw new NotFoundException('Transaction not found');
    }

    const data: Prisma.TransactionUpdateInput = {
      status: dto.status,
    };

    // gestion paidAt / cancelledAt
    if (dto.status === TransactionStatus.PAID) {
      data.paidAt = new Date();
      data.cancelledAt = null;
    } else if (dto.status === TransactionStatus.CANCELLED) {
      data.cancelledAt = new Date();
      data.paidAt = null;
    } else {
      // autres statuts : on reset les dates
      data.paidAt = null;
      data.cancelledAt = null;
    }

    return this.prisma.transaction.update({
      where: { id },
      data,
    });
  }

  // ---------- helpers ----------

  private generateReference(): string {
    const now = Date.now();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `TX-${now}-${random}`;
  }
}
