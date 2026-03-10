import { Injectable, signal, computed } from '@angular/core';
import { Expense } from '../models/expense.model';

const MOCK_EXPENSES: Expense[] = [
  {
    id: 1,
    date: 'January 5, 2026',
    category: 'Rent',
    description: 'Studio rent for January',
    amount: 25000,
    paymentMode: 'Bank Transfer',
    vendor: 'Prestige Properties',
    notes: 'Monthly studio space rent',
    status: 'Active',
  },
  {
    id: 2,
    date: 'January 12, 2026',
    category: 'Equipment',
    description: 'Canon 50mm f/1.4 lens',
    amount: 32500,
    paymentMode: 'Card',
    vendor: 'Camera House',
    notes: 'Portrait lens upgrade',
    status: 'Active',
  },
  {
    id: 3,
    date: 'January 18, 2026',
    category: 'Supplies',
    description: 'Backdrop paper rolls (3 colors)',
    amount: 3200,
    paymentMode: 'UPI',
    vendor: 'PhotoMart Supplies',
    notes: 'White, grey, and black seamless paper',
    status: 'Active',
  },
  {
    id: 4,
    date: 'February 2, 2026',
    category: 'Travel',
    description: 'Destination wedding - Goa travel',
    amount: 8500,
    paymentMode: 'UPI',
    vendor: 'MakeMyTrip',
    notes: 'Flight + hotel for 2-day wedding shoot',
    status: 'Active',
  },
  {
    id: 5,
    date: 'February 10, 2026',
    category: 'Marketing',
    description: 'Instagram & Facebook ads',
    amount: 5000,
    paymentMode: 'Card',
    vendor: 'Meta Platforms',
    notes: 'Monthly ad budget for lead generation',
    status: 'Active',
  },
  {
    id: 6,
    date: 'February 15, 2026',
    category: 'Utilities',
    description: 'Electricity bill - February',
    amount: 4200,
    paymentMode: 'UPI',
    vendor: 'BESCOM',
    notes: 'Studio electricity charges',
    status: 'Active',
  },
  {
    id: 7,
    date: 'February 22, 2026',
    category: 'Equipment',
    description: 'Godox AD600 Pro flash unit',
    amount: 45000,
    paymentMode: 'Bank Transfer',
    vendor: 'Camera House',
    notes: 'Outdoor strobe for location shoots',
    status: 'Deleted',
  },
  {
    id: 8,
    date: 'March 1, 2026',
    category: 'Rent',
    description: 'Studio rent for March',
    amount: 25000,
    paymentMode: 'Bank Transfer',
    vendor: 'Prestige Properties',
    notes: 'Monthly studio space rent',
    status: 'Active',
  },
  {
    id: 9,
    date: 'March 5, 2026',
    category: 'Other',
    description: 'Accounting software subscription',
    amount: 1500,
    paymentMode: 'Card',
    vendor: 'Zoho Books',
    notes: 'Annual plan - billed monthly',
    status: 'Active',
  },
  {
    id: 10,
    date: 'March 8, 2026',
    category: 'Supplies',
    description: 'Memory cards and batteries',
    amount: 6800,
    paymentMode: 'Cash',
    vendor: 'PhotoMart Supplies',
    notes: '4x 128GB SD cards + 6 camera batteries',
    status: 'Active',
  },
];

@Injectable({ providedIn: 'root' })
export class ExpenseService {
  private readonly expensesSignal = signal<Expense[]>(MOCK_EXPENSES);

  readonly expenses = this.expensesSignal.asReadonly();
  readonly totalCount = computed(() => this.expensesSignal().length);

  addExpense(expense: Omit<Expense, 'id'>): void {
    const newId = Math.max(...this.expensesSignal().map((e) => e.id), 0) + 1;
    this.expensesSignal.update((list) => [{ ...expense, id: newId }, ...list]);
  }

  updateExpense(updated: Expense): void {
    this.expensesSignal.update((list) =>
      list.map((e) => (e.id === updated.id ? { ...updated } : e))
    );
  }

  deleteExpense(id: number): void {
    this.expensesSignal.update((list) =>
      list.map((e) => (e.id === id ? { ...e, status: 'Deleted' as const } : e))
    );
  }
}
