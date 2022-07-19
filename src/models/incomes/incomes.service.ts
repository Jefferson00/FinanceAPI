import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Income, IncomeOnAccount, Prisma } from '@prisma/client';
import { PrismaService } from '../../providers/database/prisma/prisma.service';
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

  async lastIncomesOnAccount(where?: Prisma.IncomeOnAccountWhereInput): Promise<IncomeOnAccount[]> {
    try {
      const incomes = await this.prisma.incomeOnAccount.findMany({where, take: 3 });

      await Promise.all(incomes.map(async (inc) => {
        const findIncome = await this.income({id: inc.incomeId});
        if (findIncome) Object.assign(inc, {category: findIncome.category});
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
      const accountExists = await this.prisma.account.findFirst({where: {
        id: data.receiptDefault,
        AND: {
          status: 'active'
        }
      }});

      if (!accountExists) {
        throw new HttpException(
          'ERRO: conta de recebimento padrão não encontrada',
          HttpStatus.NOT_FOUND
        );
      }

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

      if (data.receiptDefault) {
        const accountExists = await this.prisma.account.findFirst({where: {
          id: data.receiptDefault,
          AND: {
            status: 'active'
          }
        }});
  
        if (!accountExists) {
          throw new HttpException(
            'ERRO: conta de recebimento padrão não encontrada',
            HttpStatus.NOT_FOUND
          );
        }
      }

      /* const incomesOnAccount = await this.incomesOnAccount({
        incomeId: verifyIncomeExists.id
      });

      await Promise.all(incomesOnAccount.map(async incomeOnAccount => {
        await this.prisma.incomeOnAccount.update({
          data: {
            name: data.name
          },
          where: {
            id: incomeOnAccount.id
          }
        })
      })); */

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
}