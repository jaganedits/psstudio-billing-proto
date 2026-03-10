import {
  Component,
  ChangeDetectionStrategy,
  inject,
  computed,
  signal,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { InvoiceService } from '../../shared/services/invoice.service';
import { BookingService } from '../../shared/services/booking.service';
import { CustomerService } from '../../shared/services/customer.service';
import { ExpenseService } from '../../shared/services/expense.service';

type ReportTab = 'revenue' | 'customers' | 'services' | 'expenses';

@Component({
  selector: 'app-reports',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, ChartModule],
  templateUrl: './reports.html',
  styleUrl: './reports.scss',
})
export class Reports {
  private readonly invoiceService = inject(InvoiceService);
  private readonly bookingService = inject(BookingService);
  private readonly customerService = inject(CustomerService);
  private readonly expenseService = inject(ExpenseService);

  readonly activeTab = signal<ReportTab>('revenue');

  // ── Revenue Tab ──

  readonly totalRevenue = computed(() =>
    this.invoiceService.invoices()
      .filter(i => i.status !== 'Cancelled')
      .reduce((sum, i) => sum + i.total, 0)
  );

  readonly totalCollected = computed(() =>
    this.invoiceService.invoices()
      .filter(i => i.status !== 'Cancelled')
      .reduce((sum, i) => sum + i.paid, 0)
  );

  readonly totalPending = computed(() =>
    this.invoiceService.invoices()
      .filter(i => i.status !== 'Cancelled')
      .reduce((sum, i) => sum + i.balance, 0)
  );

  readonly invoiceCount = computed(() =>
    this.invoiceService.invoices().filter(i => i.status !== 'Cancelled').length
  );

  readonly revenueByStatus = computed(() => {
    const invoices = this.invoiceService.invoices().filter(i => i.status !== 'Cancelled');
    const paid = invoices.filter(i => i.status === 'Paid').reduce((s, i) => s + i.total, 0);
    const partial = invoices.filter(i => i.status === 'Partial').reduce((s, i) => s + i.total, 0);
    const unpaid = invoices.filter(i => i.status === 'Unpaid').reduce((s, i) => s + i.total, 0);
    return { paid, partial, unpaid };
  });

  readonly revenueChartData = computed(() => {
    const r = this.revenueByStatus();
    return {
      labels: ['Paid', 'Partial', 'Unpaid'],
      datasets: [{
        data: [r.paid, r.partial, r.unpaid],
        backgroundColor: ['#328048cc', '#d9822fcc', '#e04343cc'],
        borderColor: ['#328048', '#d9822f', '#e04343'],
        borderWidth: 2,
        hoverOffset: 6,
      }],
    };
  });

  readonly revenueChartOptions = computed(() => {
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
              `${ctx.label}: \u20B9${ctx.parsed.toLocaleString()}`,
          },
        },
      },
    };
  });

  readonly revenueByPaymentMode = computed(() => {
    const invoices = this.invoiceService.invoices().filter(i => i.status !== 'Cancelled');
    const modes: Record<string, number> = {};
    for (const inv of invoices) {
      if (inv.paid > 0) {
        modes[inv.paymentMode] = (modes[inv.paymentMode] || 0) + inv.paid;
      }
    }
    return Object.entries(modes).sort((a, b) => b[1] - a[1]);
  });

  // ── Customers Tab ──

  readonly activeCustomerCount = computed(() =>
    this.customerService.customers().filter(c => c.status === 'Active').length
  );

  readonly inactiveCustomerCount = computed(() =>
    this.customerService.customers().filter(c => c.status === 'Inactive').length
  );

  readonly totalCustomerCount = computed(() =>
    this.customerService.customers().filter(c => c.status !== 'Deleted').length
  );

  readonly totalCustomerPending = computed(() =>
    this.customerService.customers()
      .filter(c => c.status !== 'Deleted')
      .reduce((sum, c) => sum + c.pendingBalance, 0)
  );

  readonly topCustomersByOrders = computed(() =>
    this.customerService.customers()
      .filter(c => c.status !== 'Deleted')
      .sort((a, b) => b.totalOrders - a.totalOrders)
      .slice(0, 8)
  );

  readonly customerStatusChartData = computed(() => {
    return {
      labels: ['Active', 'Inactive'],
      datasets: [{
        data: [this.activeCustomerCount(), this.inactiveCustomerCount()],
        backgroundColor: ['#328048cc', '#d9822fcc'],
        borderColor: ['#328048', '#d9822f'],
        borderWidth: 2,
        hoverOffset: 6,
      }],
    };
  });

  readonly customerStatusChartOptions = computed(() => {
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
        },
      },
    };
  });

  readonly topCustomersBySpend = computed(() => {
    const invoices = this.invoiceService.invoices().filter(i => i.status !== 'Cancelled');
    const spend: Record<string, number> = {};
    for (const inv of invoices) {
      spend[inv.customer] = (spend[inv.customer] || 0) + inv.total;
    }
    return Object.entries(spend)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
  });

  readonly customerSpendChartData = computed(() => {
    const top = this.topCustomersBySpend();
    const colors = [
      '#4945ff', '#328048', '#d9822f', '#7b79ff',
      '#5cb176', '#e8a33e', '#3d39e6', '#9694f8',
    ];
    return {
      labels: top.map(([name]) => name),
      datasets: [{
        label: 'Total Spend',
        data: top.map(([, val]) => val),
        backgroundColor: top.map((_, i) => colors[i % colors.length] + '99'),
        borderColor: top.map((_, i) => colors[i % colors.length]),
        borderWidth: 2,
        borderRadius: 4,
      }],
    };
  });

  readonly customerSpendChartOptions = computed(() => {
    const style = getComputedStyle(document.documentElement);
    const textMuted = style.getPropertyValue('--text-muted').trim() || '#8e8ea9';
    const borderColor = style.getPropertyValue('--border-light').trim() || '#eaeaef';
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
              `\u20B9${ctx.parsed.x.toLocaleString()}`,
          },
        },
      },
      scales: {
        x: {
          grid: { color: borderColor },
          ticks: {
            color: textMuted,
            font: { size: 11, family: 'Poppins' },
            callback: (value: number) => '\u20B9' + (value >= 1000 ? (value / 1000) + 'k' : value),
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

  // ── Services Tab ──

  readonly serviceRevenueMap = computed(() => {
    const invoices = this.invoiceService.invoices().filter(i => i.status !== 'Cancelled');
    const services: Record<string, { revenue: number; count: number }> = {};
    for (const inv of invoices) {
      for (const item of inv.items) {
        if (!services[item.name]) {
          services[item.name] = { revenue: 0, count: 0 };
        }
        services[item.name].revenue += item.total;
        services[item.name].count += item.quantity;
      }
    }
    return services;
  });

  readonly topServicesByRevenue = computed(() =>
    Object.entries(this.serviceRevenueMap())
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .slice(0, 10)
  );

  readonly totalServiceRevenue = computed(() =>
    Object.values(this.serviceRevenueMap()).reduce((sum, s) => sum + s.revenue, 0)
  );

  readonly uniqueServiceCount = computed(() =>
    Object.keys(this.serviceRevenueMap()).length
  );

  readonly totalBookingValue = computed(() =>
    this.bookingService.bookings()
      .filter(b => b.status !== 'Cancelled')
      .reduce((sum, b) => sum + b.totalAmount, 0)
  );

  readonly servicesChartData = computed(() => {
    const top = this.topServicesByRevenue();
    const colors = [
      '#4945ff', '#328048', '#d9822f', '#7b79ff',
      '#5cb176', '#e8a33e', '#3d39e6', '#9694f8',
      '#e04343', '#2196f3',
    ];
    return {
      labels: top.map(([name]) => name),
      datasets: [{
        label: 'Revenue',
        data: top.map(([, val]) => val.revenue),
        backgroundColor: top.map((_, i) => colors[i % colors.length] + '99'),
        borderColor: top.map((_, i) => colors[i % colors.length]),
        borderWidth: 2,
        borderRadius: 4,
      }],
    };
  });

  readonly servicesChartOptions = computed(() => {
    const style = getComputedStyle(document.documentElement);
    const textMuted = style.getPropertyValue('--text-muted').trim() || '#8e8ea9';
    const borderColor = style.getPropertyValue('--border-light').trim() || '#eaeaef';
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
              `\u20B9${ctx.parsed.x.toLocaleString()}`,
          },
        },
      },
      scales: {
        x: {
          grid: { color: borderColor },
          ticks: {
            color: textMuted,
            font: { size: 11, family: 'Poppins' },
            callback: (value: number) => '\u20B9' + (value >= 1000 ? (value / 1000) + 'k' : value),
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

  // ── Expenses Tab ──

  readonly activeExpenses = computed(() =>
    this.expenseService.expenses().filter(e => e.status === 'Active')
  );

  readonly totalExpenses = computed(() =>
    this.activeExpenses().reduce((sum, e) => sum + e.amount, 0)
  );

  readonly expensesByCategory = computed(() => {
    const cats: Record<string, number> = {};
    for (const exp of this.activeExpenses()) {
      cats[exp.category] = (cats[exp.category] || 0) + exp.amount;
    }
    return Object.entries(cats).sort((a, b) => b[1] - a[1]);
  });

  readonly expenseCategoryCount = computed(() =>
    this.expensesByCategory().length
  );

  readonly netProfit = computed(() =>
    this.totalCollected() - this.totalExpenses()
  );

  readonly expensesChartData = computed(() => {
    const cats = this.expensesByCategory();
    const colors = [
      '#4945ff', '#328048', '#d9822f', '#7b79ff',
      '#5cb176', '#e8a33e', '#e04343', '#2196f3',
      '#9694f8', '#3d39e6',
    ];
    return {
      labels: cats.map(([name]) => name),
      datasets: [{
        data: cats.map(([, val]) => val),
        backgroundColor: cats.map((_, i) => colors[i % colors.length] + 'cc'),
        borderColor: cats.map((_, i) => colors[i % colors.length]),
        borderWidth: 2,
        hoverOffset: 6,
      }],
    };
  });

  readonly expensesChartOptions = computed(() => {
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
              `${ctx.label}: \u20B9${ctx.parsed.toLocaleString()}`,
          },
        },
      },
    };
  });

  setTab(tab: ReportTab): void {
    this.activeTab.set(tab);
  }
}
