/* eslint-disable prettier/prettier */
import { IsInt, IsNotEmpty, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class AccountCreateDto {
  @IsNotEmpty({message: 'O campo nome é obrigatório.'})
  @IsString({ message: 'O campo nome deve ser do tipo texto.' })
  @MinLength(2, { message: 'O campo nome deve ter no mínimo 2 caracteres.' })
  @MaxLength(30, { message: 'O campo nome deve ter no máximo 30 caracteres.' })
  name!: string;

  @IsNotEmpty({message: 'O campo id do usuário é obrigatório.'})
  @IsUUID('all', { message: 'O campo id do usuário deve ser do tipo uuid.' })
  userId!: string;

  @IsNotEmpty({message: 'O tipo é obrigatório.'})
  @IsString({ message: 'O campo tipo deve ser do tipo texto.' })
  type!: string;

  @IsNotEmpty({message: 'O valor inicial é obrigatório.'})
  @IsInt({ message: 'O campo valor inicial deve ser do tipo numérico.' })
  initialValue!: number;

  @IsNotEmpty({message: 'O status é obrigatório.'})
  @IsString({ message: 'O campo status deve ser do tipo texto.' })
  status!: string;
}