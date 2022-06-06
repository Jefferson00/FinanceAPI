import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { IncomeOnAccount, Prisma } from '@prisma/client';
import { PrismaService } from '../../providers/database/prisma/prisma.service';
import { AccountsService } from '../accounts/accounts.service';
import { IncomeOnAccountCreateDto } from './dtos/income-on-account-create.dto';
import { IncomeOnAccountUpdateDto } from './dtos/income-on-account-update.dto';


@Injectable()
export class IncomesOnAccountService {
  // eslint-disable-next-line prettier/prettier
  constructor(private prisma: PrismaService, private accountService: AccountsService) {}

  async incomesOnAccount(where?: Prisma.IncomeOnAccountWhereInput): Promise<IncomeOnAccount[]> {
    try {
      const incomesOnAccount = await this.prisma.incomeOnAccount.findMany({where});
    
      await Promise.all(incomesOnAccount.map(async incomeOnAccount => {
        const income = await this.prisma.income.findFirst({where: {
          id: incomeOnAccount.incomeId
        }});
        Object.assign(incomeOnAccount, {income});
      }));
      
      return incomesOnAccount;
    } catch (error) {
      Logger.log('erro ao listar entradas: ', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async createIncomeOnAccount(data: IncomeOnAccountCreateDto): Promise<IncomeOnAccount> {
    try {
      const incomeExists = await this.prisma.income.findFirst({where:{
        id: data.incomeId
      }});

      if (!incomeExists) {
        throw new HttpException(
          'ERRO: entrada não encontrada',
          HttpStatus.NOT_FOUND
        );
      }

      const accountFound = await this.accountService.account({id: data.accountId});

      if(!accountFound){
        throw new HttpException(
          'ERRO: conta não encontrada',
          HttpStatus.NOT_FOUND
        );
      }

     // verificar se já existe no mês

      const response = await this.prisma.$transaction(async () => {
        await this.accountService.updateAccount({
          data: {
            userId: data.userId,
            balance: accountFound.balance + data.value
          },
          where: {
            id: accountFound.id,
          }
        })

        return this.prisma.incomeOnAccount.create({data});
      })
      return response;
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

      const accountFound = await this.accountService.account({id: verifyIncomeOnAccountExists.accountId});

      await this.prisma.$transaction(async () => {
        await this.accountService.updateAccount({
          data: {
            userId: verifyIncomeOnAccountExists.userId,
            balance: accountFound.balance - verifyIncomeOnAccountExists.value
          },
          where: {
            id: accountFound.id,
          }
        });

        await this.prisma.incomeOnAccount.delete({
          where,
        });
      });

      return true;
    } catch (error) {
      Logger.log('erro ao deletar entrada: ', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
 }