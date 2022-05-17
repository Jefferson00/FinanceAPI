import { AccountsModule } from './../models/accounts/accounts.module';
import { UsersModule } from './../models/users/users.module';
import { IncomesModule } from './../models/incomes/incomes.module';
import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthMiddleware } from '../auth/auth.middleware';
import { ExpansesModule } from '../models/expanses/expanses.module';
import { CreditCardModule } from '../models/credit-card/credit-card.module';
import { InvoicesModule } from '../models/invoices/invoices.module';

@Module({
  imports: [
    AccountsModule,
    UsersModule,
    IncomesModule,
    ExpansesModule,
    CreditCardModule,
    InvoicesModule,
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
