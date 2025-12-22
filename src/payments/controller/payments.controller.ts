// apps/backend/src/payments/controller/payments.controller.ts
import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';

import { PaymentsService } from '../payments.service';
import { InitiatePaymentDto } from '../dto/initiate-payment.dto';
import { TenancyService } from '../../common/tenancy/tenancy.service';
import type { AuthRequest } from '../../common/types/auth-request';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller()
export class PaymentsController {
  constructor(
    private readonly payments: PaymentsService,
    private readonly tenancy: TenancyService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('payments/initiate')
  async initiate(@Req() req: AuthRequest, @Body() dto: InitiatePaymentDto) {
    if (!req.user?.id) {
      throw new ForbiddenException('Not authenticated');
    }

    const clientId = await this.tenancy.resolveClientId(req as unknown as Request);
    return this.payments.initiate(clientId, req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('payments/status/:transactionId')
  async status(
    @Req() req: AuthRequest,
    @Param('transactionId') transactionId: string,
  ) {
    if (!req.user?.id) {
      throw new ForbiddenException('Not authenticated');
    }

    const clientId = await this.tenancy.resolveClientId(req as unknown as Request);
    return this.payments.status(clientId, req.user.id, transactionId);
  }
}
