import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../providers/database/prisma/prisma.service';
import { User, Prisma } from '@prisma/client';
import { UserCreateDto } from './dtos/user-create.dto';
import { UserUpdateDto } from './dtos/user-update.dto';
import { IFile } from 'src/shared/interfaces/file.interface';
import * as path from 'path';
// eslint-disable-next-line prettier/prettier
import fs = require('fs');

@Injectable()
export class UsersService {
  // eslint-disable-next-line prettier/prettier
  constructor(private prisma: PrismaService) {}

  async user(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
  ): Promise<User | null> {
    try {
      return this.prisma.user.findUnique({
        where: userWhereUniqueInput,
      });
    } catch (error) {
      throw new HttpException(error?.message, HttpStatus.BAD_REQUEST);
    }
  }

  async users(): Promise<User[]> {
    try {
      return this.prisma.user.findMany();
    } catch (error) {
      throw new HttpException(error?.message, HttpStatus.BAD_REQUEST);
    }
  }

  async createUser(data: UserCreateDto): Promise<User> {
    try {
      const { email, phone } = data;
      if (email) await this.verifyUserEmail(email);
      if (phone) await this.verifyUserPhone(phone);

      if(!email && !phone) {
        throw new HttpException(
          'ERRO: Informe um e-mail ou número de telefone',
          HttpStatus.BAD_REQUEST
        );
      }

      return this.prisma.user.create({
        data,
      });
    } catch (error) {
      throw new HttpException(error?.message, HttpStatus.BAD_REQUEST);
    }
  }

  async updateUser(params: {
    where: Prisma.UserWhereUniqueInput;
    data: UserUpdateDto;
  }): Promise<User> {
    const { where, data } = params;
    const { email, phone } = data;
    const { id } = where;
    try {
      const verifyUserExists = await this.verifyUserExist(id);

      if (email && email !== verifyUserExists.email) await this.verifyUserEmail(email);
      if (phone && phone !== verifyUserExists.phone) await this.verifyUserPhone(phone);

      return this.prisma.user.update({
        data,
        where,
      });
    } catch (error) {
      if (error.message) {
        throw new HttpException(error?.message, HttpStatus.BAD_REQUEST);
      }
      throw new HttpException('Erro ao atualizar', HttpStatus.BAD_REQUEST);
    }
  }

  async updateUserAvatar(id: string, image: IFile): Promise<User> {
    try {
      const verifyUserExists = await this.verifyUserExist(id);

      if(verifyUserExists.avatar){
        const fsCheck = fs.existsSync(
          path.resolve(__dirname, '..', '..', '..', `uploads/${verifyUserExists.avatar}`)
        );

        if (image && fsCheck) {
          fs.unlinkSync(path.resolve(__dirname, '..', '..', '..', `uploads/${verifyUserExists.avatar}`));
        }
      }

      verifyUserExists.avatar = image.filename;

      const userSaved = await this.prisma.user.update({
        data: verifyUserExists,
        where: {
          id
        }
      });

      userSaved.avatar = `${process.env.API_URL}static/${userSaved.avatar}`;
      
      return userSaved;
    } catch (error) {
      if (error.message) {
        throw new HttpException(error?.message, HttpStatus.BAD_REQUEST);
      }
      throw new HttpException('Erro ao atualizar', HttpStatus.BAD_REQUEST);
    }
  }

  async deleteUser(where: Prisma.UserWhereUniqueInput): Promise<User> {
    try {
      await this.verifyUserExist(where.id);

      return this.prisma.user.delete({
        where,
      });
    } catch (error) {
      if (error.message) {
        throw new HttpException(error?.message, HttpStatus.BAD_REQUEST);
      }
      throw new HttpException('Erro ao deletar usuário', HttpStatus.BAD_REQUEST);
    }
  }

  async verifyUserExist(id: string): Promise<User> {
    const verifyUserExists = await this.prisma.user.findUnique({
      where: {
        id
      }
    });

    if (!verifyUserExists) {
      throw new HttpException(
        'ERRO: usuário não encontrado',
        HttpStatus.NOT_FOUND
      );
    }

    return verifyUserExists;
  }

  async verifyUserEmail(email: string): Promise<void> {
    const verifyEmail = await this.prisma.user.findUnique({
      where: {
        email
      }
    });

    if (verifyEmail) {
      throw new HttpException(
        'ERRO: Email já utilizado',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async verifyUserPhone(phone: string): Promise<void> {
    const verifyPhone = await this.prisma.user.findUnique({
      where: {
        phone
      }
    });

    if (verifyPhone) {
      throw new HttpException(
        'ERRO: Telefone já utilizado',
        HttpStatus.BAD_REQUEST
      );
    }
  }
}
