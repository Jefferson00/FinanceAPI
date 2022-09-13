import { BullModule, getQueueToken } from '@nestjs/bull';
import { Test } from '@nestjs/testing';
import {
  Account,
  CreditCard,
  Expanse,
  ExpanseOnAccount,
  ExpanseOnInvoice,
  Invoice,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../../providers/database/prisma/prisma.service';
import { ExpansesOnInvoiceService } from '../expansesOnInvoice/expansesOnInvoice.service';
import { InvoiceService } from '../invoices/invoices.service';
import { ExpanseCreateDto } from './dtos/expanse-create.dto';
import { ExpanseUpdateDto } from './dtos/expanse-update.dto';
import { ExpansesService } from './expanses.service';

const exampleQueueMock = { add: jest.fn() };

const accountWhereUniqueInput: Prisma.ExpanseWhereUniqueInput = {
  id: 'any_id',
};

const where: Prisma.ExpanseWhereUniqueInput = {
  id: 'any_id',
};

const createExpanseDTO: ExpanseCreateDto = {
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

const updateExpanseDTO: ExpanseUpdateDto = {
  userId: 'any_user_id',
  name: 'any',
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

const creditCard: CreditCard = {
  id: 'any_id',
  color: 'any',
  limit: 0,
  name: 'any',
  paymentDate: new Date(),
  invoiceClosing: new Date(),
  receiptDefault: 'any_id',
  userId: 'any_user_id',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const invoice: Invoice = {
  id: 'any_id',
  accountId: 'any_id',
  closed: false,
  closingDate: new Date(),
  creditCardId: 'any_id',
  paid: false,
  value: 0,
  month: new Date(),
  paymentDate: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
};

const expanseOnInvoice: ExpanseOnInvoice = {
  day: 1,
  id: 'any_id',
  name: 'any',
  recurrence: 'any',
  value: 5000,
  expanseId: 'any_id',
  invoiceId: 'any_id',
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

describe(' Expanses Service', () => {
  let service: ExpansesService;
  let prismaService: PrismaService;
  let invoiceService: InvoiceService;
  let expansesOnInvoiceService: ExpansesOnInvoiceService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [
        BullModule.registerQueue({
          name: 'verify-invoices',
        }),
      ],
      providers: [
        ExpansesService,
        PrismaService,
        InvoiceService,
        ExpansesOnInvoiceService,
      ],
    })
      .overrideProvider(getQueueToken('verify-invoices'))
      .useValue(exampleQueueMock)
      .compile();

    service = module.get<ExpansesService>(ExpansesService);
    prismaService = module.get<PrismaService>(PrismaService);
    invoiceService = module.get<InvoiceService>(InvoiceService);
    expansesOnInvoiceService = module.get<ExpansesOnInvoiceService>(
      ExpansesOnInvoiceService,
    );

    prismaService.expanse.findUnique = jest.fn().mockResolvedValue(expanse);
    prismaService.expanse.findMany = jest.fn().mockResolvedValue([expanse]);
    prismaService.account.findFirst = jest.fn().mockResolvedValue(account);
    prismaService.creditCard.findFirst = jest
      .fn()
      .mockResolvedValue(creditCard);
    invoiceService.invoices = jest.fn().mockResolvedValue([invoice]);
    invoiceService.updateInvoice = jest.fn().mockResolvedValue({
      ...invoice,
      value: 5000,
    });
    expansesOnInvoiceService.createExpanseOnInvoice = jest
      .fn()
      .mockResolvedValue(expanseOnInvoice);
    expansesOnInvoiceService.expansesOnInvoice = jest
      .fn()
      .mockResolvedValue([expanseOnInvoice]);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Find Expanse', () => {
    it('should be able to find expanse with unique input', async () => {
      const response = await service.expanse(accountWhereUniqueInput);

      expect(response).toEqual(expanse);
    });
    it('should be able to throw if there is an unexpected error ', async () => {
      prismaService.expanse.findUnique = jest
        .fn()
        .mockRejectedValueOnce(new Error());
      const response = service.expanse(accountWhereUniqueInput);

      await expect(response).rejects.toThrow();
    });
  });

  describe('Find Many Expanses', () => {
    it('should be able to find many expanses', async () => {
      const response = await service.expanses();

      expect(response).toEqual([expanse]);
    });
    it('should be able to throw if there is an unexpected error ', async () => {
      prismaService.expanse.findMany = jest
        .fn()
        .mockRejectedValueOnce(new Error());
      const response = service.expanses();

      await expect(response).rejects.toThrow();
    });
  });

  describe('Create Expanse', () => {
    it('should be able to create expanse', async () => {
      prismaService.expanse.create = jest.fn().mockResolvedValueOnce(expanse);
      const response = await service.createExpanse(createExpanseDTO);

      expect(response).toEqual(expanse);
    });

    it('should be able to create expanse with iteration "Mensal"', async () => {
      const monthlyExpanse = {
        ...expanse,
        iteration: 'Mensal',
      };
      prismaService.expanse.create = jest
        .fn()
        .mockResolvedValueOnce(monthlyExpanse);
      const response = await service.createExpanse({
        ...createExpanseDTO,
        iteration: 'Mensal',
      });

      expect(response).toEqual(monthlyExpanse);
    });

    it('should be able to create expanse without invoice', async () => {
      invoiceService.invoices = jest.fn().mockResolvedValueOnce([]);
      prismaService.expanse.create = jest.fn().mockResolvedValueOnce(expanse);
      const response = await service.createExpanse(createExpanseDTO);

      expect(response).toEqual(expanse);
    });

    it('should be able to throw if account or credit card is not found', async () => {
      prismaService.account.findFirst = jest.fn().mockResolvedValue(null);
      prismaService.creditCard.findFirst = jest.fn().mockResolvedValue(null);

      const response = service.createExpanse(createExpanseDTO);

      await expect(response).rejects.toThrow();
    });

    it('should be able to throw if there is an unexpected error ', async () => {
      prismaService.expanse.create = jest
        .fn()
        .mockRejectedValueOnce(new Error());
      const response = service.createExpanse(createExpanseDTO);

      await expect(response).rejects.toThrow();
    });
  });

  describe('Update Expanse', () => {
    it('should be able to update expanse', async () => {
      prismaService.expanse.update = jest.fn().mockResolvedValueOnce(expanse);

      const response = await service.updateExpanse({
        where,
        data: updateExpanseDTO,
      });

      expect(response).toEqual(expanse);
    });

    it('should be able to update expanse with different name', async () => {
      const expanseUpdated = {
        ...expanse,
        name: 'different-name',
      };
      prismaService.expanseOnAccount.findMany = jest
        .fn()
        .mockResolvedValueOnce([expanseOnAccount]);
      prismaService.expanseOnAccount.update = jest.fn().mockResolvedValueOnce({
        ...expanseOnAccount,
        name: 'different-name',
      });
      prismaService.expanseOnInvoice.update = jest.fn().mockResolvedValueOnce({
        ...expanseOnInvoice,
        name: 'different-name',
      });
      prismaService.expanse.update = jest
        .fn()
        .mockResolvedValueOnce(expanseUpdated);

      const response = await service.updateExpanse({
        where,
        data: {
          ...updateExpanseDTO,
          name: 'different-name',
        },
      });

      expect(response).toEqual(expanseUpdated);
    });

    it('should be able to update expanse with different value', async () => {
      const expanseUpdated = {
        ...expanse,
        value: 4000,
      };
      const expanseOnInvoiceWithInvoice = {
        ...expanseOnInvoice,
        invoice,
      };
      prismaService.expanseOnInvoice.findMany = jest
        .fn()
        .mockResolvedValueOnce([expanseOnInvoiceWithInvoice]);
      prismaService.expanseOnInvoice.update = jest.fn().mockResolvedValueOnce({
        ...expanseOnInvoiceWithInvoice,
        value: 4000,
      });
      invoiceService.updateInvoice = jest.fn().mockResolvedValueOnce({
        ...invoice,
        value: 4000,
      });
      prismaService.expanse.update = jest
        .fn()
        .mockResolvedValueOnce(expanseUpdated);

      const response = await service.updateExpanse({
        where,
        data: {
          ...updateExpanseDTO,
          value: 4000,
        },
      });

      expect(response).toEqual(expanseUpdated);
    });

    it('should be able to throw if expanse is not found', async () => {
      prismaService.expanse.findUnique = jest.fn().mockResolvedValue(null);

      const response = service.updateExpanse({
        where,
        data: updateExpanseDTO,
      });

      await expect(response).rejects.toThrow();
    });

    it('should be able to throw if user is not authorized', async () => {
      const response = service.updateExpanse({
        where,
        data: {
          ...updateExpanseDTO,
          userId: 'any',
        },
      });

      await expect(response).rejects.toThrow();
    });

    it('should be able to throw if there is an unexpected error ', async () => {
      prismaService.expanse.update = jest
        .fn()
        .mockRejectedValueOnce(new Error());
      const response = service.updateExpanse({
        where,
        data: updateExpanseDTO,
      });

      await expect(response).rejects.toThrow();
    });
  });

  describe('Delete Expanse', () => {
    it('should be able to delete expanse', async () => {
      prismaService.expanse.delete = jest.fn().mockResolvedValueOnce(expanse);
      const response = await service.deleteExpanse(where, 'any_user_id');

      expect(response).toEqual(expanse);
    });

    it('should be able to throw if expanse is not found', async () => {
      prismaService.expanse.findUnique = jest
        .fn()
        .mockResolvedValueOnce(undefined);
      const response = service.deleteExpanse({ id: 'any' }, 'any_user_id');

      await expect(response).rejects.toThrow();
    });

    it('should be able to throw if user is not authorized', async () => {
      const response = service.deleteExpanse(where, 'any');

      await expect(response).rejects.toThrow();
    });

    it('should be able to throw if there is an unexpected error', async () => {
      prismaService.expanse.delete = jest
        .fn()
        .mockRejectedValueOnce(new Error());
      const response = service.deleteExpanse(where, 'any_user_id');

      await expect(response).rejects.toThrow();
    });
  });

  describe('Last Expanses On Account', () => {
    it('should be able to get last expanses on account', async () => {
      prismaService.expanseOnAccount.findMany = jest
        .fn()
        .mockResolvedValueOnce([expanseOnAccount]);
      const response = await service.lastExpansesOnAccount(where);

      expect(response).toEqual([expanseOnAccount]);
    });

    it('should be able to throw if there is an unexpected error', async () => {
      prismaService.expanseOnAccount.findMany = jest
        .fn()
        .mockRejectedValueOnce(new Error());
      const response = service.lastExpansesOnAccount(where);

      await expect(response).rejects.toThrow();
    });
  });
});
