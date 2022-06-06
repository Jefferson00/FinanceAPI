/* eslint-disable prettier/prettier */
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Expanse, ExpanseOnAccount, Prisma } from '@prisma/client';
import { addMonths } from 'date-fns';
import { PrismaService } from '../../providers/database/prisma/prisma.service';
import { ExpansesOnInvoiceService } from '../expansesOnInvoice/expansesOnInvoice.service';
import { InvoiceService } from '../invoices/invoices.service';
import { ExpanseCreateDto } from './dtos/expanse-create.dto';
import { ExpanseUpdateDto } from './dtos/expanse-update.dto';

@Injectable()
export class ExpansesService { 
  constructor(
    private prisma: PrismaService, 
    private invoiceService: InvoiceService, 
    private expansesOnInvoiceService: ExpansesOnInvoiceService
) {}

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
      const accountExists = await this.prisma.account.findFirst({where: {
        id: data.receiptDefault,
        AND: {
          status: 'active'
        }
      }});

      const creditCardExists = await this.prisma.creditCard.findFirst({where: {
        id: data.receiptDefault,
      }})

      if (!accountExists && !creditCardExists) {
        throw new HttpException(
          'ERRO: conta de recebimento padrão não encontrada',
          HttpStatus.NOT_FOUND
        );
      }

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

          await this.expansesOnInvoiceService.createExpanseOnInvoice({
            expanseId: expanse.id,
            name: expanse.name,
            value: expanse.value,
            day: expanse.startDate.getUTCDate(),
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

      if (data.name && data.name !== verifyExpanseExists.name){
        const expansesOnAccount = await this.prisma.expanseOnAccount.findMany({
         where: {
          expanseId: verifyExpanseExists.id
         }
        });
  
        const expansesOnInvoice = await this.expansesOnInvoiceService.expansesOnInvoice({
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
  
        await Promise.all(expansesOnInvoice.map(async expanseOnInvoice => {
          await this.prisma.expanseOnAccount.update({
            data: {
              name: data.name
            },
            where: {
              id: expanseOnInvoice.id
            }
          })
        }));  
      }
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
}