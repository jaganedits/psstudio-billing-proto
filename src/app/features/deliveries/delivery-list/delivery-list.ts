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
import { RouterLink } from '@angular/router';
import { ConfirmationService, MenuItem } from 'primeng/api';

import { Invoice } from '../../../shared/models/invoice.model';
import { InvoiceService } from '../../../shared/services/invoice.service';

interface TabItem {
  label: string;
  value: string;
}

@Component({
  selector: 'app-delivery-list',
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
  ],
  providers: [ConfirmationService],
  templateUrl: './delivery-list.html',
  styleUrl: './delivery-list.scss',
})
export class DeliveryList {
  private readonly invoiceService = inject(InvoiceService);
  private readonly confirmationService = inject(ConfirmationService);

  readonly activeTab = signal<string>('all');

  readonly tabs: TabItem[] = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: 'Pending' },
    { label: 'Ready', value: 'Ready' },
    { label: 'Delivered', value: 'Delivered' },
  ];

  // Only show paid/partial invoices (not cancelled/unpaid with 0 paid)
  readonly deliveryInvoices = computed(() => {
    return this.invoiceService.invoices().filter(
      (i) => i.status !== 'Cancelled' && (i.status === 'Paid' || i.status === 'Partial')
    );
  });

  readonly filteredInvoices = computed(() => {
    const tab = this.activeTab();
    const all = this.deliveryInvoices();
    if (tab === 'all') return all;
    return all.filter((i) => i.deliveryStatus === tab);
  });

  readonly tabCounts = computed(() => {
    const all = this.deliveryInvoices();
    return {
      all: all.length,
      Pending: all.filter((i) => i.deliveryStatus === 'Pending').length,
      Ready: all.filter((i) => i.deliveryStatus === 'Ready').length,
      Delivered: all.filter((i) => i.deliveryStatus === 'Delivered').length,
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

  getPaymentSeverity(status: string): 'success' | 'danger' | 'warn' | 'info' {
    switch (status) {
      case 'Paid':
        return 'success';
      case 'Partial':
        return 'warn';
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

  showActionMenu(event: Event, invoice: Invoice): void {
    this.selectedInvoice.set(invoice);
    const items: MenuItem[] = [];

    if (invoice.deliveryStatus !== 'Pending') {
      items.push({
        label: 'Mark as Pending',
        icon: 'pi pi-clock',
        command: () => this.updateStatus(invoice, 'Pending'),
      });
    }
    if (invoice.deliveryStatus !== 'Ready') {
      items.push({
        label: 'Mark as Ready',
        icon: 'pi pi-check-circle',
        command: () => this.updateStatus(invoice, 'Ready'),
      });
    }
    if (invoice.deliveryStatus !== 'Delivered') {
      items.push({
        label: 'Mark as Delivered',
        icon: 'pi pi-truck',
        command: () => this.confirmDelivery(invoice),
      });
    }
    items.push({
      label: 'View Invoice',
      icon: 'pi pi-eye',
      command: () => {},
    });

    this.menuItems.set(items);
    this.actionMenu()?.toggle(event);
  }

  updateStatus(invoice: Invoice, status: Invoice['deliveryStatus']): void {
    this.invoiceService.updateDeliveryStatus(invoice.id, status);
  }

  confirmDelivery(invoice: Invoice): void {
    this.confirmationService.confirm({
      message: `Mark invoice ${invoice.invoiceNumber} for ${invoice.customer} as delivered?`,
      header: 'Confirm Delivery',
      icon: 'pi pi-truck',
      acceptLabel: 'Yes, Delivered',
      rejectLabel: 'Cancel',
      accept: () => {
        this.invoiceService.updateDeliveryStatus(invoice.id, 'Delivered');
      },
    });
  }
}
