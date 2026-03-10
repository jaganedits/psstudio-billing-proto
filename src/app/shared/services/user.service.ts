import { Injectable, signal, computed } from '@angular/core';
import { User } from '../models/user.model';

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

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly usersSignal = signal<User[]>(MOCK_USERS);

  readonly users = this.usersSignal.asReadonly();
  readonly totalCount = computed(() => this.usersSignal().length);

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
