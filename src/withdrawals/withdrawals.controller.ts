// apps/backend/src/withdrawals/withdrawals.controller.ts
import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';

import { WithdrawalsService } from './withdrawals.service';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';
import { UpdateWithdrawalStatusDto } from './dto/update-withdrawal-status.dto';
import { TenancyService } from '../common/tenancy/tenancy.service';
import { AdminGuard } from '../common/guards/admin.guard';
import type { AuthUserPayload } from '../auth/types/auth-user-payload.type';

@Controller()
export class WithdrawalsController {
  constructor(
    private readonly withdrawals: WithdrawalsService,
    private readonly tenancy: TenancyService,
  ) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('withdrawals')
  async create(@Req() req: Request, @Body() dto: CreateWithdrawalDto) {
    const clientId = await this.tenancy.resolveClientId(req);

    const user = req.user as AuthUserPayload | undefined;
    if (!user?.id) {
      throw new ForbiddenException('Not authenticated');
    }

    return this.withdrawals.create(clientId, user.id, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('withdrawals/me')
  async mine(@Req() req: Request) {
    const clientId = await this.tenancy.resolveClientId(req);

    const user = req.user as AuthUserPayload | undefined;
    if (!user?.id) {
      throw new ForbiddenException('Not authenticated');
    }

    return this.withdrawals.listMine(clientId, user.id);
  }

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @Get('admin/withdrawals')
  async adminAll(@Req() req: Request) {
    const clientId = await this.tenancy.resolveClientId(req);
    return this.withdrawals.adminListAll(clientId);
  }

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @Patch('admin/withdrawals/:id')
  async adminUpdate(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateWithdrawalStatusDto,
  ) {
    const clientId = await this.tenancy.resolveClientId(req);

    const user = req.user as AuthUserPayload | undefined;
    if (!user?.id) {
      throw new ForbiddenException('Not authenticated');
    }

    return this.withdrawals.adminUpdateStatus(clientId, user.id, id, dto);
  }
}
