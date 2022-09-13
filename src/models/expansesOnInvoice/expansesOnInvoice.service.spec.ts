import { BullModule, getQueueToken } from '@nestjs/bull';
import { Test } from '@nestjs/testing';
import { Expanse, ExpanseOnInvoice, Invoice, Prisma } from '@prisma/client';
import { PrismaService } from '../../providers/database/prisma/prisma.service';
import { InvoiceService } from '../invoices/invoices.service';
import { ExpanseOnInvoiceCreateDto } from './dtos/expanse-on-invoice-create.dto';
import { ExpansesOnInvoiceService } from './expansesOnInvoice.service';

const exampleQueueMock = { add: jest.fn() };

const where: Prisma.ExpanseOnInvoiceWhereUniqueInput = {
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

const createExpanseOnInvoiceDTO: ExpanseOnInvoiceCreateDto = {
  day: 1,
  name: 'any',
  recurrence: 'any',
  value: 5000,
  expanseId: 'any_id',
};

describe(' Expanses On invoice', () => {
  let service: ExpansesOnInvoiceService;
  let invoiceService: InvoiceService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [
        BullModule.registerQueue({
          name: 'verify-invoices',
        }),
      ],
      providers: [ExpansesOnInvoiceService, InvoiceService, PrismaService],
    })
      .overrideProvider(getQueueToken('verify-invoices'))
      .useValue(exampleQueueMock)
      .compile();

    service = module.get<ExpansesOnInvoiceService>(ExpansesOnInvoiceService);
    invoiceService = module.get<InvoiceService>(InvoiceService);
    prismaService = module.get<PrismaService>(PrismaService);

    invoiceService.invoices = jest.fn().mockResolvedValue([invoice]);
    invoiceService.invoice = jest.fn().mockResolvedValue(invoice);

    prismaService.expanse.findFirst = jest.fn().mockResolvedValue([expanse]);
    prismaService.expanseOnInvoice.findMany = jest
      .fn()
      .mockResolvedValue([expanseOnInvoice]);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Find Expanses On Invoice', () => {
    it('should be able to find epanses on invoice', async () => {
      const response = await service.expansesOnInvoice();

      expect(response).toEqual([expanseOnInvoice]);
    });
    it('should be able to throw if there is an unexpected error ', async () => {
      prismaService.expanseOnInvoice.findMany = jest
        .fn()
        .mockRejectedValueOnce(new Error());
      const response = service.expansesOnInvoice();

      await expect(response).rejects.toThrow();
    });
  });

  describe('Create Expanses On Invoice', () => {
    it('should be able to create expanses on invoice', async () => {
      prismaService.expanseOnInvoice.create = jest
        .fn()
        .mockResolvedValueOnce(expanseOnInvoice);
      const response = await service.createExpanseOnInvoice(
        createExpanseOnInvoiceDTO,
        'any_id',
      );

      expect(response).toEqual(expanseOnInvoice);
    });

    it('should be able to throw if invoice is not found', async () => {
      invoiceService.invoices = jest.fn().mockResolvedValue([]);
      prismaService.expanseOnInvoice.create = jest
        .fn()
        .mockResolvedValueOnce(expanseOnInvoice);

      const response = service.createExpanseOnInvoice(
        createExpanseOnInvoiceDTO,
        'any_id',
      );

      await expect(response).rejects.toThrow();
    });

    it('should be able to throw if expanse is not found', async () => {
      prismaService.expanse.findFirst = jest.fn().mockResolvedValue(undefined);
      prismaService.expanseOnInvoice.create = jest
        .fn()
        .mockResolvedValueOnce(expanseOnInvoice);

      const response = service.createExpanseOnInvoice(
        createExpanseOnInvoiceDTO,
        'any_id',
      );

      await expect(response).rejects.toThrow();
    });

    it('should be able to throw if there is an unexpected error ', async () => {
      prismaService.expanseOnInvoice.create = jest
        .fn()
        .mockRejectedValueOnce(new Error());
      const response = service.createExpanseOnInvoice(
        createExpanseOnInvoiceDTO,
        'any_id',
      );

      await expect(response).rejects.toThrow();
    });
  });

  describe('Delete  Expanses On Invoice', () => {
    it('should be able to delete expanse on invoice', async () => {
      invoiceService.updateInvoice = jest.fn().mockResolvedValueOnce({
        ...invoice,
        value: invoice.value - expanse.value,
      });
      prismaService.expanseOnInvoice.delete = jest
        .fn()
        .mockResolvedValueOnce(expanseOnInvoice);
      const response = await service.deleteExpanseOnInvoice(where);

      expect(response).toEqual(expanseOnInvoice);
    });

    it('should be able to throw if expanse on invoice is not found', async () => {
      prismaService.expanseOnInvoice.findMany = jest
        .fn()
        .mockResolvedValueOnce([]);
      const response = service.deleteExpanseOnInvoice(where);

      await expect(response).rejects.toThrow();
    });

    it('should be able to throw if there is an unexpected error', async () => {
      prismaService.expanseOnInvoice.delete = jest
        .fn()
        .mockRejectedValueOnce(new Error());
      const response = service.deleteExpanseOnInvoice(where);

      await expect(response).rejects.toThrow();
    });
  });
});
