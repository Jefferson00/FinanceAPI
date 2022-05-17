export interface Transaction {
  id: string;
  title: string;
  value: number;
  paymentDate: Date;
  category: string;
  type: 'Expanse' | 'Income';
}
