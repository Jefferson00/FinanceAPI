import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Income, IncomeOnAccount, Prisma } from '@prisma/client';
import { PrismaService } from '../../providers/database/prisma/prisma.service';
import { IncomeOnAccountCreateDto } from './dtos/income-on-account-create.dto';
import { IncomeOnAccountUpdateDto } from './dtos/income-on-account-update.dto';
import { IncomesCreateDto } from './dtos/incomes-create.dto';
import { IncomeUpdateDto } from './dtos/incomes-update.dto';

@Injectable()
export class IncomesService { 
   // eslint-disable-next-line prettier/prettier
   constructor(private prisma: PrismaService) {}

   async income(
    incomeWhereUniqueInput: Prisma.IncomeWhereUniqueInput,
  ): Promise<Income | null> {
    try {
      return await this.prisma.income.findUnique({
        where: incomeWhereUniqueInput,
      });
    } catch (error) {
      Logger.log('erro ao buscar entrada: ', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async incomes(where?: Prisma.IncomeWhereInput): Promise<Income[]> {
    try {
      return await this.prisma.income.findMany({where });
    } catch (error) {
      Logger.log('erro ao listar entradas: ', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async incomesOnAccount(where?: Prisma.IncomeOnAccountWhereInput): Promise<IncomeOnAccount[]> {
    try {
      return await this.prisma.incomeOnAccount.findMany({where});
    } catch (error) {
      Logger.log('erro ao listar entradas: ', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async lastIncomesOnAccount(where?: Prisma.IncomeOnAccountWhereInput): Promise<IncomeOnAccount[]> {
    try {
      const incomes = await this.prisma.incomeOnAccount.findMany({where, take: 3 });

      await Promise.all(incomes.map(async (inc) => {
        const findIncome = await this.income({id: inc.incomeId});
        Object.assign(inc, {category: findIncome.category});
        return inc;
      }));

      return incomes;
    } catch (error) {
      Logger.log('erro ao listar entradas: ', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async createIncomes(data: IncomesCreateDto): Promise<Income> {
    try {
      return this.prisma.income.create({
        data,
      });
    } catch (error) {
      Logger.log('erro ao criar entrada: ', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async updateIncome(params: {
    where: Prisma.IncomeWhereUniqueInput;
    data: IncomeUpdateDto;
  }): Promise<Income> {
    const { where, data } = params;
    const { userId } = data;
    const { id } = where;
    try {
      const verifyIncomeExists = await this.income({id});

      if (!verifyIncomeExists) {
        throw new HttpException(
          'ERRO: entrada não encontrada',
          HttpStatus.NOT_FOUND
        );
      }

      if (verifyIncomeExists.userId !== userId) {
        throw new HttpException(
          'ERRO: usuário não autorizado a realizar essa ação',
          HttpStatus.UNAUTHORIZED
        );
      }

      return this.prisma.income.update({
        data,
        where,
      });
    } catch (error) {
      Logger.log('erro ao atualizar entrada: ', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async deleteIncome(where: Prisma.IncomeWhereUniqueInput, userId: string): Promise<Income> {
    try {
      const verifyIncomeExists = await this.income(where);

      if (!verifyIncomeExists) {
        throw new HttpException(
          'ERRO: entrada não encontrada',
          HttpStatus.NOT_FOUND
        );
      }

      if (verifyIncomeExists.userId !== userId) {
        throw new HttpException(
          'ERRO: usuário não autorizado a realizar essa ação',
          HttpStatus.UNAUTHORIZED
        );
      }

      return await this.prisma.income.delete({
        where,
      });
    } catch (error) {
      Logger.log('erro ao deletar entrada: ', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async createIncomeOnAccount(data: IncomeOnAccountCreateDto): Promise<IncomeOnAccount> {
    try {
      return this.prisma.incomeOnAccount.create({data});
    } catch (error) {
      Logger.log('erro ao vincular entrada na conta: ', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async updateIncomeOnAccount(params: {
    where: Prisma.IncomeOnAccountWhereUniqueInput;
    data: IncomeOnAccountUpdateDto;
  }): Promise<IncomeOnAccount> {
    const { where, data } = params;
    const { userId } = data;
    const { id } = where;
    try {
      const verifyIncomeOnAccountExists = await this.incomesOnAccount({id});

      if (verifyIncomeOnAccountExists.length === 0) {
        throw new HttpException(
          'ERRO: entrada vinculada não encontrada',
          HttpStatus.NOT_FOUND
        );
      }

      if (verifyIncomeOnAccountExists[0].userId !== userId) {
        throw new HttpException(
          'ERRO: usuário não autorizado a realizar essa ação',
          HttpStatus.UNAUTHORIZED
        );
      }

      return this.prisma.incomeOnAccount.update({
        data,
        where,
      });
    } catch (error) {
      Logger.log('erro ao atualizar entrada vinculada: ', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }


  async deleteIncomeOnAccount(where: Prisma.IncomeOnAccountWhereUniqueInput, userId: string): Promise<boolean> {
    try {
      const verifyIncomeOnAccountExists = await this.prisma.incomeOnAccount.findUnique({
        where
      })

      if (!verifyIncomeOnAccountExists) {
        throw new HttpException(
          'ERRO: entrada não encontrada',
          HttpStatus.NOT_FOUND
        );
      }

      if (verifyIncomeOnAccountExists.userId !== userId) {
        throw new HttpException(
          'ERRO: usuário não autorizado a realizar essa ação',
          HttpStatus.UNAUTHORIZED
        );
      }

      await this.prisma.incomeOnAccount.delete({
        where,
      });

      return true;
    } catch (error) {
      Logger.log('erro ao deletar entrada: ', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}