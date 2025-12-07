// apps/backend/src/beneficiaries/beneficiaries.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import type { Beneficiary } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import type { CreateBeneficiaryDto } from './dto/create-beneficiary.dto';

@Injectable()
export class BeneficiariesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: string,
    dto: CreateBeneficiaryDto,
  ): Promise<Beneficiary> {
    // On récupère le user pour connaître son clientId
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { fullName, country, city, phone } = dto;

    return this.prisma.beneficiary.create({
      data: {
        fullName,
        country,
        city,
        phone: phone ?? null,
        user: {
          connect: { id: userId },
        },
        client: {
          connect: { id: user.clientId },
        },
      },
    });
  }

  async findAllForUser(userId: string): Promise<Beneficiary[]> {
    return this.prisma.beneficiary.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneForUser(
    id: string,
    userId: string,
  ): Promise<Beneficiary> {
    const beneficiary = await this.prisma.beneficiary.findFirst({
      where: { id, userId },
    });

    if (!beneficiary) {
      throw new NotFoundException('Beneficiary not found');
    }

    return beneficiary;
  }
}
