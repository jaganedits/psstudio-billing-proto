import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { DatePickerModule } from 'primeng/datepicker';
import { BookingService } from '../../shared/services/booking.service';
import { Booking } from '../../shared/models/booking.model';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  bookings: Booking[];
}

@Component({
  selector: 'app-calendar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonModule, TagModule, TooltipModule, RouterLink, FormsModule, DatePickerModule],
  templateUrl: './calendar.html',
  styleUrl: './calendar.scss',
})
export class CalendarView {
  private readonly bookingService = inject(BookingService);
  private readonly router = inject(Router);

  readonly currentDate = signal(new Date());
  readonly selectedDate = signal<Date | null>(null);

  readonly weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  readonly calendarDays = computed(() => {
    const current = this.currentDate();
    const year = current.getFullYear();
    const month = current.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days: CalendarDay[] = [];
    const today = new Date();
    const bookings = this.bookingService.bookings();

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dateStr = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

      days.push({
        date,
        isCurrentMonth: date.getMonth() === month,
        isToday: date.toDateString() === today.toDateString(),
        bookings: bookings.filter(b => b.eventDate === dateStr),
      });
    }
    return days;
  });

  readonly selectedDayBookings = computed(() => {
    const sel = this.selectedDate();
    if (!sel) return [];
    const dateStr = sel.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    return this.bookingService.bookings().filter(b => b.eventDate === dateStr);
  });

  onMonthSelect(date: Date): void {
    this.currentDate.set(new Date(date.getFullYear(), date.getMonth(), 1));
  }

  goToday(): void {
    this.currentDate.set(new Date());
    this.selectedDate.set(new Date());
  }

  selectDay(day: CalendarDay): void {
    this.selectedDate.set(day.date);
  }

  getEventColor(eventType: string): string {
    switch (eventType) {
      case 'Wedding': return '#4945ff';
      case 'Baby Shoot': return '#328048';
      case 'Birthday': return '#d9822f';
      case 'Engagement': return '#8e4fd0';
      case 'Pre-Wedding': return '#0c75af';
      default: return '#7b79ff';
    }
  }

  getBookingStatusSeverity(status: string): 'success' | 'danger' | 'warn' | 'info' {
    switch (status) {
      case 'Confirmed': return 'success';
      case 'Completed': return 'info';
      case 'Pending': return 'warn';
      case 'Cancelled': return 'danger';
      default: return 'info';
    }
  }

  viewBooking(booking: Booking): void {
    this.router.navigate(['/bookings/edit', booking.id]);
  }
}
