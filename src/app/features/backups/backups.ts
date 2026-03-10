import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TooltipModule } from 'primeng/tooltip';
import { RouterLink } from '@angular/router';

interface BackupEntry {
  id: number;
  date: string;
  fileName: string;
  size: string;
  type: 'Manual' | 'Scheduled';
  status: 'Completed' | 'Failed' | 'In Progress';
}

interface AutoBackupSettings {
  enabled: boolean;
  frequency: string;
  time: string;
}

@Component({
  selector: 'app-backups',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    TableModule,
    ButtonModule,
    TagModule,
    SelectModule,
    InputTextModule,
    ToggleSwitchModule,
    TooltipModule,
    RouterLink,
  ],
  templateUrl: './backups.html',
  styleUrl: './backups.scss',
})
export class Backups {
  readonly backups = signal<BackupEntry[]>([
    { id: 1, date: 'March 10, 2026 09:00 AM', fileName: 'psstudio_backup_20260310_090000.sql', size: '24.5 MB', type: 'Manual', status: 'Completed' },
    { id: 2, date: 'March 9, 2026 02:00 AM', fileName: 'psstudio_backup_20260309_020000.sql', size: '24.3 MB', type: 'Scheduled', status: 'Completed' },
    { id: 3, date: 'March 8, 2026 02:00 AM', fileName: 'psstudio_backup_20260308_020000.sql', size: '24.1 MB', type: 'Scheduled', status: 'Completed' },
    { id: 4, date: 'March 7, 2026 02:00 AM', fileName: 'psstudio_backup_20260307_020000.sql', size: '23.9 MB', type: 'Scheduled', status: 'Failed' },
    { id: 5, date: 'March 6, 2026 11:30 AM', fileName: 'psstudio_backup_20260306_113000.sql', size: '23.8 MB', type: 'Manual', status: 'Completed' },
    { id: 6, date: 'March 5, 2026 02:00 AM', fileName: 'psstudio_backup_20260305_020000.sql', size: '23.6 MB', type: 'Scheduled', status: 'Completed' },
  ]);

  readonly autoBackupSettings = signal<AutoBackupSettings>({
    enabled: true,
    frequency: 'Daily',
    time: '02:00',
  });

  readonly frequencyOptions = [
    { label: 'Daily', value: 'Daily' },
    { label: 'Weekly', value: 'Weekly' },
    { label: 'Monthly', value: 'Monthly' },
  ];

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
      case 'Completed':
        return 'success';
      case 'Failed':
        return 'danger';
      case 'In Progress':
        return 'warn';
      default:
        return 'info';
    }
  }

  getTypeSeverity(type: string): 'success' | 'danger' | 'warn' | 'info' {
    return type === 'Manual' ? 'info' : 'success';
  }

  createBackup(): void {
    const now = new Date();
    const dateStr = now.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    const timestamp = now.toISOString().replace(/[-:T]/g, '').substring(0, 14);
    const newBackup: BackupEntry = {
      id: Math.max(...this.backups().map((b) => b.id), 0) + 1,
      date: dateStr,
      fileName: `psstudio_backup_${timestamp}.sql`,
      size: '24.6 MB',
      type: 'Manual',
      status: 'Completed',
    };
    this.backups.update((list) => [newBackup, ...list]);
  }

  deleteBackup(id: number): void {
    this.backups.update((list) => list.filter((b) => b.id !== id));
  }

  updateAutoBackupEnabled(enabled: boolean): void {
    this.autoBackupSettings.update((s) => ({ ...s, enabled }));
  }

  updateAutoBackupFrequency(frequency: string): void {
    this.autoBackupSettings.update((s) => ({ ...s, frequency }));
  }

  updateAutoBackupTime(event: Event): void {
    const time = (event.target as HTMLInputElement).value;
    this.autoBackupSettings.update((s) => ({ ...s, time }));
  }
}
