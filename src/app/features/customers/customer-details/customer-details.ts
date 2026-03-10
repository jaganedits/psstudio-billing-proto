import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

import { CustomerService } from '../../../shared/services/customer.service';
import { InvoiceService } from '../../../shared/services/invoice.service';
import { BookingService } from '../../../shared/services/booking.service';
import { Customer } from '../../../shared/models/customer.model';

@Component({
  selector: 'app-customer-details',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CurrencyPipe, ButtonModule, TableModule, TagModule, TooltipModule],
  templateUrl: './customer-details.html',
  styleUrl: './customer-details.scss',
})
export class CustomerDetails {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly customerService = inject(CustomerService);
  private readonly invoiceService = inject(InvoiceService);
  private readonly bookingService = inject(BookingService);

  readonly activeTab = signal<'invoices' | 'bookings'>('invoices');
  readonly customer = signal<Customer | null>(null);

  readonly customerInvoices = computed(() => {
    const c = this.customer();
    if (!c) return [];
    return this.invoiceService.invoices().filter((inv) => inv.customer === c.name);
  });

  readonly customerBookings = computed(() => {
    const c = this.customer();
    if (!c) return [];
    return this.bookingService.bookings().filter((b) => b.customer === c.name);
  });

  readonly totalSpent = computed(() => this.customerInvoices().reduce((sum, inv) => sum + inv.total, 0));
  readonly totalPaid = computed(() => this.customerInvoices().reduce((sum, inv) => sum + inv.paid, 0));
  readonly totalBalance = computed(() => this.customerInvoices().reduce((sum, inv) => sum + inv.balance, 0));
  readonly totalBookings = computed(() => this.customerBookings().length);

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const found = this.customerService.customers().find((c) => c.id === +id);
      if (found) {
        this.customer.set(found);
      } else {
        this.router.navigate(['/customers']);
      }
    }
  }

  setTab(tab: 'invoices' | 'bookings'): void {
    this.activeTab.set(tab);
  }

  goBack(): void {
    this.router.navigate(['/customers']);
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  getStatusSeverity(status: string): 'success' | 'warn' | 'danger' | 'info' | 'secondary' {
    switch (status) {
      case 'Paid':
      case 'Completed':
        return 'success';
      case 'Partial':
      case 'Confirmed':
        return 'warn';
      case 'Unpaid':
      case 'Pending':
        return 'danger';
      case 'Cancelled':
        return 'secondary';
      default:
        return 'info';
    }
  }
}
