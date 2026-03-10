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
    description: 'Professional model photography session',
    status: 'Active',
  },
  {
    id: 2,
    name: 'Passport Photo',
    category: 'Photography',
    price: 100,
    unit: 'per photo',
    tax: 18,
    description: 'Standard passport size photograph',
    status: 'Active',
  },
  {
    id: 3,
    name: 'Banner Photo',
    category: 'Photography',
    price: 150,
    unit: 'per photo',
    tax: 18,
    description: 'Large format banner photography',
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
    name: 'Photo Frame Small',
    category: 'Frames',
    price: 200,
    unit: 'per piece',
    tax: 18,
    description: 'Small decorative photo frame',
    status: 'Active',
  },
  {
    id: 7,
    name: 'Photo Frame Medium',
    category: 'Frames',
    price: 400,
    unit: 'per piece',
    tax: 18,
    description: 'Medium decorative photo frame',
    status: 'Inactive',
  },
  {
    id: 8,
    name: 'Wedding Album 12x36',
    category: 'Albums',
    price: 3500,
    unit: 'per piece',
    tax: 18,
    description: 'Premium wedding album 12x36 inches',
    status: 'Active',
  },
  {
    id: 9,
    name: 'Baby Shoot Package',
    category: 'Photography',
    price: 2000,
    unit: 'per session',
    tax: 18,
    description: 'Complete baby photography session package',
    status: 'Active',
  },
  {
    id: 10,
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
