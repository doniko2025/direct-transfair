// src/beneficiaries/beneficiaries.module.ts
import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { PrismaService } from '../prisma/prisma.service';
import { BeneficiariesController } from './beneficiaries.controller';
import { BeneficiariesService } from './beneficiaries.service';

@Module({
  imports: [AuthModule],
  controllers: [BeneficiariesController],
  providers: [
    BeneficiariesService,
    PrismaService,
  ],
  exports: [BeneficiariesService],
})
export class BeneficiariesModule {}
