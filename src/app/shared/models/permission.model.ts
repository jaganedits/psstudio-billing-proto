export interface PermissionActions {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

export interface Permission {
  module: string;
  actions: PermissionActions;
}

export interface RolePermission {
  role: 'Admin' | 'Staff' | 'Viewer';
  permissions: Permission[];
}
