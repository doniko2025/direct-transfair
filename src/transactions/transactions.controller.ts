// apps/backend/src/transactions/transactions.controller.ts
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import type { Request } from 'express';

import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionStatusDto } from './dto/update-transaction-status.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../tenants/tenant.guard';
import { AdminGuard } from '../common/guards/admin.guard';
import type { AuthUserPayload } from '../auth/types/auth-user-payload.type';

@UseGuards(TenantGuard, JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  // ----- ADMIN -----
  @UseGuards(AdminGuard)
  @Get('admin/all')
  async adminFindAll(@Req() req: Request) {
    const user = req.user as AuthUserPayload | undefined;
    if (!user?.id) throw new ForbiddenException('Not authenticated');

    return this.transactionsService.adminFindAllForAdmin(user.id);
  }

  @UseGuards(AdminGuard)
  @Patch('admin/status/:id')
  async adminChangeStatus(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateTransactionStatusDto,
  ) {
    const user = req.user as AuthUserPayload | undefined;
    if (!user?.id) throw new ForbiddenException('Not authenticated');

    return this.transactionsService.adminUpdateStatusForAdmin(user.id, id, dto);
  }

  // ----- USER -----
  @Post()
  async create(@Req() req: Request, @Body() dto: CreateTransactionDto) {
    const user = req.user as AuthUserPayload | undefined;
    if (!user?.id) throw new ForbiddenException('Not authenticated');

    return this.transactionsService.create(user.id, dto);
  }

  @Get()
  async findMine(@Req() req: Request) {
    const user = req.user as AuthUserPayload | undefined;
    if (!user?.id) throw new ForbiddenException('Not authenticated');

    return this.transactionsService.findForUser(user.id);
  }

  @Get(':id')
  async findOne(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as AuthUserPayload | undefined;
    if (!user?.id) throw new ForbiddenException('Not authenticated');

    return this.transactionsService.findOneForUser(id, user.id);
  }
}
