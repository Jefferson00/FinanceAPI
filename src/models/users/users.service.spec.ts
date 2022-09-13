import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../providers/database/prisma/prisma.service';
import { User, Prisma } from '@prisma/client';
import { UsersService } from './users.service';
import { UserCreateDto } from './dtos/user-create.dto';
import { UserUpdateDto } from './dtos/user-update.dto';
import { IFile } from '../../shared/interfaces/file.interface';
// eslint-disable-next-line prettier/prettier
import fs = require('fs');
import { IncomesService } from '../incomes/incomes.service';
import { ExpansesService } from '../expanses/expanses.service';
import { Transaction } from './interfaces/Transaction';
import { InvoiceService } from '../invoices/invoices.service';
import { ExpansesOnInvoiceService } from '../expansesOnInvoice/expansesOnInvoice.service';
import { BullModule, getQueueToken } from '@nestjs/bull';

const userWhereUniqueInput: Prisma.UserWhereUniqueInput = {
  email: 'any@email.com',
};

const where: Prisma.UserWhereUniqueInput = {
  id: 'any_id',
};

const exampleQueueMock = { add: jest.fn() };

const createUserDTO: UserCreateDto = {
  email: 'anyemail@email.com',
};

const updateUserDTO: UserUpdateDto = {
  name: 'any_name',
};

const file: IFile = {
  path: 'image_ref.jpeg',
  destination: 'any',
  filename: 'any_filename',
  originalname: 'any_name',
};

const user: User = {
  id: 'any_id',
  avatar: 'any_image',
  name: 'any_name',
  email: 'any@email.com',
  phone: '61 9 0000 9999',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const userCreatedWithEmail: User = {
  id: 'any_id',
  avatar: null,
  name: 'any_name',
  email: 'any@email.com',
  phone: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const userCreatedWithPhone: User = {
  id: 'any_id',
  avatar: null,
  name: null,
  email: null,
  phone: '61 9 9999 9999',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const lastTransactions: Transaction[] = [
  {
    id: 'any',
    category: 'any',
    paymentDate: new Date('2022-05-17T14:12:08.907Z'),
    title: 'any',
    type: 'Income',
    value: 10000,
  }
];

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: PrismaService;
  let incomeService: IncomesService;
  let expanseService: ExpansesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        BullModule.registerQueue({
          name: 'verify-invoices',
        }),
      ],
      providers: [
        UsersService,
        PrismaService, 
        IncomesService, 
        ExpansesService, 
        InvoiceService, 
        ExpansesOnInvoiceService
      ],
    })
    .overrideProvider(getQueueToken('verify-invoices'))
    .useValue(exampleQueueMock)
    .compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
    incomeService = module.get<IncomesService>(IncomesService);
    expanseService = module.get<ExpansesService>(ExpansesService);

    prismaService.user.findUnique = jest.fn().mockResolvedValue(user);
    prismaService.user.findMany = jest.fn().mockResolvedValue([user]);
    incomeService.lastIncomesOnAccount = jest.fn().mockResolvedValue([{
      id: 'any',
      category: 'any',
      paymentDate: new Date('2022-05-17T14:12:08.907Z'),
      name: 'any',
      incomeId: 'any',
      value: 10000,
    }]);
    expanseService.lastExpansesOnAccount = jest.fn().mockResolvedValue([]);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Find User', () => {
    it('should be able to find user with unique input', async () => {
      const response = await service.user(userWhereUniqueInput);

      expect(response).toEqual(user);
    });
    it('should be able to throw if there is an unexpected error ', async () => {
      prismaService.user.findUnique = jest
        .fn()
        .mockRejectedValueOnce(new Error());
      const response = service.user(userWhereUniqueInput);

      await expect(response).rejects.toThrow();
    });
  });

  describe('Find User Last Transactions', () => {
    it('should be able to find user last transactions', async () => {
      const response = await service.getUserLastTransactions('any_id');
     /*  allTransactions.sort = jest.fn().mockImplementationOnce(() => lastTransactions); */
    /*   jest.mock(allTransactions, () => ({
        sort: jest.fn(() => lastTransactions),
      })) */

      expect(response).toEqual(lastTransactions);
    });
    it('should be able to throw if there is an unexpected error ', async () => {
      incomeService.lastIncomesOnAccount = jest
        .fn()
        .mockRejectedValueOnce(new Error());
      const response = service.getUserLastTransactions('any_id');

      await expect(response).rejects.toThrow();
    });
  });

  describe('Find Many Users', () => {
    it('should be able to find many users', async () => {
      prismaService.user.findUnique = jest.fn().mockResolvedValue(null);
      const response = await service.users();

      expect(response).toEqual([user]);
    });
    it('should be able to throw if there is an unexpected error ', async () => {
      prismaService.user.findMany = jest
        .fn()
        .mockRejectedValueOnce(new Error());
      const response = service.users();

      await expect(response).rejects.toThrow();
    });
  });

  describe('Create User', () => {
    it('should be able to create user with email', async () => {
      prismaService.user.findUnique = jest.fn().mockResolvedValue(null);
      prismaService.user.create = jest
        .fn()
        .mockResolvedValueOnce(userCreatedWithEmail);
      const response = await service.createUser(createUserDTO);

      expect(response).toEqual(userCreatedWithEmail);
    });
    it('should be able to to throw if email already exists', async () => {
      prismaService.user.create = jest
        .fn()
        .mockResolvedValueOnce(userCreatedWithEmail);
      const response = service.createUser(createUserDTO);

      await expect(response).rejects.toThrow();
    });
    it('should be able to create user with phone', async () => {
      prismaService.user.findUnique = jest.fn().mockResolvedValue(null);
      prismaService.user.create = jest
        .fn()
        .mockResolvedValueOnce(userCreatedWithPhone);
      const response = await service.createUser({ phone: '61 9 9999 9999' });

      expect(response).toEqual(userCreatedWithPhone);
    });
    it('should be able to throw if phone already exists ', async () => {
      prismaService.user.create = jest
        .fn()
        .mockResolvedValueOnce(userCreatedWithPhone);
      const response = service.createUser({ phone: '61 9 9999 9999' });

      await expect(response).rejects.toThrow();
    });
    it('should be able to throw if no phone or email is provided ', async () => {
      prismaService.user.findUnique = jest.fn().mockResolvedValue(null);
      prismaService.user.create = jest
        .fn()
        .mockResolvedValueOnce(userCreatedWithPhone);
      const response = service.createUser({ phone: null });

      await expect(response).rejects.toThrow();
    });
    it('should be able to throw if there is an unexpected error ', async () => {
      prismaService.user.create = jest.fn().mockRejectedValueOnce(new Error());
      const response = service.createUser(userCreatedWithPhone);

      await expect(response).rejects.toThrow();
    });
  });

  describe('Update Users', () => {
    it('should be able to update user', async () => {
      prismaService.user.update = jest.fn().mockResolvedValueOnce(user);

      const response = await service.updateUser({
        where,
        data: updateUserDTO,
      });

      expect(response).toEqual(user);
    });
    it('should be able to throw if user is not found', async () => {
      prismaService.user.findUnique = jest.fn().mockResolvedValue(null);

      const response = service.updateUser({
        where,
        data: updateUserDTO,
      });

      await expect(response).rejects.toThrow();
    });

    it('should be able to throw if email already exists', async () => {
      jest.spyOn(service, 'verifyUserExist').mockResolvedValueOnce({
        id: 'any_id',
        avatar: null,
        name: 'any_name',
        email: 'any_other@email.com',
        phone: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      prismaService.user.update = jest.fn().mockResolvedValueOnce(user);

      const response = service.updateUser({
        where,
        data: {
          email: 'any@email.com',
        },
      });

      await expect(response).rejects.toThrow();
    });

    it('should be able to throw if phone already exists', async () => {
      jest.spyOn(service, 'verifyUserExist').mockResolvedValueOnce({
        id: 'any_id',
        avatar: null,
        name: 'any_name',
        email: 'any@email.com',
        phone: '61 9 9999 9999',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      prismaService.user.update = jest.fn().mockResolvedValueOnce(user);

      const response = service.updateUser({
        where,
        data: {
          phone: '61 9 0000 9999',
        },
      });

      await expect(response).rejects.toThrow();
    });

    it('should be able to throw if there is an unexpected error ', async () => {
      prismaService.user.update = jest.fn().mockRejectedValueOnce(new Error());
      const response = service.updateUser({
        where,
        data: updateUserDTO,
      });

      await expect(response).rejects.toThrow();
    });
  });

  describe('Update User Avatar', () => {
    it('should be able to update user avatar', async () => {
      prismaService.user.update = jest.fn().mockResolvedValueOnce(user);
      const response = await service.updateUserAvatar('any_id', file);

      expect(response).toEqual(user);
    });
    it('should be able to update user avatar if user already have avatar', async () => {
      jest.spyOn(service, 'verifyUserExist').mockResolvedValueOnce({
        id: 'any_id',
        avatar: 'any_avatar',
        name: 'any_name',
        email: 'any@email.com',
        phone: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      jest.spyOn(fs, 'existsSync').mockImplementationOnce(() => true);
      jest.spyOn(fs, 'unlinkSync').mockImplementationOnce(() => true);
      prismaService.user.update = jest.fn().mockResolvedValueOnce(user);
      const response = await service.updateUserAvatar('any_id', file);

      expect(response).toEqual(user);
    });

    it('should be able to throw if there is an unexpected error ', async () => {
      prismaService.user.update = jest.fn().mockRejectedValueOnce(new Error());
      const response = service.updateUserAvatar('any_id', file);

      await expect(response).rejects.toThrow();
    });
  });

  describe('Delete User', () => {
    it('should be able to delete user', async () => {
      prismaService.user.delete = jest.fn().mockResolvedValueOnce(user);
      const response = await service.deleteUser(where);

      expect(response).toEqual(user);
    })

    it('should be able to throw if there is an unexpected error', async () => {
      prismaService.user.delete = jest.fn().mockRejectedValueOnce(new Error());
      const response = service.deleteUser(where);

      await expect(response).rejects.toThrow();
    })
  })
});
