import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ChartModule } from 'primeng/chart';

import { InvoiceService } from '../../shared/services/invoice.service';
import { ExpenseService } from '../../shared/services/expense.service';
import { PaymentService } from '../../shared/services/payment.service';

@Component({
  selector: 'app-profit-loss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, ButtonModule, TableModule, TagModule, TooltipModule, ChartModule],
  templateUrl: './profit-loss.html',
  styleUrl: './profit-loss.scss',
})
export class ProfitLoss {
  private readonly invoiceService = inject(InvoiceService);
  private readonly expenseService = inject(ExpenseService);
  private readonly paymentService = inject(PaymentService);

  readonly activeTab = signal<'overview' | 'revenue' | 'expenses'>('overview');

  // Revenue calculations
  readonly totalRevenue = computed(() =>
    this.invoiceService.invoices().reduce((sum, inv) => sum + inv.total, 0)
  );
  readonly totalCollected = computed(() =>
    this.invoiceService.invoices().reduce((sum, inv) => sum + inv.paid, 0)
  );
  readonly totalPending = computed(() =>
    this.invoiceService.invoices().reduce((sum, inv) => sum + inv.balance, 0)
  );

  // Expense calculations
  readonly totalExpenses = computed(() =>
    this.expenseService.expenses()
      .filter((e) => e.status === 'Active')
      .reduce((sum, e) => sum + e.amount, 0)
  );

  // Profit
  readonly grossProfit = computed(() => this.totalCollected() - this.totalExpenses());
  readonly profitMargin = computed(() => {
    const collected = this.totalCollected();
    if (collected === 0) return 0;
    return ((this.grossProfit() / collected) * 100);
  });

  // Revenue by month
  readonly revenueByService = computed(() => {
    const serviceMap = new Map<string, number>();
    this.invoiceService.invoices().forEach((inv) => {
      inv.items.forEach((item) => {
        const current = serviceMap.get(item.name) || 0;
        serviceMap.set(item.name, current + item.total);
      });
    });
    return Array.from(serviceMap.entries())
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount);
  });

  // Expenses by category
  readonly expensesByCategory = computed(() => {
    const catMap = new Map<string, number>();
    this.expenseService.expenses()
      .filter((e) => e.status === 'Active')
      .forEach((e) => {
        const current = catMap.get(e.category) || 0;
        catMap.set(e.category, current + e.amount);
      });
    return Array.from(catMap.entries())
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  });

  // P&L summary rows
  readonly plSummary = computed(() => [
    { label: 'Total Revenue (Invoiced)', amount: this.totalRevenue(), type: 'revenue' as const },
    { label: 'Total Collected', amount: this.totalCollected(), type: 'revenue' as const },
    { label: 'Pending Receivables', amount: this.totalPending(), type: 'warning' as const },
    { label: 'Total Expenses', amount: this.totalExpenses(), type: 'expense' as const },
    { label: 'Net Profit', amount: this.grossProfit(), type: this.grossProfit() >= 0 ? 'profit' as const : 'loss' as const },
  ]);

  // Revenue vs Expense chart
  readonly overviewChartData = computed(() => {
    const root = document.documentElement;
    const isDark = root.classList.contains('dark-mode');
    return {
      labels: ['Revenue', 'Collected', 'Expenses', 'Net Profit'],
      datasets: [
        {
          label: 'Amount (₹)',
          data: [this.totalRevenue(), this.totalCollected(), this.totalExpenses(), this.grossProfit()],
          backgroundColor: [
            'rgba(73, 69, 255, 0.8)',
            'rgba(34, 197, 94, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            this.grossProfit() >= 0 ? 'rgba(34, 197, 94, 0.8)' : 'rgba(239, 68, 68, 0.8)',
          ],
          borderRadius: 6,
        },
      ],
    };
  });

  readonly overviewChartOptions = computed(() => {
    const root = document.documentElement;
    const isDark = root.classList.contains('dark-mode');
    const textColor = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)';
    const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
      },
      scales: {
        x: { ticks: { color: textColor }, grid: { display: false } },
        y: {
          ticks: {
            color: textColor,
            callback: (val: number) => '₹' + (val / 1000).toFixed(0) + 'k',
          },
          grid: { color: gridColor },
        },
      },
    };
  });

  // Expense breakdown doughnut
  readonly expenseChartData = computed(() => {
    const cats = this.expensesByCategory();
    const colors = ['#4945ff', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];
    return {
      labels: cats.map((c) => c.category),
      datasets: [
        {
          data: cats.map((c) => c.amount),
          backgroundColor: colors.slice(0, cats.length),
        },
      ],
    };
  });

  readonly expenseChartOptions = computed(() => {
    const root = document.documentElement;
    const isDark = root.classList.contains('dark-mode');
    const textColor = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)';
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom' as const,
          labels: { color: textColor, padding: 16, usePointStyle: true },
        },
      },
    };
  });

  setTab(tab: 'overview' | 'revenue' | 'expenses'): void {
    this.activeTab.set(tab);
  }

  getAmountClass(type: string): string {
    switch (type) {
      case 'revenue': return '';
      case 'expense': return 'pl-expense';
      case 'profit': return 'pl-profit';
      case 'loss': return 'pl-loss';
      case 'warning': return 'pl-warning';
      default: return '';
    }
  }
}
