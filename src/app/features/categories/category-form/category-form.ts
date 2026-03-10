import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  effect,
  signal,
  computed,
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
import { Category } from '../../../shared/models/category.model';

@Component({
  selector: 'app-category-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
  ],
  templateUrl: './category-form.html',
  styleUrl: './category-form.scss',
})
export class CategoryForm {
  private readonly fb = inject(FormBuilder);

  readonly visible = input<boolean>(false);
  readonly category = input<Category | null>(null);
  readonly save = output<any>();
  readonly cancel = output<void>();

  readonly isEditing = computed(() => this.category() !== null);

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
  });

  constructor() {
    effect(() => {
      const cat = this.category();
      if (cat) {
        this.form.patchValue({
          name: cat.name,
          description: cat.description,
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

    this.save.emit(this.form.getRawValue());
  }
}
