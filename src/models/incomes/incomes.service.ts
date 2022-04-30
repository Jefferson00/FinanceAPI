import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Income, IncomesOnAccounts, Prisma } from '@prisma/client';
import { PrismaService } from 'src/providers/database/prisma/prisma.service';
import { IncomeOnAccountCreateDto } from './dtos/income-on-account-create.dto';
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

  async incomesOnAccount(where?: Prisma.IncomesOnAccountsWhereInput): Promise<IncomesOnAccounts[]> {
    try {
      return await this.prisma.incomesOnAccounts.findMany({where, include: {
        income: {
          include: {
            IncomesOnAccounts :{
              where
            }
          }
        }
      } });
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

  async createIncomeOnAccount(data: IncomeOnAccountCreateDto): Promise<IncomesOnAccounts> {
    try {
      return this.prisma.incomesOnAccounts.create({data: {
        assignedBy: data.assignedBy,
        paymentDate: data.paymentDate,
        receiptDate: data.receiptDate,
        recurrence: data.recurrence,
        value: data.value,
        account: {
          connect: {
            id: data.accountId,
          }
        },
        income: {
          connect: {
            id: data.incomeId,
          }
        }
      }});
    } catch (error) {
      Logger.log('erro ao criar entrada: ', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}