import { Injectable, signal, computed } from '@angular/core';
import { Invoice } from '../models/invoice.model';

const MOCK_INVOICES: Invoice[] = [
  {
    id: 1,
    invoiceNumber: 'PS-001',
    date: 'March 1, 2026',
    customer: 'Rajesh Kumar',
    phone: '9876543210',
    items: [
      { name: 'Wedding Photography', quantity: 1, price: 15000, total: 15000 },
      { name: 'Photo Print 4x6', quantity: 50, price: 10, total: 500 },
    ],
    subtotal: 15500,
    discount: 500,
    gst: 2700,
    total: 17700,
    paid: 17700,
    balance: 0,
    paymentMode: 'UPI',
    status: 'Paid',
    deliveryStatus: 'Pending',
  },
  {
    id: 2,
    invoiceNumber: 'PS-002',
    date: 'March 3, 2026',
    customer: 'Priya Sharma',
    phone: '9876543211',
    items: [
      { name: 'Baby Shoot', quantity: 1, price: 5000, total: 5000 },
      { name: 'Photo Frame 8x12', quantity: 2, price: 800, total: 1600 },
    ],
    subtotal: 6600,
    discount: 0,
    gst: 1188,
    total: 7788,
    paid: 7788,
    balance: 0,
    paymentMode: 'Cash',
    status: 'Paid',
    deliveryStatus: 'Delivered',
  },
  {
    id: 3,
    invoiceNumber: 'PS-003',
    date: 'March 5, 2026',
    customer: 'Suresh Babu',
    phone: '9876543212',
    items: [
      { name: 'Birthday Photography', quantity: 1, price: 12000, total: 12000 },
      { name: 'Photo Album Premium', quantity: 1, price: 3000, total: 3000 },
      { name: 'Photo Print 5x7', quantity: 30, price: 20, total: 600 },
    ],
    subtotal: 15600,
    discount: 600,
    gst: 2700,
    total: 17700,
    paid: 10000,
    balance: 7700,
    paymentMode: 'Card',
    status: 'Partial',
    deliveryStatus: 'Pending',
  },
  {
    id: 4,
    invoiceNumber: 'PS-004',
    date: 'March 7, 2026',
    customer: 'Meena Devi',
    phone: '9876543213',
    items: [
      { name: 'Ear Piercing Photography', quantity: 1, price: 3000, total: 3000 },
    ],
    subtotal: 3000,
    discount: 0,
    gst: 540,
    total: 3540,
    paid: 3540,
    balance: 0,
    paymentMode: 'UPI',
    status: 'Paid',
    deliveryStatus: 'Ready',
  },
  {
    id: 5,
    invoiceNumber: 'PS-005',
    date: 'March 8, 2026',
    customer: 'Vikram Reddy',
    phone: '9876543214',
    items: [
      { name: 'Pre-Wedding Shoot', quantity: 1, price: 20000, total: 20000 },
      { name: 'Photo Print 8x12', quantity: 20, price: 50, total: 1000 },
    ],
    subtotal: 21000,
    discount: 1000,
    gst: 3600,
    total: 23600,
    paid: 0,
    balance: 23600,
    paymentMode: 'Bank Transfer',
    status: 'Unpaid',
    deliveryStatus: 'Pending',
  },
  {
    id: 6,
    invoiceNumber: 'PS-006',
    date: 'March 9, 2026',
    customer: 'Anitha Krishnan',
    phone: '9876543215',
    items: [
      { name: 'Studio Portrait', quantity: 1, price: 2000, total: 2000 },
      { name: 'Photo Frame 6x8', quantity: 3, price: 500, total: 1500 },
    ],
    subtotal: 3500,
    discount: 200,
    gst: 594,
    total: 3894,
    paid: 2000,
    balance: 1894,
    paymentMode: 'Cash',
    status: 'Partial',
    deliveryStatus: 'Pending',
  },
  {
    id: 7,
    invoiceNumber: 'PS-007',
    date: 'March 10, 2026',
    customer: 'Deepak Murugan',
    phone: '9876543216',
    items: [
      { name: 'Wedding Photography Full Day', quantity: 1, price: 25000, total: 25000 },
      { name: 'Wedding Album Deluxe', quantity: 1, price: 5000, total: 5000 },
      { name: 'Photo Print 4x6', quantity: 100, price: 10, total: 1000 },
    ],
    subtotal: 31000,
    discount: 1000,
    gst: 5400,
    total: 35400,
    paid: 0,
    balance: 35400,
    paymentMode: 'Bank Transfer',
    status: 'Unpaid',
    deliveryStatus: 'Pending',
  },
  {
    id: 8,
    invoiceNumber: 'PS-008',
    date: 'February 28, 2026',
    customer: 'Lakshmi Narayanan',
    phone: '9876543217',
    items: [
      { name: 'Engagement Photography', quantity: 1, price: 18000, total: 18000 },
      { name: 'Photo Album Standard', quantity: 1, price: 2500, total: 2500 },
    ],
    subtotal: 20500,
    discount: 500,
    gst: 3600,
    total: 23600,
    paid: 0,
    balance: 23600,
    paymentMode: 'UPI',
    status: 'Cancelled',
    deliveryStatus: 'Pending',
  },
];

@Injectable({ providedIn: 'root' })
export class InvoiceService {
  private readonly invoicesSignal = signal<Invoice[]>(MOCK_INVOICES);

  readonly invoices = this.invoicesSignal.asReadonly();
  readonly totalCount = computed(() => this.invoicesSignal().length);

  readonly nextInvoiceNumber = computed(() => {
    const all = this.invoicesSignal();
    const maxNum = all.reduce((max, inv) => {
      const num = parseInt(inv.invoiceNumber.replace('PS-', ''), 10);
      return num > max ? num : max;
    }, 0);
    return `PS-${String(maxNum + 1).padStart(3, '0')}`;
  });

  addInvoice(invoice: Omit<Invoice, 'id'>): void {
    const newId = Math.max(...this.invoicesSignal().map((i) => i.id), 0) + 1;
    this.invoicesSignal.update((list) => [{ ...invoice, id: newId }, ...list]);
  }

  updateInvoice(updated: Invoice): void {
    this.invoicesSignal.update((list) =>
      list.map((i) => (i.id === updated.id ? { ...updated } : i))
    );
  }

  updateDeliveryStatus(id: number, status: Invoice['deliveryStatus']): void {
    this.invoicesSignal.update((list) =>
      list.map((i) => (i.id === id ? { ...i, deliveryStatus: status } : i))
    );
  }
}
