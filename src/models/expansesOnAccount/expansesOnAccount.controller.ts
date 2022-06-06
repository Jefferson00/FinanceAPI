import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ExpanseOnAccount } from '@prisma/client';
import { ExpanseOnAccountCreateDto } from './dtos/expanse-on-account-create.dto';
import { ExpansesOnAccountService } from './expansesOnAccount.service';

@Controller('expansesOnAccount')
export class ExpansesOnAccountController {
  constructor(
    // eslint-disable-next-line prettier/prettier
    private readonly  expansesOnAccountService: ExpansesOnAccountService,
) {}

  @Get('user/:userId')
  async getAllUserExpanseOnAccount(
    @Param('userId') userId: string,
  ): Promise<ExpanseOnAccount[]> {
    return this.expansesOnAccountService.expansesOnAccount({userId});
  }

  @Post()
  async createExpanseOnAccount(
    @Body() data: ExpanseOnAccountCreateDto,
  ): Promise<ExpanseOnAccount> {
    return this.expansesOnAccountService.createExpanseOnAccount(data);
  }

  @Delete(':id/:userId')
  async deleteExpanseOnAccount(
    @Param('id') id: string,
    @Param('userId') userId: string,
  ): Promise<boolean> {
    return this.expansesOnAccountService.deleteExpanseOnAccount({
      id
    },userId)
  }

}