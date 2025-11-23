// src/beneficiaries/beneficiaries.service.ts
// src/beneficiaries/beneficiaries.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { Beneficiary } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { CreateBeneficiaryDto } from './dto/create-beneficiary.dto';

@Injectable()
export class BeneficiariesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateBeneficiaryDto): Promise<Beneficiary> {
    return this.prisma.beneficiary.create({
      data: {
        fullName: dto.fullName,
        country: dto.country,
        city: dto.city,
        phone: dto.phone ?? null,
        // IMPORTANT : on connecte la relation "user"
        user: {
          connect: { id: userId },
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

  async findOneForUser(id: string, userId: string): Promise<Beneficiary> {
    const beneficiary = await this.prisma.beneficiary.findFirst({
      where: { id, userId },
    });

    if (!beneficiary) {
      throw new NotFoundException('Beneficiary not found');
    }

    return beneficiary;
  }
}
