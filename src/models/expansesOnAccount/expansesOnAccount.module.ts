import { Module } from '@nestjs/common';
import { PrismaService } from '../../providers/database/prisma/prisma.service';
import { AccountsModule } from '../accounts/accounts.module';
import { ExpansesOnAccountController } from './expansesOnAccount.controller';
import { ExpansesOnAccountService } from './expansesOnAccount.service';

@Module({
  imports: [AccountsModule],
  controllers: [ExpansesOnAccountController],
  providers: [ExpansesOnAccountService, PrismaService],
  exports: [],
})
export class ExpansesOnAccountModule {}
