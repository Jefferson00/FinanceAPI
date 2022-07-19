/* eslint-disable prettier/prettier */
import { IsInt, IsNotEmpty, IsUUID } from 'class-validator';

export class AccountBalanceUpdateDto {
  @IsNotEmpty({message: 'O campo id da conta é obrigatório.'})
  @IsUUID('all', { message: 'O campo id da conta deve ser do tipo uuid.' })
  accountId!: string;

  @IsNotEmpty({message: 'O valor é obrigatório.'})
  @IsInt({ message: 'O campo valor deve ser do tipo numérico.' })
  value!: number;
}