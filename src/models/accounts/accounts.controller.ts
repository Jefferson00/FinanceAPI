import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { Account, AccountBalance } from '@prisma/client';
import { AccountsService } from './accounts.service';
import { AccountBalanceCreateDto } from './dtos/account-balance-create.dto';
import { AccountBalanceUpdateDto } from './dtos/account-balance-update.dto';
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

  @Get('all/user/:userId')
  async getAllUserAccounts(
    @Param('userId') userId: string,
  ): Promise<Account[]> {
    return this.accountService.accounts({
      userId,
    });
  }

  @Get('active/user/:userId')
  async getAllUserActiveAccounts(
    @Param('userId') userId: string,
  ): Promise<Account[]> {
    return this.accountService.accounts({
      userId,
      AND:{
        status: 'active'
      }
    });
  }

  @Get('/balance/:accountId')
  async getAllAccountsBalance(
    @Param('accountId') accountId: string,
  ): Promise<AccountBalance[]> {
    return this.accountService.accountsBalance({
      accountId,
    });
  }

  @Post()
  async createAccount(
    @Body() data: AccountCreateDto,
  ): Promise<Account> {
    return this.accountService.createAccount(data);
  }

  @Post('/balance')
  async createAccountBalance(
    @Body() data: AccountBalanceCreateDto,
  ): Promise<AccountBalance> {
    return this.accountService.createAccountBalance(data);
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

  @Put('/balance/:id')
  async updateAccountBalance(
    @Body() data: AccountBalanceUpdateDto,
    @Param('id') id: string
  ): Promise<AccountBalance> {
    return this.accountService.updateAccountBalance({
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

  @Delete(':id')
  async deleteAccountBalance(
    @Param('id') id: string,
  ): Promise<AccountBalance> {
    return this.accountService.deleteAccountBalance({
      id
    })
  }
}
