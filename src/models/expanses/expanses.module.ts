import { Module } from '@nestjs/common';
import { PrismaService } from '../../providers/database/prisma/prisma.service';
import { InvoicesModule } from '../invoices/invoices.module';
import { ExpansesController } from './expanses.controller';
import { ExpansesService } from './expanses.service';

@Module({
  imports: [InvoicesModule],
  controllers: [ExpansesController],
  providers: [ExpansesService, PrismaService],
  exports: [ExpansesService],
})
export class ExpansesModule {}
