import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { PrismaService } from '../../providers/database/prisma/prisma.service';
import { InvoiceController } from './invoice.controller';
import { InvoiceProcessor } from './invoices.processor';
import { InvoiceService } from './invoices.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'verify-invoices',
    }),
  ],
  controllers: [InvoiceController],
  providers: [InvoiceService, PrismaService, InvoiceProcessor],
  exports: [InvoiceService],
})
export class InvoicesModule {}
