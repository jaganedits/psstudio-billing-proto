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
import { Customer } from '../../../shared/models/customer.model';

@Component({
  selector: 'app-customer-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
  ],
  templateUrl: './customer-form.html',
  styleUrl: './customer-form.scss',
})
export class CustomerForm {
  private readonly fb = inject(FormBuilder);

  readonly visible = input<boolean>(false);
  readonly customer = input<Customer | null>(null);
  readonly save = output<Customer | Omit<Customer, 'id'>>();
  readonly cancel = output<void>();

  readonly isEditing = signal(false);

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
    alternatePhone: [''],
    email: ['', [Validators.email]],
    city: [''],
  });

  constructor() {
    effect(() => {
      const c = this.customer();
      if (c) {
        this.isEditing.set(true);
        this.form.patchValue({
          name: c.name,
          phone: c.phone,
          alternatePhone: c.alternatePhone,
          email: c.email,
          city: c.city,
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
    const c = this.customer();

    if (c) {
      this.save.emit({ ...c, ...formValue });
    } else {
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      this.save.emit({
        ...formValue,
        address: '',
        notes: '',
        status: 'Active',
        totalOrders: 0,
        pendingBalance: 0,
        addDate: dateStr,
        lastVisit: dateStr,
      });
    }
  }
}
