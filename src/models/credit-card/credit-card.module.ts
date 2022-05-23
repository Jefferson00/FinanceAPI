import { Module } from '@nestjs/common';
import { PrismaService } from '../../providers/database/prisma/prisma.service';
import { AccountsModule } from '../accounts/accounts.module';
import { InvoicesModule } from '../invoices/invoices.module';
import { CreditCardsController } from './credit-card.controller';
import { CreditCardService } from './credit-card.service';

@Module({
  imports: [InvoicesModule, AccountsModule],
  controllers: [CreditCardsController],
  providers: [CreditCardService, PrismaService],
})
export class CreditCardModule {}
