import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../providers/database/prisma/prisma.service';
import { Account, AccountBalance, Prisma } from '@prisma/client';
import { AccountCreateDto } from './dtos/account-create.dto';
import { AccountUpdateDto } from './dtos/account-update.dto';
import { AccountBalanceCreateDto } from './dtos/account-balance-create.dto';
import { AccountBalanceUpdateDto } from './dtos/account-balance-update.dto';
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
      const accounts = await this.prisma.account.findMany({where});

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

  async accountsBalance(where?: Prisma.AccountBalanceWhereInput): Promise<AccountBalance[]> {
    try {
      return await this.prisma.accountBalance.findMany({where});
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
      
      return this.prisma.account.create({
        data: {
          ...data,
          balance: data.initialValue,
        },
      });
    } catch (error) {
      Logger.log('erro ao criar conta: ', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async createAccountBalance(data: AccountBalanceCreateDto): Promise<AccountBalance> {
    try {
      return this.prisma.accountBalance.create({
        data,
      });
    } catch (error) {
      Logger.log('erro ao criar saldo da conta: ', error);
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

      return this.prisma.account.update({
        data,
        where,
      });
    } catch (error) {
      Logger.log('erro ao atualizar conta: ', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async updateAccountBalance(params: {
    where: Prisma.AccountBalanceWhereUniqueInput;
    data: AccountBalanceUpdateDto;
  }): Promise<AccountBalance> {
    const { where, data } = params;
    const { accountId } = data;
    const { id } = where;
    try {
      const verifyAccountBalanceExists = await this.accountsBalance({id});

      if (verifyAccountBalanceExists.length === 0) {
        throw new HttpException(
          'ERRO: saldo da conta não encontrada',
          HttpStatus.NOT_FOUND
        );
      }

      if (verifyAccountBalanceExists[0].accountId !== accountId) {
        throw new HttpException(
          'ERRO: usuário não autorizado a realizar essa ação',
          HttpStatus.UNAUTHORIZED
        );
      }

      return this.prisma.accountBalance.update({
        data,
        where,
      });
    } catch (error) {
      Logger.log('erro ao atualizar saldo da conta: ', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async deleteAccountBalance(where: Prisma.AccountBalanceWhereUniqueInput): Promise<AccountBalance> {
    try {
      const verifyAccountExists = await this.prisma.accountBalance.findMany({where});

      if (verifyAccountExists.length === 0) {
        throw new HttpException(
          'ERRO: conta não encontrada',
          HttpStatus.NOT_FOUND
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

      return await this.prisma.accountBalance.delete({
        where,
      });
    } catch (error) {
      Logger.log('erro ao deletar balanço da conta: ', error);
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