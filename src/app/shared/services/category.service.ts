import { Injectable, signal, computed } from '@angular/core';
import { Category } from '../models/category.model';

const MOCK_CATEGORIES: Category[] = [
  {
    id: 1,
    name: 'Photography',
    description: 'All photography related services',
    status: 'Active',
  },
  {
    id: 2,
    name: 'Printing',
    description: 'Photo printing and enlargements',
    status: 'Active',
  },
  {
    id: 3,
    name: 'Frames',
    description: 'Photo frames and mounting',
    status: 'Active',
  },
  {
    id: 4,
    name: 'Albums',
    description: 'Wedding and event albums',
    status: 'Active',
  },
  {
    id: 5,
    name: 'Editing',
    description: 'Photo and video editing services',
    status: 'Active',
  },
  {
    id: 6,
    name: 'Videography',
    description: 'Video shooting and coverage',
    status: 'Active',
  },
];

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly categoriesSignal = signal<Category[]>(MOCK_CATEGORIES);

  readonly categories = this.categoriesSignal.asReadonly();
  readonly totalCount = computed(() => this.categoriesSignal().length);

  addCategory(category: Omit<Category, 'id'>): void {
    const newId = Math.max(...this.categoriesSignal().map((c) => c.id), 0) + 1;
    this.categoriesSignal.update((list) => [{ ...category, id: newId }, ...list]);
  }

  updateCategory(updated: Category): void {
    this.categoriesSignal.update((list) =>
      list.map((c) => (c.id === updated.id ? { ...updated } : c))
    );
  }

  deleteCategory(id: number): void {
    this.categoriesSignal.update((list) =>
      list.map((c) => (c.id === id ? { ...c, status: 'Inactive' as const } : c))
    );
  }
}
