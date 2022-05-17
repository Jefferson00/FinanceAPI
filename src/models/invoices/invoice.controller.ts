import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { Invoice } from '@prisma/client';
import { InvoiceCreateDto } from './dtos/invoices-create.dto';
import { InvoiceUpdateDto } from './dtos/invoices-update.dto';
import { InvoiceService } from './invoices.service';

@Controller('invoices')
export class InvoiceController {
  constructor(
    // eslint-disable-next-line prettier/prettier
    private readonly invoiceService: InvoiceService,
  ) {}

  @Get()
  async getAllInvoices(): Promise<Invoice[]> {
    return this.invoiceService.invoices();
  }

  @Get('card/:creditCardId')
    async getAllCreditCardsInvoices(
      @Param('creditCardId') creditCardId: string,
    ): Promise<Invoice[]> {
      return this.invoiceService.invoices({
        creditCardId,
      });
    }

    @Post()
    async createInvoice(
      @Body() data: InvoiceCreateDto,
    ): Promise<Invoice> {
      return this.invoiceService.createInvoice(data);
    }

    @Put(':id')
    async updateInvoice(
      @Body() data: InvoiceUpdateDto,
      @Param('id') id: string
    ): Promise<Invoice> {
      return this.invoiceService.updateInvoice({
        data,
        where: {
          id
        }
      })
    }
  
    @Delete(':id')
    async deleteInvoice(
      @Param('id') id: string,
    ): Promise<Invoice> {
      return this.invoiceService.deleteInvoice({
        id
      })
    }

    @Post('verify')
    async verifyInvoice(): Promise<void> {
      return this.invoiceService.verifyInvoice();
    }

}