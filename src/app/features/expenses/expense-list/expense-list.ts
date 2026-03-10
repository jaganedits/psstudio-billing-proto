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
import { RouterLink } from '@angular/router';
import { ConfirmationService, MenuItem } from 'primeng/api';

import { Expense } from '../../../shared/models/expense.model';
import { ExpenseService } from '../../../shared/services/expense.service';
import { ExpenseForm } from '../expense-form/expense-form';

interface TabItem {
  label: string;
  value: string;
}

@Component({
  selector: 'app-expense-list',
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
    ExpenseForm,
  ],
  providers: [ConfirmationService],
  templateUrl: './expense-list.html',
  styleUrl: './expense-list.scss',
})
export class ExpenseList {
  private readonly expenseService = inject(ExpenseService);
  private readonly confirmationService = inject(ConfirmationService);

  readonly allExpenses = this.expenseService.expenses;
  readonly totalCount = this.expenseService.totalCount;

  readonly activeTab = signal<string>('all');

  readonly tabs: TabItem[] = [
    { label: 'All Expenses', value: 'all' },
    { label: 'Active', value: 'Active' },
    { label: 'Deleted', value: 'Deleted' },
  ];

  readonly filteredExpenses = computed(() => {
    const tab = this.activeTab();
    const all = this.allExpenses();
    if (tab === 'all') return all;
    return all.filter((e) => e.status === tab);
  });

  readonly tabCounts = computed(() => {
    const all = this.allExpenses();
    return {
      all: all.length,
      Active: all.filter((e) => e.status === 'Active').length,
      Deleted: all.filter((e) => e.status === 'Deleted').length,
    } as Record<string, number>;
  });

  readonly totalAmount = computed(() => {
    return this.filteredExpenses()
      .filter((e) => e.status === 'Active')
      .reduce((sum, e) => sum + e.amount, 0);
  });

  readonly selectedExpense = signal<Expense | null>(null);
  readonly showForm = signal(false);
  readonly editingExpense = signal<Expense | null>(null);

  readonly actionMenu = viewChild<Menu>('actionMenu');
  readonly menuItems = signal<MenuItem[]>([]);

  getStatusSeverity(status: string): 'success' | 'danger' | 'warn' | 'info' {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Deleted':
        return 'danger';
      default:
        return 'info';
    }
  }

  getCategorySeverity(category: string): 'success' | 'danger' | 'warn' | 'info' | 'secondary' | 'contrast' {
    switch (category) {
      case 'Rent':
        return 'info';
      case 'Equipment':
        return 'warn';
      case 'Supplies':
        return 'success';
      case 'Travel':
        return 'contrast';
      case 'Marketing':
        return 'secondary';
      case 'Utilities':
        return 'danger';
      default:
        return 'info';
    }
  }

  getPaymentModeIcon(mode: string): string {
    switch (mode) {
      case 'Cash':
        return 'pi pi-wallet';
      case 'UPI':
        return 'pi pi-mobile';
      case 'Card':
        return 'pi pi-credit-card';
      case 'Bank Transfer':
        return 'pi pi-building-columns';
      default:
        return 'pi pi-money-bill';
    }
  }

  setTab(value: string): void {
    this.activeTab.set(value);
  }

  onFilter(table: Table, event: Event): void {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  openAddForm(): void {
    this.editingExpense.set(null);
    this.showForm.set(true);
  }

  openEditForm(expense: Expense): void {
    this.editingExpense.set(expense);
    this.showForm.set(true);
  }

  onFormSave(data: Expense | Omit<Expense, 'id'>): void {
    const editing = this.editingExpense();
    if (editing) {
      this.expenseService.updateExpense(data as Expense);
    } else {
      this.expenseService.addExpense(data as Omit<Expense, 'id'>);
    }
    this.showForm.set(false);
  }

  onFormCancel(): void {
    this.showForm.set(false);
  }

  showActionMenu(event: Event, expense: Expense): void {
    this.selectedExpense.set(expense);
    this.menuItems.set([
      {
        label: 'Edit Expense',
        icon: 'pi pi-pencil',
        command: () => this.openEditForm(expense),
      },
      {
        label: 'Delete Expense',
        icon: 'pi pi-trash',
        command: () => this.confirmDelete(expense),
      },
    ]);
    this.actionMenu()?.toggle(event);
  }

  private confirmDelete(expense: Expense): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${expense.description}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.expenseService.deleteExpense(expense.id),
    });
  }
}
