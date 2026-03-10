import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  effect,
  inject,
} from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { FrameOrder } from '../../../shared/models/frame-order.model';

@Component({
  selector: 'app-frame-order-status-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    SelectModule,
    TextareaModule,
  ],
  templateUrl: './frame-order-status-dialog.html',
  styleUrl: './frame-order-status-dialog.scss',
})
export class FrameOrderStatusDialog {
  private readonly fb = inject(FormBuilder);

  readonly visible = input<boolean>(false);
  readonly order = input<FrameOrder | null>(null);
  readonly save = output<{ status: FrameOrder['status']; deliveryDate: string; notes: string }>();
  readonly cancel = output<void>();

  readonly statusOptions = [
    { label: 'Ordered', value: 'Ordered' },
    { label: 'In Progress', value: 'In Progress' },
    { label: 'Ready', value: 'Ready' },
    { label: 'Delivered', value: 'Delivered' },
    { label: 'Cancelled', value: 'Cancelled' },
  ];

  readonly form = this.fb.nonNullable.group({
    status: ['', [Validators.required]],
    deliveryDate: [''],
    notes: [''],
  });

  constructor() {
    effect(() => {
      const o = this.order();
      if (o) {
        this.form.patchValue({
          status: o.status,
          deliveryDate: o.deliveryDate,
          notes: o.notes,
        });
      } else {
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
    this.save.emit({
      status: formValue.status as FrameOrder['status'],
      deliveryDate: formValue.deliveryDate,
      notes: formValue.notes,
    });
  }
}
