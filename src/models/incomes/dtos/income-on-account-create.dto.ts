/* eslint-disable prettier/prettier */
import { IsInt, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class IncomeOnAccountCreateDto { 
  @IsNotEmpty({message: 'O campo id da conta é obrigatório.'})
  @IsUUID('all', { message: 'O campo id da conta  deve ser do tipo uuid.' })
  accountId!: string;

  @IsNotEmpty({message: 'O campo id da entrada é obrigatório.'})
  @IsUUID('all', { message: 'O campo id da entrada  deve ser do tipo uuid.' })
  incomeId!: string;

  @IsNotEmpty({message: 'O campo "assinado por" é obrigatório.'})
  @IsString({ message: 'O campo "assinado por"  deve ser do tipo string.' })
  assignedBy!: string;

  @IsNotEmpty({message: 'O valor é obrigatório.'})
  @IsInt({ message: 'O campo valor deve ser do tipo numérico.' })
  value!: number;

  @IsNotEmpty({message: 'O campo data de recebimento é obrigatório.'})
  @IsString({ message: 'O campo data de recebimento deve ser do tipo texto.' })
  receiptDate!: string;

  @IsOptional()
  @IsString({ message: 'O campo data de pagamento deve ser do tipo texto.' })
  paymentDate?: string;

  @IsOptional()
  @IsString({ message: 'O campo recorrencia deve ser do tipo texto.' })
  recurrence?: string;

}