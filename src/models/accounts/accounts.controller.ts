import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { Account } from '@prisma/client';
import { AccountsService } from './accounts.service';
import { AccountCreateDto } from './dtos/account-create.dto';
import { AccountUpdateDto } from './dtos/account-update.dto';

@Controller('accounts')
export class AccountsController {
  constructor(
        // eslint-disable-next-line prettier/prettier
        private readonly accountService: AccountsService,
  ) {}

  @Get()
  async getAllAccounts(): Promise<Account[]> {
    return this.accountService.accounts();
  }

  @Get('user/:userId')
  async getAllUserAccounts(
    @Param('userId') userId: string,
  ): Promise<Account[]> {
    return this.accountService.accounts({
      userId,
    });
  }

  @Post()
  async createAccount(
    @Body() data: AccountCreateDto,
  ): Promise<Account> {
    return this.accountService.createAccount(data);
  }

  @Put(':id')
  async updateAccount(
    @Body() data: AccountUpdateDto,
    @Param('id') id: string
  ): Promise<Account> {
    return this.accountService.updateAccount({
      data,
      where: {
        id
      }
    })
  }

  @Delete(':id/:userId')
  async deleteAccount(
    @Param('id') id: string,
    @Param('userId') userId: string,
  ): Promise<Account> {
    return this.accountService.deleteAccount({
      id
    },userId)
  }
}
