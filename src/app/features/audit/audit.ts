import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TooltipModule } from 'primeng/tooltip';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { AuditLog } from '../../shared/models/audit.model';
import { AuditService } from '../../shared/services/audit.service';

interface TabItem {
  label: string;
  value: string;
}

@Component({
  selector: 'app-audit',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TableModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    IconFieldModule,
    InputIconModule,
    TooltipModule,
    DatePipe,
    RouterLink,
  ],
  templateUrl: './audit.html',
  styleUrl: './audit.scss',
})
export class Audit {
  private readonly auditService = inject(AuditService);

  readonly allLogs = this.auditService.auditLogs;

  readonly activeTab = signal<string>('All');

  readonly tabs: TabItem[] = [
    { label: 'All', value: 'All' },
    { label: 'Customers', value: 'Customers' },
    { label: 'Invoices', value: 'Invoices' },
    { label: 'Bookings', value: 'Bookings' },
    { label: 'Expenses', value: 'Expenses' },
    { label: 'Services', value: 'Services' },
    { label: 'Users', value: 'Users' },
  ];

  readonly filteredLogs = computed(() => {
    const tab = this.activeTab();
    const all = this.allLogs();
    if (tab === 'All') return all;
    return all.filter((l) => l.module === tab);
  });

  readonly tabCounts = computed(() => {
    const all = this.allLogs();
    return {
      All: all.length,
      Customers: all.filter((l) => l.module === 'Customers').length,
      Invoices: all.filter((l) => l.module === 'Invoices').length,
      Bookings: all.filter((l) => l.module === 'Bookings').length,
      Expenses: all.filter((l) => l.module === 'Expenses').length,
      Services: all.filter((l) => l.module === 'Services').length,
      Users: all.filter((l) => l.module === 'Users').length,
    } as Record<string, number>;
  });

  private readonly avatarColors = [
    '#4945ff', '#328048', '#d9822f', '#7b79ff', '#0c75af',
    '#8e4fd0', '#d02b20', '#0c7547', '#ba5612', '#3d39e6',
  ];

  private readonly moduleColors: Record<string, string> = {
    Customers: 'info',
    Invoices: 'success',
    Bookings: 'warn',
    Expenses: 'danger',
    Services: 'secondary',
    Packages: 'contrast',
    Users: 'info',
    Settings: 'warn',
  };

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

  getModuleSeverity(module: string): 'success' | 'danger' | 'warn' | 'info' | 'secondary' | 'contrast' {
    return (this.moduleColors[module] ?? 'info') as 'success' | 'danger' | 'warn' | 'info' | 'secondary' | 'contrast';
  }

  setTab(value: string): void {
    this.activeTab.set(value);
  }

  onFilter(table: Table, event: Event): void {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }
}
