import {
  Component,
  ChangeDetectionStrategy,
  signal,
  input,
  output,
  effect,
} from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { TextareaModule } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { Expense } from '../../../shared/models/expense.model';

@Component({
  selector: 'app-expense-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    SelectModule,
    DatePickerModule,
    TextareaModule,
    InputNumberModule,
  ],
  templateUrl: './expense-form.html',
  styleUrl: './expense-form.scss',
})
export class ExpenseForm {
  private readonly fb = inject(FormBuilder);

  readonly visible = input<boolean>(false);
  readonly expense = input<Expense | null>(null);
  readonly save = output<Expense | Omit<Expense, 'id'>>();
  readonly cancel = output<void>();

  readonly isEditing = signal(false);

  readonly categories = [
    { label: 'Rent', value: 'Rent' },
    { label: 'Equipment', value: 'Equipment' },
    { label: 'Supplies', value: 'Supplies' },
    { label: 'Travel', value: 'Travel' },
    { label: 'Marketing', value: 'Marketing' },
    { label: 'Utilities', value: 'Utilities' },
    { label: 'Other', value: 'Other' },
  ];

  readonly paymentModes = [
    { label: 'Cash', value: 'Cash' },
    { label: 'UPI', value: 'UPI' },
    { label: 'Card', value: 'Card' },
    { label: 'Bank Transfer', value: 'Bank Transfer' },
  ];

  readonly form = this.fb.nonNullable.group({
    date: [null as Date | null, [Validators.required]],
    category: ['', [Validators.required]],
    description: ['', [Validators.required, Validators.minLength(2)]],
    amount: [null as number | null, [Validators.required, Validators.min(1)]],
    paymentMode: ['', [Validators.required]],
    vendor: [''],
    notes: [''],
  });

  constructor() {
    effect(() => {
      const e = this.expense();
      if (e) {
        this.isEditing.set(true);
        this.form.patchValue({
          date: new Date(e.date),
          category: e.category,
          description: e.description,
          amount: e.amount,
          paymentMode: e.paymentMode,
          vendor: e.vendor,
          notes: e.notes,
        });
      } else {
        this.isEditing.set(false);
        this.form.reset();
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.getRawValue();
    const e = this.expense();

    const dateStr = formValue.date
      ? formValue.date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : '';

    if (e) {
      this.save.emit({
        ...e,
        date: dateStr,
        category: formValue.category as Expense['category'],
        description: formValue.description,
        amount: formValue.amount ?? 0,
        paymentMode: formValue.paymentMode as Expense['paymentMode'],
        vendor: formValue.vendor,
        notes: formValue.notes,
      });
    } else {
      this.save.emit({
        date: dateStr,
        category: formValue.category as Expense['category'],
        description: formValue.description,
        amount: formValue.amount ?? 0,
        paymentMode: formValue.paymentMode as Expense['paymentMode'],
        vendor: formValue.vendor,
        notes: formValue.notes,
        status: 'Active',
      });
    }
  }
}
