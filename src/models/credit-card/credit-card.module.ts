import { Module } from '@nestjs/common';
import { PrismaService } from '../../providers/database/prisma/prisma.service';
import { CreditCardsController } from './credit-card.controller';
import { CreditCardService } from './credit-card.service';

@Module({
  imports: [],
  controllers: [CreditCardsController],
  providers: [CreditCardService, PrismaService],
})
export class CreditCardModule {}
