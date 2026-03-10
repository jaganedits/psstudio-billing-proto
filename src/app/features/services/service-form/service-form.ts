import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  effect,
  signal,
  inject,
} from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import { ServiceItem } from '../../../shared/models/service.model';

@Component({
  selector: 'app-service-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    DialogModule,
  ],
  templateUrl: './service-form.html',
  styleUrl: './service-form.scss',
})
export class ServiceForm {
  private readonly fb = inject(FormBuilder);

  readonly visible = input<boolean>(false);
  readonly service = input<ServiceItem | null>(null);
  readonly save = output<any>();
  readonly cancel = output<void>();

  readonly isEditing = signal(false);

  readonly categories = [
    { label: 'Photography', value: 'Photography' },
    { label: 'Printing', value: 'Printing' },
    { label: 'Frames', value: 'Frames' },
    { label: 'Albums', value: 'Albums' },
    { label: 'Editing', value: 'Editing' },
  ];

  readonly units = [
    { label: 'per photo', value: 'per photo' },
    { label: 'per frame', value: 'per frame' },
    { label: 'per print', value: 'per print' },
    { label: 'per session', value: 'per session' },
    { label: 'per piece', value: 'per piece' },
  ];

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    category: ['', [Validators.required]],
    unit: ['', [Validators.required]],
    price: [0, [Validators.required]],
    tax: [0],
  });

  constructor() {
    effect(() => {
      const svc = this.service();
      if (svc) {
        this.isEditing.set(true);
        this.form.patchValue({
          name: svc.name,
          category: svc.category,
          unit: svc.unit,
          price: svc.price,
          tax: svc.tax,
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

    this.save.emit(this.form.getRawValue());
  }
}
