import { BullModule, getQueueToken } from '@nestjs/bull';
import { Test } from '@nestjs/testing';
import { Account, Invoice, Prisma } from '@prisma/client';
import { PrismaService } from '../../providers/database/prisma/prisma.service';
import { InvoiceCreateDto } from './dtos/invoices-create.dto';
import { InvoiceUpdateDto } from './dtos/invoices-update.dto';
import { InvoiceService } from './invoices.service';

const createInvoiceDTO: InvoiceCreateDto = {
  accountId: 'any_id',
  closed: false,
  closingDate: new Date().toISOString(),
  creditCardId: 'any_id',
  paid: false,
  value: 0,
  month: new Date().toISOString(),
  paymentDate: new Date().toISOString(),
};

const updateInvoiceDTO: InvoiceUpdateDto = {
  closed: false,
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

const incomeWhereUniqueInput: Prisma.InvoiceWhereUniqueInput = {
  id: 'any_id',
};

const where: Prisma.InvoiceWhereUniqueInput = {
  id: 'any_id',
};

const exampleQueueMock = { add: jest.fn() };
describe('Invoice Service', () => {
  let service: InvoiceService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [
        BullModule.registerQueue({
          name: 'verify-invoices',
        }),
      ],
      providers: [InvoiceService, PrismaService],
    })
      .overrideProvider(getQueueToken('verify-invoices'))
      .useValue(exampleQueueMock)
      .compile();

    service = module.get<InvoiceService>(InvoiceService);
    prismaService = module.get<PrismaService>(PrismaService);
    // queue = module.get('verify-invoices');

    prismaService.invoice.findUnique = jest.fn().mockResolvedValue(invoice);
    prismaService.invoice.findMany = jest.fn().mockResolvedValue([invoice]);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Find Invoice', () => {
    it('should be able to find invoice with unique input', async () => {
      const response = await service.invoice(incomeWhereUniqueInput);

      expect(response).toEqual(invoice);
    });
    it('should be able to throw if there is an unexpected error ', async () => {
      prismaService.invoice.findUnique = jest
        .fn()
        .mockRejectedValueOnce(new Error());
      const response = service.invoice(incomeWhereUniqueInput);

      await expect(response).rejects.toThrow();
    });
  });

  describe('Find Many Invoices', () => {
    it('should be able to find many invoices', async () => {
      const response = await service.invoices();

      expect(response).toEqual([invoice]);
    });
    it('should be able to throw if there is an unexpected error ', async () => {
      prismaService.invoice.findMany = jest
        .fn()
        .mockRejectedValueOnce(new Error());
      const response = service.invoices();

      await expect(response).rejects.toThrow();
    });
  });

  describe('Create Invoice', () => {
    it('should be able to create invoice', async () => {
      prismaService.invoice.create = jest.fn().mockResolvedValueOnce(invoice);
      const response = await service.createInvoice(createInvoiceDTO);

      expect(response).toEqual(invoice);
    });

    it('should be able to throw if there is an unexpected error ', async () => {
      prismaService.invoice.create = jest
        .fn()
        .mockRejectedValueOnce(new Error());
      const response = service.createInvoice(createInvoiceDTO);
      await expect(response).rejects.toThrow();
    });
  });

  describe('Update Invoice', () => {
    it('should be able to update invoice', async () => {
      prismaService.invoice.update = jest.fn().mockResolvedValueOnce(invoice);

      const response = await service.updateInvoice({
        where,
        data: updateInvoiceDTO,
      });

      expect(response).toEqual(invoice);
    });

    it('should be able to update invoice paid status', async () => {
      const invoicePaid = {
        ...invoice,
        paid: true,
      };
      prismaService.invoice.update = jest
        .fn()
        .mockResolvedValueOnce(invoicePaid);
      prismaService.account.findFirst = jest
        .fn()
        .mockResolvedValueOnce(account);
      prismaService.account.update = jest.fn().mockResolvedValueOnce(account);

      const response = await service.updateInvoice({
        where,
        data: {
          paid: true,
        },
      });

      expect(response).toEqual(invoicePaid);
    });

    it('should be able to throw if invoice is not found', async () => {
      prismaService.invoice.findUnique = jest.fn().mockResolvedValue(null);

      const response = service.updateInvoice({
        where,
        data: updateInvoiceDTO,
      });

      await expect(response).rejects.toThrow();
    });

    it('should be able to throw if there is an unexpected error ', async () => {
      prismaService.invoice.update = jest
        .fn()
        .mockRejectedValueOnce(new Error());
      const response = service.updateInvoice({
        where,
        data: updateInvoiceDTO,
      });

      await expect(response).rejects.toThrow();
    });
  });

  describe('Delete Invoice', () => {
    it('should be able to delete invoice', async () => {
      prismaService.invoice.delete = jest.fn().mockResolvedValueOnce(invoice);
      const response = await service.deleteInvoice(where);

      expect(response).toEqual(invoice);
    });

    it('should be able to throw if invoice is not found', async () => {
      prismaService.invoice.findUnique = jest
        .fn()
        .mockResolvedValueOnce(undefined);
      const response = service.deleteInvoice({ id: 'any' });

      await expect(response).rejects.toThrow();
    });

    it('should be able to throw if there is an unexpected error', async () => {
      prismaService.invoice.delete = jest
        .fn()
        .mockRejectedValueOnce(new Error());
      const response = service.deleteInvoice(where);

      await expect(response).rejects.toThrow();
    });
  });

  describe('Verify Invoice', () => {
    it('should be able to verify invoice', async () => {
      await service.verifyInvoice();

      expect(exampleQueueMock.add).toBeCalledTimes(1);
    });

    it('should be able to throw if there is an unexpected error', async () => {
      prismaService.invoice.findMany = jest
        .fn()
        .mockRejectedValueOnce(new Error());
      const response = service.verifyInvoice();

      await expect(response).rejects.toThrow();
    });
  });
});
