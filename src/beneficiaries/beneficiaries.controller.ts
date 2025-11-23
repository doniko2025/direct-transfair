// src/beneficiaries/beneficiaries.controller.ts
import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';

import { BeneficiariesService } from './beneficiaries.service';
import { CreateBeneficiaryDto } from './dto/create-beneficiary.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthUserPayload } from '../auth/types/auth-user-payload.type';

@UseGuards(JwtAuthGuard)
@Controller('beneficiaries')
export class BeneficiariesController {
  constructor(
    private readonly beneficiariesService: BeneficiariesService,
  ) {}

  @Post()
  async create(@Req() req: Request, @Body() dto: CreateBeneficiaryDto) {
    const user = req.user as AuthUserPayload | undefined;

    if (!user?.sub) {
      throw new Error('Missing authenticated user in request');
    }

    return this.beneficiariesService.create(user.sub, dto);
  }

  @Get()
  async findAll(@Req() req: Request) {
    const user = req.user as AuthUserPayload | undefined;

    if (!user?.sub) {
      throw new Error('Missing authenticated user in request');
    }

    return this.beneficiariesService.findAllForUser(user.sub);
  }
}
