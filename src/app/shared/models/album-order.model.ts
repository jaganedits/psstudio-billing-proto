export interface AlbumOrder {
  id: number;
  invoiceNumber: string;
  customer: string;
  phone: string;
  albumType: string;
  size: string;
  pages: number;
  designStatus: 'Pending' | 'In Design' | 'Review' | 'Approved' | 'Rejected';
  orderStatus: 'Not Ordered' | 'Ordered' | 'In Production' | 'Ready' | 'Delivered';
  revisions: number;
  expectedDate: string;
  deliveryDate: string;
  notes: string;
}
