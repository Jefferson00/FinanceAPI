/* eslint-disable prettier/prettier */
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class IncomeOnAccountUpdateDto {
  @IsNotEmpty({message: 'O campo id do usuário é obrigatório.'})
  @IsUUID('all', { message: 'O campo id do usuário  deve ser do tipo uuid.' })
  userId!: string;

  @IsOptional()
  @IsString({ message: 'O campo recorrencia deve ser do tipo texto.' })
  recurrence?: string;

  @IsOptional()
  @IsString({ message: 'O campo nome deve ser do tipo texto.' })
  name!: string;
}