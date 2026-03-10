import { Injectable, signal, computed } from '@angular/core';
import { Album } from '../models/album.model';

const MOCK_ALBUMS: Album[] = [
  {
    id: 1,
    name: 'Royal Wedding Album',
    albumType: 'Flush Mount',
    size: '12x18',
    coverType: 'Leather',
    basePages: 40,
    basePrice: 8500,
    extraPagePrice: 150,
    status: 'Active',
  },
  {
    id: 2,
    name: 'Classic Portrait Album',
    albumType: 'Classic',
    size: '10x14',
    coverType: 'Hard Cover',
    basePages: 20,
    basePrice: 3500,
    extraPagePrice: 100,
    status: 'Active',
  },
  {
    id: 3,
    name: 'Premium Canvas Album',
    albumType: 'Premium',
    size: '12x36',
    coverType: 'Acrylic',
    basePages: 30,
    basePrice: 12000,
    extraPagePrice: 250,
    status: 'Active',
  },
  {
    id: 4,
    name: 'Magazine Style Album',
    albumType: 'Magazine',
    size: '8x10',
    coverType: 'Padded',
    basePages: 24,
    basePrice: 2800,
    extraPagePrice: 80,
    status: 'Active',
  },
  {
    id: 5,
    name: 'Canvas Art Album',
    albumType: 'Canvas',
    size: '10x24',
    coverType: 'Wood',
    basePages: 20,
    basePrice: 6500,
    extraPagePrice: 200,
    status: 'Active',
  },
  {
    id: 6,
    name: 'Baby Memories Album',
    albumType: 'Classic',
    size: '8x10',
    coverType: 'Padded',
    basePages: 20,
    basePrice: 2500,
    extraPagePrice: 75,
    status: 'Active',
  },
  {
    id: 7,
    name: 'Premium Leather Album',
    albumType: 'Premium',
    size: '12x18',
    coverType: 'Leather',
    basePages: 40,
    basePrice: 15000,
    extraPagePrice: 300,
    status: 'Active',
  },
  {
    id: 8,
    name: 'Economy Event Album',
    albumType: 'Magazine',
    size: '8x10',
    coverType: 'Hard Cover',
    basePages: 16,
    basePrice: 1800,
    extraPagePrice: 60,
    status: 'Inactive',
  },
  {
    id: 9,
    name: 'Flush Mount Deluxe',
    albumType: 'Flush Mount',
    size: '10x14',
    coverType: 'Acrylic',
    basePages: 30,
    basePrice: 9500,
    extraPagePrice: 200,
    status: 'Active',
  },
  {
    id: 10,
    name: 'Wooden Cover Album',
    albumType: 'Canvas',
    size: '12x18',
    coverType: 'Wood',
    basePages: 24,
    basePrice: 7000,
    extraPagePrice: 180,
    status: 'Inactive',
  },
];

@Injectable({ providedIn: 'root' })
export class AlbumService {
  private readonly albumsSignal = signal<Album[]>(MOCK_ALBUMS);

  readonly albums = this.albumsSignal.asReadonly();
  readonly totalCount = computed(() => this.albumsSignal().length);

  addAlbum(album: Omit<Album, 'id'>): void {
    const newId = Math.max(...this.albumsSignal().map((a) => a.id), 0) + 1;
    this.albumsSignal.update((list) => [{ ...album, id: newId }, ...list]);
  }

  updateAlbum(updated: Album): void {
    this.albumsSignal.update((list) =>
      list.map((a) => (a.id === updated.id ? { ...updated } : a))
    );
  }

  deleteAlbum(id: number): void {
    this.albumsSignal.update((list) =>
      list.map((a) => (a.id === id ? { ...a, status: 'Inactive' as const } : a))
    );
  }
}
