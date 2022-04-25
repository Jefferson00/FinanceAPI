import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../providers/database/prisma/prisma.service';
import { Account, Prisma } from '@prisma/client';
import { AccountCreateDto } from './dtos/account-create.dto';
import { AccountUpdateDto } from './dtos/account-update.dto';

@Injectable()
export class AccountsService {
  // eslint-disable-next-line prettier/prettier
  constructor(private prisma: PrismaService) {}

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
      return await this.prisma.account.findMany({where});
    } catch (error) {
      Logger.log('erro ao listar contas: ', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async createAccount(data: AccountCreateDto): Promise<Account> {
    try {
      return this.prisma.account.create({
        data,
      });
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

      return this.prisma.account.update({
        data,
        where,
      });
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

      // Verificar entradas/saídas vinculadas

      return await this.prisma.account.delete({
        where,
      });
    } catch (error) {
      Logger.log('erro ao deletar conta: ', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

}