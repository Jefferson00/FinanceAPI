import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../providers/database/prisma/prisma.service';
import { Prisma, Account, User, IncomeOnAccount } from '@prisma/client';
import { AccountCreateDto } from './dtos/account-create.dto';
import { AccountUpdateDto } from './dtos/account-update.dto';
import { AccountsService } from './accounts.service';
import { IncomesService } from '../incomes/incomes.service';
import { ExpansesService } from '../expanses/expanses.service';
import { InvoiceService } from '../invoices/invoices.service';
import { ExpansesOnInvoiceService } from '../expansesOnInvoice/expansesOnInvoice.service';
import { BullModule, getQueueToken } from '@nestjs/bull';

const accountWhereUniqueInput: Prisma.AccountWhereUniqueInput = {
  id: 'any_id',
};

const where: Prisma.AccountWhereUniqueInput = {
  id: 'any_id',
};

const createAccountDTO: AccountCreateDto = {
  initialValue: 0,
  name: 'teste',
  status: 'active',
  type: 'any',
  userId: 'any_user_id',
};

const updateAccountDTO: AccountUpdateDto = {
  userId: 'any_user_id',
  name: 'teste 2',
};

const account: Account = {
  id: 'any_id',
  initialValue: 0,
  name: 'teste',
  status: 'active',
  type: 'any',
  userId: 'any_user_id',
  balance: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const user: User = {
  id: 'any_user_id',
  avatar: null,
  email: 'any@email.com',
  name: 'any',
  phone: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const incomesOnAccount: IncomeOnAccount = {
  accountId: 'any_id',
  id: 'any',
  incomeId: 'any_id',
  month: new Date(),
  name: 'any',
  paymentDate: new Date(),
  recurrence: 'any',
  userId: 'any_user_id',
  value: 0,
};

const exampleQueueMock = { add: jest.fn() };

describe('AccountsService', () => {
  let service: AccountsService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        BullModule.registerQueue({
          name: 'verify-invoices',
        }),
      ],
      providers: [
        AccountsService,
        PrismaService,
        IncomesService,
        ExpansesService,
        InvoiceService,
        ExpansesOnInvoiceService,
      ],
    })
      .overrideProvider(getQueueToken('verify-invoices'))
      .useValue(exampleQueueMock)
      .compile();

    service = module.get<AccountsService>(AccountsService);
    prismaService = module.get<PrismaService>(PrismaService);

    prismaService.account.findUnique = jest.fn().mockResolvedValue(account);
    prismaService.account.findMany = jest.fn().mockResolvedValue([account]);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Find Account', () => {
    it('should be able to find account with unique input', async () => {
      const response = await service.account(accountWhereUniqueInput);

      expect(response).toEqual(account);
    });
    it('should be able to throw if there is an unexpected error ', async () => {
      prismaService.account.findUnique = jest
        .fn()
        .mockRejectedValueOnce(new Error());
      const response = service.account(accountWhereUniqueInput);

      await expect(response).rejects.toThrow();
    });
  });

  describe('Find Many Accounts', () => {
    it('should be able to find many accounts', async () => {
      const response = await service.accounts();

      expect(response).toEqual([account]);
    });
    it('should be able to throw if there is an unexpected error ', async () => {
      prismaService.account.findMany = jest
        .fn()
        .mockRejectedValueOnce(new Error());
      const response = service.accounts();

      await expect(response).rejects.toThrow();
    });
  });

  describe('Create Account', () => {
    it('should be able to create account', async () => {
      prismaService.account.create = jest.fn().mockResolvedValueOnce(account);
      prismaService.user.findFirst = jest.fn().mockResolvedValueOnce(user);
      const response = await service.createAccount(createAccountDTO);

      expect(response).toEqual(account);
    });

    it('should be able to throw if there is an unexpected error ', async () => {
      prismaService.account.create = jest
        .fn()
        .mockRejectedValueOnce(new Error());
      const response = service.createAccount(createAccountDTO);

      await expect(response).rejects.toThrow();
    });
  });

  describe('Update Account', () => {
    it('should be able to update account', async () => {
      prismaService.account.update = jest.fn().mockResolvedValueOnce(account);

      const response = await service.updateAccount({
        where,
        data: updateAccountDTO,
      });

      expect(response).toEqual(account);
    });
    it('should be able to throw if account is not found', async () => {
      prismaService.account.findUnique = jest.fn().mockResolvedValue(null);

      const response = service.updateAccount({
        where,
        data: updateAccountDTO,
      });

      await expect(response).rejects.toThrow();
    });

    it('should be able to throw if user is not authorized', async () => {
      const response = service.updateAccount({
        where,
        data: {
          ...updateAccountDTO,
          userId: 'any',
        },
      });

      await expect(response).rejects.toThrow();
    });

    it('should be able to throw if there is an unexpected error ', async () => {
      prismaService.account.update = jest
        .fn()
        .mockRejectedValueOnce(new Error());
      const response = service.updateAccount({
        where,
        data: updateAccountDTO,
      });

      await expect(response).rejects.toThrow();
    });
  });

  describe('Delete Account', () => {
    it('should be able to delete account', async () => {
      prismaService.account.delete = jest.fn().mockResolvedValueOnce(account);
      const response = await service.deleteAccount(where, 'any_user_id');

      expect(response).toEqual(account);
    });

    it('should be able to throw if account is not found', async () => {
      prismaService.account.findUnique = jest
        .fn()
        .mockResolvedValueOnce(undefined);
      const response = service.deleteAccount({ id: 'any' }, 'any_user_id');

      await expect(response).rejects.toThrow();
    });

    it('should be able to throw if user is not authorized', async () => {
      const response = service.deleteAccount(where, 'any');

      await expect(response).rejects.toThrow();
    });

    it('should be able to throw if account have income or expanse record', async () => {
      prismaService.incomeOnAccount.findMany = jest
        .fn()
        .mockResolvedValueOnce([incomesOnAccount]);
      const response = service.deleteAccount({ id: 'any' }, 'any_user_id');

      await expect(response).rejects.toThrow();
    });

    it('should be able to throw if there is an unexpected error', async () => {
      prismaService.account.delete = jest
        .fn()
        .mockRejectedValueOnce(new Error());
      const response = service.deleteAccount(where, 'any_user_id');

      await expect(response).rejects.toThrow();
    });
  });
});
