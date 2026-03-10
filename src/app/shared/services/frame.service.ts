import { Injectable, signal, computed } from '@angular/core';
import { Frame } from '../models/frame.model';

const MOCK_FRAMES: Frame[] = [
  { id: 1, name: 'Classic Wooden Frame', size: '8x10', border: '1 inch', material: 'Wood', price: 850, status: 'Active' },
  { id: 2, name: 'Premium Metal Frame', size: '12x18', border: '2 inch', material: 'Metal', price: 1200, status: 'Active' },
  { id: 3, name: 'Acrylic Floating Frame', size: '16x24', border: '½ inch', material: 'Acrylic', price: 1800, status: 'Active' },
  { id: 4, name: 'Fiber Desktop Frame', size: '4x6', border: '½ inch', material: 'Fiber', price: 350, status: 'Active' },
  { id: 5, name: 'Glass Portrait Frame', size: '5x7', border: '1 inch', material: 'Glass', price: 600, status: 'Active' },
  { id: 6, name: 'Wooden Collage Frame', size: '18x24', border: '3 inch', material: 'Wood', price: 2200, status: 'Active' },
  { id: 7, name: 'Metal Poster Frame', size: '24x36', border: '2 inch', material: 'Metal', price: 1500, status: 'Inactive' },
  { id: 8, name: 'Acrylic Tabletop Frame', size: '6x8', border: '½ inch', material: 'Acrylic', price: 500, status: 'Active' },
  { id: 9, name: 'Fiber Wall Frame', size: '10x14', border: '1 inch', material: 'Fiber', price: 750, status: 'Active' },
  { id: 10, name: 'Wooden Rustic Frame', size: '8x12', border: '2 inch', material: 'Wood', price: 950, status: 'Inactive' },
];

@Injectable({ providedIn: 'root' })
export class FrameService {
  private readonly framesSignal = signal<Frame[]>(MOCK_FRAMES);

  readonly frames = this.framesSignal.asReadonly();
  readonly totalCount = computed(() => this.framesSignal().length);

  addFrame(frame: Omit<Frame, 'id'>): void {
    const newId = Math.max(...this.framesSignal().map((f) => f.id), 0) + 1;
    this.framesSignal.update((list) => [{ ...frame, id: newId }, ...list]);
  }

  updateFrame(updated: Frame): void {
    this.framesSignal.update((list) =>
      list.map((f) => (f.id === updated.id ? { ...updated } : f))
    );
  }

  deleteFrame(id: number): void {
    this.framesSignal.update((list) =>
      list.map((f) => (f.id === id ? { ...f, status: 'Inactive' as const } : f))
    );
  }
}
