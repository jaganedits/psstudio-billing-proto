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
import { RouterLink } from '@angular/router';
import { ConfirmationService, MenuItem } from 'primeng/api';

import { ServiceItem } from '../../../shared/models/service.model';
import { ServiceService } from '../../../shared/services/service.service';
import { ServiceForm } from '../service-form/service-form';

interface TabItem {
  label: string;
  value: string;
}

@Component({
  selector: 'app-service-list',
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
    ServiceForm,
  ],
  providers: [ConfirmationService],
  templateUrl: './service-list.html',
  styleUrl: './service-list.scss',
})
export class ServiceList {
  private readonly serviceService = inject(ServiceService);
  private readonly confirmationService = inject(ConfirmationService);

  readonly allServices = this.serviceService.services;
  readonly totalCount = this.serviceService.totalCount;

  readonly activeTab = signal<string>('all');
  readonly showForm = signal(false);
  readonly editingService = signal<ServiceItem | null>(null);

  readonly tabs: TabItem[] = [
    { label: 'All Services', value: 'all' },
    { label: 'Active', value: 'Active' },
    { label: 'Inactive', value: 'Inactive' },
  ];

  readonly filteredServices = computed(() => {
    const tab = this.activeTab();
    const all = this.allServices();
    if (tab === 'all') return all;
    return all.filter((s) => s.status === tab);
  });

  readonly tabCounts = computed(() => {
    const all = this.allServices();
    return {
      all: all.length,
      Active: all.filter((s) => s.status === 'Active').length,
      Inactive: all.filter((s) => s.status === 'Inactive').length,
    } as Record<string, number>;
  });

  readonly selectedService = signal<ServiceItem | null>(null);

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
    this.editingService.set(null);
    this.showForm.set(true);
  }

  openEditForm(service: ServiceItem): void {
    this.editingService.set(service);
    this.showForm.set(true);
  }

  onFormSave(data: any): void {
    const editing = this.editingService();
    if (editing) {
      this.serviceService.updateService({
        ...editing,
        ...data,
      });
    } else {
      this.serviceService.addService({
        ...data,
        description: '',
        status: 'Active',
      });
    }
    this.showForm.set(false);
  }

  onFormCancel(): void {
    this.showForm.set(false);
  }

  showActionMenu(event: Event, service: ServiceItem): void {
    this.selectedService.set(service);
    this.menuItems.set([
      {
        label: 'View',
        icon: 'pi pi-eye',
        command: () => this.openEditForm(service),
      },
      {
        label: 'Edit',
        icon: 'pi pi-pencil',
        command: () => this.openEditForm(service),
      },
      {
        label: 'Delete',
        icon: 'pi pi-trash',
        command: () => this.confirmDelete(service),
      },
    ]);
    this.actionMenu()?.toggle(event);
  }

  private confirmDelete(service: ServiceItem): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete ${service.name}?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.serviceService.deleteService(service.id),
    });
  }
}
