/* eslint-disable prettier/prettier */
import { IsEmail, IsOptional, IsPhoneNumber, IsString, MaxLength, MinLength } from 'class-validator';

export class UserCreateDto {
  @IsOptional()
  @IsString({ message: 'O campo nome deve ser do tipo texto.' })
  @MinLength(2, { message: 'O campo nome deve ter no mínimo 2 caracteres.' })
  @MaxLength(30, { message: 'O campo nome deve ter no máximo 30 caracteres.' })
  name: string;

  @IsOptional()
  @IsEmail({}, { message: 'E-mail inválido.' })
  email: string;

  @IsOptional()
  @IsString({ message: 'O campo avatar deve ser do tipo texto.' })
  avatar: string;

  @IsOptional()
  @IsString({ message: 'O campo telefone deve ser do tipo texto.' })
  @IsPhoneNumber('BR', { message: 'Formato de telefone inválido'})
  phone: string;
}