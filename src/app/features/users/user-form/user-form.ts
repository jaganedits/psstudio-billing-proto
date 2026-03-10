import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { PasswordModule } from 'primeng/password';
import { AbstractControl, ValidationErrors } from '@angular/forms';

import { UserService } from '../../../shared/services/user.service';
import { User } from '../../../shared/models/user.model';

@Component({
  selector: 'app-user-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, InputTextModule, ButtonModule, SelectModule, PasswordModule, RouterLink],
  templateUrl: './user-form.html',
  styleUrl: './user-form.scss',
})
export class UserForm {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly userService = inject(UserService);

  readonly editingUser = signal<User | null>(null);
  readonly profileImagePreview = signal<string>('');
  readonly roleOptions = ['Admin', 'Staff', 'Viewer'];
  readonly statusOptions = ['Active', 'Inactive'];

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    password: ['', [Validators.minLength(6)]],
    confirmPassword: [''],
    role: ['Staff' as string, [Validators.required]],
    status: ['Active' as string],
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
    this.form.addValidators(UserForm.passwordMatchValidator);
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      // Password required for new users
      this.form.get('password')?.addValidators(Validators.required);
      this.form.get('password')?.updateValueAndValidity();
    }
    if (id) {
      const user = this.userService.users().find((u) => u.id === +id);
      if (user) {
        this.editingUser.set(user);
        if (user.profileImage) {
          this.profileImagePreview.set(user.profileImage);
        }
        this.form.patchValue({
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          status: user.status,
        });
      }
    }
  }

  get pageTitle(): string {
    return this.editingUser() ? 'Edit User' : 'Add User';
  }

  isEditing(): boolean {
    return !!this.editingUser();
  }

  onImageSelect(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return; // Max 2MB
    const reader = new FileReader();
    reader.onload = () => {
      this.profileImagePreview.set(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  removeImage(): void {
    this.profileImagePreview.set('');
  }

  onCancel(): void {
    this.router.navigate(['/users']);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const val = this.form.getRawValue();
    const editing = this.editingUser();
    if (editing) {
      this.userService.updateUser({
        ...editing,
        ...val,
        role: val.role as User['role'],
        status: val.status as User['status'],
        profileImage: this.profileImagePreview(),
      });
    } else {
      this.userService.addUser({
        ...val,
        role: val.role as User['role'],
        status: val.status as User['status'],
        profileImage: this.profileImagePreview(),
        addDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        lastLogin: '-',
      } as Omit<User, 'id'>);
    }
    this.router.navigate(['/users']);
  }
}
