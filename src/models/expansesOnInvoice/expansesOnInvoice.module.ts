import { Module } from '@nestjs/common';
import { PrismaService } from '../../providers/database/prisma/prisma.service';
import { InvoicesModule } from '../invoices/invoices.module';
import { ExpansesOnInvoiceController } from './expansesOnInvoice.controller';
import { ExpansesOnInvoiceService } from './expansesOnInvoice.service';

@Module({
  imports: [InvoicesModule],
  controllers: [ExpansesOnInvoiceController],
  providers: [ExpansesOnInvoiceService, PrismaService],
  exports: [ExpansesOnInvoiceService],
})
export class ExpansesOnInvoiceModule {}
