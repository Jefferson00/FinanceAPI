import { UsersModule } from './../models/users/users.module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GraphQLModule } from '@nestjs/graphql';

@Module({
  imports: [
    GraphQLModule.forRoot({
      include: [UsersModule],
      autoSchemaFile: 'schema.gql',
      buildSchemaOptions: {
        dateScalarMode: 'isoDate',
      },
    }),
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
