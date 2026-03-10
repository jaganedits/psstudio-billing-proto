export interface FrameOrder {
  id: number;
  invoiceNumber: string;
  customer: string;
  phone: string;
  frameName: string;
  size: string;
  qty: number;
  status: 'Ordered' | 'In Progress' | 'Ready' | 'Delivered' | 'Cancelled';
  orderDate: string;
  expectedDate: string;
  deliveryDate: string;
  notes: string;
}
