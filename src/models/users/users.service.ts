import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../providers/database/prisma/prisma.service';
import { User, Prisma } from '@prisma/client';
import { UserCreateDto } from './dtos/user-create.dto';
import { UserUpdateDto } from './dtos/user-update.dto';

@Injectable()
export class UsersService {
  // eslint-disable-next-line prettier/prettier
  constructor(private prisma: PrismaService) {}

  async user(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
  ): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: userWhereUniqueInput,
    });
  }

  async users(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  async createUser(data: UserCreateDto): Promise<User> {
    try {
      const { email } = data;
      await this.verifyUserEmail(email);

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
    const { email } = data;
    const { id } = where;
    try {
      const verifyUserExists = await this.verifyUserExist(id);

      if (email && email !== verifyUserExists.email) await this.verifyUserEmail(email);

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

  async deleteUser(where: Prisma.UserWhereUniqueInput): Promise<User> {
    await this.verifyUserExist(where.id);

    return this.prisma.user.delete({
      where,
    });
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
}
