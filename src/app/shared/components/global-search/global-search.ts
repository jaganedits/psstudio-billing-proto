import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  ElementRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';

import { CustomerService } from '../../services/customer.service';
import { InvoiceService } from '../../services/invoice.service';
import { BookingService } from '../../services/booking.service';

export interface SearchResult {
  label: string;
  sublabel: string;
  icon: string;
  route: string;
}

export interface SearchGroup {
  category: string;
  results: SearchResult[];
}

@Component({
  selector: 'app-global-search',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [InputTextModule],
  templateUrl: './global-search.html',
  styleUrl: './global-search.scss',
  host: {
    '(document:click)': 'onDocumentClick($event)',
    '(document:keydown.escape)': 'closeSearch()',
  },
})
export class GlobalSearch {
  private readonly router = inject(Router);
  private readonly elementRef = inject(ElementRef);
  private readonly customerService = inject(CustomerService);
  private readonly invoiceService = inject(InvoiceService);
  private readonly bookingService = inject(BookingService);

  readonly searchQuery = signal('');
  readonly showResults = signal(false);

  readonly results = computed<SearchGroup[]>(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (query.length < 2) return [];

    const groups: SearchGroup[] = [];

    // Search customers
    const customerResults = this.customerService
      .customers()
      .filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.phone.includes(query)
      )
      .slice(0, 5)
      .map((c) => ({
        label: c.name,
        sublabel: c.phone,
        icon: 'pi pi-user',
        route: '/customers',
      }));

    if (customerResults.length > 0) {
      groups.push({ category: 'Customers', results: customerResults });
    }

    // Search invoices
    const invoiceResults = this.invoiceService
      .invoices()
      .filter(
        (i) =>
          i.invoiceNumber.toLowerCase().includes(query) ||
          i.customer.toLowerCase().includes(query)
      )
      .slice(0, 5)
      .map((i) => ({
        label: i.invoiceNumber,
        sublabel: i.customer,
        icon: 'pi pi-file-check',
        route: '/invoices',
      }));

    if (invoiceResults.length > 0) {
      groups.push({ category: 'Invoices', results: invoiceResults });
    }

    // Search bookings
    const bookingResults = this.bookingService
      .bookings()
      .filter(
        (b) =>
          b.customer.toLowerCase().includes(query) ||
          b.eventType.toLowerCase().includes(query)
      )
      .slice(0, 5)
      .map((b) => ({
        label: b.customer,
        sublabel: b.eventType + ' — ' + b.eventDate,
        icon: 'pi pi-calendar',
        route: '/bookings',
      }));

    if (bookingResults.length > 0) {
      groups.push({ category: 'Bookings', results: bookingResults });
    }

    return groups;
  });

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
    this.showResults.set(value.trim().length >= 2);
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
    this.closeSearch();
  }

  closeSearch(): void {
    this.showResults.set(false);
    this.searchQuery.set('');
  }

  onDocumentClick(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.showResults.set(false);
    }
  }
}
