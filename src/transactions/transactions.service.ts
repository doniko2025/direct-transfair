// src/transactions/transactions.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import {
  Prisma,
  Transaction,
  TransactionStatus,
  PayoutMethod,
} from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionStatusDto } from './dto/update-transaction-status.dto';

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  // Création de transaction côté USER
  async create(
    senderId: string,
    dto: CreateTransactionDto,
  ): Promise<Transaction> {
    const user = await this.prisma.user.findUnique({
      where: { id: senderId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const clientId = user.clientId;

    const beneficiary = await this.prisma.beneficiary.findFirst({
      where: {
        id: dto.beneficiaryId,
        userId: senderId,
      },
    });

    if (!beneficiary) {
      throw new NotFoundException(
        'Beneficiary not found for this user',
      );
    }

    if (beneficiary.clientId !== clientId) {
      throw new ForbiddenException(
        'Beneficiary does not belong to this client',
      );
    }

    const amount = new Prisma.Decimal(dto.amount);
    const fees = amount.mul(new Prisma.Decimal(0.03));
    const total = amount.plus(fees);
    const reference = this.generateReference();

    const data = {
      reference,
      amount,
      fees,
      total,
      currency: dto.currency,
      payoutMethod: dto.payoutMethod ?? PayoutMethod.CASH_PICKUP,
      status: TransactionStatus.PENDING,
      senderId,
      beneficiaryId: beneficiary.id,
      clientId,
    } as any;

    return this.prisma.transaction.create({ data });
  }

  async findForUser(senderId: string): Promise<Transaction[]> {
    return this.prisma.transaction.findMany({
      where: { senderId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneForUser(
    id: string,
    senderId: string,
  ): Promise<Transaction> {
    const tx = await this.prisma.transaction.findFirst({
      where: { id, senderId },
    });

    if (!tx) {
      throw new NotFoundException('Transaction not found');
    }

    return tx;
  }

  async adminFindAllForAdmin(adminId: string): Promise<Transaction[]> {
    const admin = await this.prisma.user.findUnique({
      where: { id: adminId },
    });

    if (!admin) {
      throw new NotFoundException('Admin user not found');
    }

    return this.prisma.transaction.findMany({
      where: { clientId: admin.clientId } as any,
      orderBy: { createdAt: 'desc' },
      include: {
        sender: true,
        beneficiary: true,
        client: true,
      },
    });
  }

  async adminUpdateStatusForAdmin(
    adminId: string,
    id: string,
    dto: UpdateTransactionStatusDto,
  ): Promise<Transaction> {
    const admin = await this.prisma.user.findUnique({
      where: { id: adminId },
    });

    if (!admin) {
      throw new NotFoundException('Admin user not found');
    }

    const tx = await this.prisma.transaction.findFirst({
      where: {
        id,
        clientId: admin.clientId,
      } as any,
    });

    if (!tx) {
      throw new NotFoundException('Transaction not found');
    }

    const data: Prisma.TransactionUpdateInput = {
      status: dto.status,
    } as any;

    if (dto.status === TransactionStatus.PAID) {
      (data as any).paidAt = new Date();
      (data as any).cancelledAt = null;
    } else if (dto.status === TransactionStatus.CANCELLED) {
      (data as any).cancelledAt = new Date();
      (data as any).paidAt = null;
    } else {
      (data as any).paidAt = null;
      (data as any).cancelledAt = null;
    }

    return this.prisma.transaction.update({
      where: { id },
      data,
    });
  }

  private generateReference(): string {
    const now = Date.now();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `TX-${now}-${random}`;
  }
}
