/* eslint-disable prettier/prettier */
import { UsersController } from './users.controller';
import { Module } from '@nestjs/common';
import { PrismaService } from 'src/providers/database/prisma/prisma.service';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';

@Module({
    imports: [],
    controllers: [UsersController],
    providers: [UsersService, PrismaService, UsersResolver],
})
export class UsersModule {}
