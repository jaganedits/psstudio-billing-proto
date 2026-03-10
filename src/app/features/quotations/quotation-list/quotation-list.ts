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

import { Quotation } from '../../../shared/models/quotation.model';
import { QuotationService } from '../../../shared/services/quotation.service';

interface TabItem {
  label: string;
  value: string;
}

@Component({
  selector: 'app-quotation-list',
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
  templateUrl: './quotation-list.html',
  styleUrl: './quotation-list.scss',
})
export class QuotationList {
  private readonly quotationService = inject(QuotationService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly router = inject(Router);

  readonly allQuotations = this.quotationService.quotations;
  readonly totalCount = this.quotationService.totalCount;

  readonly activeTab = signal<string>('all');

  readonly tabs: TabItem[] = [
    { label: 'All', value: 'all' },
    { label: 'Draft', value: 'Draft' },
    { label: 'Sent', value: 'Sent' },
    { label: 'Accepted', value: 'Accepted' },
    { label: 'Expired', value: 'Expired' },
    { label: 'Converted', value: 'Converted' },
  ];

  readonly filteredQuotations = computed(() => {
    const tab = this.activeTab();
    const all = this.allQuotations();
    if (tab === 'all') return all;
    return all.filter((q) => q.status === tab);
  });

  readonly tabCounts = computed(() => {
    const all = this.allQuotations();
    return {
      all: all.length,
      Draft: all.filter((q) => q.status === 'Draft').length,
      Sent: all.filter((q) => q.status === 'Sent').length,
      Accepted: all.filter((q) => q.status === 'Accepted').length,
      Expired: all.filter((q) => q.status === 'Expired').length,
      Converted: all.filter((q) => q.status === 'Converted').length,
    } as Record<string, number>;
  });

  readonly selectedQuotation = signal<Quotation | null>(null);

  readonly actionMenu = viewChild<Menu>('actionMenu');
  readonly menuItems = signal<MenuItem[]>([]);

  getStatusSeverity(status: string): 'success' | 'danger' | 'warn' | 'info' {
    switch (status) {
      case 'Draft':
        return 'info';
      case 'Sent':
        return 'warn';
      case 'Accepted':
        return 'success';
      case 'Expired':
        return 'danger';
      case 'Converted':
        return 'info';
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
    this.router.navigate(['/quotations/add']);
  }

  showActionMenu(event: Event, quotation: Quotation): void {
    this.selectedQuotation.set(quotation);
    const items: MenuItem[] = [
      {
        label: 'View',
        icon: 'pi pi-eye',
        command: () => this.router.navigate(['/quotations', quotation.id]),
      },
      {
        label: 'Edit',
        icon: 'pi pi-pencil',
        command: () => this.router.navigate(['/quotations/edit', quotation.id]),
      },
    ];

    if (quotation.status === 'Draft') {
      items.push({
        label: 'Send',
        icon: 'pi pi-send',
        command: () => this.quotationService.updateStatus(quotation.id, 'Sent'),
      });
    }

    if (quotation.status !== 'Converted' && quotation.status !== 'Expired') {
      items.push({
        label: 'Convert to Invoice',
        icon: 'pi pi-file-check',
        command: () => this.convertToInvoice(quotation),
      });
    }

    items.push({
      label: 'Delete',
      icon: 'pi pi-trash',
      command: () => this.confirmDelete(quotation),
    });

    this.menuItems.set(items);
    this.actionMenu()?.toggle(event);
  }

  private convertToInvoice(quotation: Quotation): void {
    this.confirmationService.confirm({
      message: `Convert quotation ${quotation.quotationNumber} to an invoice?`,
      header: 'Convert to Invoice',
      icon: 'pi pi-file-check',
      acceptButtonStyleClass: 'add-btn',
      accept: () => {
        this.quotationService.convertToInvoice(quotation);
        this.router.navigate(['/invoices']);
      },
    });
  }

  private confirmDelete(quotation: Quotation): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete quotation ${quotation.quotationNumber}?`,
      header: 'Delete Quotation',
      icon: 'pi pi-trash',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.quotationService.deleteQuotation(quotation.id);
      },
    });
  }
}
