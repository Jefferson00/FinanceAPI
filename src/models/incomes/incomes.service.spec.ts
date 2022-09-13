import { Test } from '@nestjs/testing';
import { Account, Income, IncomeOnAccount, Prisma } from '@prisma/client';
import { PrismaService } from '../../providers/database/prisma/prisma.service';
import { IncomesCreateDto } from './dtos/incomes-create.dto';
import { IncomeUpdateDto } from './dtos/incomes-update.dto';
import { IncomesService } from './incomes.service';

const income: Income = {
  id: 'any_id',
  category: 'any',
  description: 'any',
  iteration: 'any',
  name: 'any',
  userId: 'any_user_id',
  receiptDefault: 'any_account_id',
  receiptDate: new Date(),
  endDate: new Date(),
  startDate: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
  value: 5000,
};

const incomeOnAccount: IncomeOnAccount = {
  id: 'any_id',
  name: 'any',
  month: new Date(),
  incomeId: 'any_id',
  accountId: 'any_id',
  recurrence: 'any',
  value: 5000,
  paymentDate: new Date(),
  userId: 'any_user_id',
};

const createIncomeDTO: IncomesCreateDto = {
  category: 'any',
  description: 'any',
  iteration: 'any',
  name: 'any',
  userId: 'any_user_id',
  receiptDefault: 'any_account_id',
  receiptDate: new Date().toISOString(),
  endDate: new Date().toISOString(),
  startDate: new Date().toISOString(),
  value: 5000,
};

const updateIncomeDTO: IncomeUpdateDto = {
  name: 'any',
  userId: 'any_user_id',
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

const incomeWhereUniqueInput: Prisma.IncomeWhereUniqueInput = {
  id: 'any_id',
};

const where: Prisma.IncomeWhereUniqueInput = {
  id: 'any_id',
};

describe('Incomes Service', () => {
  let service: IncomesService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [IncomesService, PrismaService],
    }).compile();

    service = module.get<IncomesService>(IncomesService);
    prismaService = module.get<PrismaService>(PrismaService);

    prismaService.income.findUnique = jest.fn().mockResolvedValue(income);
    prismaService.income.findMany = jest.fn().mockResolvedValue([income]);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Find Income', () => {
    it('should be able to find income with unique input', async () => {
      const response = await service.income(incomeWhereUniqueInput);

      expect(response).toEqual(income);
    });
    it('should be able to throw if there is an unexpected error ', async () => {
      prismaService.income.findUnique = jest
        .fn()
        .mockRejectedValueOnce(new Error());
      const response = service.income(incomeWhereUniqueInput);

      await expect(response).rejects.toThrow();
    });
  });

  describe('Find Many Incomes', () => {
    it('should be able to find many incomes', async () => {
      const response = await service.incomes();

      expect(response).toEqual([income]);
    });
    it('should be able to throw if there is an unexpected error ', async () => {
      prismaService.income.findMany = jest
        .fn()
        .mockRejectedValueOnce(new Error());
      const response = service.incomes();

      await expect(response).rejects.toThrow();
    });
  });

  describe('Last Incomes On Account', () => {
    it('should be able to get last incomes on account', async () => {
      prismaService.incomeOnAccount.findMany = jest
        .fn()
        .mockResolvedValueOnce([incomeOnAccount]);
      const response = await service.lastIncomesOnAccount(where);

      expect(response).toEqual([incomeOnAccount]);
    });

    it('should be able to throw if there is an unexpected error', async () => {
      prismaService.incomeOnAccount.findMany = jest
        .fn()
        .mockRejectedValueOnce(new Error());
      const response = service.lastIncomesOnAccount(where);

      await expect(response).rejects.toThrow();
    });
  });

  describe('Create Income', () => {
    it('should be able to create income', async () => {
      prismaService.account.findFirst = jest.fn().mockResolvedValue(account);
      prismaService.income.create = jest.fn().mockResolvedValueOnce(income);
      const response = await service.createIncomes(createIncomeDTO);

      expect(response).toEqual(income);
    });

    it('should be able to throw if account is not found', async () => {
      prismaService.account.findFirst = jest.fn().mockResolvedValue(null);

      const response = service.createIncomes(createIncomeDTO);

      await expect(response).rejects.toThrow();
    });

    it('should be able to throw if there is an unexpected error ', async () => {
      prismaService.income.create = jest
        .fn()
        .mockRejectedValueOnce(new Error());
      const response = service.createIncomes(createIncomeDTO);

      await expect(response).rejects.toThrow();
    });
  });

  describe('Update Income', () => {
    it('should be able to update income', async () => {
      prismaService.income.update = jest.fn().mockResolvedValueOnce(income);

      const response = await service.updateIncome({
        where,
        data: updateIncomeDTO,
      });

      expect(response).toEqual(income);
    });

    /*  it('should be able to update income with different name', async () => {
      const incomeUpdated = {
        ...income,
        name: 'different-name',
      };
      prismaService.expanseOnAccount.findMany = jest
        .fn()
        .mockResolvedValueOnce([incomeOnAccount]);
      prismaService.expanseOnAccount.update = jest.fn().mockResolvedValueOnce({
        ...incomeOnAccount,
        name: 'different-name',
      });
      prismaService.expanse.update = jest
        .fn()
        .mockResolvedValueOnce(incomeUpdated);

      const response = await service.updateIncome({
        where,
        data: {
          ...updateIncomeDTO,
          name: 'different-name',
        },
      });

      expect(response).toEqual(incomeUpdated);
    }); */

    it('should be able to throw if income is not found', async () => {
      prismaService.income.findUnique = jest.fn().mockResolvedValue(null);

      const response = service.updateIncome({
        where,
        data: updateIncomeDTO,
      });

      await expect(response).rejects.toThrow();
    });

    it('should be able to throw if user is not authorized', async () => {
      const response = service.updateIncome({
        where,
        data: {
          ...updateIncomeDTO,
          userId: 'any',
        },
      });

      await expect(response).rejects.toThrow();
    });

    it('should be able to throw if account is not found', async () => {
      prismaService.account.findFirst = jest.fn().mockResolvedValue(undefined);

      const response = service.updateIncome({
        where,
        data: {
          ...updateIncomeDTO,
          receiptDefault: 'any_account_id',
        },
      });

      await expect(response).rejects.toThrow();
    });

    it('should be able to throw if there is an unexpected error ', async () => {
      prismaService.income.update = jest
        .fn()
        .mockRejectedValueOnce(new Error());
      const response = service.updateIncome({
        where,
        data: updateIncomeDTO,
      });

      await expect(response).rejects.toThrow();
    });
  });

  describe('Delete Income', () => {
    it('should be able to delete income', async () => {
      prismaService.income.delete = jest.fn().mockResolvedValueOnce(income);
      const response = await service.deleteIncome(where, 'any_user_id');

      expect(response).toEqual(income);
    });

    it('should be able to throw if income is not found', async () => {
      prismaService.income.findUnique = jest
        .fn()
        .mockResolvedValueOnce(undefined);
      const response = service.deleteIncome({ id: 'any' }, 'any_user_id');

      await expect(response).rejects.toThrow();
    });

    it('should be able to throw if user is not authorized', async () => {
      const response = service.deleteIncome(where, 'any');

      await expect(response).rejects.toThrow();
    });

    it('should be able to throw if there is an unexpected error', async () => {
      prismaService.income.delete = jest
        .fn()
        .mockRejectedValueOnce(new Error());
      const response = service.deleteIncome(where, 'any_user_id');

      await expect(response).rejects.toThrow();
    });
  });
});
