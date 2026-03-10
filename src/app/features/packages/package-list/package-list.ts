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

import { Package } from '../../../shared/models/package.model';
import { PackageService } from '../../../shared/services/package.service';

interface TabItem {
  label: string;
  value: string;
}

@Component({
  selector: 'app-package-list',
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
  ],
  providers: [ConfirmationService],
  templateUrl: './package-list.html',
  styleUrl: './package-list.scss',
})
export class PackageList {
  private readonly packageService = inject(PackageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly router = inject(Router);

  readonly allPackages = this.packageService.packages;
  readonly totalCount = this.packageService.totalCount;

  readonly activeTab = signal<string>('all');

  readonly tabs: TabItem[] = [
    { label: 'All Packages', value: 'all' },
    { label: 'Active', value: 'Active' },
    { label: 'Inactive', value: 'Inactive' },
  ];

  readonly filteredPackages = computed(() => {
    const tab = this.activeTab();
    const all = this.allPackages();
    if (tab === 'all') return all;
    return all.filter((p) => p.status === tab);
  });

  readonly tabCounts = computed(() => {
    const all = this.allPackages();
    return {
      all: all.length,
      Active: all.filter((p) => p.status === 'Active').length,
      Inactive: all.filter((p) => p.status === 'Inactive').length,
    } as Record<string, number>;
  });

  readonly selectedPackage = signal<Package | null>(null);

  readonly actionMenu = viewChild<Menu>('actionMenu');
  readonly menuItems = signal<MenuItem[]>([]);

  getStatusSeverity(status: string): 'success' | 'danger' | 'warn' | 'info' {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Inactive':
        return 'warn';
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
    this.router.navigate(['/packages/add']);
  }

  openEditForm(pkg: Package): void {
    this.router.navigate(['/packages/edit', pkg.id]);
  }

  showActionMenu(event: Event, pkg: Package): void {
    this.selectedPackage.set(pkg);
    this.menuItems.set([
      {
        label: 'View',
        icon: 'pi pi-eye',
        command: () => this.openEditForm(pkg),
      },
      {
        label: 'Edit',
        icon: 'pi pi-pencil',
        command: () => this.openEditForm(pkg),
      },
      {
        label: 'Delete',
        icon: 'pi pi-trash',
        command: () => this.confirmDelete(pkg),
      },
    ]);
    this.actionMenu()?.toggle(event);
  }

  private confirmDelete(pkg: Package): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete ${pkg.name}?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.packageService.deletePackage(pkg.id),
    });
  }
}
