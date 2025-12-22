// apps/backend/src/payments/dto/initiate-payment.dto.ts
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PaymentMethod } from '@prisma/client';

export class InitiatePaymentDto {
  @IsString()
  @IsNotEmpty()
  transactionId!: string;

  // nouveau nom
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  // ancien nom (compat)
  @IsOptional()
  @IsEnum(PaymentMethod)
  method?: PaymentMethod;

  @IsOptional()
  @IsBoolean()
  simulateSuccess?: boolean;
}
