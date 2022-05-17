import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreditCard, Prisma } from '@prisma/client';
import { PrismaService } from '../../providers/database/prisma/prisma.service';
import { CreditCardCreateDto } from './dtos/credit-card-create.dto';
import { CreditCardUpdateDto } from './dtos/credit-card-update.dto';

@Injectable()
export class CreditCardService {
  // eslint-disable-next-line prettier/prettier
  constructor(private prisma: PrismaService) {}

  async creditCard(
    creditCardWhereUniqueInput: Prisma.CreditCardWhereUniqueInput,
  ): Promise<CreditCard | null> {
    try {
      return await this.prisma.creditCard.findUnique({
        where: creditCardWhereUniqueInput,
      });
    } catch (error) {
      Logger.log('erro ao buscar cartão: ', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async creditCards(where?: Prisma.CreditCardWhereInput): Promise<CreditCard[]> {
    try {
      return await this.prisma.creditCard.findMany({where});
    } catch (error) {
      Logger.log('erro ao listar cartões: ', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async createCreditCard(data: CreditCardCreateDto): Promise<CreditCard> {
    try {
      return this.prisma.creditCard.create({
        data,
      });
    } catch (error) {
      Logger.log('erro ao criar cartão: ', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async updateCreditCard(params: {
    where: Prisma.CreditCardWhereUniqueInput;
    data: CreditCardUpdateDto;
  }): Promise<CreditCard> {
    const { where, data } = params;
    const { userId } = data;
    const { id } = where;
    try {
      const verifyCreditCardExists = await this.creditCard({id});

      if (!verifyCreditCardExists) {
        throw new HttpException(
          'ERRO: cartão não encontrado',
          HttpStatus.NOT_FOUND
        );
      }

      if (verifyCreditCardExists.userId !== userId) {
        throw new HttpException(
          'ERRO: usuário não autorizado a realizar essa ação',
          HttpStatus.UNAUTHORIZED
        );
      }

      return this.prisma.creditCard.update({
        data,
        where,
      });
    } catch (error) {
      Logger.log('erro ao atualizar cartão: ', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async deleteCreditCard(where: Prisma.CreditCardWhereUniqueInput, userId: string): Promise<CreditCard> {
    try {
      const verifyCreditCardExists = await this.creditCard(where);

      if (!verifyCreditCardExists) {
        throw new HttpException(
          'ERRO: cartão não encontrado',
          HttpStatus.NOT_FOUND
        );
      }

      if (verifyCreditCardExists.userId !== userId) {
        throw new HttpException(
          'ERRO: usuário não autorizado a realizar essa ação',
          HttpStatus.UNAUTHORIZED
        );
      }

      // verificar faturas

      return await this.prisma.creditCard.delete({
        where,
      });
    } catch (error) {
      Logger.log('erro ao deletar cartão: ', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

}