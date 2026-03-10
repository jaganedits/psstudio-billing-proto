import { Injectable, signal } from '@angular/core';
import { RolePermission } from '../models/permission.model';

const MODULES = ['Customers', 'Services', 'Packages', 'Frames', 'Albums', 'Bookings', 'Quotations', 'Invoices', 'Payments', 'Deliveries', 'Expenses', 'Reports', 'Users', 'Settings'];

const MOCK_PERMISSIONS: RolePermission[] = [
  {
    role: 'Admin',
    permissions: MODULES.map((module) => ({
      module,
      actions: { view: true, create: true, edit: true, delete: true },
    })),
  },
  {
    role: 'Staff',
    permissions: MODULES.map((module) => ({
      module,
      actions: {
        view: true,
        create: !['Users', 'Settings', 'Reports'].includes(module),
        edit: !['Users', 'Settings', 'Reports'].includes(module),
        delete: false,
      },
    })),
  },
  {
    role: 'Viewer',
    permissions: MODULES.map((module) => ({
      module,
      actions: { view: true, create: false, edit: false, delete: false },
    })),
  },
];

@Injectable({ providedIn: 'root' })
export class PermissionService {
  private readonly permissionsSignal = signal<RolePermission[]>(MOCK_PERMISSIONS);

  readonly permissions = this.permissionsSignal.asReadonly();

  getPermissionsForRole(role: string): RolePermission | undefined {
    return this.permissionsSignal().find((rp) => rp.role === role);
  }

  updatePermission(role: string, module: string, action: string, value: boolean): void {
    this.permissionsSignal.update((list) =>
      list.map((rp) => {
        if (rp.role !== role) return rp;
        return {
          ...rp,
          permissions: rp.permissions.map((p) => {
            if (p.module !== module) return p;
            return { ...p, actions: { ...p.actions, [action]: value } };
          }),
        };
      })
    );
  }

  resetToDefaults(): void {
    this.permissionsSignal.set(MOCK_PERMISSIONS.map((rp) => ({
      ...rp,
      permissions: rp.permissions.map((p) => ({ ...p, actions: { ...p.actions } })),
    })));
  }
}
