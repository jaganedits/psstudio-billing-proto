import { Component, ChangeDetectionStrategy, inject, signal, computed, viewChild } from '@angular/core';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { Menu, MenuModule } from 'primeng/menu';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TooltipModule } from 'primeng/tooltip';
import { DecimalPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MenuItem } from 'primeng/api';

import { Payment } from '../../../shared/models/payment.model';
import { PaymentService } from '../../../shared/services/payment.service';
import { PaymentForm } from '../payment-form/payment-form';

interface TabItem {
  label: string;
  value: string;
}

@Component({
  selector: 'app-payment-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TableModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    MenuModule,
    IconFieldModule,
    InputIconModule,
    TooltipModule,
    DecimalPipe,
    RouterLink,
    PaymentForm,
  ],
  templateUrl: './payment-list.html',
  styleUrl: './payment-list.scss',
})
export class PaymentList {
  private readonly paymentService = inject(PaymentService);
  private readonly router = inject(Router);

  readonly allPayments = this.paymentService.payments;
  readonly totalCollected = this.paymentService.totalCollected;
  readonly thisMonthCollected = this.paymentService.thisMonthCollected;
  readonly pendingBalance = this.paymentService.pendingBalance;
  readonly totalInvoices = this.paymentService.totalInvoices;

  readonly activeTab = signal<string>('all');

  readonly tabs: TabItem[] = [
    { label: 'All', value: 'all' },
    { label: 'Cash', value: 'Cash' },
    { label: 'UPI', value: 'UPI' },
    { label: 'Card', value: 'Card' },
    { label: 'Bank Transfer', value: 'Bank Transfer' },
  ];

  readonly filteredPayments = computed(() => {
    const tab = this.activeTab();
    const all = this.allPayments();
    if (tab === 'all') return all;
    return all.filter((p) => p.paymentMode === tab);
  });

  readonly tabCounts = computed(() => {
    const all = this.allPayments();
    return {
      all: all.length,
      Cash: all.filter((p) => p.paymentMode === 'Cash').length,
      UPI: all.filter((p) => p.paymentMode === 'UPI').length,
      Card: all.filter((p) => p.paymentMode === 'Card').length,
      'Bank Transfer': all.filter((p) => p.paymentMode === 'Bank Transfer').length,
    } as Record<string, number>;
  });

  readonly showForm = signal(false);

  readonly actionMenu = viewChild<Menu>('actionMenu');
  readonly menuItems = signal<MenuItem[]>([]);

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

  getModeSeverity(mode: string): 'success' | 'danger' | 'warn' | 'info' | 'secondary' | 'contrast' {
    switch (mode) {
      case 'Cash':
        return 'success';
      case 'UPI':
        return 'info';
      case 'Card':
        return 'warn';
      case 'Bank Transfer':
        return 'contrast';
      case 'Cheque':
        return 'secondary';
      default:
        return 'info';
    }
  }

  setTab(value: string): void {
    this.activeTab.set(value);
  }

  onFilter(table: Table, event: Event): void {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  openCollectForm(): void {
    this.showForm.set(true);
  }

  onFormSave(payment: Omit<Payment, 'id'>): void {
    this.paymentService.addPayment(payment);
    this.showForm.set(false);
  }

  onFormCancel(): void {
    this.showForm.set(false);
  }

  showActionMenu(event: Event, payment: Payment): void {
    this.menuItems.set([
      {
        label: 'View Invoice',
        icon: 'pi pi-eye',
        command: () => this.router.navigate(['/invoices/edit', payment.invoiceId]),
      },
    ]);
    this.actionMenu()?.toggle(event);
  }
}
