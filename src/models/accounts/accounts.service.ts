import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/providers/database/prisma/prisma.service';
import { Account, Prisma } from '@prisma/client';
import { AccountCreateDto } from './dtos/account-create.dto';

@Injectable()
export class AccountsService {
  // eslint-disable-next-line prettier/prettier
  constructor(private prisma: PrismaService) {}

  async accounts(): Promise<Account[]> {
    try {
      return await this.prisma.account.findMany();
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

}