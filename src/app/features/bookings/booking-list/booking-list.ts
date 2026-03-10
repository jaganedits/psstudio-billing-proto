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

import { Booking } from '../../../shared/models/booking.model';
import { BookingService } from '../../../shared/services/booking.service';

interface TabItem {
  label: string;
  value: string;
}

@Component({
  selector: 'app-booking-list',
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
  templateUrl: './booking-list.html',
  styleUrl: './booking-list.scss',
})
export class BookingList {
  private readonly bookingService = inject(BookingService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly router = inject(Router);

  readonly allBookings = this.bookingService.bookings;
  readonly totalCount = this.bookingService.totalCount;

  readonly activeTab = signal<string>('all');

  readonly tabs: TabItem[] = [
    { label: 'All Bookings', value: 'all' },
    { label: 'Confirmed', value: 'Confirmed' },
    { label: 'Completed', value: 'Completed' },
    { label: 'Pending', value: 'Pending' },
    { label: 'Cancelled', value: 'Cancelled' },
  ];

  readonly filteredBookings = computed(() => {
    const tab = this.activeTab();
    const all = this.allBookings();
    if (tab === 'all') return all;
    return all.filter((b) => b.status === tab);
  });

  readonly tabCounts = computed(() => {
    const all = this.allBookings();
    return {
      all: all.length,
      Confirmed: all.filter((b) => b.status === 'Confirmed').length,
      Completed: all.filter((b) => b.status === 'Completed').length,
      Pending: all.filter((b) => b.status === 'Pending').length,
      Cancelled: all.filter((b) => b.status === 'Cancelled').length,
    } as Record<string, number>;
  });

  readonly selectedBooking = signal<Booking | null>(null);

  readonly actionMenu = viewChild<Menu>('actionMenu');
  readonly menuItems = signal<MenuItem[]>([]);

  getStatusSeverity(status: string): 'success' | 'danger' | 'warn' | 'info' {
    switch (status) {
      case 'Confirmed':
        return 'info';
      case 'Completed':
        return 'success';
      case 'Pending':
        return 'warn';
      case 'Cancelled':
        return 'danger';
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
    this.router.navigate(['/bookings/add']);
  }

  openEditForm(booking: Booking): void {
    this.router.navigate(['/bookings/edit', booking.id]);
  }

  showActionMenu(event: Event, booking: Booking): void {
    this.selectedBooking.set(booking);
    this.menuItems.set([
      {
        label: 'View',
        icon: 'pi pi-eye',
        command: () => this.openEditForm(booking),
      },
      {
        label: 'Edit',
        icon: 'pi pi-pencil',
        command: () => this.openEditForm(booking),
      },
      {
        label: 'Cancel Booking',
        icon: 'pi pi-times-circle',
        command: () => this.confirmCancel(booking),
      },
    ]);
    this.actionMenu()?.toggle(event);
  }

  private confirmCancel(booking: Booking): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to cancel the booking for ${booking.customer}?`,
      header: 'Confirm Cancel',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.bookingService.deleteBooking(booking.id),
    });
  }
}
