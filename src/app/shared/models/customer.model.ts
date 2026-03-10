export interface Customer {
  id: number;
  name: string;
  phone: string;
  alternatePhone: string;
  email: string;
  address: string;
  city: string;
  notes: string;
  totalOrders: number;
  pendingBalance: number;
  status: 'Active' | 'Inactive' | 'Deleted';
  addDate: string;
  lastVisit: string;
}
