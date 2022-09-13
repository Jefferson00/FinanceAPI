import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Invoice, Prisma } from '@prisma/client';
import { PrismaService } from '../../providers/database/prisma/prisma.service';
import { InvoiceCreateDto } from './dtos/invoices-create.dto';
import { InvoiceUpdateDto } from './dtos/invoices-update.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';


@Injectable()
export class InvoiceService {
  // eslint-disable-next-line prettier/prettier
  constructor(private prisma: PrismaService, @InjectQueue('verify-invoices') private verifyInvoicesQueue: Queue) {}

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
      const invoiceCreated = await this.prisma.invoice.create({
        data,
      })
      return invoiceCreated;
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

      if (data.paid !== undefined && data.paid !== verifyInvoiceExists.paid){
        const response = await this.prisma.$transaction(async () =>{
          const account = await this.prisma.account.findFirst({where: {
            id: verifyInvoiceExists.accountId
          }})
          if(data.paid){
            await this.prisma.account.update({data:{
              balance: account.balance - verifyInvoiceExists.value
            }, where: {
              id: account.id
            }});
          } else {
            await this.prisma.account.update({data:{
              balance: account.balance + verifyInvoiceExists.value
            }, where: {
              id: account.id
            }});
          }

          return this.prisma.invoice.update({
            data,
            where,
          });
        });
        return response;
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

  @Cron(CronExpression.EVERY_5_MINUTES)
  handleCron() {
    Logger.log('Called every 5 minutes');
  }

  @Cron(CronExpression.EVERY_DAY_AT_10PM)
  async verifyInvoice() : Promise<void> {
    try {
      await this.prisma.$transaction(async() => {
        const currentInvoices = await this.invoices({
          closingDate: {
            lte: new Date(),
          },
          AND: {
            closed: false
          }
        });

        if(currentInvoices.length > 0) {
          this.verifyInvoicesQueue.add('verifyInvoicesJob', currentInvoices);
        }
        Logger.log('faturas verificadas');
      });
    } catch (error) {
      Logger.log('erro ao verificar fatura: ', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}