// apps/backend/src/payments/payments.controller.ts
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';

import { PaymentsService } from './payments.service';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { TenancyService } from '../common/tenancy/tenancy.service';

@Controller('payments')
@UseGuards(AuthGuard('jwt'))
export class PaymentsController {
  constructor(
    private readonly payments: PaymentsService,
    private readonly tenancy: TenancyService,
  ) {}

  @Post('initiate')
  async initiate(@Req() req: Request, @Body() dto: InitiatePaymentDto) {
    const clientId = await this.tenancy.resolveClientId(req);

    const userId = String((req as any).user?.id ?? (req as any).user?.userId ?? '');
    if (!userId) throw new BadRequestException('Utilisateur non authentifié');

    return this.payments.initiate(clientId, userId, dto);
  }

  @Get('status/:transactionId')
  async status(@Req() req: Request, @Param('transactionId') transactionId: string) {
    const clientId = await this.tenancy.resolveClientId(req);

    const userId = String((req as any).user?.id ?? (req as any).user?.userId ?? '');
    if (!userId) throw new BadRequestException('Utilisateur non authentifié');

    return this.payments.status(clientId, userId, transactionId);
  }
}
