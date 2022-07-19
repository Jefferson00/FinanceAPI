import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { Expanse } from '@prisma/client';
import { ExpansesService } from './expanses.service';
import {ExpanseCreateDto  } from './dtos/expanse-create.dto';
import {ExpanseUpdateDto  } from './dtos/expanse-update.dto';


@Controller('expanses')
export class ExpansesController {
  constructor(
    // eslint-disable-next-line prettier/prettier
    private readonly  expansesService: ExpansesService,
) {}

@Get('user/:userId')
async getAllUserExpanses(
  @Param('userId') userId: string,
): Promise<Expanse[]> {
  return this.expansesService.expanses({
    userId,
  });
}

@Post()
async createExpanse(
  @Body() data: ExpanseCreateDto,
): Promise<Expanse> {
  return this.expansesService.createExpanse(data);
}

@Put(':id')
async updateExpanse(
  @Body() data: ExpanseUpdateDto,
  @Param('id') id: string
): Promise<Expanse> {
  return this.expansesService.updateExpanse({
    data,
    where: {
      id
    }
  })
}

@Delete(':id/:userId')
async deleteExpanse(
  @Param('id') id: string,
  @Param('userId') userId: string,
): Promise<Expanse> {
  return this.expansesService.deleteExpanse({
    id
  },userId)
}
}