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
import { AlbumOrder } from '../../../shared/models/album-order.model';

@Component({
  selector: 'app-album-order-status-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    SelectModule,
    TextareaModule,
  ],
  templateUrl: './album-order-status-dialog.html',
  styleUrl: './album-order-status-dialog.scss',
})
export class AlbumOrderStatusDialog {
  private readonly fb = inject(FormBuilder);

  readonly visible = input<boolean>(false);
  readonly order = input<AlbumOrder | null>(null);
  readonly save = output<{ designStatus: AlbumOrder['designStatus']; orderStatus: AlbumOrder['orderStatus']; deliveryDate: string; notes: string }>();
  readonly cancel = output<void>();

  readonly designStatusOptions = [
    { label: 'Pending', value: 'Pending' },
    { label: 'In Design', value: 'In Design' },
    { label: 'Review', value: 'Review' },
    { label: 'Approved', value: 'Approved' },
    { label: 'Rejected', value: 'Rejected' },
  ];

  readonly orderStatusOptions = [
    { label: 'Not Ordered', value: 'Not Ordered' },
    { label: 'Ordered', value: 'Ordered' },
    { label: 'In Production', value: 'In Production' },
    { label: 'Ready', value: 'Ready' },
    { label: 'Delivered', value: 'Delivered' },
  ];

  readonly form = this.fb.nonNullable.group({
    designStatus: ['', [Validators.required]],
    orderStatus: ['', [Validators.required]],
    deliveryDate: [''],
    notes: [''],
  });

  constructor() {
    effect(() => {
      const o = this.order();
      if (o) {
        this.form.patchValue({
          designStatus: o.designStatus,
          orderStatus: o.orderStatus,
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
      designStatus: formValue.designStatus as AlbumOrder['designStatus'],
      orderStatus: formValue.orderStatus as AlbumOrder['orderStatus'],
      deliveryDate: formValue.deliveryDate,
      notes: formValue.notes,
    });
  }
}
