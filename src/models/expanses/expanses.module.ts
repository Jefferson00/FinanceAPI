import { Module } from '@nestjs/common';
import { PrismaService } from 'src/providers/database/prisma/prisma.service';
import { ExpansesController } from './expanses.controller';
import { ExpansesService } from './expanses.service';

@Module({
  imports: [],
  controllers: [ExpansesController],
  providers: [ExpansesService, PrismaService],
  exports: [ExpansesService],
})
export class ExpansesModule {}
