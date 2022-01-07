import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { User } from '@prisma/client';
import { UserCreateDto } from './dtos/user-create.dto';
import { UserUpdateDto } from './dtos/user-update.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(
    // eslint-disable-next-line prettier/prettier
    private readonly userService: UsersService,
  ) {}

  @Get()
  async getAllUsers(): Promise<User[]> {
    return this.userService.users();
  }

  @Post()
  async createUser(
    @Body() data: UserCreateDto,
  ): Promise<User> {
    return this.userService.createUser(data);
  }

  @Put(':id')
  async updateUser(
    @Body() data: UserUpdateDto,
    @Param('id') id: string
  ): Promise<User> {
    return this.userService.updateUser({
      data,
      where: {
        id
      }
    })
  }

  @Delete(':id')
  async deleteUser(
    @Param('id') id: string
  ): Promise<User> {
    return this.userService.deleteUser({
      id
    })
  }
}
