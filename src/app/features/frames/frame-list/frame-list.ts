import { Component, ChangeDetectionStrategy, inject, signal, computed, viewChild } from '@angular/core';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { Menu, MenuModule } from 'primeng/menu';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ConfirmationService, MenuItem } from 'primeng/api';

import { Frame } from '../../../shared/models/frame.model';
import { FrameService } from '../../../shared/services/frame.service';
import { FrameForm } from '../frame-form/frame-form';

interface TabItem {
  label: string;
  value: string;
}

@Component({
  selector: 'app-frame-list',
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
    DecimalPipe,
    RouterLink,
    FrameForm,
  ],
  providers: [ConfirmationService],
  templateUrl: './frame-list.html',
  styleUrl: './frame-list.scss',
})
export class FrameList {
  private readonly frameService = inject(FrameService);
  private readonly confirmationService = inject(ConfirmationService);

  readonly allFrames = this.frameService.frames;
  readonly totalCount = this.frameService.totalCount;

  readonly activeTab = signal<string>('all');

  readonly tabs: TabItem[] = [
    { label: 'All Frames', value: 'all' },
    { label: 'Active', value: 'Active' },
    { label: 'Inactive', value: 'Inactive' },
  ];

  readonly filteredFrames = computed(() => {
    const tab = this.activeTab();
    const all = this.allFrames();
    if (tab === 'all') return all;
    return all.filter((f) => f.status === tab);
  });

  readonly tabCounts = computed(() => {
    const all = this.allFrames();
    return {
      all: all.length,
      Active: all.filter((f) => f.status === 'Active').length,
      Inactive: all.filter((f) => f.status === 'Inactive').length,
    } as Record<string, number>;
  });

  readonly selectedFrame = signal<Frame | null>(null);
  readonly showForm = signal(false);
  readonly editingFrame = signal<Frame | null>(null);

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
    this.editingFrame.set(null);
    this.showForm.set(true);
  }

  openEditForm(frame: Frame): void {
    this.editingFrame.set(frame);
    this.showForm.set(true);
  }

  onFormSave(data: Frame | Omit<Frame, 'id'>): void {
    const editing = this.editingFrame();
    if (editing) {
      this.frameService.updateFrame(data as Frame);
    } else {
      this.frameService.addFrame(data as Omit<Frame, 'id'>);
    }
    this.showForm.set(false);
  }

  onFormCancel(): void {
    this.showForm.set(false);
  }

  showActionMenu(event: Event, frame: Frame): void {
    this.selectedFrame.set(frame);
    this.menuItems.set([
      {
        label: 'Edit Details',
        icon: 'pi pi-pencil',
        command: () => this.openEditForm(frame),
      },
      {
        label: 'Delete Frame',
        icon: 'pi pi-trash',
        command: () => this.confirmDelete(frame),
      },
    ]);
    this.actionMenu()?.toggle(event);
  }

  private confirmDelete(frame: Frame): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete ${frame.name}?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.frameService.deleteFrame(frame.id),
    });
  }
}
