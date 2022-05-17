import { Module } from '@nestjs/common';
import { PrismaService } from '../../providers/database/prisma/prisma.service';
import { InvoicesModule } from '../invoices/invoices.module';
import { CreditCardsController } from './credit-card.controller';
import { CreditCardService } from './credit-card.service';

@Module({
  imports: [InvoicesModule],
  controllers: [CreditCardsController],
  providers: [CreditCardService, PrismaService],
})
export class CreditCardModule {}
