/* eslint-disable prettier/prettier */
import { IsInt, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class ExpanseOnInvoiceCreateDto {
/*   @IsNotEmpty({message: 'O campo id da fatura é obrigatório.'})
  @IsUUID('all', { message: 'O campo id da fatura deve ser do tipo uuid.' })
  invoiceId!: string; */

  @IsNotEmpty({message: 'O campo id da despesa é obrigatório.'})
  @IsUUID('all', { message: 'O campo id da despesa  deve ser do tipo uuid.' })
  expanseId!: string;

  @IsNotEmpty({message: 'O valor é obrigatório.'})
  @IsInt({ message: 'O campo valor deve ser do tipo numérico.' })
  value!: number;

  @IsOptional()
  @IsString({ message: 'O campo recorrencia deve ser do tipo texto.' })
  recurrence?: string;

  @IsNotEmpty({message: 'O nome é obrigatório.'})
  @IsString({ message: 'O campo nome deve ser do tipo texto.' })
  name!: string;

  @IsNotEmpty({message: 'O valor dia é obrigatório.'})
  @IsInt({ message: 'O campo valor dia ser do tipo numérico.' })
  day!: number;
}