import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ExpanseOnAccount, Prisma } from '@prisma/client';
import { PrismaService } from '../../providers/database/prisma/prisma.service';
import { AccountsService } from '../accounts/accounts.service';
import { ExpanseOnAccountCreateDto } from './dtos/expanse-on-account-create.dto';

@Injectable()
export class ExpansesOnAccountService {
  // eslint-disable-next-line prettier/prettier
  constructor(private prisma: PrismaService, private accountService: AccountsService) {}

  async expansesOnAccount(where?: Prisma.ExpanseOnAccountWhereInput): Promise<ExpanseOnAccount[]> {
    try {
      const expansesOnAccount = await this.prisma.expanseOnAccount.findMany({where });

      await Promise.all(expansesOnAccount.map(async expanseOnAccount => {
        const expanse = await this.prisma.expanse.findFirst({where: {
          id: expanseOnAccount.expanseId
        }});
        Object.assign(expanseOnAccount, {expanse});
      }));

      return expansesOnAccount;
    } catch (error) {
      Logger.log('erro ao listar despesas em uma conta: ', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async createExpanseOnAccount(data: ExpanseOnAccountCreateDto): Promise<ExpanseOnAccount> {
    try {
      const expanseExists = await this.prisma.expanse.findFirst({where:{
        id: data.expanseId
      }});

      if (!expanseExists) {
        throw new HttpException(
          'ERRO: despesa não encontrada',
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
          balance: accountFound.balance - data.value
        },
        where: {
          id: accountFound.id,
        }
      })

      const expanseOnAccountCreated = await this.prisma.expanseOnAccount.create({data});

      const expanse = await this.prisma.expanse.findFirst({where: {
        id: expanseOnAccountCreated.expanseId
      }});
      Object.assign(expanseOnAccountCreated, {expanse});

      return expanseOnAccountCreated;
    })

      return response;
    } catch (error) {
      Logger.log('erro ao vincular despesa na conta: ', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async deleteExpanseOnAccount(where: Prisma.ExpanseOnAccountWhereUniqueInput, userId: string): Promise<ExpanseOnAccount> {
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

      const accountFound = await this.accountService.account({id: verifyExpanseOnAccountExists.accountId});

      await this.prisma.$transaction(async () => {
        await this.accountService.updateAccount({
          data: {
            userId: verifyExpanseOnAccountExists.userId,
            balance: accountFound.balance + verifyExpanseOnAccountExists.value
          },
          where: {
            id: accountFound.id,
          }
        });

        await this.prisma.expanseOnAccount.delete({
          where,
        });
      });
     
      return verifyExpanseOnAccountExists;
    } catch (error) {
      Logger.log('erro ao deletar despesa vinculada a uma conta: ', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}