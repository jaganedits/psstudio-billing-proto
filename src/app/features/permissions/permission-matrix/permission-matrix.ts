import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService } from 'primeng/api';

import { PermissionService } from '../../../shared/services/permission.service';

type RoleType = 'Admin' | 'Staff' | 'Viewer';

interface TabItem {
  label: string;
  value: RoleType;
}

@Component({
  selector: 'app-permission-matrix',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TitleCasePipe,
    FormsModule,
    CheckboxModule,
    ButtonModule,
    ConfirmDialogModule,
    TooltipModule,
  ],
  providers: [ConfirmationService],
  templateUrl: './permission-matrix.html',
  styleUrl: './permission-matrix.scss',
})
export class PermissionMatrix {
  private readonly permissionService = inject(PermissionService);
  private readonly confirmationService = inject(ConfirmationService);

  readonly activeRole = signal<RoleType>('Admin');

  readonly tabs: TabItem[] = [
    { label: 'Admin', value: 'Admin' },
    { label: 'Staff', value: 'Staff' },
    { label: 'Viewer', value: 'Viewer' },
  ];

  readonly actions = ['view', 'create', 'edit', 'delete'] as const;

  readonly activePermissions = computed(() => {
    const role = this.activeRole();
    const rolePermission = this.permissionService.permissions().find((rp) => rp.role === role);
    return rolePermission?.permissions ?? [];
  });

  setRole(role: RoleType): void {
    this.activeRole.set(role);
  }

  isDisabled(): boolean {
    return this.activeRole() === 'Admin';
  }

  getActionValue(moduleIndex: number, action: string): boolean {
    const permissions = this.activePermissions();
    if (moduleIndex < 0 || moduleIndex >= permissions.length) return false;
    return permissions[moduleIndex].actions[action as keyof typeof permissions[0]['actions']];
  }

  onPermissionChange(module: string, action: string, value: boolean): void {
    this.permissionService.updatePermission(this.activeRole(), module, action, value);
  }

  confirmReset(): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to reset all permissions to their default values?',
      header: 'Reset Permissions',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.permissionService.resetToDefaults(),
    });
  }
}
