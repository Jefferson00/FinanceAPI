import { BullModule, getQueueToken } from '@nestjs/bull';
import { Test, TestingModule } from '@nestjs/testing';
import { Account, CreditCard, Invoice, Prisma } from '@prisma/client';
import { PrismaService } from '../../providers/database/prisma/prisma.service';
import { AccountsService } from '../accounts/accounts.service';
import { ExpansesService } from '../expanses/expanses.service';
import { ExpansesOnInvoiceService } from '../expansesOnInvoice/expansesOnInvoice.service';
import { IncomesService } from '../incomes/incomes.service';
import { InvoiceService } from '../invoices/invoices.service';
import { CreditCardService } from './credit-card.service';
import { CreditCardCreateDto } from './dtos/credit-card-create.dto';
import { CreditCardUpdateDto } from './dtos/credit-card-update.dto';

const exampleQueueMock = { add: jest.fn() };

const accountWhereUniqueInput: Prisma.CreditCardWhereUniqueInput = {
  id: 'any_id',
};

const where: Prisma.CreditCardWhereUniqueInput = {
  id: 'any_id',
};

const createCreditCardDTO: CreditCardCreateDto = {
  color: 'any',
  limit: 0,
  name: 'any',
  paymentDate: new Date().toDateString(),
  invoiceClosing: new Date().toDateString(),
  receiptDefault: 'any_id',
  userId: 'any_user_id',
};

const updateCreditCardDTO: CreditCardUpdateDto = {
  color: 'any',
  limit: 0,
  name: 'any',
  userId: 'any_user_id',
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

describe('CreditCardService', () => {
  let service: CreditCardService;
  let accountService: AccountsService;
  let invoiceService: InvoiceService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        BullModule.registerQueue({
          name: 'verify-invoices',
        }),
      ],
      providers: [
        CreditCardService,
        PrismaService,
        InvoiceService,
        IncomesService,
        ExpansesService,
        ExpansesOnInvoiceService,
        AccountsService,
      ],
    })
      .overrideProvider(getQueueToken('verify-invoices'))
      .useValue(exampleQueueMock)
      .compile();

    service = module.get<CreditCardService>(CreditCardService);
    accountService = module.get<AccountsService>(AccountsService);
    prismaService = module.get<PrismaService>(PrismaService);
    invoiceService = module.get<InvoiceService>(InvoiceService);

    prismaService.creditCard.findUnique = jest
      .fn()
      .mockResolvedValue(creditCard);
    prismaService.creditCard.findMany = jest
      .fn()
      .mockResolvedValue([creditCard]);
    accountService.account = jest.fn().mockResolvedValue(account);
    invoiceService.createInvoice = jest.fn().mockResolvedValue(invoice);
    invoiceService.invoices = jest.fn().mockResolvedValue([invoice]);
    invoiceService.deleteInvoice = jest.fn().mockResolvedValue(invoice);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Find Credit Card', () => {
    it('should be able to find credit card with unique input', async () => {
      const response = await service.creditCard(accountWhereUniqueInput);

      expect(response).toEqual(creditCard);
    });
    it('should be able to throw if there is an unexpected error ', async () => {
      prismaService.creditCard.findUnique = jest
        .fn()
        .mockRejectedValueOnce(new Error());
      const response = service.creditCard(accountWhereUniqueInput);

      await expect(response).rejects.toThrow();
    });
  });

  describe('Find Many Credit cards', () => {
    it('should be able to find many credit cards', async () => {
      const response = await service.creditCards();

      expect(response).toEqual([creditCard]);
    });
    it('should be able to throw if there is an unexpected error ', async () => {
      prismaService.creditCard.findMany = jest
        .fn()
        .mockRejectedValueOnce(new Error());
      const response = service.creditCards();

      await expect(response).rejects.toThrow();
    });
  });

  describe('Create Credit Card', () => {
    it('should be able to create credit card', async () => {
      prismaService.creditCard.create = jest
        .fn()
        .mockResolvedValueOnce(creditCard);
      const response = await service.createCreditCard(createCreditCardDTO);

      expect(response).toEqual(creditCard);
    });

    it('should be able to create credit card with invoice closing after today', async () => {
      const invoiceClosing = new Date();
      const newDate = new Date(
        invoiceClosing.setDate(invoiceClosing.getDate() + 1),
      );
      prismaService.creditCard.create = jest.fn().mockResolvedValueOnce({
        ...creditCard,
        invoiceClosing: newDate,
      });
      const response = await service.createCreditCard({
        ...createCreditCardDTO,
      });

      expect(response).toEqual({
        ...creditCard,
        invoiceClosing: newDate,
      });
    });

    it('should be able to throw if account is not found', async () => {
      accountService.account = jest.fn().mockResolvedValue(null);

      const response = service.createCreditCard(createCreditCardDTO);

      await expect(response).rejects.toThrow();
    });

    it('should be able to throw if there is an unexpected error ', async () => {
      prismaService.creditCard.create = jest
        .fn()
        .mockRejectedValueOnce(new Error());
      const response = service.createCreditCard(createCreditCardDTO);

      await expect(response).rejects.toThrow();
    });
  });

  describe('Update Credit Card', () => {
    it('should be able to update credit card', async () => {
      prismaService.creditCard.update = jest
        .fn()
        .mockResolvedValueOnce(creditCard);

      const response = await service.updateCreditCard({
        where,
        data: updateCreditCardDTO,
      });

      expect(response).toEqual(creditCard);
    });
    it('should be able to throw if credit card is not found', async () => {
      prismaService.creditCard.findUnique = jest.fn().mockResolvedValue(null);

      const response = service.updateCreditCard({
        where,
        data: updateCreditCardDTO,
      });

      await expect(response).rejects.toThrow();
    });

    it('should be able to throw if user is not authorized', async () => {
      const response = service.updateCreditCard({
        where,
        data: {
          ...updateCreditCardDTO,
          userId: 'any',
        },
      });

      await expect(response).rejects.toThrow();
    });

    it('should be able to throw if there is an unexpected error ', async () => {
      prismaService.creditCard.update = jest
        .fn()
        .mockRejectedValueOnce(new Error());
      const response = service.updateCreditCard({
        where,
        data: updateCreditCardDTO,
      });

      await expect(response).rejects.toThrow();
    });
  });

  describe('Delete Credit Card', () => {
    it('should be able to delete credit card', async () => {
      prismaService.creditCard.delete = jest
        .fn()
        .mockResolvedValueOnce(creditCard);
      const response = await service.deleteCreditCard(where, 'any_user_id');

      expect(response).toEqual(creditCard);
    });

    it('should be able to throw if credit card is not found', async () => {
      prismaService.creditCard.findUnique = jest
        .fn()
        .mockResolvedValueOnce(undefined);
      const response = service.deleteCreditCard({ id: 'any' }, 'any_user_id');

      await expect(response).rejects.toThrow();
    });

    it('should be able to throw if user is not authorized', async () => {
      const response = service.deleteCreditCard(where, 'any');

      await expect(response).rejects.toThrow();
    });

    it('should be able to throw if credit card have expanse in open invoice', async () => {
      prismaService.expanseOnInvoice.findFirst = jest
        .fn()
        .mockResolvedValueOnce(invoice);
      const response = service.deleteCreditCard({ id: 'any' }, 'any_user_id');

      await expect(response).rejects.toThrow();
    });

    it('should be able to throw if there is an unexpected error', async () => {
      prismaService.creditCard.delete = jest
        .fn()
        .mockRejectedValueOnce(new Error());
      const response = service.deleteCreditCard(where, 'any_user_id');

      await expect(response).rejects.toThrow();
    });
  });
});
