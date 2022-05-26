/* eslint-disable prettier/prettier */
import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class InvoiceUpdateDto {
  @IsOptional()
  @IsString({ message: 'O campo data de pagamento deve ser do tipo texto.' })
  paymentDate?: string;

  @IsOptional()
  @IsString({ message: 'O campo data de pagamento deve ser do tipo texto.' })
  closingDate?: string;

  @IsOptional()
  @IsString({ message: 'O campo data de pagamento deve ser do tipo texto.' })
  month?: string;

  @IsOptional()
  @IsBoolean({ message: 'O campo pago deve ser do tipo booleano.' })
  paid?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'O campo fechado deve ser do tipo booleano.' })
  closed?: boolean;

  @IsOptional()
  @IsInt({ message: 'O campo valor deve ser do tipo inteiro.' })
  value?: number;
}