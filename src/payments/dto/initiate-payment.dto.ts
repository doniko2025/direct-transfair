import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { PaymentMethod } from '@prisma/client';

export class InitiatePaymentDto {
  @IsString()
  @IsNotEmpty()
  transactionId: string;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;
}
