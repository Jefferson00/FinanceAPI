import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AccountsModule } from './../models/accounts/accounts.module';
import { ScheduleModule } from '@nestjs/schedule';
import { UsersModule } from './../models/users/users.module';
import { IncomesModule } from './../models/incomes/incomes.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthMiddleware } from '../auth/auth.middleware';
import { ExpansesModule } from '../models/expanses/expanses.module';
import { CreditCardModule } from '../models/credit-card/credit-card.module';
import { InvoicesModule } from '../models/invoices/invoices.module';
import { IncomesOnAccountModule } from '../models/incomesOnAccount/incomesOnAccount.module';
import { ExpansesOnAccountModule } from '../models/expansesOnAccount/expansesOnAccount.module';
import { ExpansesOnInvoiceModule } from 'src/models/expansesOnInvoice/expansesOnInvoice.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    AccountsModule,
    UsersModule,
    IncomesModule,
    ExpansesModule,
    CreditCardModule,
    InvoicesModule,
    IncomesOnAccountModule,
    ExpansesOnAccountModule,
    ExpansesOnInvoiceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes({
      path: '*',
      method: RequestMethod.ALL,
    });
  }
}
