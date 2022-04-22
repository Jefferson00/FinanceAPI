import { Body, Controller, Get, Post } from '@nestjs/common';
import { Account } from '@prisma/client';
import { AccountsService } from './accounts.service';
import { AccountCreateDto } from './dtos/account-create.dto';

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

  @Post()
  async createAccount(
    @Body() data: AccountCreateDto,
  ): Promise<Account> {
    return this.accountService.createAccount(data);
  }
}
