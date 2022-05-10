/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { PrismaService } from 'src/providers/database/prisma/prisma.service';
import { ExpansesModule } from '../expanses/expanses.module';
import { IncomesModule } from '../incomes/incomes.module';
import { UsersModule } from '../users/users.module';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';

@Module({
  imports: [UsersModule, IncomesModule, ExpansesModule],
  controllers: [AccountsController],
  providers: [AccountsService, PrismaService],
})
export class AccountsModule {}
