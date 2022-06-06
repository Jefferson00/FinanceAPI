import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ExpanseOnInvoice } from '@prisma/client';
import { ExpanseOnInvoiceCreateDto } from './dtos/expanse-on-invoice-create.dto';
import { ExpansesOnInvoiceService } from './expansesOnInvoice.service';

@Controller('expansesOnInvoice')
export class ExpansesOnInvoiceController {
  constructor(
    // eslint-disable-next-line prettier/prettier
    private readonly  expansesOnInvoiceService: ExpansesOnInvoiceService,
) {}

  @Get('invoice/:invoiceId')
  async getAllUserExpanseOnInvoice(
    @Param('invoiceId') invoiceId: string,
  ): Promise<ExpanseOnInvoice[]> {
    return this.expansesOnInvoiceService.expansesOnInvoice({invoiceId});
  }

  @Post('/creditCard/:creditCardId')
  async createExpanseOnInvoice(
    @Body() data: ExpanseOnInvoiceCreateDto,
    @Param('creditCardId') creditCardId: string,
  ): Promise<ExpanseOnInvoice> {
    return this.expansesOnInvoiceService.createExpanseOnInvoice(data, creditCardId);
  }

  @Delete(':id')
  async deleteExpanseOnInvoice(
    @Param('id') id: string,
  ): Promise<ExpanseOnInvoice> {
    return this.expansesOnInvoiceService.deleteExpanseOnInvoice({
      id
    })
  }
}