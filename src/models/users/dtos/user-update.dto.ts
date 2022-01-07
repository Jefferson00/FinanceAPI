/* eslint-disable prettier/prettier */
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UserUpdateDto {
  @IsOptional()
  @IsString({ message: 'O campo nome deve ser do tipo texto.' })
  name: string;

  @IsOptional()
  @IsEmail({}, { message: 'E-mail inválido.' })
  email: string;

  @IsOptional()
  @IsString({ message: 'O campo nome deve ser do tipo texto.' })
  avatar: string;

  @IsOptional()
  @IsString({ message: 'O campo nome deve ser do tipo texto.' })
  phone: string;
}