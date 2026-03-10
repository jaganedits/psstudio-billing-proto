import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
} from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { Booking } from '../../../shared/models/booking.model';
import { BookingService } from '../../../shared/services/booking.service';
import { PackageService } from '../../../shared/services/package.service';

@Component({
  selector: 'app-booking-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    DatePickerModule,
    RouterLink,
  ],
  templateUrl: './booking-form.html',
  styleUrl: './booking-form.scss',
})
export class BookingForm {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly bookingService = inject(BookingService);
  private readonly packageService = inject(PackageService);

  readonly isEditing = signal(false);
  private editingBooking: Booking | null = null;

  readonly eventTypes = [
    { label: 'Wedding', value: 'Wedding' },
    { label: 'Ear Piercing', value: 'Ear Piercing' },
    { label: 'Birthday', value: 'Birthday' },
    { label: 'Baby Shoot', value: 'Baby Shoot' },
    { label: 'Studio Shoot', value: 'Studio Shoot' },
    { label: 'Pre-Wedding', value: 'Pre-Wedding' },
    { label: 'Engagement', value: 'Engagement' },
  ];

  readonly packageOptions = computed(() =>
    this.packageService.packages()
      .filter(p => p.status === 'Active')
      .map(p => ({ label: `${p.name} — ₹${p.packagePrice}`, value: p.name }))
  );

  readonly form = this.fb.nonNullable.group({
    customer: ['', [Validators.required, Validators.minLength(2)]],
    eventType: ['', [Validators.required]],
    eventDate: [null as Date | null, [Validators.required]],
    eventTime: [''],
    eventEndTime: [''],
    location: [''],
    photographer: [''],
    package: [''],
    totalAmount: [0, [Validators.required]],
    advancePaid: [0],
    deliveryDate: [null as Date | null],
  });

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const booking = this.bookingService.bookings().find(b => b.id === +id);
      if (booking) {
        this.editingBooking = booking;
        this.isEditing.set(true);
        this.form.patchValue({
          customer: booking.customer,
          eventType: booking.eventType,
          eventDate: booking.eventDate ? new Date(booking.eventDate) : null,
          location: booking.location,
          photographer: booking.photographer,
          package: booking.package,
          totalAmount: booking.totalAmount,
          advancePaid: booking.advancePaid,
          deliveryDate: booking.deliveryDate ? new Date(booking.deliveryDate) : null,
        });
      }
    }
  }

  get pageTitle(): string {
    return this.isEditing() ? 'Edit Booking' : 'New Booking';
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const balance = raw.totalAmount - raw.advancePaid;

    const formatDate = (d: Date | null): string => {
      if (!d) return '';
      return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const formValue = {
      customer: raw.customer,
      eventType: raw.eventType,
      eventDate: formatDate(raw.eventDate),
      location: raw.location,
      photographer: raw.photographer,
      package: raw.package,
      totalAmount: raw.totalAmount,
      advancePaid: raw.advancePaid,
      deliveryDate: formatDate(raw.deliveryDate),
    };

    if (this.editingBooking) {
      this.bookingService.updateBooking({
        ...this.editingBooking,
        ...formValue,
        balance,
      });
    } else {
      this.bookingService.addBooking({
        ...formValue,
        balance,
        notes: '',
        status: 'Pending',
      });
    }

    this.router.navigate(['/bookings']);
  }

  onCancel(): void {
    this.router.navigate(['/bookings']);
  }
}
