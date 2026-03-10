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

import { Album } from '../../../shared/models/album.model';
import { AlbumService } from '../../../shared/services/album.service';
import { AlbumForm } from '../album-form/album-form';

interface TabItem {
  label: string;
  value: string;
}

@Component({
  selector: 'app-album-list',
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
    AlbumForm,
  ],
  providers: [ConfirmationService],
  templateUrl: './album-list.html',
  styleUrl: './album-list.scss',
})
export class AlbumList {
  private readonly albumService = inject(AlbumService);
  private readonly confirmationService = inject(ConfirmationService);

  readonly allAlbums = this.albumService.albums;
  readonly totalCount = this.albumService.totalCount;

  readonly activeTab = signal<string>('all');

  readonly tabs: TabItem[] = [
    { label: 'All Albums', value: 'all' },
    { label: 'Active', value: 'Active' },
    { label: 'Inactive', value: 'Inactive' },
  ];

  readonly filteredAlbums = computed(() => {
    const tab = this.activeTab();
    const all = this.allAlbums();
    if (tab === 'all') return all;
    return all.filter((a) => a.status === tab);
  });

  readonly tabCounts = computed(() => {
    const all = this.allAlbums();
    return {
      all: all.length,
      Active: all.filter((a) => a.status === 'Active').length,
      Inactive: all.filter((a) => a.status === 'Inactive').length,
    } as Record<string, number>;
  });

  readonly selectedAlbum = signal<Album | null>(null);
  readonly showForm = signal(false);
  readonly editingAlbum = signal<Album | null>(null);

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
    this.editingAlbum.set(null);
    this.showForm.set(true);
  }

  openEditForm(album: Album): void {
    this.editingAlbum.set(album);
    this.showForm.set(true);
  }

  onFormSave(data: Album | Omit<Album, 'id'>): void {
    const editing = this.editingAlbum();
    if (editing) {
      this.albumService.updateAlbum(data as Album);
    } else {
      this.albumService.addAlbum(data as Omit<Album, 'id'>);
    }
    this.showForm.set(false);
  }

  onFormCancel(): void {
    this.showForm.set(false);
  }

  showActionMenu(event: Event, album: Album): void {
    this.selectedAlbum.set(album);
    this.menuItems.set([
      {
        label: 'Edit Details',
        icon: 'pi pi-pencil',
        command: () => this.openEditForm(album),
      },
      {
        label: 'Delete Album',
        icon: 'pi pi-trash',
        command: () => this.confirmDelete(album),
      },
    ]);
    this.actionMenu()?.toggle(event);
  }

  private confirmDelete(album: Album): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete ${album.name}?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.albumService.deleteAlbum(album.id),
    });
  }
}
