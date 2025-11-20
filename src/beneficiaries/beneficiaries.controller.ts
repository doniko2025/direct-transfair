import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { BeneficiariesService } from './beneficiaries.service';
import { CreateBeneficiaryDto } from './dto/create-beneficiary.dto';
import { UpdateBeneficiaryDto } from './dto/update-beneficiary.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('beneficiaries')
export class BeneficiariesController {
  constructor(private readonly service: BeneficiariesService) {}

  // USER: create
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@GetUser('userId') userId: string, @Body() dto: CreateBeneficiaryDto) {
    return this.service.create(userId, dto);
  }

  // USER: list own
  @UseGuards(JwtAuthGuard)
  @Get()
  findAllForUser(@GetUser('userId') userId: string) {
    return this.service.findAllForUser(userId);
  }

  // USER: get one
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOneForUser(@GetUser('userId') userId: string, @Param('id') id: string) {
    return this.service.findOneForUser(userId, id);
  }

  // USER: update
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  updateForUser(
    @GetUser('userId') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateBeneficiaryDto,
  ) {
    return this.service.updateForUser(userId, id, dto);
  }

  // USER: delete
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  removeForUser(@GetUser('userId') userId: string, @Param('id') id: string) {
    return this.service.removeForUser(userId, id);
  }

  // ADMIN: list all
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('admin/all')
  adminFindAll() {
    return this.service.adminFindAll();
  }

  // ADMIN: delete any
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete('admin/:id')
  adminRemove(@Param('id') id: string) {
    return this.service.adminRemove(id);
  }
}
