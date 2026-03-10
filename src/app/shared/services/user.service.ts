import { Injectable, signal, computed } from '@angular/core';
import { User, LoginActivity } from '../models/user.model';

const MOCK_USERS: User[] = [
  {
    id: 1,
    name: 'Jagan',
    email: 'jagan@pscreative.com',
    phone: '9876543210',
    role: 'Admin',
    status: 'Active',
    profileImage: '',
    addDate: 'January 1, 2025',
    lastLogin: 'March 10, 2026',
  },
  {
    id: 2,
    name: 'Priya Sharma',
    email: 'priya@pscreative.com',
    phone: '9876543211',
    role: 'Staff',
    status: 'Active',
    profileImage: '',
    addDate: 'March 15, 2025',
    lastLogin: 'March 9, 2026',
  },
  {
    id: 3,
    name: 'Ravi Kumar',
    email: 'ravi@pscreative.com',
    phone: '9876543212',
    role: 'Staff',
    status: 'Active',
    profileImage: '',
    addDate: 'June 10, 2025',
    lastLogin: 'March 8, 2026',
  },
  {
    id: 4,
    name: 'Anita Desai',
    email: 'anita@pscreative.com',
    phone: '9876543213',
    role: 'Viewer',
    status: 'Inactive',
    profileImage: '',
    addDate: 'August 20, 2025',
    lastLogin: 'January 15, 2026',
  },
];

const MOCK_LOGIN_ACTIVITY: LoginActivity[] = [
  { id: 1, userId: 1, loginTime: 'March 10, 2026 08:30 AM', logoutTime: '', ipAddress: '192.168.1.100', device: 'Chrome / Windows 11', status: 'Success', failureReason: '' },
  { id: 2, userId: 2, loginTime: 'March 9, 2026 09:15 AM', logoutTime: 'March 9, 2026 06:30 PM', ipAddress: '192.168.1.101', device: 'Firefox / macOS', status: 'Success', failureReason: '' },
  { id: 3, userId: 1, loginTime: 'March 9, 2026 07:45 AM', logoutTime: 'March 9, 2026 07:00 PM', ipAddress: '192.168.1.100', device: 'Chrome / Windows 11', status: 'Success', failureReason: '' },
  { id: 4, userId: 3, loginTime: 'March 8, 2026 10:00 AM', logoutTime: 'March 8, 2026 05:00 PM', ipAddress: '192.168.1.102', device: 'Safari / iPhone', status: 'Success', failureReason: '' },
  { id: 5, userId: 1, loginTime: 'March 8, 2026 08:00 AM', logoutTime: 'March 8, 2026 06:45 PM', ipAddress: '192.168.1.100', device: 'Chrome / Windows 11', status: 'Success', failureReason: '' },
  { id: 6, userId: 4, loginTime: 'March 7, 2026 11:00 AM', logoutTime: '', ipAddress: '10.0.0.50', device: 'Chrome / Android', status: 'Failed', failureReason: 'Invalid password' },
  { id: 7, userId: 2, loginTime: 'March 7, 2026 09:00 AM', logoutTime: 'March 7, 2026 05:30 PM', ipAddress: '192.168.1.101', device: 'Firefox / macOS', status: 'Success', failureReason: '' },
  { id: 8, userId: 1, loginTime: 'March 7, 2026 07:30 AM', logoutTime: 'March 7, 2026 07:15 PM', ipAddress: '192.168.1.100', device: 'Chrome / Windows 11', status: 'Success', failureReason: '' },
  { id: 9, userId: 3, loginTime: 'March 6, 2026 10:30 AM', logoutTime: 'March 6, 2026 04:00 PM', ipAddress: '192.168.1.102', device: 'Safari / iPhone', status: 'Success', failureReason: '' },
  { id: 10, userId: 4, loginTime: 'March 5, 2026 02:00 PM', logoutTime: '', ipAddress: '10.0.0.50', device: 'Chrome / Android', status: 'Failed', failureReason: 'Account inactive' },
  { id: 11, userId: 1, loginTime: 'March 5, 2026 08:15 AM', logoutTime: 'March 5, 2026 06:00 PM', ipAddress: '192.168.1.100', device: 'Chrome / Windows 11', status: 'Success', failureReason: '' },
  { id: 12, userId: 2, loginTime: 'March 4, 2026 09:30 AM', logoutTime: 'March 4, 2026 06:00 PM', ipAddress: '192.168.1.101', device: 'Firefox / macOS', status: 'Success', failureReason: '' },
];

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly usersSignal = signal<User[]>(MOCK_USERS);

  readonly users = this.usersSignal.asReadonly();
  readonly totalCount = computed(() => this.usersSignal().length);

  getLoginActivity(userId: number): LoginActivity[] {
    return MOCK_LOGIN_ACTIVITY.filter((a) => a.userId === userId);
  }

  getAllLoginActivity(): LoginActivity[] {
    return MOCK_LOGIN_ACTIVITY;
  }

  addUser(user: Omit<User, 'id'>): void {
    const newId = Math.max(...this.usersSignal().map((u) => u.id), 0) + 1;
    this.usersSignal.update((list) => [{ ...user, id: newId }, ...list]);
  }

  updateUser(updated: User): void {
    this.usersSignal.update((list) =>
      list.map((u) => (u.id === updated.id ? { ...updated } : u))
    );
  }

  deleteUser(id: number): void {
    this.usersSignal.update((list) =>
      list.map((u) => (u.id === id ? { ...u, status: 'Inactive' as const } : u))
    );
  }
}
