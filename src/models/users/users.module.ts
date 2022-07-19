/* eslint-disable prettier/prettier */
import { UsersController } from './users.controller';
import { Module } from '@nestjs/common';
import { PrismaService } from '../../providers/database/prisma/prisma.service';
import { UsersService } from './users.service';
import { IncomesModule } from '../incomes/incomes.module';
import { ExpansesModule } from '../expanses/expanses.module';

@Module({
  imports: [IncomesModule, ExpansesModule],
  controllers: [UsersController],
  providers: [UsersService, PrismaService],
  exports: [UsersService],
})
export class UsersModule {}
