import { Component, ChangeDetectionStrategy, inject, signal, computed, viewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { Menu, MenuModule } from 'primeng/menu';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MenuItem } from 'primeng/api';

import { User } from '../../../shared/models/user.model';
import { UserService } from '../../../shared/services/user.service';

interface TabItem {
  label: string;
  value: string;
}

@Component({
  selector: 'app-user-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TableModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    MenuModule,
    IconFieldModule,
    InputIconModule,
    ConfirmDialogModule,
    RouterLink,
  ],
  providers: [ConfirmationService],
  templateUrl: './user-list.html',
  styleUrl: './user-list.scss',
})
export class UserList {
  private readonly userService = inject(UserService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly router = inject(Router);

  readonly allUsers = this.userService.users;
  readonly totalCount = this.userService.totalCount;

  readonly activeTab = signal<string>('all');

  readonly tabs: TabItem[] = [
    { label: 'All Users', value: 'all' },
    { label: 'Active', value: 'Active' },
    { label: 'Inactive', value: 'Inactive' },
  ];

  readonly filteredUsers = computed(() => {
    const tab = this.activeTab();
    const all = this.allUsers();
    if (tab === 'all') return all;
    return all.filter((u) => u.status === tab);
  });

  readonly tabCounts = computed(() => {
    const all = this.allUsers();
    return {
      all: all.length,
      Active: all.filter((u) => u.status === 'Active').length,
      Inactive: all.filter((u) => u.status === 'Inactive').length,
    } as Record<string, number>;
  });

  readonly actionMenu = viewChild<Menu>('actionMenu');
  readonly menuItems = signal<MenuItem[]>([]);

  private readonly avatarColors = [
    '#4945ff', '#328048', '#d9822f', '#7b79ff', '#0c75af',
    '#8e4fd0', '#d02b20', '#0c7547', '#ba5612', '#3d39e6',
  ];

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  getAvatarColor(name: string): string {
    let hash = 0;
    for (const ch of name) {
      hash = ch.charCodeAt(0) + ((hash << 5) - hash);
    }
    return this.avatarColors[Math.abs(hash) % this.avatarColors.length];
  }

  getRoleSeverity(role: string): 'info' | 'warn' | 'secondary' {
    switch (role) {
      case 'Admin':
        return 'info';
      case 'Staff':
        return 'warn';
      default:
        return 'secondary';
    }
  }

  getStatusSeverity(status: string): 'success' | 'danger' {
    return status === 'Active' ? 'success' : 'danger';
  }

  setTab(value: string): void {
    this.activeTab.set(value);
  }

  onFilter(table: Table, event: Event): void {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  openAddForm(): void {
    this.router.navigate(['/users/add']);
  }

  openEditForm(user: User): void {
    this.router.navigate(['/users/edit', user.id]);
  }

  showActionMenu(event: Event, user: User): void {
    this.menuItems.set([
      {
        label: 'Edit User',
        icon: 'pi pi-pencil',
        command: () => this.openEditForm(user),
      },
      {
        label: 'Deactivate',
        icon: 'pi pi-ban',
        command: () => this.confirmDeactivate(user),
        visible: user.status === 'Active',
      },
    ]);
    this.actionMenu()?.toggle(event);
  }

  private confirmDeactivate(user: User): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to deactivate ${user.name}?`,
      header: 'Confirm Deactivate',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.userService.deleteUser(user.id),
    });
  }
}
