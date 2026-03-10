import { Injectable, signal, computed } from '@angular/core';
import { ServiceItem } from '../models/service.model';

const MOCK_SERVICES: ServiceItem[] = [
  {
    id: 1,
    name: 'Model Photography',
    category: 'Photography',
    price: 70,
    unit: 'per photo',
    tax: 18,
    description: 'Soft + Hard copy (Soft only: ₹65)',
    status: 'Active',
  },
  {
    id: 2,
    name: 'Passport Photo',
    category: 'Photography',
    price: 100,
    unit: 'per photo',
    tax: 18,
    description: 'Soft + Hard copy (Soft only: ₹90)',
    status: 'Active',
  },
  {
    id: 3,
    name: 'Banner Photo',
    category: 'Photography',
    price: 150,
    unit: 'per photo',
    tax: 18,
    description: 'Soft + Hard copy (Soft only: ₹140)',
    status: 'Active',
  },
  {
    id: 4,
    name: 'Photo Print 4x6',
    category: 'Printing',
    price: 10,
    unit: 'per print',
    tax: 12,
    description: '4x6 inch photo print on glossy paper',
    status: 'Active',
  },
  {
    id: 5,
    name: 'Photo Print 5x7',
    category: 'Printing',
    price: 20,
    unit: 'per print',
    tax: 12,
    description: '5x7 inch photo print on glossy paper',
    status: 'Active',
  },
  {
    id: 6,
    name: 'Photo Print 6x8',
    category: 'Printing',
    price: 30,
    unit: 'per print',
    tax: 12,
    description: '6x8 inch photo print on glossy paper',
    status: 'Active',
  },
  {
    id: 7,
    name: 'Photo Print 8x10',
    category: 'Printing',
    price: 50,
    unit: 'per print',
    tax: 12,
    description: '8x10 inch photo print on glossy paper',
    status: 'Active',
  },
  {
    id: 8,
    name: 'Photo Print 8x12',
    category: 'Printing',
    price: 60,
    unit: 'per print',
    tax: 12,
    description: '8x12 inch photo print on glossy paper',
    status: 'Active',
  },
  {
    id: 9,
    name: 'Photo Print 12x18',
    category: 'Printing',
    price: 120,
    unit: 'per print',
    tax: 12,
    description: '12x18 inch photo print on glossy paper',
    status: 'Active',
  },
  {
    id: 10,
    name: 'Baby Shoot Package',
    category: 'Photography',
    price: 2000,
    unit: 'per session',
    tax: 18,
    description: 'Complete baby photography session package',
    status: 'Active',
  },
  {
    id: 11,
    name: 'Video Editing',
    category: 'Editing',
    price: 500,
    unit: 'per session',
    tax: 18,
    description: 'Professional video editing service',
    status: 'Active',
  },
];

@Injectable({ providedIn: 'root' })
export class ServiceService {
  private readonly servicesSignal = signal<ServiceItem[]>(MOCK_SERVICES);

  readonly services = this.servicesSignal.asReadonly();
  readonly totalCount = computed(() => this.servicesSignal().length);

  addService(service: Omit<ServiceItem, 'id'>): void {
    const newId = Math.max(...this.servicesSignal().map((s) => s.id), 0) + 1;
    this.servicesSignal.update((list) => [{ ...service, id: newId }, ...list]);
  }

  updateService(updated: ServiceItem): void {
    this.servicesSignal.update((list) =>
      list.map((s) => (s.id === updated.id ? { ...updated } : s))
    );
  }

  deleteService(id: number): void {
    this.servicesSignal.update((list) =>
      list.map((s) => (s.id === id ? { ...s, status: 'Deleted' as const } : s))
    );
  }
}
