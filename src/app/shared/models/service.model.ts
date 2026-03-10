export interface ServiceItem {
  id: number;
  name: string;
  category: string;
  price: number;
  unit: string;
  tax: number;
  description: string;
  status: 'Active' | 'Inactive' | 'Deleted';
}
