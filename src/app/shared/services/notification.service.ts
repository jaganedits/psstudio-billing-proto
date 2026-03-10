import { Injectable, signal, computed } from '@angular/core';
import { AppNotification } from '../models/notification.model';

const MOCK_NOTIFICATIONS: AppNotification[] = [
  { id: 1, title: 'New Booking Received', message: 'Priya Sharma booked Wedding Photography for March 25', type: 'info', module: 'Bookings', read: false, timestamp: 'March 10, 2026 09:30 AM', link: '/bookings' },
  { id: 2, title: 'Payment Received', message: 'Rs. 17,700 received from Rajesh Kumar for PS-001', type: 'success', module: 'Payments', read: false, timestamp: 'March 10, 2026 08:15 AM', link: '/payments' },
  { id: 3, title: 'Invoice Overdue', message: 'Invoice PS-005 for Vikram Reddy is overdue by 2 days', type: 'warning', module: 'Invoices', read: false, timestamp: 'March 10, 2026 07:00 AM', link: '/invoices' },
  { id: 4, title: 'Low Stock Alert', message: 'Premium Wood Frame (12x36) stock is critically low (1 remaining)', type: 'error', module: 'Frames', read: false, timestamp: 'March 9, 2026 05:00 PM', link: '/frames' },
  { id: 5, title: 'Album Design Approved', message: 'Vikram Reddy approved the pre-wedding magazine album design', type: 'success', module: 'Album Orders', read: true, timestamp: 'March 9, 2026 03:30 PM', link: '/album-orders' },
  { id: 6, title: 'Quotation Sent', message: 'Quotation QT-005 sent to Lakshmi Venkat via email', type: 'info', module: 'Quotations', read: true, timestamp: 'March 9, 2026 02:00 PM', link: '/quotations' },
  { id: 7, title: 'Frame Order Ready', message: 'Large Canvas Frame for Deepak Murugan is ready for pickup', type: 'success', module: 'Frame Orders', read: true, timestamp: 'March 9, 2026 11:00 AM', link: '/frame-orders' },
  { id: 8, title: 'Booking Cancelled', message: 'Lakshmi Narayanan cancelled engagement photography booking', type: 'error', module: 'Bookings', read: true, timestamp: 'March 8, 2026 04:00 PM', link: '/bookings' },
  { id: 9, title: 'New Customer Added', message: 'Ganesh Raman was added as a new customer', type: 'info', module: 'Customers', read: true, timestamp: 'March 8, 2026 10:00 AM', link: '/customers' },
  { id: 10, title: 'Expense Recorded', message: 'Equipment maintenance expense of Rs. 5,000 recorded', type: 'info', module: 'Expenses', read: true, timestamp: 'March 7, 2026 06:00 PM', link: '/expenses' },
];

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly notificationsSignal = signal<AppNotification[]>(MOCK_NOTIFICATIONS);

  readonly notifications = this.notificationsSignal.asReadonly();

  readonly unreadCount = computed(() =>
    this.notificationsSignal().filter((n) => !n.read).length
  );

  markAsRead(id: number): void {
    this.notificationsSignal.update((list) =>
      list.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }

  markAllAsRead(): void {
    this.notificationsSignal.update((list) =>
      list.map((n) => ({ ...n, read: true }))
    );
  }

  addNotification(notification: Omit<AppNotification, 'id'>): void {
    const newId = Math.max(...this.notificationsSignal().map((n) => n.id), 0) + 1;
    this.notificationsSignal.update((list) => [{ ...notification, id: newId }, ...list]);
  }
}
