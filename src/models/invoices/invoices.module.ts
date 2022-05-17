import { Module } from '@nestjs/common';
import { PrismaService } from '../../providers/database/prisma/prisma.service';
import { InvoiceController } from './invoice.controller';
import { InvoiceService } from './invoices.service';

@Module({
  imports: [],
  controllers: [InvoiceController],
  providers: [InvoiceService, PrismaService],
  exports: [InvoiceService],
})
export class InvoicesModule {}
