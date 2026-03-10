export interface Payment {
  id: number;
  invoiceId: number;
  invoiceNumber: string;
  customer: string;
  amount: number;
  paymentMode: 'Cash' | 'UPI' | 'Card' | 'Bank Transfer' | 'Cheque';
  date: string;
  reference: string;
  notes: string;
}
