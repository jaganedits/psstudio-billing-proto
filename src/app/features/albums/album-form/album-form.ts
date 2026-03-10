import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
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
import { DecimalPipe } from '@angular/common';
import { Album } from '../../../shared/models/album.model';

@Component({
  selector: 'app-album-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    SelectModule,
    DecimalPipe,
  ],
  templateUrl: './album-form.html',
  styleUrl: './album-form.scss',
})
export class AlbumForm {
  private readonly fb = inject(FormBuilder);

  readonly visible = input<boolean>(false);
  readonly album = input<Album | null>(null);
  readonly save = output<Album | Omit<Album, 'id'>>();
  readonly cancel = output<void>();

  readonly isEditing = signal(false);
  readonly previewPages = signal(20);

  readonly albumTypeOptions = ['Classic', 'Premium', 'Flush Mount', 'Magazine', 'Canvas'];
  readonly sizeOptions = ['8x10', '10x14', '10x24', '12x18', '12x36'];
  readonly coverTypeOptions = ['Hard Cover', 'Leather', 'Padded', 'Acrylic', 'Wood'];

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    albumType: ['', [Validators.required]],
    size: ['', [Validators.required]],
    coverType: ['', [Validators.required]],
    basePages: [20, [Validators.required, Validators.min(1)]],
    basePrice: [0, [Validators.required, Validators.min(1)]],
    extraPagePrice: [0, [Validators.required, Validators.min(0)]],
  });

  readonly previewPrice = computed(() => {
    const basePrice = this.form.getRawValue().basePrice || 0;
    const basePages = this.form.getRawValue().basePages || 0;
    const extraPagePrice = this.form.getRawValue().extraPagePrice || 0;
    const totalPages = this.previewPages();
    return basePrice + Math.max(0, totalPages - basePages) * extraPagePrice;
  });

  constructor() {
    effect(() => {
      const a = this.album();
      if (a) {
        this.isEditing.set(true);
        this.form.patchValue({
          name: a.name,
          albumType: a.albumType,
          size: a.size,
          coverType: a.coverType,
          basePages: a.basePages,
          basePrice: a.basePrice,
          extraPagePrice: a.extraPagePrice,
        });
        this.previewPages.set(a.basePages);
      } else {
        this.isEditing.set(false);
        this.form.reset({ name: '', albumType: '', size: '', coverType: '', basePages: 20, basePrice: 0, extraPagePrice: 0 });
        this.previewPages.set(20);
      }
    });
  }

  onPreviewPagesChange(event: Event): void {
    const value = parseInt((event.target as HTMLInputElement).value, 10);
    this.previewPages.set(isNaN(value) ? 0 : value);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.getRawValue();
    const a = this.album();

    if (a) {
      this.save.emit({ ...a, ...formValue });
    } else {
      this.save.emit({
        ...formValue,
        status: 'Active' as const,
      });
    }
  }
}
