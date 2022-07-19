import { Body, Controller, Delete, Get, Param, Patch, Post, Put, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { User } from '@prisma/client';
import { UserCreateDto } from './dtos/user-create.dto';
import { UserUpdateDto } from './dtos/user-update.dto';
import { UsersService } from './users.service';
import { diskStorage } from 'multer';
import * as path from 'path';
import { Transaction } from './interfaces/Transaction';

@Controller('users')
export class UsersController {
  constructor(
    // eslint-disable-next-line prettier/prettier
    private readonly userService: UsersService,
  ) {}

  @Get('/phone/:phone')
  async getUserByPhone(
    @Param('phone') phone: string,
  ): Promise<User> {
    return this.userService.user({phone});
  }

  @Get('/email/:email')
  async getUserByEmail(
    @Param('email') email: string,
  ): Promise<User> {
    return this.userService.user({email});
  }

  @Get('/lastTransactions/:userId')
  async getUserLastTransactions(
    @Param('userId') userId: string,
  ): Promise<Transaction[]> {
    return this.userService.getUserLastTransactions(userId);
  }

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

  @Patch(':id/avatar')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: path.resolve(__dirname, '..', '..', '..', 'uploads'),
        filename: (req, file, cb) => {
          const randomName = Array(64)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          const extension = file.originalname.split('.');
          return cb(null, `${randomName}.${extension[extension.length - 1]}`);
        },
      })
    })
  )
  async updateAvatar(
    @UploadedFile() image,
    @Param('id') id: string
  ): Promise<User> {
    return this.userService.updateUserAvatar(id, image);
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
