import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DecimalPipe } from '@angular/common';
import { Booking } from '../../../shared/models/booking.model';
import { BookingService } from '../../../shared/services/booking.service';
import { InvoiceService } from '../../../shared/services/invoice.service';

@Component({
  selector: 'app-booking-details',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    ButtonModule,
    TagModule,
    DecimalPipe,
  ],
  templateUrl: './booking-details.html',
  styleUrl: './booking-details.scss',
})
export class BookingDetails {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly bookingService = inject(BookingService);
  private readonly invoiceService = inject(InvoiceService);

  readonly booking = signal<Booking | null>(null);
  readonly notFound = signal(false);

  readonly relatedInvoices = computed(() => {
    const b = this.booking();
    if (!b) return [];
    return this.invoiceService.invoices().filter(inv => inv.customer === b.customer);
  });

  readonly statusSteps = ['Pending', 'Confirmed', 'Completed'];

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const found = this.bookingService.bookings().find(b => b.id === +id);
      if (found) {
        this.booking.set(found);
      } else {
        this.notFound.set(true);
      }
    } else {
      this.notFound.set(true);
    }
  }

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

  getInvoiceStatusSeverity(status: string): 'success' | 'danger' | 'warn' | 'info' {
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

  getStepIndex(status: string): number {
    if (status === 'Cancelled') return -1;
    return this.statusSteps.indexOf(status);
  }

  isStepCompleted(stepIndex: number): boolean {
    const booking = this.booking();
    if (!booking) return false;
    const currentIndex = this.getStepIndex(booking.status);
    return currentIndex > stepIndex;
  }

  isStepActive(stepIndex: number): boolean {
    const booking = this.booking();
    if (!booking) return false;
    return this.getStepIndex(booking.status) === stepIndex;
  }

  editBooking(): void {
    const b = this.booking();
    if (b) {
      this.router.navigate(['/bookings/edit', b.id]);
    }
  }

  goBack(): void {
    this.router.navigate(['/bookings']);
  }
}
