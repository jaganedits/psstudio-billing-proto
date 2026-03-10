import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { RouterLink } from '@angular/router';

import { EmailLogService } from '../../../shared/services/email-log.service';
import { EmailLog } from '../../../shared/models/email-log.model';

interface TabItem {
  label: string;
  value: string;
}

@Component({
  selector: 'app-email-logs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TableModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    IconFieldModule,
    InputIconModule,
    RouterLink,
  ],
  templateUrl: './email-logs.html',
  styleUrl: './email-logs.scss',
})
export class EmailLogs {
  private readonly emailLogService = inject(EmailLogService);

  readonly allLogs = this.emailLogService.logs;
  readonly totalCount = this.emailLogService.totalCount;

  readonly activeTab = signal<string>('all');

  readonly tabs: TabItem[] = [
    { label: 'All', value: 'all' },
    { label: 'Sent', value: 'Sent' },
    { label: 'Failed', value: 'Failed' },
    { label: 'Pending', value: 'Pending' },
  ];

  readonly filteredLogs = computed(() => {
    const tab = this.activeTab();
    const all = this.allLogs();
    if (tab === 'all') return all;
    return all.filter((l) => l.status === tab);
  });

  readonly tabCounts = computed(() => {
    const all = this.allLogs();
    return {
      all: all.length,
      Sent: all.filter((l) => l.status === 'Sent').length,
      Failed: all.filter((l) => l.status === 'Failed').length,
      Pending: all.filter((l) => l.status === 'Pending').length,
    } as Record<string, number>;
  });

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
      case 'Sent':
        return 'success';
      case 'Failed':
        return 'danger';
      case 'Pending':
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
}
