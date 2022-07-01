import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { IncomeOnAccount } from '@prisma/client';
import { IncomeOnAccountCreateDto } from './dtos/income-on-account-create.dto';
import { IncomeOnAccountUpdateDto } from './dtos/income-on-account-update.dto';
import { IncomesOnAccountService } from './incomesOnAccount.service';

@Controller('incomesOnAccount')
export class IncomesOnAccountController {
  constructor(
    // eslint-disable-next-line prettier/prettier
    private readonly  incomesService: IncomesOnAccountService,
) {}

  @Get('user/:userId')
  async getAllUserIncomesOnAccount(
    @Param('userId') userId: string,
  ): Promise<IncomeOnAccount[]> {
    return this.incomesService.incomesOnAccount({userId});
  }

  @Post()
  async createIncomeOnAccount(
    @Body() data: IncomeOnAccountCreateDto,
  ): Promise<IncomeOnAccount> {
    return this.incomesService.createIncomeOnAccount(data);
  }

  @Put(':id')
  async updateIncomeOnAccount(
    @Body() data: IncomeOnAccountUpdateDto,
    @Param('id') id: string
  ): Promise<IncomeOnAccount> {
    return this.incomesService.updateIncomeOnAccount({
      data,
      where: {
        id
      }
    })
  }

  @Delete(':id/:userId')
  async deleteIncomeOnAccount(
    @Param('id') id: string,
    @Param('userId') userId: string,
  ): Promise<IncomeOnAccount> {
    return this.incomesService.deleteIncomeOnAccount({
      id
    },userId)
  }
}