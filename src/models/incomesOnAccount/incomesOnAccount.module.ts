import { Module } from '@nestjs/common';
import { PrismaService } from '../../providers/database/prisma/prisma.service';
import { AccountsModule } from '../accounts/accounts.module';
import { IncomesOnAccountController } from './incomesOnAccount.controller';
import { IncomesOnAccountService } from './incomesOnAccount.service';

@Module({
  imports: [AccountsModule],
  controllers: [IncomesOnAccountController],
  providers: [IncomesOnAccountService, PrismaService],
  exports: [],
})
export class IncomesOnAccountModule {}
