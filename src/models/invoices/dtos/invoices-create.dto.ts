/* eslint-disable prettier/prettier */
import { IsBoolean, IsInt, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class InvoiceCreateDto {
  @IsNotEmpty({message: 'O campo id do cartão é obrigatório.'})
  @IsUUID('all', { message: 'O campo id do cartão deve ser do tipo uuid.' })
  creditCardId!: string;

  @IsNotEmpty({message: 'O campo id da conta é obrigatório.'})
  @IsUUID('all', { message: 'O campo id da conta deve ser do tipo uuid.' })
  accountId!: string;

  @IsNotEmpty({message: 'O campo data de pagamento é obrigatório.'})
  @IsString({ message: 'O campo data de pagamento deve ser do tipo texto.' })
  paymentDate!: string;

  @IsNotEmpty({message: 'O campo data de fechamento da fatura é obrigatório.'})
  @IsString({ message: 'O campo data de fechamento da fatura deve ser do tipo texto.' })
  closingDate!: string;

  @IsNotEmpty({message: 'O campo mês da fatura é obrigatório.'})
  @IsString({ message: 'O campo mês da fatura deve ser do tipo texto.' })
  month!: string;

  @IsNotEmpty({message: 'O campo pago é obrigatório.'})
  @IsBoolean({ message: 'O campo pago deve ser do tipo booleano.' })
  paid!: boolean;

  @IsNotEmpty({message: 'O campo fechado é obrigatório.'})
  @IsBoolean({ message: 'O campo fechado deve ser do tipo booleano.' })
  closed!: boolean;

  @IsNotEmpty({message: 'O campo valor é obrigatório.'})
  @IsInt({ message: 'O campo valor deve ser do tipo inteiro.' })
  value!: number;
}