import { Component, ChangeDetectionStrategy, inject, signal, computed, viewChild } from '@angular/core';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { Menu, MenuModule } from 'primeng/menu';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { DecimalPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ConfirmationService, MenuItem } from 'primeng/api';

import { Invoice } from '../../../shared/models/invoice.model';
import { Payment } from '../../../shared/models/payment.model';
import { InvoiceService } from '../../../shared/services/invoice.service';
import { PaymentService } from '../../../shared/services/payment.service';
import { PaymentForm } from '../../payments/payment-form/payment-form';

interface TabItem {
  label: string;
  value: string;
}

@Component({
  selector: 'app-invoice-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TableModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    MenuModule,
    IconFieldModule,
    InputIconModule,
    ConfirmDialogModule,
    TooltipModule,
    DecimalPipe,
    RouterLink,
    PaymentForm,
  ],
  providers: [ConfirmationService],
  templateUrl: './invoice-list.html',
  styleUrl: './invoice-list.scss',
})
export class InvoiceList {
  private readonly invoiceService = inject(InvoiceService);
  private readonly paymentService = inject(PaymentService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly router = inject(Router);

  readonly showPaymentForm = signal(false);
  readonly paymentInvoice = signal<Invoice | null>(null);

  readonly allInvoices = this.invoiceService.invoices;
  readonly totalCount = this.invoiceService.totalCount;

  readonly activeTab = signal<string>('all');

  readonly tabs: TabItem[] = [
    { label: 'All Invoices', value: 'all' },
    { label: 'Paid', value: 'Paid' },
    { label: 'Partial', value: 'Partial' },
    { label: 'Unpaid', value: 'Unpaid' },
    { label: 'Cancelled', value: 'Cancelled' },
  ];

  readonly filteredInvoices = computed(() => {
    const tab = this.activeTab();
    const all = this.allInvoices();
    if (tab === 'all') return all;
    return all.filter((i) => i.status === tab);
  });

  readonly tabCounts = computed(() => {
    const all = this.allInvoices();
    return {
      all: all.length,
      Paid: all.filter((i) => i.status === 'Paid').length,
      Partial: all.filter((i) => i.status === 'Partial').length,
      Unpaid: all.filter((i) => i.status === 'Unpaid').length,
      Cancelled: all.filter((i) => i.status === 'Cancelled').length,
    } as Record<string, number>;
  });

  readonly selectedInvoice = signal<Invoice | null>(null);

  readonly actionMenu = viewChild<Menu>('actionMenu');
  readonly menuItems = signal<MenuItem[]>([]);

  getDeliverySeverity(status: string): 'success' | 'danger' | 'warn' | 'info' {
    switch (status) {
      case 'Delivered':
        return 'success';
      case 'Ready':
        return 'warn';
      case 'Pending':
        return 'danger';
      default:
        return 'info';
    }
  }

  getStatusSeverity(status: string): 'success' | 'danger' | 'warn' | 'info' {
    switch (status) {
      case 'Paid':
        return 'success';
      case 'Partial':
        return 'warn';
      case 'Unpaid':
        return 'danger';
      case 'Cancelled':
        return 'info';
      default:
        return 'info';
    }
  }

  private readonly avatarColors = [
    '#4945ff', '#328048', '#d9822f', '#7b79ff', '#0c75af',
    '#8e4fd0', '#d02b20', '#0c7547', '#ba5612', '#3d39e6',
  ];

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  getAvatarColor(name: string): string {
    let hash = 0;
    for (const ch of name) {
      hash = ch.charCodeAt(0) + ((hash << 5) - hash);
    }
    return this.avatarColors[Math.abs(hash) % this.avatarColors.length];
  }

  setTab(value: string): void {
    this.activeTab.set(value);
  }

  onFilter(table: Table, event: Event): void {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  openAddForm(): void {
    this.router.navigate(['/invoices/add']);
  }

  openEditForm(invoice: Invoice): void {
    this.router.navigate(['/invoices/edit', invoice.id]);
  }

  showActionMenu(event: Event, invoice: Invoice): void {
    this.selectedInvoice.set(invoice);
    const items: MenuItem[] = [
      {
        label: 'View',
        icon: 'pi pi-eye',
        command: () => this.router.navigate(['/invoices', invoice.id]),
      },
      {
        label: 'Edit',
        icon: 'pi pi-pencil',
        command: () => this.openEditForm(invoice),
      },
      {
        label: 'Print Invoice',
        icon: 'pi pi-print',
        command: () => this.printInvoice(invoice),
      },
    ];
    if (invoice.status === 'Unpaid' || invoice.status === 'Partial') {
      items.splice(2, 0, {
        label: 'Collect Payment',
        icon: 'pi pi-indian-rupee',
        command: () => this.openPaymentForm(invoice),
      });
    }
    if (invoice.status !== 'Cancelled') {
      if (invoice.deliveryStatus !== 'Pending') {
        items.push({
          label: 'Mark Delivery Pending',
          icon: 'pi pi-clock',
          command: () => this.invoiceService.updateDeliveryStatus(invoice.id, 'Pending'),
        });
      }
      if (invoice.deliveryStatus !== 'Ready') {
        items.push({
          label: 'Mark Ready for Delivery',
          icon: 'pi pi-check-circle',
          command: () => this.invoiceService.updateDeliveryStatus(invoice.id, 'Ready'),
        });
      }
      if (invoice.deliveryStatus !== 'Delivered') {
        items.push({
          label: 'Mark as Delivered',
          icon: 'pi pi-truck',
          command: () => this.invoiceService.updateDeliveryStatus(invoice.id, 'Delivered'),
        });
      }
    }
    if (invoice.status !== 'Cancelled') {
      items.push({ separator: true });
      items.push({
        label: 'Cancel Invoice',
        icon: 'pi pi-times-circle',
        command: () => this.confirmCancelInvoice(invoice),
      });
    }
    this.menuItems.set(items);
    this.actionMenu()?.toggle(event);
  }

  private confirmCancelInvoice(invoice: Invoice): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to cancel invoice ${invoice.invoiceNumber}?`,
      header: 'Cancel Invoice',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.invoiceService.deleteInvoice(invoice.id),
    });
  }

  openPaymentForm(invoice: Invoice): void {
    this.paymentInvoice.set(invoice);
    this.showPaymentForm.set(true);
  }

  onPaymentSave(payment: Omit<Payment, 'id'>): void {
    this.paymentService.addPayment(payment);
    this.showPaymentForm.set(false);
    this.paymentInvoice.set(null);
  }

  onPaymentCancel(): void {
    this.showPaymentForm.set(false);
    this.paymentInvoice.set(null);
  }

  private printInvoice(_invoice: Invoice): void {
    // Print functionality placeholder
    window.print();
  }
}
