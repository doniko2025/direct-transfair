//apps/backend/src/transactions/transactions.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionStatusDto } from './dto/update-transaction-status.dto';
import { TransactionStatus } from '@prisma/client';

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateTransactionDto) {
    const reference = `TX-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    const fees = dto.amount * 0.02;
    const total = dto.amount + fees;

    return this.prisma.transaction.create({
      data: {
        reference,
        amount: dto.amount,
        fees,
        total,
        currency: dto.currency,
        payoutMethod: dto.payoutMethod,
        senderId: userId,
        beneficiaryId: dto.beneficiaryId,
      },
      include: { beneficiary: true },
    });
  }

  async findAllForUser(userId: string) {
    return this.prisma.transaction.findMany({
      where: { senderId: userId },
      orderBy: { createdAt: 'desc' },
      include: { beneficiary: true },
    });
  }

  async findOneForUser(userId: string, id: string) {
    const tx = await this.prisma.transaction.findUnique({
      where: { id },
      include: { beneficiary: true },
    });

    if (!tx) {
      throw new NotFoundException('Transaction not found');
    }

    if (tx.senderId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return tx;
  }

  async adminFindAll() {
    return this.prisma.transaction.findMany({
      orderBy: { createdAt: 'desc' },
      include: { sender: true, beneficiary: true },
    });
  }

  async adminUpdateStatus(id: string, dto: UpdateTransactionStatusDto) {
    const tx = await this.prisma.transaction.findUnique({ where: { id } });

    if (!tx) {
      throw new NotFoundException('Transaction not found');
    }

    return this.prisma.transaction.update({
      where: { id },
      data: {
        status: dto.status,
        paidAt: dto.status === TransactionStatus.PAID ? new Date() : null,
        cancelledAt:
          dto.status === TransactionStatus.CANCELLED ? new Date() : null,
      },
    });
  }
}
