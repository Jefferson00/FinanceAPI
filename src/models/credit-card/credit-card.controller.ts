import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { CreditCard } from '@prisma/client';
import { CreditCardService } from './credit-card.service';
import { CreditCardCreateDto } from './dtos/credit-card-create.dto';
import { CreditCardUpdateDto } from './dtos/credit-card-update.dto';

@Controller('creditCards')
export class CreditCardsController {
  constructor(
    // eslint-disable-next-line prettier/prettier
    private readonly creditCardService: CreditCardService,
) {}

@Get()
async getAllCreditCards(): Promise<CreditCard[]> {
  return this.creditCardService.creditCards();
}

@Get('user/:userId')
  async getAllUserCreditCards(
    @Param('userId') userId: string,
  ): Promise<CreditCard[]> {
    return this.creditCardService.creditCards({
      userId,
    });
  }

  @Post()
  async createCreditCards(
    @Body() data: CreditCardCreateDto,
  ): Promise<CreditCard> {
    return this.creditCardService.createCreditCard(data);
  }


  @Put(':id')
  async updateCreditCard(
    @Body() data: CreditCardUpdateDto,
    @Param('id') id: string
  ): Promise<CreditCard> {
    return this.creditCardService.updateCreditCard({
      data,
      where: {
        id
      }
    })
  }

  @Delete(':id/:userId')
  async deleteAccount(
    @Param('id') id: string,
    @Param('userId') userId: string,
  ): Promise<CreditCard> {
    return this.creditCardService.deleteCreditCard({
      id
    },userId)
  }


}