/* eslint-disable prettier/prettier */
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UserCreateDto {
  @IsNotEmpty({ message: 'Campo Nome é obrigatório.' })
  @IsString({ message: 'O campo nome deve ser do tipo texto.' })
  name: string;

  @IsNotEmpty({ message: 'Campo Email é obrigatório.' })
  @IsEmail({}, { message: 'E-mail inválido.' })
  email: string;

  @IsOptional()
  @IsString({ message: 'O campo nome deve ser do tipo texto.' })
  avatar: string;

  @IsOptional()
  @IsString({ message: 'O campo nome deve ser do tipo texto.' })
  phone: string;
}