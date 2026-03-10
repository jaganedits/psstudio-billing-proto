export interface Expense {
  id: number;
  date: string;
  category: 'Rent' | 'Equipment' | 'Supplies' | 'Travel' | 'Marketing' | 'Utilities' | 'Other';
  description: string;
  amount: number;
  paymentMode: 'Cash' | 'UPI' | 'Card' | 'Bank Transfer';
  vendor: string;
  notes: string;
  status: 'Active' | 'Deleted';
}
