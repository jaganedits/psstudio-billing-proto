export interface InvoiceItem {
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Invoice {
  id: number;
  invoiceNumber: string;
  date: string;
  customer: string;
  phone: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  gst: number;
  total: number;
  paid: number;
  balance: number;
  paymentMode: string;
  status: 'Paid' | 'Partial' | 'Unpaid' | 'Cancelled';
  deliveryStatus: 'Pending' | 'Ready' | 'Delivered';
}
