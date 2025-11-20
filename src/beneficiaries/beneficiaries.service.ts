//apps/backend/src/beneficiaries/beneficiaries.service.ts
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBeneficiaryDto } from './dto/create-beneficiary.dto';
import { UpdateBeneficiaryDto } from './dto/update-beneficiary.dto';

@Injectable()
export class BeneficiariesService {
  constructor(private readonly prisma: PrismaService) {}

  // USER: create
  async create(userId: string, dto: CreateBeneficiaryDto) {
    return this.prisma.beneficiary.create({
      data: {
        fullName: dto.fullName,
        country: dto.country,
        city: dto.city,
        phone: dto.phone,
        userId,
      },
    });
  }

  // USER: list own beneficiaries
  async findAllForUser(userId: string) {
    return this.prisma.beneficiary.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // USER: get one
  async findOneForUser(userId: string, id: string) {
    const b = await this.prisma.beneficiary.findUnique({ where: { id } });
    if (!b) {
      throw new NotFoundException('Beneficiary not found');
    }
    if (b.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }
    return b;
  }

  // USER: update one
  async updateForUser(userId: string, id: string, dto: UpdateBeneficiaryDto) {
    const b = await this.prisma.beneficiary.findUnique({ where: { id } });
    if (!b) {
      throw new NotFoundException('Beneficiary not found');
    }
    if (b.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.beneficiary.update({
      where: { id },
      data: {
        fullName: dto.fullName ?? b.fullName,
        country: dto.country ?? b.country,
        city: dto.city ?? b.city,
        phone: dto.phone ?? b.phone,
      },
    });
  }

  // USER: delete one
  async removeForUser(userId: string, id: string) {
    const b = await this.prisma.beneficiary.findUnique({ where: { id } });
    if (!b) {
      throw new NotFoundException('Beneficiary not found');
    }
    if (b.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    await this.prisma.beneficiary.delete({ where: { id } });
    return { message: 'Beneficiary deleted' };
  }

  // ADMIN: list all
  async adminFindAll() {
    return this.prisma.beneficiary.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: true },
    });
  }

  // ADMIN: delete any
  async adminRemove(id: string) {
    const b = await this.prisma.beneficiary.findUnique({ where: { id } });
    if (!b) {
      throw new NotFoundException('Beneficiary not found');
    }
    await this.prisma.beneficiary.delete({ where: { id } });
    return { message: 'Beneficiary deleted' };
  }
}
