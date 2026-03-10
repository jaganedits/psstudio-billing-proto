export interface PackageService {
  serviceId: number;
  name: string;
  quantity: number;
  price: number;
}

export interface Package {
  id: number;
  name: string;
  description: string;
  services: PackageService[];
  totalValue: number;
  packagePrice: number;
  discount: number;
  status: 'Active' | 'Inactive';
}
