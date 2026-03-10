import { Injectable, signal, computed } from '@angular/core';
import { EmailLog } from '../models/email-log.model';

const MOCK_EMAIL_LOGS: EmailLog[] = [
  { id: 1, to: 'priya.sharma@example.com', subject: 'Quotation QT-001 from PS Creative', template: 'Quotation', status: 'Sent', sentAt: 'March 10, 2026 09:35 AM', error: '' },
  { id: 2, to: 'vikram.patel@example.com', subject: 'Booking Confirmation - Wedding Photography', template: 'Booking Confirmation', status: 'Sent', sentAt: 'March 9, 2026 04:15 PM', error: '' },
  { id: 3, to: 'rajesh.kumar@example.com', subject: 'Invoice PS-001 from PS Creative', template: 'Invoice', status: 'Sent', sentAt: 'March 9, 2026 02:00 PM', error: '' },
  { id: 4, to: 'deepa.iyer@example.com', subject: 'Payment Receipt - Rs. 7,788', template: 'Payment Receipt', status: 'Failed', sentAt: 'March 9, 2026 11:30 AM', error: 'SMTP connection timeout' },
  { id: 5, to: 'suresh.babu@example.com', subject: 'Your Photos are Ready for Delivery', template: 'Delivery Notification', status: 'Sent', sentAt: 'March 8, 2026 05:00 PM', error: '' },
  { id: 6, to: 'anitha.krishnan@example.com', subject: 'Invoice PS-006 from PS Creative', template: 'Invoice', status: 'Sent', sentAt: 'March 8, 2026 03:00 PM', error: '' },
  { id: 7, to: 'lakshmi.venkat@example.com', subject: 'Quotation QT-005 from PS Creative', template: 'Quotation', status: 'Pending', sentAt: 'March 8, 2026 01:00 PM', error: '' },
  { id: 8, to: 'karthik.menon@example.com', subject: 'Payment Reminder - Invoice PS-008', template: 'Payment Reminder', status: 'Sent', sentAt: 'March 7, 2026 10:00 AM', error: '' },
  { id: 9, to: 'divya.krishnan@example.com', subject: 'Booking Confirmation - Engagement Photography', template: 'Booking Confirmation', status: 'Sent', sentAt: 'March 6, 2026 09:00 AM', error: '' },
  { id: 10, to: 'arjun.nair@example.com', subject: 'Your Photos are Ready for Delivery', template: 'Delivery Notification', status: 'Failed', sentAt: 'March 5, 2026 04:00 PM', error: 'Invalid email address' },
];

@Injectable({ providedIn: 'root' })
export class EmailLogService {
  private readonly logsSignal = signal<EmailLog[]>(MOCK_EMAIL_LOGS);

  readonly logs = this.logsSignal.asReadonly();
  readonly totalCount = computed(() => this.logsSignal().length);
}
