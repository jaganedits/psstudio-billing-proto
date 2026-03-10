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
import { Frame } from '../../../shared/models/frame.model';

@Component({
  selector: 'app-frame-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    SelectModule,
  ],
  templateUrl: './frame-form.html',
  styleUrl: './frame-form.scss',
})
export class FrameForm {
  private readonly fb = inject(FormBuilder);

  readonly visible = input<boolean>(false);
  readonly frame = input<Frame | null>(null);
  readonly save = output<Frame | Omit<Frame, 'id'>>();
  readonly cancel = output<void>();

  readonly isEditing = signal(false);

  readonly sizeOptions = ['4x6', '5x7', '6x8', '8x10', '8x12', '10x14', '12x18', '16x24', '18x24', '24x36'];
  readonly borderOptions = ['½ inch', '1 inch', '2 inch', '3 inch'];
  readonly materialOptions = ['Wood', 'Metal', 'Acrylic', 'Fiber', 'Glass'];

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    size: ['', [Validators.required]],
    border: ['', [Validators.required]],
    material: ['', [Validators.required]],
    price: [0, [Validators.required, Validators.min(1)]],
  });

  constructor() {
    effect(() => {
      const f = this.frame();
      if (f) {
        this.isEditing.set(true);
        this.form.patchValue({
          name: f.name,
          size: f.size,
          border: f.border,
          material: f.material,
          price: f.price,
        });
      } else {
        this.isEditing.set(false);
        this.form.reset({ name: '', size: '', border: '', material: '', price: 0 });
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.getRawValue();
    const f = this.frame();

    if (f) {
      this.save.emit({ ...f, ...formValue });
    } else {
      this.save.emit({
        ...formValue,
        status: 'Active' as const,
      });
    }
  }
}
