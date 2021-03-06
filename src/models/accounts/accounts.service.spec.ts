import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../providers/database/prisma/prisma.service';
import { Prisma, Account, AccountBalance } from '@prisma/client';
import { AccountCreateDto } from './dtos/account-create.dto';
import { AccountUpdateDto } from './dtos/account-update.dto';
import { AccountsService } from './accounts.service';
import { IncomesService } from '../incomes/incomes.service';
import { ExpansesService } from '../expanses/expanses.service';

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
  createdAt: new Date(),
  updatedAt: new Date(),
};

const accountBalance: AccountBalance = {
  id: 'any',
  accountId: 'any_id',
  value: 0,
  month: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('AccountsService', () => {
  let service: AccountsService;
  let prismaService: PrismaService;
  let incomeService: IncomesService;
  let expanseService: ExpansesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountsService,
        PrismaService,
        IncomesService,
        ExpansesService,
      ],
    }).compile();

    service = module.get<AccountsService>(AccountsService);
    prismaService = module.get<PrismaService>(PrismaService);
    incomeService = module.get<IncomesService>(IncomesService);
    expanseService = module.get<ExpansesService>(ExpansesService);

    prismaService.account.findUnique = jest.fn().mockResolvedValue(account);
    prismaService.account.findMany = jest.fn().mockResolvedValue([account]);
    prismaService.accountBalance.findMany = jest
      .fn()
      .mockResolvedValue([accountBalance]);
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

  describe('Find Account Balance', () => {
    it('should be able to find account balance', async () => {
      const response = await service.accountsBalance({ id: 'any_id' });

      expect(response).toEqual([accountBalance]);
    });
    it('should be able to throw if there is an unexpected error ', async () => {
      prismaService.accountBalance.findMany = jest
        .fn()
        .mockRejectedValueOnce(new Error());
      const response = service.accountsBalance({ id: 'any_id' });

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

  describe('Create Account Balance', () => {
    it('should be able to create account balance', async () => {
      prismaService.accountBalance.create = jest
        .fn()
        .mockResolvedValueOnce(accountBalance);
      const response = await service.createAccountBalance({
        accountId: 'any_id',
        month: '2022-05-16T20:16:58.453Z',
        value: 0,
      });

      expect(response).toEqual(accountBalance);
    });

    it('should be able to throw if there is an unexpected error ', async () => {
      prismaService.accountBalance.create = jest
        .fn()
        .mockRejectedValueOnce(new Error());
      const response = service.createAccountBalance({
        accountId: 'any_id',
        month: '2022-05-16T20:16:58.453Z',
        value: 0,
      });

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

  describe('Update Account Balance', () => {
    it('should be able to update account balance', async () => {
      prismaService.accountBalance.update = jest
        .fn()
        .mockResolvedValueOnce(accountBalance);

      const response = await service.updateAccountBalance({
        where,
        data: {
          accountId: 'any_id',
          value: 0,
        },
      });

      expect(response).toEqual(accountBalance);
    });
    it('should be able to throw if account balance is not found', async () => {
      prismaService.accountBalance.findMany = jest.fn().mockResolvedValue([]);

      const response = service.updateAccountBalance({
        where,
        data: {
          accountId: 'any_id',
          value: 0,
        },
      });

      await expect(response).rejects.toThrow();
    });

    it('should be able to throw if user is not authorized', async () => {
      const response = service.updateAccountBalance({
        where,
        data: {
          accountId: 'any_other_id',
          value: 0,
        },
      });

      await expect(response).rejects.toThrow();
    });

    it('should be able to throw if there is an unexpected error ', async () => {
      prismaService.accountBalance.update = jest
        .fn()
        .mockRejectedValueOnce(new Error());
      const response = service.updateAccountBalance({
        where,
        data: {
          accountId: 'any_id',
          value: 0,
        },
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
      const response = service.deleteAccount({ id: 'any' }, 'any_user_id');

      await expect(response).rejects.toThrow();
    });

    it('should be able to throw if user is not authorized', async () => {
      const response = service.deleteAccount(where, 'any');

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

  describe('Delete Account Balance', () => {
    it('should be able to delete account balance', async () => {
      prismaService.accountBalance.delete = jest
        .fn()
        .mockResolvedValueOnce(accountBalance);
      const response = await service.deleteAccountBalance({
        id: 'any',
      });

      expect(response).toEqual(accountBalance);
    });

    it('should be able to throw if account balance is not found', async () => {
      prismaService.accountBalance.findMany = jest.fn().mockResolvedValue([]);
      const response = service.deleteAccountBalance({
        id: 'any',
      });

      await expect(response).rejects.toThrow();
    });

    it('should be able to throw if there is an unexpected error', async () => {
      prismaService.accountBalance.delete = jest
        .fn()
        .mockRejectedValueOnce(new Error());
      const response = service.deleteAccountBalance({
        id: 'any',
      });

      await expect(response).rejects.toThrow();
    });
  });
});
