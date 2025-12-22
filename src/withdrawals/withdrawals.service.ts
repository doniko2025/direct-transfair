// apps/backend/src/withdrawals/withdrawals.service.ts
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';
import { UpdateWithdrawalStatusDto } from './dto/update-withdrawal-status.dto';
import { WithdrawalStatus } from '@prisma/client';

const TERMINAL_WITHDRAWAL: WithdrawalStatus[] = ['PAID', 'REJECTED'];

function assertTransition(from: WithdrawalStatus, to: WithdrawalStatus) {
  if (from === to) return;

  if (TERMINAL_WITHDRAWAL.includes(from)) {
    throw new BadRequestException(`Transition interdite: ${from} -> ${to}`);
  }

  const allowed: Record<WithdrawalStatus, WithdrawalStatus[]> = {
    PENDING: ['APPROVED', 'REJECTED'],
    APPROVED: ['PAID', 'REJECTED'],
    PAID: [],
    REJECTED: [],
  };

  if (!allowed[from].includes(to)) {
    throw new BadRequestException(`Transition interdite: ${from} -> ${to}`);
  }
}

@Injectable()
export class WithdrawalsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * USER — créer un retrait
   * Règle stricte: retrait autorisé uniquement si transaction PAID
   */
  async create(clientId: number, userId: string, dto: CreateWithdrawalDto) {
    const tx = await this.prisma.transaction.findFirst({
      where: {
        id: dto.transactionId,
        clientId,
      },
      select: {
        id: true,
        senderId: true,
        status: true,
        payoutMethod: true,
      },
    });

    if (!tx) throw new NotFoundException('Transaction introuvable');
    if (tx.senderId !== userId) {
      throw new ForbiddenException('Transaction non appartenant à l’utilisateur');
    }
    if (tx.status !== 'PAID') {
      throw new BadRequestException(`Retrait interdit: transaction status=${tx.status} (attendu: PAID)`);
    }

    const exists = await this.prisma.withdrawal.findFirst({
      where: { clientId, transactionId: tx.id },
      select: { id: true },
    });
    if (exists) throw new ConflictException('Un retrait existe déjà pour cette transaction');

    return this.prisma.withdrawal.create({
      data: {
        clientId,
        transactionId: tx.id,
        method: dto.method ?? tx.payoutMethod,
        status: 'PENDING',
      },
      select: {
        id: true,
        status: true,
        requestedAt: true,
        processedAt: true,
        processedById: true,
        transactionId: true,
        method: true,
      },
    });
  }

  /**
   * USER — mes retraits (via transaction.senderId)
   */
  async listMine(clientId: number, userId: string) {
    return this.prisma.withdrawal.findMany({
      where: {
        clientId,
        transaction: { senderId: userId },
      },
      orderBy: { requestedAt: 'desc' },
      select: {
        id: true,
        status: true,
        requestedAt: true,
        processedAt: true,
        processedById: true,
        transactionId: true,
        method: true,
        transaction: {
          select: {
            id: true,
            total: true,
            status: true,
            payoutMethod: true,
          },
        },
      },
    });
  }

  /**
   * ADMIN — tous les retraits
   */
  async adminListAll(clientId: number) {
    return this.prisma.withdrawal.findMany({
      where: { clientId },
      orderBy: { requestedAt: 'desc' },
      select: {
        id: true,
        status: true,
        requestedAt: true,
        processedAt: true,
        processedById: true,
        transactionId: true,
        method: true,
        processedBy: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
        transaction: {
          select: {
            id: true,
            total: true,
            status: true,
            sender: { select: { id: true, email: true, firstName: true, lastName: true } },
          },
        },
      },
    });
  }

  /**
   * ADMIN — mise à jour du statut
   */
  async adminUpdateStatus(
    clientId: number,
    adminId: string,
    withdrawalId: string,
    dto: UpdateWithdrawalStatusDto,
  ) {
    const w = await this.prisma.withdrawal.findFirst({
      where: { id: withdrawalId, clientId },
      select: { id: true, status: true },
    });

    if (!w) throw new NotFoundException('Retrait introuvable');

    const from = w.status;
    const to = dto.status;

    assertTransition(from, to);

    const now = new Date();
    const shouldStamp = to === 'APPROVED' || to === 'PAID' || to === 'REJECTED';

    return this.prisma.withdrawal.update({
      where: { id: withdrawalId },
      data: {
        status: to,
        processedById: shouldStamp ? adminId : null,
        processedAt: shouldStamp ? now : null,
      },
      select: {
        id: true,
        status: true,
        processedAt: true,
        processedById: true,
      },
    });
  }
}
