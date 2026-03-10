import { Injectable, signal, computed } from '@angular/core';
import { Package } from '../models/package.model';

const MOCK_PACKAGES: Package[] = [
  {
    id: 1,
    name: 'Wedding Premium',
    description: 'Complete wedding photography and album package with video editing',
    services: [
      { serviceId: 1, name: 'Model Photography', quantity: 10, price: 70 },
      { serviceId: 4, name: 'Photo Print 4x6', quantity: 100, price: 10 },
      { serviceId: 8, name: 'Wedding Album 12x36', quantity: 1, price: 3500 },
      { serviceId: 10, name: 'Video Editing', quantity: 1, price: 500 },
    ],
    totalValue: 5200,
    packagePrice: 4500,
    discount: 700,
    status: 'Active',
  },
  {
    id: 2,
    name: 'Wedding Basic',
    description: 'Essential wedding photography and album package',
    services: [
      { serviceId: 1, name: 'Model Photography', quantity: 5, price: 70 },
      { serviceId: 4, name: 'Photo Print 4x6', quantity: 50, price: 10 },
      { serviceId: 8, name: 'Wedding Album 12x36', quantity: 1, price: 3500 },
    ],
    totalValue: 4350,
    packagePrice: 3800,
    discount: 550,
    status: 'Active',
  },
  {
    id: 3,
    name: 'Baby Shoot Complete',
    description: 'Full baby photography session with prints and frames',
    services: [
      { serviceId: 9, name: 'Baby Shoot Package', quantity: 1, price: 2000 },
      { serviceId: 4, name: 'Photo Print 4x6', quantity: 30, price: 10 },
      { serviceId: 6, name: 'Photo Frame Small', quantity: 2, price: 200 },
    ],
    totalValue: 2700,
    packagePrice: 2200,
    discount: 500,
    status: 'Active',
  },
  {
    id: 4,
    name: 'Passport & ID Pack',
    description: 'Quick passport and ID photo package',
    services: [
      { serviceId: 2, name: 'Passport Photo', quantity: 4, price: 100 },
      { serviceId: 4, name: 'Photo Print 4x6', quantity: 8, price: 10 },
    ],
    totalValue: 480,
    packagePrice: 400,
    discount: 80,
    status: 'Active',
  },
  {
    id: 5,
    name: 'Birthday Special',
    description: 'Birthday event photography with prints and frame',
    services: [
      { serviceId: 1, name: 'Model Photography', quantity: 5, price: 70 },
      { serviceId: 5, name: 'Photo Print 5x7', quantity: 20, price: 20 },
      { serviceId: 6, name: 'Photo Frame Small', quantity: 1, price: 200 },
    ],
    totalValue: 950,
    packagePrice: 800,
    discount: 150,
    status: 'Inactive',
  },
];

@Injectable({ providedIn: 'root' })
export class PackageService {
  private readonly packagesSignal = signal<Package[]>(MOCK_PACKAGES);

  readonly packages = this.packagesSignal.asReadonly();
  readonly totalCount = computed(() => this.packagesSignal().length);

  addPackage(pkg: Omit<Package, 'id'>): void {
    const newId = Math.max(...this.packagesSignal().map((p) => p.id), 0) + 1;
    this.packagesSignal.update((list) => [{ ...pkg, id: newId }, ...list]);
  }

  updatePackage(updated: Package): void {
    this.packagesSignal.update((list) =>
      list.map((p) => (p.id === updated.id ? { ...updated } : p))
    );
  }

  deletePackage(id: number): void {
    this.packagesSignal.update((list) =>
      list.map((p) => (p.id === id ? { ...p, status: 'Inactive' as const } : p))
    );
  }
}
