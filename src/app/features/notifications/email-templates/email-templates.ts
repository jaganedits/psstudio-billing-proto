import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  viewChild,
} from '@angular/core';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { Menu, MenuModule } from 'primeng/menu';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { RouterLink } from '@angular/router';
import { ConfirmationService, MenuItem } from 'primeng/api';

import { EmailTemplate } from '../../../shared/models/email-template.model';
import { EmailTemplateService } from '../../../shared/services/email-template.service';
import { EmailTemplateForm } from '../email-template-form/email-template-form';

interface TabItem {
  label: string;
  value: string;
}

@Component({
  selector: 'app-email-templates',
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
    EmailTemplateForm,
  ],
  providers: [ConfirmationService],
  templateUrl: './email-templates.html',
  styleUrl: './email-templates.scss',
})
export class EmailTemplates {
  private readonly emailTemplateService = inject(EmailTemplateService);
  private readonly confirmationService = inject(ConfirmationService);

  readonly allTemplates = this.emailTemplateService.templates;
  readonly totalCount = this.emailTemplateService.totalCount;

  readonly activeTab = signal<string>('all');

  readonly tabs: TabItem[] = [
    { label: 'All Templates', value: 'all' },
    { label: 'Active', value: 'Active' },
    { label: 'Inactive', value: 'Inactive' },
  ];

  readonly filteredTemplates = computed(() => {
    const tab = this.activeTab();
    const all = this.allTemplates();
    if (tab === 'all') return all;
    return all.filter((t) => t.status === tab);
  });

  readonly tabCounts = computed(() => {
    const all = this.allTemplates();
    return {
      all: all.length,
      Active: all.filter((t) => t.status === 'Active').length,
      Inactive: all.filter((t) => t.status === 'Inactive').length,
    } as Record<string, number>;
  });

  readonly selectedTemplate = signal<EmailTemplate | null>(null);
  readonly showForm = signal(false);
  readonly editingTemplate = signal<EmailTemplate | null>(null);

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

  setTab(value: string): void {
    this.activeTab.set(value);
  }

  onFilter(table: Table, event: Event): void {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  openAddForm(): void {
    this.editingTemplate.set(null);
    this.showForm.set(true);
  }

  openEditForm(template: EmailTemplate): void {
    this.editingTemplate.set(template);
    this.showForm.set(true);
  }

  onFormSave(data: EmailTemplate | Omit<EmailTemplate, 'id'>): void {
    const editing = this.editingTemplate();
    if (editing) {
      this.emailTemplateService.updateTemplate(data as EmailTemplate);
    } else {
      this.emailTemplateService.addTemplate(data as Omit<EmailTemplate, 'id'>);
    }
    this.showForm.set(false);
  }

  onFormCancel(): void {
    this.showForm.set(false);
  }

  showActionMenu(event: Event, template: EmailTemplate): void {
    this.selectedTemplate.set(template);
    this.menuItems.set([
      {
        label: 'Edit Template',
        icon: 'pi pi-pencil',
        command: () => this.openEditForm(template),
      },
      {
        label: 'Delete Template',
        icon: 'pi pi-trash',
        command: () => this.confirmDelete(template),
      },
    ]);
    this.actionMenu()?.toggle(event);
  }

  private confirmDelete(template: EmailTemplate): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${template.name}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.emailTemplateService.deleteTemplate(template.id),
    });
  }
}
