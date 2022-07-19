import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../providers/database/prisma/prisma.service';
import { Account, Prisma } from '@prisma/client';
import { AccountCreateDto } from './dtos/account-create.dto';
import { AccountUpdateDto } from './dtos/account-update.dto';
import { IncomesService } from '../incomes/incomes.service';
import { ExpansesService } from '../expanses/expanses.service';

@Injectable()
export class AccountsService {
  // eslint-disable-next-line prettier/prettier
  constructor(private prisma: PrismaService, private incomeService: IncomesService, private expanseService: ExpansesService) {}

  async account(
    accountWhereUniqueInput: Prisma.AccountWhereUniqueInput,
  ): Promise<Account | null> {
    try {
      return await this.prisma.account.findUnique({
        where: accountWhereUniqueInput,
      });
    } catch (error) {
      Logger.log('erro ao buscar conta: ', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }


  async accounts(where?: Prisma.AccountWhereInput): Promise<Account[]> {
    try {
      const accounts = await this.prisma.account.findMany({where, include: {
        Invoice:{
          where: {
            paid: true,
          },
          include: {
            ExpanseOnInvoice: true,
          }
        }
      }});

      await Promise.all(accounts.map(async account => {
        const incomesOnAccount = await this.prisma.incomeOnAccount.findMany({where: {
          accountId: account.id
        }});

        const expansesOnAccount = await this.prisma.expanseOnAccount.findMany({where: {
          accountId: account.id
        }});
        Object.assign(account, {incomesOnAccount, expansesOnAccount});
      }));

      return accounts;
    } catch (error) {
      Logger.log('erro ao listar contas: ', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async createAccount(data: AccountCreateDto): Promise<Account> {
    try {
      const userExists = await this.prisma.user.findFirst({
        where: {
          id: data.userId
        }
      });

      if(!userExists){
        throw new HttpException(
          'ERRO: usuário não encontrado',
          HttpStatus.NOT_FOUND
        );
      }
      
      const accountCreated = await this.prisma.account.create({
        data: {
          ...data,
          balance: data.initialValue,
        },
        include: {Invoice: {
          where: {
            paid: true,
          },
          include: {
            ExpanseOnInvoice: true,
          }
        }}
      });

      const incomesOnAccount = await this.prisma.incomeOnAccount.findMany({where: {
        accountId: accountCreated.id
      }});

      const expansesOnAccount = await this.prisma.expanseOnAccount.findMany({where: {
        accountId: accountCreated.id
      }});

      Object.assign(accountCreated, {incomesOnAccount, expansesOnAccount});

      return accountCreated;
    } catch (error) {
      Logger.log('erro ao criar conta: ', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async updateAccount(params: {
    where: Prisma.AccountWhereUniqueInput;
    data: AccountUpdateDto;
  }): Promise<Account> {
    const { where, data } = params;
    const { userId } = data;
    const { id } = where;
    try {
      const verifyAccountExists = await this.account({id});

      if (!verifyAccountExists) {
        throw new HttpException(
          'ERRO: conta não encontrada',
          HttpStatus.NOT_FOUND
        );
      }

      if (verifyAccountExists.userId !== userId) {
        throw new HttpException(
          'ERRO: usuário não autorizado a realizar essa ação',
          HttpStatus.UNAUTHORIZED
        );
      }

      const accountUpdated = await this.prisma.account.update({
        data,
        where,
        include: {Invoice: {
          where: {
            paid: true,
          },
          include: {
            ExpanseOnInvoice: true,
          }
        }}
      });

      const incomesOnAccount = await this.prisma.incomeOnAccount.findMany({where: {
        accountId: accountUpdated.id
      }});

      const expansesOnAccount = await this.prisma.expanseOnAccount.findMany({where: {
        accountId: accountUpdated.id
      }});

      Object.assign(accountUpdated, {incomesOnAccount, expansesOnAccount});

      return accountUpdated;
    } catch (error) {
      Logger.log('erro ao atualizar conta: ', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async deleteAccount(where: Prisma.AccountWhereUniqueInput, userId: string): Promise<Account> {
    try {
      const verifyAccountExists = await this.account(where);

      if (!verifyAccountExists) {
        throw new HttpException(
          'ERRO: conta não encontrada',
          HttpStatus.NOT_FOUND
        );
      }

      if (verifyAccountExists.userId !== userId) {
        throw new HttpException(
          'ERRO: usuário não autorizado a realizar essa ação',
          HttpStatus.UNAUTHORIZED
        );
      }

      const incomesOnAccount = await this.prisma.incomeOnAccount.findMany( {
        where: {
          accountId: where.id
        }
      });
      const expansesOnAccount = await this.prisma.expanseOnAccount.findMany({
        where: {
          accountId: where.id
        }
      });

      if (incomesOnAccount.length > 0 || expansesOnAccount.length > 0) {
        throw new HttpException(
          'ERRO: essa conta possui registros de entradas ou despesas. Nesse caso, você pode mudar o status da conta para "inativo"',
          HttpStatus.UNAUTHORIZED
        );
      }

      return await this.prisma.account.delete({
        where,
      });
    } catch (error) {
      Logger.log('erro ao deletar conta: ', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

}