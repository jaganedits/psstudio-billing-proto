import { Injectable, signal, computed } from '@angular/core';
import { EmailTemplate } from '../models/email-template.model';

const MOCK_TEMPLATES: EmailTemplate[] = [
  { id: 1, name: 'Invoice Email', subject: 'Invoice {{invoiceNumber}} from PS Creative', body: '<p>Dear {{customerName}},</p><p>Please find attached your invoice {{invoiceNumber}} dated {{invoiceDate}} for a total of Rs. {{totalAmount}}.</p><p>Thank you for choosing PS Creative.</p>', variables: ['{{customerName}}', '{{invoiceNumber}}', '{{invoiceDate}}', '{{totalAmount}}'], status: 'Active' },
  { id: 2, name: 'Quotation Email', subject: 'Quotation {{quotationNumber}} from PS Creative', body: '<p>Dear {{customerName}},</p><p>Thank you for your interest. Please find attached quotation {{quotationNumber}} valid until {{validUntil}}.</p><p>Total: Rs. {{totalAmount}}</p>', variables: ['{{customerName}}', '{{quotationNumber}}', '{{validUntil}}', '{{totalAmount}}'], status: 'Active' },
  { id: 3, name: 'Booking Confirmation', subject: 'Booking Confirmation - {{eventType}}', body: '<p>Dear {{customerName}},</p><p>Your booking for {{eventType}} on {{eventDate}} at {{venue}} has been confirmed.</p><p>Assigned Photographer: {{photographer}}</p>', variables: ['{{customerName}}', '{{eventType}}', '{{eventDate}}', '{{venue}}', '{{photographer}}'], status: 'Active' },
  { id: 4, name: 'Payment Receipt', subject: 'Payment Receipt - Rs. {{amount}}', body: '<p>Dear {{customerName}},</p><p>We have received your payment of Rs. {{amount}} via {{paymentMode}} for invoice {{invoiceNumber}}.</p><p>Balance remaining: Rs. {{balance}}</p>', variables: ['{{customerName}}', '{{amount}}', '{{paymentMode}}', '{{invoiceNumber}}', '{{balance}}'], status: 'Active' },
  { id: 5, name: 'Delivery Notification', subject: 'Your Photos are Ready for Delivery', body: '<p>Dear {{customerName}},</p><p>Your photos from {{eventType}} are ready! {{deliveryMethod}}</p><p>Please contact us to arrange pickup or delivery.</p>', variables: ['{{customerName}}', '{{eventType}}', '{{deliveryMethod}}'], status: 'Active' },
  { id: 6, name: 'Payment Reminder', subject: 'Payment Reminder - Invoice {{invoiceNumber}}', body: '<p>Dear {{customerName}},</p><p>This is a friendly reminder that invoice {{invoiceNumber}} has an outstanding balance of Rs. {{balance}}.</p><p>Please make the payment at your earliest convenience.</p>', variables: ['{{customerName}}', '{{invoiceNumber}}', '{{balance}}'], status: 'Active' },
  { id: 7, name: 'Welcome Email', subject: 'Welcome to PS Creative!', body: '<p>Dear {{customerName}},</p><p>Welcome to PS Creative! We are delighted to have you.</p><p>Feel free to reach out for any photography needs.</p>', variables: ['{{customerName}}'], status: 'Inactive' },
];

@Injectable({ providedIn: 'root' })
export class EmailTemplateService {
  private readonly templatesSignal = signal<EmailTemplate[]>(MOCK_TEMPLATES);

  readonly templates = this.templatesSignal.asReadonly();
  readonly totalCount = computed(() => this.templatesSignal().length);

  addTemplate(template: Omit<EmailTemplate, 'id'>): void {
    const newId = Math.max(...this.templatesSignal().map((t) => t.id), 0) + 1;
    this.templatesSignal.update((list) => [{ ...template, id: newId }, ...list]);
  }

  updateTemplate(updated: EmailTemplate): void {
    this.templatesSignal.update((list) =>
      list.map((t) => (t.id === updated.id ? { ...updated } : t))
    );
  }

  deleteTemplate(id: number): void {
    this.templatesSignal.update((list) =>
      list.map((t) => (t.id === id ? { ...t, status: 'Inactive' as const } : t))
    );
  }
}
