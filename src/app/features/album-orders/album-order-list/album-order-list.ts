import { Component, ChangeDetectionStrategy, inject, signal, computed, viewChild } from '@angular/core';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { Menu, MenuModule } from 'primeng/menu';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TooltipModule } from 'primeng/tooltip';
import { RouterLink } from '@angular/router';
import { MenuItem } from 'primeng/api';

import { AlbumOrder } from '../../../shared/models/album-order.model';
import { AlbumOrderService } from '../../../shared/services/album-order.service';
import { AlbumOrderStatusDialog } from '../album-order-status-dialog/album-order-status-dialog';

interface TabItem {
  label: string;
  value: string;
}

@Component({
  selector: 'app-album-order-list',
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
    AlbumOrderStatusDialog,
  ],
  templateUrl: './album-order-list.html',
  styleUrl: './album-order-list.scss',
})
export class AlbumOrderList {
  private readonly albumOrderService = inject(AlbumOrderService);

  readonly allOrders = this.albumOrderService.orders;
  readonly totalCount = this.albumOrderService.totalCount;

  readonly activeTab = signal<string>('all');

  readonly tabs: TabItem[] = [
    { label: 'All', value: 'all' },
    { label: 'Design Pending', value: 'Pending' },
    { label: 'In Production', value: 'In Production' },
    { label: 'Ready', value: 'Ready' },
    { label: 'Delivered', value: 'Delivered' },
  ];

  readonly filteredOrders = computed(() => {
    const tab = this.activeTab();
    const all = this.allOrders();
    if (tab === 'all') return all;
    if (tab === 'Pending') return all.filter((o) => o.designStatus === 'Pending');
    return all.filter((o) => o.orderStatus === tab);
  });

  readonly tabCounts = computed(() => {
    const all = this.allOrders();
    return {
      all: all.length,
      Pending: all.filter((o) => o.designStatus === 'Pending').length,
      'In Production': all.filter((o) => o.orderStatus === 'In Production').length,
      Ready: all.filter((o) => o.orderStatus === 'Ready').length,
      Delivered: all.filter((o) => o.orderStatus === 'Delivered').length,
    } as Record<string, number>;
  });

  readonly selectedOrder = signal<AlbumOrder | null>(null);
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

  getDesignStatusSeverity(status: string): 'success' | 'danger' | 'warn' | 'info' | 'secondary' {
    switch (status) {
      case 'Approved': return 'success';
      case 'In Design': return 'info';
      case 'Review': return 'warn';
      case 'Pending': return 'secondary';
      case 'Rejected': return 'danger';
      default: return 'info';
    }
  }

  getOrderStatusSeverity(status: string): 'success' | 'danger' | 'warn' | 'info' | 'secondary' {
    switch (status) {
      case 'Delivered': return 'success';
      case 'Ready': return 'info';
      case 'In Production': return 'warn';
      case 'Ordered': return 'secondary';
      case 'Not Ordered': return 'danger';
      default: return 'info';
    }
  }

  setTab(value: string): void {
    this.activeTab.set(value);
  }

  onFilter(table: Table, event: Event): void {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  showActionMenu(event: Event, order: AlbumOrder): void {
    this.selectedOrder.set(order);
    this.menuItems.set([
      {
        label: 'Update Status',
        icon: 'pi pi-sync',
        command: () => this.openStatusDialog(order),
      },
    ]);
    this.actionMenu()?.toggle(event);
  }

  openStatusDialog(order: AlbumOrder): void {
    this.selectedOrder.set(order);
    this.showStatusDialog.set(true);
  }

  onStatusSave(data: { designStatus: AlbumOrder['designStatus']; orderStatus: AlbumOrder['orderStatus']; deliveryDate: string; notes: string }): void {
    const order = this.selectedOrder();
    if (order) {
      this.albumOrderService.updateOrder({
        ...order,
        designStatus: data.designStatus,
        orderStatus: data.orderStatus,
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
