/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { PrismaService } from 'src/providers/database/prisma/prisma.service';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';

@Module({
  imports: [],
  controllers: [AccountsController],
  providers: [AccountsService, PrismaService],
})
export class AccountsModule {}
