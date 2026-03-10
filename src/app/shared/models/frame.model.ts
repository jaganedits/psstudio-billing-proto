export interface Frame {
  id: number;
  name: string;
  size: string;
  border: string;
  material: string;
  price: number;
  status: 'Active' | 'Inactive';
}
