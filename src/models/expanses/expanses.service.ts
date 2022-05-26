import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Expanse, ExpanseOnAccount, ExpanseOnInvoice, Prisma } from '@prisma/client';
import { addMonths } from 'date-fns';
import { PrismaService } from '../../providers/database/prisma/prisma.service';
import { InvoiceService } from '../invoices/invoices.service';
import { ExpanseCreateDto } from './dtos/expanse-create.dto';
import { ExpanseOnAccountCreateDto } from './dtos/expanse-on-account-create.dto';
import { ExpanseOnInvoiceCreateDto } from './dtos/expanse-on-invoice-create.dto';
import { ExpanseUpdateDto } from './dtos/expanse-update.dto';

@Injectable()
export class ExpansesService { 
  // eslint-disable-next-line prettier/prettier
  constructor(private prisma: PrismaService, private invoiceService: InvoiceService) {}

  async expanse(
    expanseWhereUniqueInput: Prisma.ExpanseWhereUniqueInput,
  ): Promise<Expanse | null> {
    try {
      return await this.prisma.expanse.findUnique({
        where: expanseWhereUniqueInput,
      });
    } catch (error) {
      Logger.log('erro ao buscar despesa: ', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async expanses(where?: Prisma.ExpanseWhereInput): Promise<Expanse[]> {
    try {
      return await this.prisma.expanse.findMany({where });
    } catch (error) {
      Logger.log('erro ao listar despesas: ', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async createExpanse(data: ExpanseCreateDto): Promise<Expanse> {
    try {
      const response = await this.prisma.$transaction(async () => {
        const verifyInvoiceExists = await this.invoiceService.invoices({creditCardId: data.receiptDefault, AND: {
          closed: false
        }});

        
        if (verifyInvoiceExists.length > 0){
          const newStartDate = new Date(verifyInvoiceExists[0].month);
          newStartDate.setDate(new Date(data.startDate).getDate());

          const newEndDate = data.iteration !== 'Mensal' ? addMonths(newStartDate, Number(data.iteration) - 1) : null;
          
          const expanse = await this.prisma.expanse.create({
            data: {
              ...data,
              startDate: newStartDate,
              endDate: newEndDate,
            },
          });

          await this.createExpanseOnInvoice({
            expanseId: expanse.id,
            name: expanse.name,
            value: expanse.value,
            day: expanse.createdAt.getDay(),
          }, expanse.receiptDefault)

          await this.invoiceService.updateInvoice({where: {id: verifyInvoiceExists[0].id}, data: {
            value: verifyInvoiceExists[0].value +  expanse.value
          }})
          return expanse;
        }

        const expanse = await this.prisma.expanse.create({
          data,
        });

        return expanse;
      });

      return response;
    } catch (error) {
      Logger.log('erro ao criar despesa: ', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async updateExpanse(params: {
    where: Prisma.ExpanseWhereUniqueInput;
    data: ExpanseUpdateDto;
  }): Promise<Expanse> {
    const { where, data } = params;
    const { userId } = data;
    const { id } = where;
    try {
      const verifyExpanseExists = await this.expanse({id});

      if (!verifyExpanseExists) {
        throw new HttpException(
          'ERRO: despesa não encontrada',
          HttpStatus.NOT_FOUND
        );
      }

      if (verifyExpanseExists.userId !== userId) {
        throw new HttpException(
          'ERRO: usuário não autorizado a realizar essa ação',
          HttpStatus.UNAUTHORIZED
        );
      }

      const expansesOnAccount = await this.expansesOnAccount({
        expanseId: verifyExpanseExists.id
      });

      await Promise.all(expansesOnAccount.map(async expanseOnAccount => {
        await this.prisma.expanseOnAccount.update({
          data: {
            name: data.name
          },
          where: {
            id: expanseOnAccount.id
          }
        })
      }));

      return this.prisma.expanse.update({
        data,
        where,
      });
    } catch (error) {
      Logger.log('erro ao atualizar despesa: ', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async deleteExpanse(where: Prisma.ExpanseWhereUniqueInput, userId: string): Promise<Expanse> {
    try {
      const verifyExpanseExists = await this.expanse(where);

      if (!verifyExpanseExists) {
        throw new HttpException(
          'ERRO: despesa não encontrada',
          HttpStatus.NOT_FOUND
        );
      }

      if (verifyExpanseExists.userId !== userId) {
        throw new HttpException(
          'ERRO: usuário não autorizado a realizar essa ação',
          HttpStatus.UNAUTHORIZED
        );
      }

      return await this.prisma.expanse.delete({
        where,
      });
    } catch (error) {
      Logger.log('erro ao deletar despesa: ', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async expansesOnAccount(where?: Prisma.ExpanseOnAccountWhereInput): Promise<ExpanseOnAccount[]> {
    try {
      return await this.prisma.expanseOnAccount.findMany({where });
    } catch (error) {
      Logger.log('erro ao listar despesas em uma conta: ', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async expansesOnInvoice(where?: Prisma.ExpanseOnInvoiceWhereInput): Promise<ExpanseOnInvoice[]> {
    try {
      return await this.prisma.expanseOnInvoice.findMany({where });
    } catch (error) {
      Logger.log('erro ao listar despesas em uma conta: ', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async lastExpansesOnAccount(where?: Prisma.ExpanseOnAccountWhereInput): Promise<ExpanseOnAccount[]> {
    try {
      const expanses = await this.prisma.expanseOnAccount.findMany({where, take: 3 });

      await Promise.all(expanses.map(async (exp) => {
        const findExpanse= await this.expanse({id: exp.expanseId});
        Object.assign(exp, {category: findExpanse.category});
        return exp;
      }));

      return expanses;
    } catch (error) {
      Logger.log('erro ao listar despesas em uma conta: ', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async createExpanseOnAccount(data: ExpanseOnAccountCreateDto): Promise<ExpanseOnAccount> {
    try {
      return this.prisma.expanseOnAccount.create({data});
    } catch (error) {
      Logger.log('erro ao vincular despesa na conta: ', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }


  async deleteExpanseOnAccount(where: Prisma.ExpanseOnAccountWhereUniqueInput, userId: string): Promise<boolean> {
    try {
      const verifyExpanseOnAccountExists = await this.prisma.expanseOnAccount.findUnique({
        where
      })

      if (!verifyExpanseOnAccountExists) {
        throw new HttpException(
          'ERRO: despesa vinculada a conta não encontrada',
          HttpStatus.NOT_FOUND
        );
      }

      if (verifyExpanseOnAccountExists.userId !== userId) {
        throw new HttpException(
          'ERRO: usuário não autorizado a realizar essa ação',
          HttpStatus.UNAUTHORIZED
        );
      }

      await this.prisma.expanseOnAccount.delete({
        where,
      });

      return true;
    } catch (error) {
      Logger.log('erro ao deletar despesa vinculada a uma conta: ', error);
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