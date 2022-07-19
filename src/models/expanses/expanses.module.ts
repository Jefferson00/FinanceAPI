import { Module } from '@nestjs/common';
import { PrismaService } from '../../providers/database/prisma/prisma.service';
import { ExpansesOnInvoiceModule } from '../expansesOnInvoice/expansesOnInvoice.module';
import { InvoicesModule } from '../invoices/invoices.module';
import { ExpansesController } from './expanses.controller';
import { ExpansesService } from './expanses.service';

@Module({
  imports: [InvoicesModule, ExpansesOnInvoiceModule],
  controllers: [ExpansesController],
  providers: [ExpansesService, PrismaService],
  exports: [ExpansesService],
})
export class ExpansesModule {}
