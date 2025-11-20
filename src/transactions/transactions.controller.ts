//apps/backend/src/transactions/transactions.controller.ts
import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionStatusDto } from './dto/update-transaction-status.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly service: TransactionsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@GetUser('userId') userId: string, @Body() dto: CreateTransactionDto) {
    return this.service.create(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAllForUser(@GetUser('userId') userId: string) {
    return this.service.findAllForUser(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@GetUser('userId') userId: string, @Param('id') id: string) {
    return this.service.findOneForUser(userId, id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('admin/all')
  adminFindAll() {
    return this.service.adminFindAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch('admin/status/:id')
  adminUpdateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateTransactionStatusDto,
  ) {
    return this.service.adminUpdateStatus(id, dto);
  }
}
