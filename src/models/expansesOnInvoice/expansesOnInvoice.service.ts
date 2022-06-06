import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ExpanseOnInvoice, Prisma } from '@prisma/client';
import { PrismaService } from 'src/providers/database/prisma/prisma.service';
import { ExpanseOnInvoiceCreateDto } from './dtos/expanse-on-invoice-create.dto';
import { InvoiceService } from '../invoices/invoices.service';

@Injectable()
export class ExpansesOnInvoiceService { 
  // eslint-disable-next-line prettier/prettier
  constructor(private prisma: PrismaService, private invoiceService: InvoiceService) {}

  async expansesOnInvoice(where?: Prisma.ExpanseOnInvoiceWhereInput): Promise<ExpanseOnInvoice[]> {
    try {
      return await this.prisma.expanseOnInvoice.findMany({where });
    } catch (error) {
      Logger.log('erro ao listar despesas em uma fatura: ', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async createExpanseOnInvoice(data: ExpanseOnInvoiceCreateDto, creditCardId: string): Promise<ExpanseOnInvoice> {
    try {
      const verifyInvoiceExists = await this.invoiceService.invoices({creditCardId, AND: {
        closed: false
      }});

      if (verifyInvoiceExists.length === 0) {
        throw new HttpException(
          'ERRO: fatura não encontrada',
          HttpStatus.NOT_FOUND
        );
      }

      const verifyExpanseExists = await this.prisma.expanse.findFirst({where: {
        id: data.expanseId
      }});

      if (!verifyExpanseExists) {
        throw new HttpException(
          'ERRO: despesa não encontrada',
          HttpStatus.NOT_FOUND
        );
      }

      return this.prisma.expanseOnInvoice.create({data: {
        ...data,
        invoiceId: verifyInvoiceExists[0].id
      }});
    } catch (error) {
      Logger.log('erro ao vincular despesa na fatura: ', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async deleteExpanseOnInvoice(where: Prisma.ExpanseOnInvoiceWhereUniqueInput): Promise<ExpanseOnInvoice> {
    try {
      const verifyExpanseExists = await this.expansesOnInvoice(where);

      if (verifyExpanseExists.length === 0) {
        throw new HttpException(
          'ERRO: despesa na fatura não encontrada',
          HttpStatus.NOT_FOUND
        );
      }

      const response = await this.prisma.$transaction(async() => {
        const invoice = await this.invoiceService.invoice({id: verifyExpanseExists[0].invoiceId});

        await this.invoiceService.updateInvoice({where: {
          id: invoice.id,
        }, data: {
          value: invoice.value - verifyExpanseExists[0].value
        }});

        return await this.prisma.expanseOnInvoice.delete({
          where,
        });
      })

      return response;
    } catch (error) {
      Logger.log('erro ao deletar despesa na fatura: ', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }


}