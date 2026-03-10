import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { AbstractControl, ValidationErrors } from '@angular/forms';

import { UserService } from '../../shared/services/user.service';

@Component({
  selector: 'app-profile',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, InputTextModule, ButtonModule, PasswordModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);

  readonly profileImagePreview = signal<string>('');
  readonly saveSuccess = signal(false);

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    password: ['', [Validators.minLength(6)]],
    confirmPassword: [''],
  });

  private static passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    if (password && confirm && password !== confirm) {
      group.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  constructor() {
    this.form.addValidators(Profile.passwordMatchValidator);
    // Load current user (first Admin user as logged-in user)
    const currentUser = this.userService.users().find((u) => u.role === 'Admin');
    if (currentUser) {
      this.form.patchValue({
        name: currentUser.name,
        email: currentUser.email,
        phone: currentUser.phone,
      });
      if (currentUser.profileImage) {
        this.profileImagePreview.set(currentUser.profileImage);
      }
    }
  }

  onImageSelect(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = () => {
      this.profileImagePreview.set(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  removeImage(): void {
    this.profileImagePreview.set('');
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const val = this.form.getRawValue();
    const currentUser = this.userService.users().find((u) => u.role === 'Admin');
    if (currentUser) {
      this.userService.updateUser({
        ...currentUser,
        name: val.name,
        email: val.email,
        phone: val.phone,
        profileImage: this.profileImagePreview(),
      });
      this.saveSuccess.set(true);
      setTimeout(() => this.saveSuccess.set(false), 3000);
    }
  }
}
