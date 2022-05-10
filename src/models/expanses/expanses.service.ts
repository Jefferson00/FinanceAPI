import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Expanse, ExpanseOnAccount, Prisma } from '@prisma/client';
import { PrismaService } from 'src/providers/database/prisma/prisma.service';
import { ExpanseCreateDto } from './dtos/expanse-create.dto';
import { ExpanseOnAccountCreateDto } from './dtos/expanse-on-account-create.dto';
import { ExpanseUpdateDto } from './dtos/expanse-update.dto';

@Injectable()
export class ExpansesService { 
  // eslint-disable-next-line prettier/prettier
  constructor(private prisma: PrismaService) {}

  async expanse(
    expanseWhereUniqueInput: Prisma.ExpanseWhereUniqueInput,
  ): Promise<Expanse | null> {
    try {
      return await this.prisma.expanse.findUnique({
        where: expanseWhereUniqueInput,
      });
    } catch (error) {
      Logger.log('erro ao buscar despesa: ', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async expanses(where?: Prisma.ExpanseWhereInput): Promise<Expanse[]> {
    try {
      return await this.prisma.expanse.findMany({where });
    } catch (error) {
      Logger.log('erro ao listar despesas: ', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async createExpanse(data: ExpanseCreateDto): Promise<Expanse> {
    try {
      return this.prisma.expanse.create({
        data,
      });
    } catch (error) {
      Logger.log('erro ao criar despesa: ', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async updateExpanse(params: {
    where: Prisma.ExpanseWhereUniqueInput;
    data: ExpanseUpdateDto;
  }): Promise<Expanse> {
    const { where, data } = params;
    const { userId } = data;
    const { id } = where;
    try {
      const verifyExpanseExists = await this.expanse({id});

      if (!verifyExpanseExists) {
        throw new HttpException(
          'ERRO: despesa não encontrada',
          HttpStatus.NOT_FOUND
        );
      }

      if (verifyExpanseExists.userId !== userId) {
        throw new HttpException(
          'ERRO: usuário não autorizado a realizar essa ação',
          HttpStatus.UNAUTHORIZED
        );
      }

      return this.prisma.expanse.update({
        data,
        where,
      });
    } catch (error) {
      Logger.log('erro ao atualizar despesa: ', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async deleteExpanse(where: Prisma.ExpanseWhereUniqueInput, userId: string): Promise<Expanse> {
    try {
      const verifyExpanseExists = await this.expanse(where);

      if (!verifyExpanseExists) {
        throw new HttpException(
          'ERRO: despesa não encontrada',
          HttpStatus.NOT_FOUND
        );
      }

      if (verifyExpanseExists.userId !== userId) {
        throw new HttpException(
          'ERRO: usuário não autorizado a realizar essa ação',
          HttpStatus.UNAUTHORIZED
        );
      }

      return await this.prisma.expanse.delete({
        where,
      });
    } catch (error) {
      Logger.log('erro ao deletar despesa: ', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }



  async expansesOnAccount(where?: Prisma.ExpanseOnAccountWhereInput): Promise<ExpanseOnAccount[]> {
    try {
      return await this.prisma.expanseOnAccount.findMany({where });
    } catch (error) {
      Logger.log('erro ao listar despesas em uma conta: ', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async createExpanseOnAccount(data: ExpanseOnAccountCreateDto): Promise<ExpanseOnAccount> {
    try {
      return this.prisma.expanseOnAccount.create({data});
    } catch (error) {
      Logger.log('erro ao vincular despesa na conta: ', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }


  async deleteExpanseOnAccount(where: Prisma.ExpanseOnAccountWhereUniqueInput, userId: string): Promise<boolean> {
    try {
      const verifyExpanseOnAccountExists = await this.prisma.expanseOnAccount.findUnique({
        where
      })

      if (!verifyExpanseOnAccountExists) {
        throw new HttpException(
          'ERRO: despesa vinculada a conta não encontrada',
          HttpStatus.NOT_FOUND
        );
      }

      if (verifyExpanseOnAccountExists.userId !== userId) {
        throw new HttpException(
          'ERRO: usuário não autorizado a realizar essa ação',
          HttpStatus.UNAUTHORIZED
        );
      }

      await this.prisma.expanseOnAccount.delete({
        where,
      });

      return true;
    } catch (error) {
      Logger.log('erro ao deletar despesa vinculada a uma conta: ', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}