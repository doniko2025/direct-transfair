// apps/backend/src/withdrawals/withdrawals.module.ts
import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { WithdrawalsController } from './withdrawals.controller';
import { WithdrawalsService } from './withdrawals.service';
import { TenancyService } from '../common/tenancy/tenancy.service';
import { AdminGuard } from '../common/guards/admin.guard';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [WithdrawalsController],
  providers: [WithdrawalsService, TenancyService, AdminGuard],
  exports: [WithdrawalsService],
})
export class WithdrawalsModule {}
