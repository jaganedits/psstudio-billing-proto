import { Injectable, signal, computed, inject } from '@angular/core';
import { Booking } from '../models/booking.model';
import { InvoiceService } from './invoice.service';

const MOCK_BOOKINGS: Booking[] = [
  {
    id: 1,
    customer: 'Rajesh Kumar',
    eventType: 'Wedding',
    eventDate: 'March 25, 2026',
    location: 'Grand Palace Hall, Chennai',
    photographer: 'Arjun',
    package: 'Wedding Premium',
    packageId: 1,
    invoiceId: 1,
    totalAmount: 45000,
    advancePaid: 20000,
    balance: 25000,
    deliveryDate: 'April 10, 2026',
    notes: 'Full day coverage',
    status: 'Confirmed',
  },
  {
    id: 2,
    customer: 'Priya Sharma',
    eventType: 'Baby Shoot',
    eventDate: 'March 18, 2026',
    location: 'PS Studio, Anna Nagar',
    photographer: 'Kavitha',
    package: 'Baby Shoot Complete',
    packageId: 3,
    invoiceId: 2,
    totalAmount: 8000,
    advancePaid: 8000,
    balance: 0,
    deliveryDate: 'March 25, 2026',
    notes: '3 month old baby shoot',
    status: 'Completed',
  },
  {
    id: 3,
    customer: 'Suresh Babu',
    eventType: 'Birthday',
    eventDate: 'April 5, 2026',
    location: 'Hotel Taj, T. Nagar',
    photographer: 'Arjun',
    package: 'Birthday Special',
    packageId: 5,
    invoiceId: 3,
    totalAmount: 15000,
    advancePaid: 5000,
    balance: 10000,
    deliveryDate: 'April 20, 2026',
    notes: '1st birthday celebration',
    status: 'Confirmed',
  },
  {
    id: 4,
    customer: 'Meena Devi',
    eventType: 'Ear Piercing',
    eventDate: 'March 12, 2026',
    location: 'Sri Lakshmi Temple, Mylapore',
    photographer: 'Ravi',
    package: 'Event Basic',
    packageId: null,
    invoiceId: 4,
    totalAmount: 5000,
    advancePaid: 5000,
    balance: 0,
    deliveryDate: 'March 19, 2026',
    notes: 'Traditional ceremony coverage',
    status: 'Completed',
  },
  {
    id: 5,
    customer: 'Vikram Reddy',
    eventType: 'Pre-Wedding',
    eventDate: 'April 15, 2026',
    location: 'Marina Beach, Chennai',
    photographer: 'Arjun',
    package: 'Pre-Wedding Premium',
    packageId: null,
    invoiceId: 5,
    totalAmount: 25000,
    advancePaid: 10000,
    balance: 15000,
    deliveryDate: 'April 30, 2026',
    notes: 'Outdoor shoot at sunrise',
    status: 'Pending',
  },
  {
    id: 6,
    customer: 'Anitha Krishnan',
    eventType: 'Studio Shoot',
    eventDate: 'March 20, 2026',
    location: 'PS Studio, Anna Nagar',
    photographer: 'Kavitha',
    package: 'Studio Basic',
    packageId: null,
    invoiceId: 6,
    totalAmount: 3000,
    advancePaid: 1500,
    balance: 1500,
    deliveryDate: 'March 27, 2026',
    notes: 'Family portrait session',
    status: 'Pending',
  },
  {
    id: 7,
    customer: 'Deepak Murugan',
    eventType: 'Wedding',
    eventDate: 'February 28, 2026',
    location: 'Kalyana Mandapam, Tambaram',
    photographer: 'Ravi',
    package: 'Wedding Basic',
    packageId: 2,
    invoiceId: 7,
    totalAmount: 30000,
    advancePaid: 30000,
    balance: 0,
    deliveryDate: 'March 15, 2026',
    notes: 'Half day coverage with album',
    status: 'Completed',
  },
  {
    id: 8,
    customer: 'Lakshmi Narayanan',
    eventType: 'Engagement',
    eventDate: 'April 22, 2026',
    location: 'Radisson Blu, OMR',
    photographer: 'Arjun',
    package: 'Engagement Deluxe',
    packageId: null,
    invoiceId: 8,
    totalAmount: 20000,
    advancePaid: 0,
    balance: 20000,
    deliveryDate: 'May 5, 2026',
    notes: 'Ring ceremony and reception',
    status: 'Cancelled',
  },
];

@Injectable({ providedIn: 'root' })
export class BookingService {
  private readonly invoiceService = inject(InvoiceService);
  private readonly bookingsSignal = signal<Booking[]>(MOCK_BOOKINGS);

  readonly bookings = this.bookingsSignal.asReadonly();
  readonly totalCount = computed(() => this.bookingsSignal().length);

  addBooking(booking: Omit<Booking, 'id'>): void {
    const newId = Math.max(...this.bookingsSignal().map((b) => b.id), 0) + 1;
    this.bookingsSignal.update((list) => [{ ...booking, id: newId }, ...list]);
  }

  updateBooking(updated: Booking): void {
    this.bookingsSignal.update((list) =>
      list.map((b) => (b.id === updated.id ? { ...updated } : b))
    );
  }

  deleteBooking(id: number): void {
    this.bookingsSignal.update((list) =>
      list.map((b) => (b.id === id ? { ...b, status: 'Cancelled' as const } : b))
    );
  }

  createInvoiceFromBooking(booking: Booking, phone: string): void {
    const gstPercent = 18;
    const subtotal = booking.totalAmount;
    const discount = 0;
    const gst = Math.round(((subtotal - discount) * gstPercent) / 100);
    const total = subtotal - discount + gst;
    const paid = booking.advancePaid;
    const balance = total - paid;

    let status: 'Paid' | 'Partial' | 'Unpaid';
    if (balance <= 0) status = 'Paid';
    else if (paid > 0) status = 'Partial';
    else status = 'Unpaid';

    const invoiceId = this.invoiceService.addInvoice({
      invoiceNumber: this.invoiceService.nextInvoiceNumber(),
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      customer: booking.customer,
      phone,
      bookingId: booking.id,
      items: [{ name: `${booking.eventType} - ${booking.package || 'Custom'}`, quantity: 1, price: subtotal, total: subtotal }],
      subtotal,
      discount,
      gstPercent,
      gst,
      total,
      paid,
      balance: Math.max(0, balance),
      paymentMode: 'Cash',
      status,
      deliveryStatus: 'Pending',
    });

    this.bookingsSignal.update((list) =>
      list.map((b) => (b.id === booking.id ? { ...b, invoiceId } : b))
    );
  }
}
