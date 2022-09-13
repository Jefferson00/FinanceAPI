import { BullModule, getQueueToken } from '@nestjs/bull';
import { Test } from '@nestjs/testing';
import { Account, Expanse, ExpanseOnAccount, Prisma } from '@prisma/client';
import { PrismaService } from '../../providers/database/prisma/prisma.service';
import { AccountsService } from '../accounts/accounts.service';
import { ExpansesService } from '../expanses/expanses.service';
import { ExpansesOnInvoiceService } from '../expansesOnInvoice/expansesOnInvoice.service';
import { IncomesService } from '../incomes/incomes.service';
import { InvoiceService } from '../invoices/invoices.service';
import { ExpanseOnAccountCreateDto } from './dtos/expanse-on-account-create.dto';
import { ExpansesOnAccountService } from './expansesOnAccount.service';

const exampleQueueMock = { add: jest.fn() };

const where: Prisma.ExpanseOnAccountWhereUniqueInput = {
  id: 'any_id',
};

const expanse: Expanse = {
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

const expanseOnAccount: ExpanseOnAccount = {
  id: 'any_id',
  name: 'any',
  month: new Date(),
  expanseId: 'any_id',
  accountId: 'any_id',
  recurrence: 'any',
  value: 5000,
  paymentDate: new Date(),
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

const createExpanseOnAccountDTO: ExpanseOnAccountCreateDto = {
  value: 5000,
  name: 'any',
  month: new Date().toISOString(),
  expanseId: 'any_id',
  accountId: 'any_id',
  recurrence: 'any',
  userId: 'any_user_id',
};

describe('Expanses On Account Service', () => {
  let service: ExpansesOnAccountService;
  let accountService: AccountsService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [
        BullModule.registerQueue({
          name: 'verify-invoices',
        }),
      ],
      providers: [
        ExpansesOnAccountService,
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

    service = module.get<ExpansesOnAccountService>(ExpansesOnAccountService);
    accountService = module.get<AccountsService>(AccountsService);
    prismaService = module.get<PrismaService>(PrismaService);

    prismaService.expanse.findFirst = jest.fn().mockResolvedValue(expanse);
    accountService.account = jest.fn().mockResolvedValue(account);
    prismaService.expanseOnAccount.findUnique = jest
      .fn()
      .mockResolvedValue(expanseOnAccount);
    prismaService.expanseOnAccount.findMany = jest
      .fn()
      .mockResolvedValue([expanseOnAccount]);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Find Expanses On Account', () => {
    it('should be able to find expanses on account', async () => {
      const response = await service.expansesOnAccount();

      expect(response).toEqual([expanseOnAccount]);
    });
    it('should be able to throw if there is an unexpected error ', async () => {
      prismaService.expanseOnAccount.findMany = jest
        .fn()
        .mockRejectedValueOnce(new Error());
      const response = service.expansesOnAccount();

      await expect(response).rejects.toThrow();
    });
  });

  describe('Create Expanses On Account', () => {
    it('should be able to create expanses on account', async () => {
      accountService.updateAccount = jest.fn().mockResolvedValue(account);
      prismaService.expanseOnAccount.create = jest
        .fn()
        .mockResolvedValueOnce(expanseOnAccount);
      const response = await service.createExpanseOnAccount(
        createExpanseOnAccountDTO,
      );

      expect(response).toEqual(expanseOnAccount);
    });

    it('should be able to throw if expanse is not found', async () => {
      prismaService.expanse.findFirst = jest.fn().mockResolvedValue(null);
      prismaService.expanseOnAccount.create = jest
        .fn()
        .mockResolvedValueOnce(expanseOnAccount);

      const response = service.createExpanseOnAccount(
        createExpanseOnAccountDTO,
      );

      await expect(response).rejects.toThrow();
    });

    it('should be able to throw if account is not found', async () => {
      accountService.account = jest.fn().mockResolvedValue(undefined);
      prismaService.expanseOnAccount.create = jest
        .fn()
        .mockResolvedValueOnce(expanseOnAccount);

      const response = service.createExpanseOnAccount(
        createExpanseOnAccountDTO,
      );

      await expect(response).rejects.toThrow();
    });

    it('should be able to throw if there is an unexpected error ', async () => {
      prismaService.expanseOnAccount.create = jest
        .fn()
        .mockRejectedValueOnce(new Error());
      const response = service.createExpanseOnAccount(
        createExpanseOnAccountDTO,
      );

      await expect(response).rejects.toThrow();
    });
  });

  describe('Delete  Expanses On Account', () => {
    it('should be able to delete expanse on account', async () => {
      accountService.updateAccount = jest.fn().mockResolvedValue(account);
      prismaService.expanseOnAccount.delete = jest
        .fn()
        .mockResolvedValueOnce(expanseOnAccount);
      const response = await service.deleteExpanseOnAccount(
        where,
        'any_user_id',
      );

      expect(response).toEqual(expanseOnAccount);
    });

    it('should be able to throw if expanse on account is not found', async () => {
      prismaService.expanseOnAccount.findUnique = jest
        .fn()
        .mockResolvedValueOnce(undefined);
      const response = service.deleteExpanseOnAccount(
        { id: 'any' },
        'any_user_id',
      );

      await expect(response).rejects.toThrow();
    });

    it('should be able to throw if user is not authorized', async () => {
      const response = service.deleteExpanseOnAccount(where, 'any');

      await expect(response).rejects.toThrow();
    });

    it('should be able to throw if there is an unexpected error', async () => {
      prismaService.expanseOnAccount.delete = jest
        .fn()
        .mockRejectedValueOnce(new Error());
      const response = service.deleteExpanseOnAccount(where, 'any_user_id');

      await expect(response).rejects.toThrow();
    });
  });
});
