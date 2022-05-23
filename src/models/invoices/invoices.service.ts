import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Invoice, Prisma } from '@prisma/client';
import { addMonths } from 'date-fns';
import { PrismaService } from '../../providers/database/prisma/prisma.service';
import { InvoiceCreateDto } from './dtos/invoices-create.dto';
import { InvoiceUpdateDto } from './dtos/invoices-update.dto';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class InvoiceService {
  // eslint-disable-next-line prettier/prettier
  constructor(private prisma: PrismaService) {}

  async invoice(
    invoiceWhereUniqueInput: Prisma.InvoiceWhereUniqueInput,
  ): Promise<Invoice | null> {
    try {
      return await this.prisma.invoice.findUnique({
        where: invoiceWhereUniqueInput,
      });
    } catch (error) {
      Logger.log('erro ao buscar fatura: ', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async invoices(where?: Prisma.InvoiceWhereInput): Promise<Invoice[]> {
    try {
      return await this.prisma.invoice.findMany({where});
    } catch (error) {
      Logger.log('erro ao listar faturas: ', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async createInvoice(data: InvoiceCreateDto): Promise<Invoice> {
    try {
      return this.prisma.invoice.create({
        data,
      });
    } catch (error) {
      Logger.log('erro ao criar fatura: ', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async updateInvoice(params: {
    where: Prisma.InvoiceWhereUniqueInput;
    data: InvoiceUpdateDto;
  }): Promise<Invoice> {
    const { where, data } = params;
    const { id } = where;
    try {
      const verifyInvoiceExists = await this.invoice({id});

      if (!verifyInvoiceExists) {
        throw new HttpException(
          'ERRO: fatura não encontrado',
          HttpStatus.NOT_FOUND
        );
      }

      return this.prisma.invoice.update({
        data,
        where,
      });
    } catch (error) {
      Logger.log('erro ao atualizar fatura: ', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async deleteInvoice(where: Prisma.InvoiceWhereUniqueInput): Promise<Invoice> {
    try {
      const verifyInvoiceExists = await this.invoice(where);

      if (!verifyInvoiceExists) {
        throw new HttpException(
          'ERRO: fatura não encontrado',
          HttpStatus.NOT_FOUND
        );
      }

      return await this.prisma.invoice.delete({
        where,
      });
    } catch (error) {
      Logger.log('erro ao deletar fatura: ', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async verifyInvoice() : Promise<void> {
    try {
      const currentInvoices = await this.invoices({
        closingDate: {
          lte: new Date(),
        },
        AND: {
          closed: false
        }
      });

      if(currentInvoices.length > 0) {
        await Promise.all(currentInvoices.map(async(invoice) => {
          await this.prisma.invoice.update({
            data: {
              ...invoice,
              closed: true,
            },
            where: {
              id: invoice.id
            },
          });

          await this.prisma.invoice.create({
            data: {
              closed: false,
              paid: false,
              value: 0,
              closingDate: addMonths(invoice.closingDate, 1),
              month: addMonths(invoice.month, 1),
              paymentDate: invoice.paymentDate,
              accountId: invoice.accountId,
              creditCardId: invoice.creditCardId,
            }
          })
        }));
      }
      Logger.log('faturas verificadas');
    } catch (error) {
      Logger.log('erro ao verificar fatura: ', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}