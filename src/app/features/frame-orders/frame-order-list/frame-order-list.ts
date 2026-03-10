import { Component, ChangeDetectionStrategy, inject, signal, computed, viewChild } from '@angular/core';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { Menu, MenuModule } from 'primeng/menu';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TooltipModule } from 'primeng/tooltip';
import { Router, RouterLink } from '@angular/router';
import { MenuItem } from 'primeng/api';

import { FrameOrder } from '../../../shared/models/frame-order.model';
import { FrameOrderService } from '../../../shared/services/frame-order.service';
import { InvoiceService } from '../../../shared/services/invoice.service';
import { FrameOrderStatusDialog } from '../frame-order-status-dialog/frame-order-status-dialog';

interface TabItem {
  label: string;
  value: string;
}

@Component({
  selector: 'app-frame-order-list',
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
    RouterLink,
    FrameOrderStatusDialog,
  ],
  templateUrl: './frame-order-list.html',
  styleUrl: './frame-order-list.scss',
})
export class FrameOrderList {
  private readonly router = inject(Router);
  private readonly frameOrderService = inject(FrameOrderService);
  private readonly invoiceService = inject(InvoiceService);

  readonly allOrders = this.frameOrderService.orders;
  readonly totalCount = this.frameOrderService.totalCount;

  readonly activeTab = signal<string>('all');

  readonly tabs: TabItem[] = [
    { label: 'All', value: 'all' },
    { label: 'Ordered', value: 'Ordered' },
    { label: 'In Progress', value: 'In Progress' },
    { label: 'Ready', value: 'Ready' },
    { label: 'Delivered', value: 'Delivered' },
  ];

  readonly filteredOrders = computed(() => {
    const tab = this.activeTab();
    const all = this.allOrders();
    if (tab === 'all') return all;
    return all.filter((o) => o.status === tab);
  });

  readonly tabCounts = computed(() => {
    const all = this.allOrders();
    return {
      all: all.length,
      Ordered: all.filter((o) => o.status === 'Ordered').length,
      'In Progress': all.filter((o) => o.status === 'In Progress').length,
      Ready: all.filter((o) => o.status === 'Ready').length,
      Delivered: all.filter((o) => o.status === 'Delivered').length,
    } as Record<string, number>;
  });

  readonly selectedOrder = signal<FrameOrder | null>(null);
  readonly showStatusDialog = signal(false);

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

  getStatusSeverity(status: string): 'success' | 'danger' | 'warn' | 'info' | 'secondary' {
    switch (status) {
      case 'Delivered': return 'success';
      case 'Ready': return 'info';
      case 'In Progress': return 'warn';
      case 'Ordered': return 'secondary';
      case 'Cancelled': return 'danger';
      default: return 'info';
    }
  }

  setTab(value: string): void {
    this.activeTab.set(value);
  }

  onFilter(table: Table, event: Event): void {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  showActionMenu(event: Event, order: FrameOrder): void {
    this.selectedOrder.set(order);
    this.menuItems.set([
      {
        label: 'Update Status',
        icon: 'pi pi-sync',
        command: () => this.openStatusDialog(order),
      },
      {
        label: 'View Invoice',
        icon: 'pi pi-file',
        command: () => {
          const inv = this.invoiceService.invoices().find(i => i.invoiceNumber === order.invoiceNumber);
          if (inv) this.router.navigate(['/invoices', inv.id]);
        },
      },
    ]);
    this.actionMenu()?.toggle(event);
  }

  openStatusDialog(order: FrameOrder): void {
    this.selectedOrder.set(order);
    this.showStatusDialog.set(true);
  }

  onStatusSave(data: { status: FrameOrder['status']; deliveryDate: string; notes: string }): void {
    const order = this.selectedOrder();
    if (order) {
      this.frameOrderService.updateOrder({
        ...order,
        status: data.status,
        deliveryDate: data.deliveryDate,
        notes: data.notes,
      });
    }
    this.showStatusDialog.set(false);
  }

  onStatusCancel(): void {
    this.showStatusDialog.set(false);
  }
}
