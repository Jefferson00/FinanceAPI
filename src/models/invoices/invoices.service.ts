import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Invoice, Prisma } from '@prisma/client';
import { addMonths, lastDayOfMonth, startOfMonth } from 'date-fns';
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

  @Cron(CronExpression.EVERY_DAY_AT_8PM)
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
  
            const invoiceCreated = await this.prisma.invoice.create({
              data: {
                closed: false,
                paid: false,
                value: 0,
                closingDate: addMonths(invoice.closingDate, 1),
                month: addMonths(invoice.month, 1),
                paymentDate: addMonths(invoice.paymentDate, 1),
                accountId: invoice.accountId,
                creditCardId: invoice.creditCardId,
              }
            });
  
            const lastDay = lastDayOfMonth(new Date())
            lastDay.setUTCHours(23,59,59,999);
            const firstDay = startOfMonth(new Date());
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

            console.log(expansesOnCreditCard)
  
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
  
            await this.updateInvoice({where: {
              id: invoiceCreated.id,
            }, data: {
              value: invoiceCreated.value + sumValue
            }});
          }));
        }
        Logger.log('faturas verificadas');
      });
    } catch (error) {
      Logger.log('erro ao verificar fatura: ', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}