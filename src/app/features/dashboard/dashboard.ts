import {
  Component,
  ChangeDetectionStrategy,
  inject,
  computed,
  signal,
  AfterViewInit,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { InvoiceService } from '../../shared/services/invoice.service';
import { BookingService } from '../../shared/services/booking.service';
import { CustomerService } from '../../shared/services/customer.service';
import { PaymentService } from '../../shared/services/payment.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DecimalPipe, ButtonModule, ChartModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements AfterViewInit {
  private readonly invoiceService = inject(InvoiceService);
  private readonly bookingService = inject(BookingService);
  private readonly customerService = inject(CustomerService);
  private readonly paymentService = inject(PaymentService);
  private readonly themeService = inject(ThemeService);

  readonly chartPeriod = signal<'weekly' | 'monthly' | 'yearly'>('weekly');
  readonly chartRenderTick = signal(0);

  ngAfterViewInit(): void {
    setTimeout(() => this.chartRenderTick.update((v) => v + 1));
  }

  readonly totalRevenue = computed(() => {
    return this.invoiceService.invoices()
      .filter(i => i.status !== 'Cancelled')
      .reduce((sum, i) => sum + i.paid, 0);
  });

  readonly pendingBalance = computed(() => {
    return this.invoiceService.invoices()
      .filter(i => i.status === 'Partial' || i.status === 'Unpaid')
      .reduce((sum, i) => sum + i.balance, 0);
  });

  readonly activeBookings = computed(() => {
    return this.bookingService.bookings()
      .filter(b => b.status === 'Confirmed' || b.status === 'Pending')
      .length;
  });

  readonly totalCustomers = computed(() => {
    return this.customerService.customers()
      .filter(c => c.status === 'Active')
      .length;
  });

  readonly recentInvoices = computed(() => {
    return this.invoiceService.invoices()
      .filter(i => i.status !== 'Cancelled')
      .slice(0, 5);
  });

  readonly upcomingBookings = computed(() => {
    return this.bookingService.bookings()
      .filter(b => b.status === 'Confirmed' || b.status === 'Pending')
      .slice(0, 5);
  });

  readonly paidCount = computed(() =>
    this.invoiceService.invoices().filter(i => i.status === 'Paid').length
  );

  readonly partialCount = computed(() =>
    this.invoiceService.invoices().filter(i => i.status === 'Partial').length
  );

  readonly unpaidCount = computed(() =>
    this.invoiceService.invoices().filter(i => i.status === 'Unpaid').length
  );

  // Chart data
  readonly revenueChartData = computed(() => {
    this.chartRenderTick();
    this.themeService.isDark();
    const period = this.chartPeriod();
    const style = getComputedStyle(document.documentElement);
    const primary = style.getPropertyValue('--primary').trim() || '#4945ff';
    const primaryLight = style.getPropertyValue('--primary-light').trim() || '#7b79ff';
    const green = style.getPropertyValue('--accent-green').trim() || '#328048';
    const amber = style.getPropertyValue('--accent-amber').trim() || '#d9822f';

    if (period === 'weekly') {
      return {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
          {
            label: 'Revenue',
            data: [3540, 8500, 17700, 5200, 17700, 7788, 35400],
            backgroundColor: primary + '99',
            borderColor: primary,
            borderWidth: 2,
            borderRadius: 4,
          },
          {
            label: 'Collected',
            data: [3540, 6000, 10000, 3500, 17700, 7788, 12000],
            backgroundColor: green + '99',
            borderColor: green,
            borderWidth: 2,
            borderRadius: 4,
          },
        ],
      };
    }

    if (period === 'monthly') {
      return {
        labels: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
        datasets: [
          {
            label: 'Revenue',
            data: [28500, 42000, 55000, 38000, 23600, 82128],
            borderColor: primary,
            backgroundColor: primary + '22',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: primary,
            pointRadius: 4,
          },
          {
            label: 'Collected',
            data: [25000, 38000, 48000, 35000, 0, 41028],
            borderColor: green,
            backgroundColor: green + '22',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: green,
            pointRadius: 4,
          },
        ],
      };
    }

    // yearly
    return {
      labels: ['2024', '2025', '2026'],
      datasets: [
        {
          label: 'Revenue',
          data: [285000, 520000, 82128],
          backgroundColor: [primaryLight + '99', primary + '99', amber + '99'],
          borderColor: [primaryLight, primary, amber],
          borderWidth: 2,
          borderRadius: 6,
        },
      ],
    };
  });

  readonly revenueChartOptions = computed(() => {
    this.chartRenderTick();
    const isDark = this.themeService.isDark();
    const style = getComputedStyle(document.documentElement);
    const textMuted = style.getPropertyValue('--text-muted').trim() || '#8e8ea9';
    const borderColor = style.getPropertyValue('--border-light').trim()
      || (isDark ? 'rgba(255,255,255,0.08)' : '#eaeaef');
    const period = this.chartPeriod();

    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top' as const,
          align: 'end' as const,
          labels: {
            color: textMuted,
            usePointStyle: true,
            pointStyle: 'circle',
            font: { size: 11, family: 'Poppins' },
            padding: 16,
          },
        },
        tooltip: {
          backgroundColor: '#1e1e30',
          titleFont: { family: 'Poppins', size: 12 },
          bodyFont: { family: 'Poppins', size: 12 },
          padding: 10,
          cornerRadius: 6,
          callbacks: {
            label: (ctx: { dataset: { label: string }; parsed: { y: number } }) =>
              `${ctx.dataset.label}: ₹${ctx.parsed.y.toLocaleString()}`,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            color: textMuted,
            font: { size: 11, family: 'Poppins' },
          },
        },
        y: {
          grid: { color: borderColor },
          ticks: {
            color: textMuted,
            font: { size: 11, family: 'Poppins' },
            callback: (value: number) => '₹' + (value >= 1000 ? (value / 1000) + 'k' : value),
          },
          beginAtZero: true,
        },
      },
      ...(period === 'yearly' ? { indexAxis: 'x' as const } : {}),
    };
  });

  readonly revenueChartType = computed(() => {
    const period = this.chartPeriod();
    if (period === 'monthly') return 'line';
    return 'bar';
  });

  // Payment mode doughnut chart — derived from actual payment records
  readonly paymentModeData = computed(() => {
    const payments = this.paymentService.payments();
    const modes: Record<string, number> = {};
    for (const p of payments) {
      modes[p.paymentMode] = (modes[p.paymentMode] || 0) + p.amount;
    }
    return {
      labels: Object.keys(modes),
      datasets: [{
        data: Object.values(modes),
        backgroundColor: ['#4945ff', '#328048', '#d9822f', '#7b79ff'],
        borderWidth: 0,
        hoverOffset: 6,
      }],
    };
  });

  readonly paymentModeOptions = computed(() => {
    this.chartRenderTick();
    this.themeService.isDark();
    const style = getComputedStyle(document.documentElement);
    const textMuted = style.getPropertyValue('--text-muted').trim() || '#8e8ea9';
    return {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: {
          position: 'bottom' as const,
          labels: {
            color: textMuted,
            usePointStyle: true,
            pointStyle: 'circle',
            font: { size: 11, family: 'Poppins' },
            padding: 14,
          },
        },
        tooltip: {
          backgroundColor: '#1e1e30',
          titleFont: { family: 'Poppins', size: 12 },
          bodyFont: { family: 'Poppins', size: 12 },
          padding: 10,
          cornerRadius: 6,
          callbacks: {
            label: (ctx: { label: string; parsed: number }) =>
              `${ctx.label}: ₹${ctx.parsed.toLocaleString()}`,
          },
        },
      },
    };
  });

  // Top Services by Revenue - horizontal bar
  readonly topServicesData = computed(() => {
    const invoices = this.invoiceService.invoices().filter(i => i.status !== 'Cancelled');
    const serviceRevenue: Record<string, number> = {};
    for (const inv of invoices) {
      for (const item of inv.items) {
        serviceRevenue[item.name] = (serviceRevenue[item.name] || 0) + item.total;
      }
    }
    const sorted = Object.entries(serviceRevenue)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);

    const colors = [
      '#4945ff', '#328048', '#d9822f', '#7b79ff',
      '#5cb176', '#e8a33e', '#3d39e6', '#9694f8',
    ];

    return {
      labels: sorted.map(([name]) => name),
      datasets: [{
        label: 'Revenue',
        data: sorted.map(([, val]) => val),
        backgroundColor: sorted.map((_, i) => colors[i % colors.length] + '99'),
        borderColor: sorted.map((_, i) => colors[i % colors.length]),
        borderWidth: 2,
        borderRadius: 4,
      }],
    };
  });

  readonly topServicesOptions = computed(() => {
    this.chartRenderTick();
    const isDark = this.themeService.isDark();
    const style = getComputedStyle(document.documentElement);
    const textMuted = style.getPropertyValue('--text-muted').trim() || '#8e8ea9';
    const borderColor = style.getPropertyValue('--border-light').trim()
      || (isDark ? 'rgba(255,255,255,0.08)' : '#eaeaef');
    return {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y' as const,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1e1e30',
          titleFont: { family: 'Poppins', size: 12 },
          bodyFont: { family: 'Poppins', size: 12 },
          padding: 10,
          cornerRadius: 6,
          callbacks: {
            label: (ctx: { parsed: { x: number } }) =>
              `₹${ctx.parsed.x.toLocaleString()}`,
          },
        },
      },
      scales: {
        x: {
          grid: { color: borderColor },
          ticks: {
            color: textMuted,
            font: { size: 11, family: 'Poppins' },
            callback: (value: number) => '₹' + (value >= 1000 ? (value / 1000) + 'k' : value),
          },
          beginAtZero: true,
        },
        y: {
          grid: { display: false },
          ticks: {
            color: textMuted,
            font: { size: 11, family: 'Poppins' },
          },
        },
      },
    };
  });

  setChartPeriod(period: 'weekly' | 'monthly' | 'yearly'): void {
    this.chartPeriod.set(period);
  }
}
