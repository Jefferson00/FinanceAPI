import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreditCard, Prisma } from '@prisma/client';
import { addMonths, isBefore } from 'date-fns';
import { PrismaService } from '../../providers/database/prisma/prisma.service';
import { AccountsService } from '../accounts/accounts.service';
import { InvoiceCreateDto } from '../invoices/dtos/invoices-create.dto';
import { InvoiceService } from '../invoices/invoices.service';
import { CreditCardCreateDto } from './dtos/credit-card-create.dto';
import { CreditCardUpdateDto } from './dtos/credit-card-update.dto';

@Injectable()
export class CreditCardService {
  // eslint-disable-next-line prettier/prettier
  constructor(private prisma: PrismaService, private invoiceService: InvoiceService, private accountService: AccountsService) {}

  async creditCard(
    creditCardWhereUniqueInput: Prisma.CreditCardWhereUniqueInput,
  ): Promise<CreditCard | null> {
    try {
      return await this.prisma.creditCard.findUnique({
        where: creditCardWhereUniqueInput,
      });
    } catch (error) {
      Logger.log('erro ao buscar cartão: ', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async creditCards(where?: Prisma.CreditCardWhereInput): Promise<CreditCard[]> {
    try {
      return await this.prisma.creditCard.findMany({where, include: {
        Invoice: {
          where:{
            paid: false
          },
          include: {
            ExpanseOnInvoice: {
              select:{
                id: true,
                expanseId: true,
                name: true,
                value: true,
                day: true,
              }
            }
          }
        }
      }});
    } catch (error) {
      Logger.log('erro ao listar cartões: ', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async createCreditCard(data: CreditCardCreateDto): Promise<CreditCard> {
    try {
      const verifyIfAccountExists = await this.accountService.account({id: data.receiptDefault});

      if (!verifyIfAccountExists){
        throw new HttpException(
          'ERRO: conta padrão não encontrada.',
          HttpStatus.NOT_FOUND
        );
      }

      const card = await this.prisma.creditCard.create({
        data,
      });

      if (isBefore(card.invoiceClosing, new Date())){
        const firstInvoice : InvoiceCreateDto = {
          accountId: card.receiptDefault,
          closingDate: addMonths(card.invoiceClosing, 1).toISOString(),
          month: addMonths(card.paymentDate, 1).toISOString(),
          creditCardId: card.id,
          value: 0,
          paymentDate: addMonths(card.paymentDate, 1).toISOString(),
          paid:false,
          closed: false,
        }

        await this.invoiceService.createInvoice(firstInvoice);
      } else {
        const firstInvoice : InvoiceCreateDto = {
          accountId: card.receiptDefault,
          closingDate: card.invoiceClosing.toISOString(),
          month: card.paymentDate.toISOString(),
          creditCardId: card.id,
          value: 0,
          paymentDate: card.paymentDate.toISOString(),
          paid:false,
          closed: false,
        }

        await this.invoiceService.createInvoice(firstInvoice);
      }

      return card;
    } catch (error) {
      Logger.log('erro ao criar cartão: ', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async updateCreditCard(params: {
    where: Prisma.CreditCardWhereUniqueInput;
    data: CreditCardUpdateDto;
  }): Promise<CreditCard> {
    const { where, data } = params;
    const { userId } = data;
    const { id } = where;
    try {
      const verifyCreditCardExists = await this.creditCard({id});

      if (!verifyCreditCardExists) {
        throw new HttpException(
          'ERRO: cartão não encontrado',
          HttpStatus.NOT_FOUND
        );
      }

      if (verifyCreditCardExists.userId !== userId) {
        throw new HttpException(
          'ERRO: usuário não autorizado a realizar essa ação',
          HttpStatus.UNAUTHORIZED
        );
      }

      return this.prisma.creditCard.update({
        data,
        where,
      });
    } catch (error) {
      Logger.log('erro ao atualizar cartão: ', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async deleteCreditCard(where: Prisma.CreditCardWhereUniqueInput, userId: string): Promise<CreditCard> {
    try {
      const verifyCreditCardExists = await this.creditCard(where);

      if (!verifyCreditCardExists) {
        throw new HttpException(
          'ERRO: cartão não encontrado',
          HttpStatus.NOT_FOUND
        );
      }

      if (verifyCreditCardExists.userId !== userId) {
        throw new HttpException(
          'ERRO: usuário não autorizado a realizar essa ação',
          HttpStatus.UNAUTHORIZED
        );
      }

      const findOpenInvoices = await this.invoiceService.invoices({
        creditCardId: verifyCreditCardExists.id, AND: {
          closed: false,
        }
      });

      if (findOpenInvoices.length > 0){
        const expansesOnInvoice = await this.prisma.expanseOnInvoice.findFirst({
          where: {
            invoiceId: findOpenInvoices[0].id
          }
        });

        if (expansesOnInvoice) {
          throw new HttpException(
            'ERRO: esse cartão possui despesas na fatura em aberto',
            HttpStatus.BAD_REQUEST
          );
        }
      }

      const findAllInvoices = await this.invoiceService.invoices({
        creditCardId: verifyCreditCardExists.id
      });

      await Promise.all(findAllInvoices.map(async(invoice) => {
        await this.invoiceService.deleteInvoice({id: invoice.id});
      }));

      return await this.prisma.creditCard.delete({
        where,
      });
    } catch (error) {
      Logger.log('erro ao deletar cartão: ', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

}