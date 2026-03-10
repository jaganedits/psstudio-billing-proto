import { Injectable, signal, computed, inject } from '@angular/core';
import { Payment } from '../models/payment.model';
import { InvoiceService } from './invoice.service';

const MOCK_PAYMENTS: Payment[] = [
  {
    id: 1,
    invoiceId: 1,
    invoiceNumber: 'PS-001',
    customer: 'Rajesh Kumar',
    amount: 10000,
    paymentMode: 'UPI',
    date: 'March 1, 2026',
    reference: 'UPI-20260301-001',
    notes: 'Advance payment',
  },
  {
    id: 2,
    invoiceId: 1,
    invoiceNumber: 'PS-001',
    customer: 'Rajesh Kumar',
    amount: 7700,
    paymentMode: 'UPI',
    date: 'March 2, 2026',
    reference: 'UPI-20260302-002',
    notes: 'Final payment',
  },
  {
    id: 3,
    invoiceId: 2,
    invoiceNumber: 'PS-002',
    customer: 'Priya Sharma',
    amount: 7788,
    paymentMode: 'Cash',
    date: 'March 3, 2026',
    reference: 'CASH-20260303-001',
    notes: 'Full payment at studio',
  },
  {
    id: 4,
    invoiceId: 3,
    invoiceNumber: 'PS-003',
    customer: 'Suresh Babu',
    amount: 5000,
    paymentMode: 'Card',
    date: 'March 5, 2026',
    reference: 'CARD-20260305-001',
    notes: 'Partial payment via card',
  },
  {
    id: 5,
    invoiceId: 3,
    invoiceNumber: 'PS-003',
    customer: 'Suresh Babu',
    amount: 5000,
    paymentMode: 'Bank Transfer',
    date: 'March 6, 2026',
    reference: 'NEFT-20260306-001',
    notes: 'Second installment',
  },
  {
    id: 6,
    invoiceId: 6,
    invoiceNumber: 'PS-006',
    customer: 'Anitha Krishnan',
    amount: 2000,
    paymentMode: 'Cash',
    date: 'March 9, 2026',
    reference: 'CASH-20260309-001',
    notes: 'Partial payment',
  },
];

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly invoiceService = inject(InvoiceService);
  private readonly paymentsSignal = signal<Payment[]>(MOCK_PAYMENTS);

  readonly payments = this.paymentsSignal.asReadonly();

  readonly totalCollected = computed(() =>
    this.paymentsSignal().reduce((sum, p) => sum + p.amount, 0)
  );

  readonly thisMonthCollected = computed(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    return this.paymentsSignal()
      .filter((p) => {
        const d = new Date(p.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((sum, p) => sum + p.amount, 0);
  });

  readonly pendingBalance = computed(() => {
    return this.invoiceService
      .invoices()
      .filter((i) => i.status !== 'Cancelled')
      .reduce((sum, i) => sum + i.balance, 0);
  });

  readonly totalInvoices = computed(() =>
    this.invoiceService.invoices().filter((i) => i.status !== 'Cancelled').length
  );

  getPaymentsByInvoice(invoiceId: number): Payment[] {
    return this.paymentsSignal().filter((p) => p.invoiceId === invoiceId);
  }

  addPayment(payment: Omit<Payment, 'id'>): void {
    const newId = Math.max(...this.paymentsSignal().map((p) => p.id), 0) + 1;
    this.paymentsSignal.update((list) => [{ ...payment, id: newId }, ...list]);

    // Update the corresponding invoice
    const invoice = this.invoiceService
      .invoices()
      .find((i) => i.id === payment.invoiceId);
    if (invoice) {
      const newPaid = invoice.paid + payment.amount;
      const newBalance = invoice.total - newPaid;
      const newStatus: 'Paid' | 'Partial' | 'Unpaid' =
        newBalance <= 0 ? 'Paid' : newPaid > 0 ? 'Partial' : 'Unpaid';
      this.invoiceService.updateInvoice({
        ...invoice,
        paid: newPaid,
        balance: Math.max(0, newBalance),
        status: newStatus,
      });
    }
  }
}
