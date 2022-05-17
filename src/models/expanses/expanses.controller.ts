import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { Expanse, ExpanseOnAccount, ExpanseOnInvoice } from '@prisma/client';
import { ExpansesService } from './expanses.service';
import {  ExpanseOnAccountCreateDto } from './dtos/expanse-on-account-create.dto';
import {ExpanseCreateDto  } from './dtos/expanse-create.dto';
import {ExpanseUpdateDto  } from './dtos/expanse-update.dto';
import { ExpanseOnInvoiceCreateDto } from './dtos/expanse-on-invoice-create.dto';


@Controller('expanses')
export class ExpansesController {
  constructor(
    // eslint-disable-next-line prettier/prettier
    private readonly  expansesService: ExpansesService,
) {}

@Get('user/:userId')
async getAllUserExpanses(
  @Param('userId') userId: string,
): Promise<Expanse[]> {
  return this.expansesService.expanses({
    userId,
  });
}

@Post()
async createExpanse(
  @Body() data: ExpanseCreateDto,
): Promise<Expanse> {
  return this.expansesService.createExpanse(data);
}

@Put(':id')
async updateExpanse(
  @Body() data: ExpanseUpdateDto,
  @Param('id') id: string
): Promise<Expanse> {
  return this.expansesService.updateExpanse({
    data,
    where: {
      id
    }
  })
}

@Delete(':id/:userId')
async deleteExpanse(
  @Param('id') id: string,
  @Param('userId') userId: string,
): Promise<Expanse> {
  return this.expansesService.deleteExpanse({
    id
  },userId)
}


@Get('onAccount/:userId')
async getAllUserExpanseOnAccount(
  @Param('userId') userId: string,
): Promise<ExpanseOnAccount[]> {
  return this.expansesService.expansesOnAccount({userId});
}


@Post('/onAccount')
async createExpanseOnAccount(
  @Body() data: ExpanseOnAccountCreateDto,
): Promise<ExpanseOnAccount> {
  return this.expansesService.createExpanseOnAccount(data);
}

@Delete('onAccount/:id/:userId')
async deleteExpanseOnAccount(
  @Param('id') id: string,
  @Param('userId') userId: string,
): Promise<boolean> {
  return this.expansesService.deleteExpanseOnAccount({
    id
  },userId)
}

@Post('/onInvoice/:creditCardId')
async createExpanseOnInvoice(
  @Body() data: ExpanseOnInvoiceCreateDto,
  @Param('creditCardId') creditCardId: string,
): Promise<ExpanseOnInvoice> {
  return this.expansesService.createExpanseOnInvoice(data, creditCardId);
}


}