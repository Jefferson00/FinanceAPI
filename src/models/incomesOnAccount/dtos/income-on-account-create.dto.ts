/* eslint-disable prettier/prettier */
import { IsInt, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class IncomeOnAccountCreateDto {
  @IsNotEmpty({message: 'O campo id do usuário é obrigatório.'})
  @IsUUID('all', { message: 'O campo id do usuário  deve ser do tipo uuid.' })
  userId!: string;

  @IsNotEmpty({message: 'O campo id da conta é obrigatório.'})
  @IsUUID('all', { message: 'O campo id da conta  deve ser do tipo uuid.' })
  accountId!: string;

  @IsNotEmpty({message: 'O campo id da entrada é obrigatório.'})
  @IsUUID('all', { message: 'O campo id da entrada  deve ser do tipo uuid.' })
  incomeId!: string;

  @IsNotEmpty({message: 'O valor é obrigatório.'})
  @IsInt({ message: 'O campo valor deve ser do tipo numérico.' })
  value!: number;

  @IsOptional()
  @IsString({ message: 'O campo recorrencia deve ser do tipo texto.' })
  recurrence?: string;

  @IsNotEmpty({message: 'O valor do mês é obrigatório.'})
  @IsString({ message: 'O campo mês deve ser do tipo texto.' })
  month!: string;

  @IsNotEmpty({message: 'O nome é obrigatório.'})
  @IsString({ message: 'O campo nome deve ser do tipo texto.' })
  name!: string;
}