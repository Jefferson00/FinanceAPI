import { Module } from '@nestjs/common';
import { PrismaService } from 'src/providers/database/prisma/prisma.service';
import { IncomesController } from './incomes.controller';
import { IncomesService } from './incomes.service';

@Module({
  imports: [],
  controllers: [IncomesController],
  providers: [IncomesService, PrismaService],
  exports: [IncomesService],
})
export class IncomesModule {}
