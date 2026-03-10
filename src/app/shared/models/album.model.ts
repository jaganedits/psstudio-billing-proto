export interface Album {
  id: number;
  name: string;
  albumType: string;
  size: string;
  coverType: string;
  basePages: number;
  basePrice: number;
  extraPagePrice: number;
  status: 'Active' | 'Inactive';
}
