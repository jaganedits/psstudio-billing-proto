import { Injectable, inject, signal, computed } from '@angular/core';
import { Quotation } from '../models/quotation.model';
import { InvoiceService } from './invoice.service';

const MOCK_QUOTATIONS: Quotation[] = [
  {
    id: 1, quotationNumber: 'QT-001', date: 'February 20, 2026', validUntil: 'March 20, 2026',
    customer: 'Priya Sharma', phone: '9876543210', email: 'priya.sharma@example.com',
    items: [
      { name: 'Wedding Photography', quantity: 1, price: 25000, total: 25000 },
      { name: 'Photo Album Premium', quantity: 1, price: 12000, total: 12000 },
      { name: 'Photo Print 4x6', quantity: 100, price: 10, total: 1000 },
    ],
    subtotal: 38000, discount: 2000, gst: 6480, total: 42480,
    notes: 'Full day coverage with drone shots included', status: 'Sent',
  },
  {
    id: 2, quotationNumber: 'QT-002', date: 'February 25, 2026', validUntil: 'March 25, 2026',
    customer: 'Vikram Patel', phone: '9876543213', email: 'vikram.patel@example.com',
    items: [
      { name: 'Pre-Wedding Shoot', quantity: 1, price: 20000, total: 20000 },
      { name: 'Wedding Photography', quantity: 1, price: 25000, total: 25000 },
    ],
    subtotal: 45000, discount: 5000, gst: 7200, total: 47200,
    notes: 'Two-day event. Venue: Bangalore Palace', status: 'Accepted',
  },
  {
    id: 3, quotationNumber: 'QT-003', date: 'March 1, 2026', validUntil: 'March 31, 2026',
    customer: 'Deepa Iyer', phone: '9876543216', email: 'deepa.iyer@example.com',
    items: [
      { name: 'Baby Shoot', quantity: 1, price: 5000, total: 5000 },
      { name: 'Photo Frame 8x12', quantity: 3, price: 850, total: 2550 },
    ],
    subtotal: 7550, discount: 0, gst: 1359, total: 8909,
    notes: '', status: 'Draft',
  },
  {
    id: 4, quotationNumber: 'QT-004', date: 'January 15, 2026', validUntil: 'February 15, 2026',
    customer: 'Arjun Nair', phone: '9876543215', email: 'arjun.nair@example.com',
    items: [
      { name: 'Family Portrait', quantity: 1, price: 3000, total: 3000 },
      { name: 'Photo Print 8x12', quantity: 10, price: 50, total: 500 },
    ],
    subtotal: 3500, discount: 0, gst: 630, total: 4130,
    notes: 'Annual family photo session', status: 'Expired',
  },
  {
    id: 5, quotationNumber: 'QT-005', date: 'March 5, 2026', validUntil: 'April 5, 2026',
    customer: 'Lakshmi Venkat', phone: '9876543218', email: 'lakshmi.venkat@example.com',
    items: [
      { name: 'Wedding Photography Full Day', quantity: 1, price: 35000, total: 35000 },
      { name: 'Wedding Album Deluxe', quantity: 1, price: 18000, total: 18000 },
      { name: 'Photo Frame 12x18', quantity: 5, price: 1500, total: 7500 },
      { name: 'Photo Print 4x6', quantity: 200, price: 10, total: 2000 },
    ],
    subtotal: 62500, discount: 5000, gst: 10350, total: 67850,
    notes: 'Premium package with videography add-on to be discussed', status: 'Sent',
  },
  {
    id: 6, quotationNumber: 'QT-006', date: 'February 10, 2026', validUntil: 'March 10, 2026',
    customer: 'Karthik Menon', phone: '9876543217', email: 'karthik.menon@example.com',
    items: [
      { name: 'Product Photography', quantity: 50, price: 200, total: 10000 },
    ],
    subtotal: 10000, discount: 1000, gst: 1620, total: 10620,
    notes: 'E-commerce product shoots - 50 items', status: 'Converted',
  },
  {
    id: 7, quotationNumber: 'QT-007', date: 'March 8, 2026', validUntil: 'April 8, 2026',
    customer: 'Divya Krishnan', phone: '9876543220', email: 'divya.krishnan@example.com',
    items: [
      { name: 'Engagement Photography', quantity: 1, price: 18000, total: 18000 },
      { name: 'Photo Album Standard', quantity: 1, price: 5000, total: 5000 },
    ],
    subtotal: 23000, discount: 0, gst: 4140, total: 27140,
    notes: 'Engagement ceremony at resort', status: 'Draft',
  },
];

@Injectable({ providedIn: 'root' })
export class QuotationService {
  private readonly invoiceService = inject(InvoiceService);
  private readonly quotationsSignal = signal<Quotation[]>(MOCK_QUOTATIONS);

  readonly quotations = this.quotationsSignal.asReadonly();
  readonly totalCount = computed(() => this.quotationsSignal().length);

  readonly nextQuotationNumber = computed(() => {
    const all = this.quotationsSignal();
    const maxNum = all.reduce((max, q) => {
      const num = parseInt(q.quotationNumber.replace('QT-', ''), 10);
      return num > max ? num : max;
    }, 0);
    return `QT-${String(maxNum + 1).padStart(3, '0')}`;
  });

  addQuotation(quotation: Omit<Quotation, 'id'>): void {
    const newId = Math.max(...this.quotationsSignal().map((q) => q.id), 0) + 1;
    this.quotationsSignal.update((list) => [{ ...quotation, id: newId }, ...list]);
  }

  updateQuotation(updated: Quotation): void {
    this.quotationsSignal.update((list) =>
      list.map((q) => (q.id === updated.id ? { ...updated } : q))
    );
  }

  updateStatus(id: number, status: Quotation['status']): void {
    this.quotationsSignal.update((list) =>
      list.map((q) => (q.id === id ? { ...q, status } : q))
    );
  }

  convertToInvoice(quotation: Quotation): void {
    this.invoiceService.addInvoice({
      invoiceNumber: this.invoiceService.nextInvoiceNumber(),
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      customer: quotation.customer,
      phone: quotation.phone,
      items: quotation.items.map((item) => ({ ...item })),
      subtotal: quotation.subtotal,
      discount: quotation.discount,
      gst: quotation.gst,
      total: quotation.total,
      paid: 0,
      balance: quotation.total,
      paymentMode: 'Cash',
      status: 'Unpaid',
      deliveryStatus: 'Pending',
    });
    this.updateStatus(quotation.id, 'Converted');
  }

  deleteQuotation(id: number): void {
    this.quotationsSignal.update((list) => list.filter((q) => q.id !== id));
  }
}
