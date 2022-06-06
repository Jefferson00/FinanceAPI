/* eslint-disable prettier/prettier */
import { IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class AccountUpdateDto {
  @IsOptional()
  @IsString({ message: 'O campo nome deve ser do tipo texto.' })
  @MinLength(2, { message: 'O campo nome deve ter no mínimo 2 caracteres.' })
  @MaxLength(30, { message: 'O campo nome deve ter no máximo 30 caracteres.' })
  name?: string;

  @IsNotEmpty({message: 'O campo id do usuário é obrigatório.'})
  @IsUUID('all', { message: 'O campo id do usuário deve ser do tipo uuid.' })
  userId!: string;

  @IsOptional()
  @IsString({ message: 'O campo tipo deve ser do tipo texto.' })
  type?: string;

  @IsOptional()
  @IsString({ message: 'O campo status deve ser do tipo texto.' })
  status?: string;

  @IsOptional()
  @IsInt({ message: 'O campo saldo da conta deve ser do tipo numérico.' })
  balance?: number;
}