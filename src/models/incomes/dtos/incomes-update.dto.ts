/* eslint-disable prettier/prettier */
import { IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class IncomeUpdateDto {
  @IsOptional()
  @IsString({ message: 'O campo nome deve ser do tipo texto.' })
  @MinLength(2, { message: 'O campo nome deve ter no mínimo 2 caracteres.' })
  @MaxLength(30, { message: 'O campo nome deve ter no máximo 30 caracteres.' })
  name?: string;

  @IsNotEmpty({message: 'O campo id do usuário é obrigatório.'})
  @IsUUID('all', { message: 'O campo id do usuário deve ser do tipo uuid.' })
  userId!: string;

  @IsOptional()
  @IsString({ message: 'O campo descrição deve ser do tipo texto.' })
  description?: string;

  @IsOptional()
  @IsInt({ message: 'O campo valor deve ser do tipo numérico.' })
  value?: number;

  @IsOptional()
  @IsString({ message: 'O campo categoria deve ser do tipo texto.' })
  category?: string;

  @IsOptional()
  @IsString({ message: 'O campo repetição deve ser do tipo texto.' })
  iteration?: string;

  @IsOptional()
  @IsString({ message: 'O campo data de recebimento deve ser do tipo texto.' })
  receiptDate?: string;

  @IsOptional()
  @IsString({ message: 'O campo recebimento padrão deve ser do tipo texto.' })
  receiptDefault?: string;


  @IsOptional()
  @IsString({ message: 'O campo data de inicio deve ser do tipo texto.' })
  startDate?: string;

  @IsOptional()
  @IsString({ message: 'O campo data final deve ser do tipo texto.' })
  endDate?: string;
}