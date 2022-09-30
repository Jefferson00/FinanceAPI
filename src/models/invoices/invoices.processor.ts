import {
  OnQueueCompleted,
  OnQueueFailed,
  Process,
  Processor,
} from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Invoice } from '@prisma/client';
import { addMonths, lastDayOfMonth, startOfMonth } from 'date-fns';
import { PrismaService } from '../../providers/database/prisma/prisma.service';
import { Job } from 'bull';

@Processor('verify-invoices')
export class InvoiceProcessor {
  // eslint-disable-next-line prettier/prettier
  constructor(private prisma: PrismaService) {}

  @Process('verifyInvoicesJob')
  async verifyInvoices(job: Job<{currentInvoices: Invoice[]}>) {
    const invoices = job.data;
    Logger.log('fila verificação iniciada');
    try {
      await this.prisma.$transaction(async() => {
        await Promise.all(invoices.map(async(invoice) => {
          await this.prisma.invoice.update({
            data: {
              ...invoice,
              closed: true,
            },
            where: {
              id: invoice.id
            },
          });

          const month = addMonths(new Date(invoice.month), 1);
          const closingDate = addMonths(new Date(invoice.closingDate), 1);
          const paymentDate =  addMonths(new Date(invoice.paymentDate), 1);

          const invoiceCreated = await this.prisma.invoice.create({
            data: {
              closed: false,
              paid: false,
              value: 0,
              closingDate,
              month,
              paymentDate,
              accountId: invoice.accountId,
              creditCardId: invoice.creditCardId,
            }
          });

          const lastDay = lastDayOfMonth(month)
          lastDay.setUTCHours(23,59,59,999);
          const firstDay = new Date(closingDate);
          firstDay.setUTCHours(0,0,0,0);

          const expansesOnCreditCard = await this.prisma.expanse.findMany({where: {
            OR: [{
              receiptDefault:  invoice.creditCardId,
              startDate: {
                lte: lastDay,
              },
              endDate:{
                gte: firstDay
              }
            }, {
              receiptDefault:  invoice.creditCardId,
              startDate: {
                lte: lastDay,
              },
              endDate:null
            }]
          }});

          let sumValue = 0;

          await Promise.all(expansesOnCreditCard.map(async(exp) => {
            await this.prisma.expanseOnInvoice.create({
              data: {
                day: exp.startDate.getUTCDate(),
                expanseId: exp.id,
                name: exp.name,
                value: exp.value,
                invoiceId: invoiceCreated.id,
              }
            });

            sumValue = sumValue + exp.value
          }));

          await this.prisma.invoice.update({where: {
            id: invoiceCreated.id,
          }, data: {
            value: invoiceCreated.value + sumValue
          }});
        }));
      })
    } catch (error) {
      Logger.log('erro', error);
    }
  }

  @OnQueueCompleted()
  async onCompleted() {
    Logger.log('fila  verificação de faturas completa');
  }

  @OnQueueFailed()
  async onFailed(job: Job<{ currentInvoices: Invoice[]}>) {
    Logger.log('fila de verificação de faturas falhou', job.failedReason);
  }
}