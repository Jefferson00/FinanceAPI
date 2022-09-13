import { BullModule, getQueueToken } from '@nestjs/bull';
import { Test } from '@nestjs/testing';
import { Account, Income, IncomeOnAccount, Prisma } from '@prisma/client';
import { PrismaService } from '../../providers/database/prisma/prisma.service';
import { AccountsService } from '../accounts/accounts.service';
import { ExpansesService } from '../expanses/expanses.service';
import { ExpansesOnInvoiceService } from '../expansesOnInvoice/expansesOnInvoice.service';
import { IncomesService } from '../incomes/incomes.service';
import { InvoiceService } from '../invoices/invoices.service';
import { IncomeOnAccountCreateDto } from './dtos/income-on-account-create.dto';
import { IncomeOnAccountUpdateDto } from './dtos/income-on-account-update.dto';
import { IncomesOnAccountService } from './incomesOnAccount.service';

const exampleQueueMock = { add: jest.fn() };

const where: Prisma.IncomeOnAccountWhereUniqueInput = {
  id: 'any_id',
};

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

const createIncomeOnAccountDTO: IncomeOnAccountCreateDto = {
  value: 5000,
  name: 'any',
  month: new Date().toISOString(),
  incomeId: 'any_id',
  accountId: 'any_id',
  recurrence: 'any',
  userId: 'any_user_id',
};

const updateIncomeOnAccountDTO: IncomeOnAccountUpdateDto = {
  name: 'any',
  userId: 'any_user_id',
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

describe(' Incomes on Account Service', () => {
  let service: IncomesOnAccountService;
  let prismaService: PrismaService;
  let accountService: AccountsService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [
        BullModule.registerQueue({
          name: 'verify-invoices',
        }),
      ],
      providers: [
        IncomesOnAccountService,
        PrismaService,
        AccountsService,
        IncomesService,
        ExpansesService,
        InvoiceService,
        ExpansesOnInvoiceService,
      ],
    })
      .overrideProvider(getQueueToken('verify-invoices'))
      .useValue(exampleQueueMock)
      .compile();

    service = module.get<IncomesOnAccountService>(IncomesOnAccountService);
    prismaService = module.get<PrismaService>(PrismaService);
    accountService = module.get<AccountsService>(AccountsService);

    prismaService.income.findFirst = jest.fn().mockResolvedValue(income);
    accountService.account = jest.fn().mockResolvedValue(account);

    prismaService.incomeOnAccount.findUnique = jest
      .fn()
      .mockResolvedValue(incomeOnAccount);
    prismaService.incomeOnAccount.findMany = jest
      .fn()
      .mockResolvedValue([incomeOnAccount]);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Find Incomes On Account', () => {
    it('should be able to find incomes on account', async () => {
      const response = await service.incomesOnAccount();

      expect(response).toEqual([incomeOnAccount]);
    });
    it('should be able to throw if there is an unexpected error ', async () => {
      prismaService.incomeOnAccount.findMany = jest
        .fn()
        .mockRejectedValueOnce(new Error());
      const response = service.incomesOnAccount();

      await expect(response).rejects.toThrow();
    });
  });

  describe('Create Incomes On Account', () => {
    it('should be able to create incomes on account', async () => {
      accountService.updateAccount = jest.fn().mockResolvedValue(account);
      prismaService.incomeOnAccount.create = jest
        .fn()
        .mockResolvedValueOnce(incomeOnAccount);
      const response = await service.createIncomeOnAccount(
        createIncomeOnAccountDTO,
      );

      expect(response).toEqual(incomeOnAccount);
    });

    it('should be able to throw if income is not found', async () => {
      prismaService.income.findFirst = jest.fn().mockResolvedValue(null);
      prismaService.incomeOnAccount.create = jest
        .fn()
        .mockResolvedValueOnce(incomeOnAccount);

      const response = service.createIncomeOnAccount(createIncomeOnAccountDTO);

      await expect(response).rejects.toThrow();
    });

    it('should be able to throw if account is not found', async () => {
      accountService.account = jest.fn().mockResolvedValue(undefined);
      prismaService.incomeOnAccount.create = jest
        .fn()
        .mockResolvedValueOnce(incomeOnAccount);

      const response = service.createIncomeOnAccount(createIncomeOnAccountDTO);

      await expect(response).rejects.toThrow();
    });

    it('should be able to throw if there is an unexpected error ', async () => {
      prismaService.incomeOnAccount.create = jest
        .fn()
        .mockRejectedValueOnce(new Error());
      const response = service.createIncomeOnAccount(createIncomeOnAccountDTO);

      await expect(response).rejects.toThrow();
    });
  });

  describe('Update  Incomes On Account', () => {
    it('should be able to update income on account', async () => {
      prismaService.incomeOnAccount.update = jest
        .fn()
        .mockResolvedValueOnce(incomeOnAccount);
      const response = await service.updateIncomeOnAccount({
        where,
        data: updateIncomeOnAccountDTO,
      });

      expect(response).toEqual(incomeOnAccount);
    });

    it('should be able to throw if income on account is not found', async () => {
      prismaService.incomeOnAccount.findMany = jest
        .fn()
        .mockResolvedValueOnce([]);
      const response = service.updateIncomeOnAccount({
        where,
        data: updateIncomeOnAccountDTO,
      });

      await expect(response).rejects.toThrow();
    });

    it('should be able to throw if user is not authorized', async () => {
      const response = service.updateIncomeOnAccount({
        where,
        data: {
          userId: 'any',
          name: 'any',
        },
      });

      await expect(response).rejects.toThrow();
    });

    it('should be able to throw if there is an unexpected error', async () => {
      prismaService.incomeOnAccount.update = jest
        .fn()
        .mockRejectedValueOnce(new Error());
      const response = service.updateIncomeOnAccount({
        where,
        data: updateIncomeOnAccountDTO,
      });

      await expect(response).rejects.toThrow();
    });
  });

  describe('Delete  Incomes On Account', () => {
    it('should be able to delete income on account', async () => {
      accountService.updateAccount = jest.fn().mockResolvedValue(account);
      prismaService.incomeOnAccount.delete = jest
        .fn()
        .mockResolvedValueOnce(incomeOnAccount);
      const response = await service.deleteIncomeOnAccount(
        where,
        'any_user_id',
      );

      expect(response).toEqual(incomeOnAccount);
    });

    it('should be able to throw if income on account is not found', async () => {
      prismaService.incomeOnAccount.findUnique = jest
        .fn()
        .mockResolvedValueOnce(undefined);
      const response = service.deleteIncomeOnAccount(
        { id: 'any' },
        'any_user_id',
      );

      await expect(response).rejects.toThrow();
    });

    it('should be able to throw if user is not authorized', async () => {
      const response = service.deleteIncomeOnAccount(where, 'any');

      await expect(response).rejects.toThrow();
    });

    it('should be able to throw if there is an unexpected error', async () => {
      prismaService.incomeOnAccount.delete = jest
        .fn()
        .mockRejectedValueOnce(new Error());
      const response = service.deleteIncomeOnAccount(where, 'any_user_id');

      await expect(response).rejects.toThrow();
    });
  });
});
