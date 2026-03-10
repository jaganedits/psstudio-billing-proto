import { Component, ChangeDetectionStrategy, inject, signal, computed, viewChild } from '@angular/core';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { Menu, MenuModule } from 'primeng/menu';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { DecimalPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ConfirmationService, MenuItem } from 'primeng/api';

import { Customer } from '../../../shared/models/customer.model';
import { CustomerService } from '../../../shared/services/customer.service';
import { CustomerForm } from '../customer-form/customer-form';

interface TabItem {
  label: string;
  value: string;
}

@Component({
  selector: 'app-customer-list',
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
    TooltipModule,
    DecimalPipe,
    RouterLink,
    CustomerForm,
  ],
  providers: [ConfirmationService],
  templateUrl: './customer-list.html',
  styleUrl: './customer-list.scss',
})
export class CustomerList {
  private readonly customerService = inject(CustomerService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly router = inject(Router);

  readonly allCustomers = this.customerService.customers;
  readonly totalCount = this.customerService.totalCount;

  readonly activeTab = signal<string>('all');

  readonly tabs: TabItem[] = [
    { label: 'All Customers', value: 'all' },
    { label: 'Active', value: 'Active' },
    { label: 'Inactive', value: 'Inactive' },
    { label: 'Deleted', value: 'Deleted' },
  ];

  readonly filteredCustomers = computed(() => {
    const tab = this.activeTab();
    const all = this.allCustomers();
    if (tab === 'all') return all;
    return all.filter((c) => c.status === tab);
  });

  readonly tabCounts = computed(() => {
    const all = this.allCustomers();
    return {
      all: all.length,
      Active: all.filter((c) => c.status === 'Active').length,
      Inactive: all.filter((c) => c.status === 'Inactive').length,
      Deleted: all.filter((c) => c.status === 'Deleted').length,
    } as Record<string, number>;
  });

  readonly selectedCustomer = signal<Customer | null>(null);
  readonly showForm = signal(false);
  readonly editingCustomer = signal<Customer | null>(null);

  readonly actionMenu = viewChild<Menu>('actionMenu');
  readonly menuItems = signal<MenuItem[]>([]);

  getStatusSeverity(status: string): 'success' | 'danger' | 'warn' | 'info' {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Inactive':
        return 'warn';
      case 'Deleted':
        return 'danger';
      default:
        return 'info';
    }
  }

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

  setTab(value: string): void {
    this.activeTab.set(value);
  }

  onFilter(table: Table, event: Event): void {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  openAddForm(): void {
    this.editingCustomer.set(null);
    this.showForm.set(true);
  }

  openEditForm(customer: Customer): void {
    this.editingCustomer.set(customer);
    this.showForm.set(true);
  }

  onFormSave(data: Customer | Omit<Customer, 'id'>): void {
    const editing = this.editingCustomer();
    if (editing) {
      this.customerService.updateCustomer(data as Customer);
    } else {
      this.customerService.addCustomer(data as Omit<Customer, 'id'>);
    }
    this.showForm.set(false);
  }

  onFormCancel(): void {
    this.showForm.set(false);
  }

  showActionMenu(event: Event, customer: Customer): void {
    this.selectedCustomer.set(customer);
    this.menuItems.set([
      {
        label: 'View Profile',
        icon: 'pi pi-user',
        command: () => this.router.navigate(['/customers', customer.id]),
      },
      {
        label: 'Edit Details',
        icon: 'pi pi-pencil',
        command: () => this.openEditForm(customer),
      },
      {
        label: 'Delete Customer',
        icon: 'pi pi-trash',
        command: () => this.confirmDelete(customer),
      },
    ]);
    this.actionMenu()?.toggle(event);
  }

  private confirmDelete(customer: Customer): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete ${customer.name}?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.customerService.deleteCustomer(customer.id),
    });
  }
}
