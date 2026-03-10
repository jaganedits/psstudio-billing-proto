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
import { RouterLink } from '@angular/router';
import { ConfirmationService, MenuItem } from 'primeng/api';

import { Category } from '../../../shared/models/category.model';
import { CategoryService } from '../../../shared/services/category.service';
import { CategoryForm } from '../category-form/category-form';

interface TabItem {
  label: string;
  value: string;
}

@Component({
  selector: 'app-category-list',
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
    RouterLink,
    CategoryForm,
  ],
  providers: [ConfirmationService],
  templateUrl: './category-list.html',
  styleUrl: './category-list.scss',
})
export class CategoryList {
  private readonly categoryService = inject(CategoryService);
  private readonly confirmationService = inject(ConfirmationService);

  readonly allCategories = this.categoryService.categories;
  readonly totalCount = this.categoryService.totalCount;

  readonly activeTab = signal<string>('all');

  readonly tabs: TabItem[] = [
    { label: 'All Categories', value: 'all' },
    { label: 'Active', value: 'Active' },
    { label: 'Inactive', value: 'Inactive' },
  ];

  readonly filteredCategories = computed(() => {
    const tab = this.activeTab();
    const all = this.allCategories();
    if (tab === 'all') return all;
    return all.filter((c) => c.status === tab);
  });

  readonly tabCounts = computed(() => {
    const all = this.allCategories();
    return {
      all: all.length,
      Active: all.filter((c) => c.status === 'Active').length,
      Inactive: all.filter((c) => c.status === 'Inactive').length,
    } as Record<string, number>;
  });

  readonly selectedCategory = signal<Category | null>(null);

  readonly actionMenu = viewChild<Menu>('actionMenu');
  readonly menuItems = signal<MenuItem[]>([]);

  readonly showForm = signal(false);
  readonly editingCategory = signal<Category | null>(null);

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
    this.editingCategory.set(null);
    this.showForm.set(true);
  }

  openEditForm(category: Category): void {
    this.editingCategory.set(category);
    this.showForm.set(true);
  }

  onFormSave(data: { name: string; description: string }): void {
    const editing = this.editingCategory();
    if (editing) {
      this.categoryService.updateCategory({
        ...editing,
        ...data,
      });
    } else {
      this.categoryService.addCategory({
        ...data,
        status: 'Active',
      });
    }
    this.showForm.set(false);
  }

  onFormCancel(): void {
    this.showForm.set(false);
  }

  showActionMenu(event: Event, category: Category): void {
    this.selectedCategory.set(category);
    this.menuItems.set([
      {
        label: 'Edit',
        icon: 'pi pi-pencil',
        command: () => this.openEditForm(category),
      },
      {
        label: 'Delete',
        icon: 'pi pi-trash',
        command: () => this.confirmDelete(category),
      },
    ]);
    this.actionMenu()?.toggle(event);
  }

  private confirmDelete(category: Category): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete ${category.name}?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.categoryService.deleteCategory(category.id),
    });
  }
}
