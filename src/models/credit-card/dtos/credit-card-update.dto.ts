/* eslint-disable prettier/prettier */
import { IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class CreditCardUpdateDto {
  @IsOptional()
  @IsString({ message: 'O campo nome deve ser do tipo texto.' })
  @MinLength(2, { message: 'O campo nome deve ter no mínimo 2 caracteres.' })
  @MaxLength(30, { message: 'O campo nome deve ter no máximo 30 caracteres.' })
  name?: string;

  @IsNotEmpty({message: 'O campo id do usuário é obrigatório.'})
  @IsUUID('all', { message: 'O campo id do usuário deve ser do tipo uuid.' })
  userId!: string;

  @IsOptional()
  @IsInt({ message: 'O campo limite deve ser do tipo inteiro.' })
  limit?: number;

  @IsOptional()
  @IsString({ message: 'O campo data de pagamento deve ser do tipo texto.' })
  paymentDate?: string;

  @IsOptional()
  @IsString({ message: 'O campo data de fechamento da fatura deve ser do tipo texto.' })
  invoiceClosing?: string;

  @IsOptional()
  @IsString({ message: 'O campo cor deve ser do tipo texto.' })
  color?: string;

  @IsOptional()
  @IsString({ message: 'O campo conta padrão deve ser do tipo texto.' })
  receiptDefault?: string;
}