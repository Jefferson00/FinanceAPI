/* eslint-disable prettier/prettier */
import { IsInt, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class AccountBalanceCreateDto {
  @IsNotEmpty({message: 'O campo id da conta é obrigatório.'})
  @IsUUID('all', { message: 'O campo id da conta deve ser do tipo uuid.' })
  accountId!: string;

  @IsNotEmpty({message: 'O mês é obrigatório.'})
  @IsString({ message: 'O campo mês deve ser do tipo texto.' })
  month!: string;

  @IsNotEmpty({message: 'O valor é obrigatório.'})
  @IsInt({ message: 'O campo valor deve ser do tipo numérico.' })
  value!: number;
}