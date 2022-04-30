import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { Income, IncomesOnAccounts } from '@prisma/client';
import { IncomeOnAccountCreateDto } from './dtos/income-on-account-create.dto';
import { IncomesCreateDto } from './dtos/incomes-create.dto';
import { IncomeUpdateDto } from './dtos/incomes-update.dto';
import { IncomesService } from './incomes.service';
import { lastDayOfMonth, startOfMonth } from 'date-fns';


@Controller('incomes')
export class IncomesController {
  constructor(
    // eslint-disable-next-line prettier/prettier
    private readonly  incomesService: IncomesService,
) {}

@Get('user/:userId/:date')
  async getAllUserIncomes(
    @Param('userId') userId: string,
    @Param('date') date: string,
  ): Promise<Income[]> {
    const lastDay = lastDayOfMonth(new Date(date))
    lastDay.setUTCHours(23,59,59,999);
    const firstDay = startOfMonth(new Date(date));
    firstDay.setUTCHours(0,0,0,0);
    return this.incomesService.incomes({
      userId,
      startDate: {
        lte: lastDay,
      },
      endDate:{
        gte: firstDay
      } 
    });
  }

  @Get('user/:userId/:startDate/monthly')
  async getAllMonthlyUserIncomes(
    @Param('userId') userId: string,
    @Param('startDate') startDate: string,
  ): Promise<Income[]> {

    return this.incomesService.incomes({
      userId,
      startDate: {
        lte: startDate,
      },
      endDate: null
    });
  }

  @Get('onAccount/:userId/:date')
  async getAllUserIncomesOnAccount(
    @Param('userId') userId: string,
    @Param('date') date: string,
  ): Promise<IncomesOnAccounts[]> {
    const lastDay = lastDayOfMonth(new Date(date))
    lastDay.setUTCHours(23,59,59,999);
    const firstDay = startOfMonth(new Date(date));
    firstDay.setUTCHours(0,0,0,0);

    return this.incomesService.incomesOnAccount({
      income : {
        userId,
        receiptDate: {
          gte: firstDay,
          lt: lastDay,
        }
      }
    });
  }

  @Post()
  async createIncome(
    @Body() data: IncomesCreateDto,
  ): Promise<Income> {
    return this.incomesService.createIncomes(data);
  }

  @Post('/onAccount')
  async createIncomeOnAccount(
    @Body() data: IncomeOnAccountCreateDto,
  ): Promise<IncomesOnAccounts> {
    return this.incomesService.createIncomeOnAccount(data);
  }

  @Put(':id')
  async updateIncome(
    @Body() data: IncomeUpdateDto,
    @Param('id') id: string
  ): Promise<Income> {
    return this.incomesService.updateIncome({
      data,
      where: {
        id
      }
    })
  }

  @Delete(':id/:userId')
  async deleteIncome(
    @Param('id') id: string,
    @Param('userId') userId: string,
  ): Promise<Income> {
    return this.incomesService.deleteIncome({
      id
    },userId)
  }
}