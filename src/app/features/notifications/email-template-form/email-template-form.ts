import {
  Component,
  ChangeDetectionStrategy,
  signal,
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
import { TextareaModule } from 'primeng/textarea';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { EmailTemplate } from '../../../shared/models/email-template.model';

@Component({
  selector: 'app-email-template-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    TextareaModule,
    ToggleSwitchModule,
  ],
  templateUrl: './email-template-form.html',
  styleUrl: './email-template-form.scss',
})
export class EmailTemplateForm {
  private readonly fb = inject(FormBuilder);

  readonly visible = input<boolean>(false);
  readonly template = input<EmailTemplate | null>(null);
  readonly save = output<EmailTemplate | Omit<EmailTemplate, 'id'>>();
  readonly cancel = output<void>();

  readonly isEditing = signal(false);
  readonly templateVariables = signal<string[]>([]);

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    subject: ['', [Validators.required]],
    body: ['', [Validators.required]],
    isActive: [true],
  });

  constructor() {
    effect(() => {
      const t = this.template();
      if (t) {
        this.isEditing.set(true);
        this.form.patchValue({
          name: t.name,
          subject: t.subject,
          body: t.body,
          isActive: t.status === 'Active',
        });
        this.templateVariables.set(t.variables);
      } else {
        this.isEditing.set(false);
        this.form.reset({ name: '', subject: '', body: '', isActive: true });
        this.templateVariables.set([]);
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.getRawValue();
    const t = this.template();
    const status: 'Active' | 'Inactive' = formValue.isActive ? 'Active' : 'Inactive';

    // Extract variables from body
    const variableMatches = formValue.body.match(/\{\{[^}]+\}\}/g) || [];
    const variables = [...new Set(variableMatches)];

    if (t) {
      this.save.emit({
        ...t,
        name: formValue.name,
        subject: formValue.subject,
        body: formValue.body,
        variables,
        status,
      });
    } else {
      this.save.emit({
        name: formValue.name,
        subject: formValue.subject,
        body: formValue.body,
        variables,
        status,
      });
    }
  }
}
