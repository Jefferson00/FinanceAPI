/* eslint-disable prettier/prettier */
import { IsInt, IsNotEmpty, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class CreditCardCreateDto {
  @IsNotEmpty({message: 'O campo nome é obrigatório.'})
  @IsString({ message: 'O campo nome deve ser do tipo texto.' })
  @MinLength(2, { message: 'O campo nome deve ter no mínimo 2 caracteres.' })
  @MaxLength(30, { message: 'O campo nome deve ter no máximo 30 caracteres.' })
  name!: string;

  @IsNotEmpty({message: 'O campo id do usuário é obrigatório.'})
  @IsUUID('all', { message: 'O campo id do usuário deve ser do tipo uuid.' })
  userId!: string;

  @IsNotEmpty({message: 'O campo limite é obrigatório.'})
  @IsInt({ message: 'O campo limite deve ser do tipo inteiro.' })
  limit!: number;

  @IsNotEmpty({message: 'O campo data de pagamento é obrigatório.'})
  @IsString({ message: 'O campo data de pagamento deve ser do tipo texto.' })
  paymentDate!: string;

  @IsNotEmpty({message: 'O campo data de fechamento da fatura é obrigatório.'})
  @IsString({ message: 'O campo data de fechamento da fatura deve ser do tipo texto.' })
  invoiceClosing!: string;

  @IsNotEmpty({message: 'O campo cor é obrigatório.'})
  @IsString({ message: 'O campo cor deve ser do tipo texto.' })
  color!: string;

  @IsNotEmpty({message: 'O campo conta padrão é obrigatório.'})
  @IsString({ message: 'O campo conta padrão deve ser do tipo texto.' })
  receiptDefault!: string;
}