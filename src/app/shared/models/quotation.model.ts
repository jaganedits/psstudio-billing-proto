export interface QuotationItem {
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Quotation {
  id: number;
  quotationNumber: string;
  date: string;
  validUntil: string;
  customer: string;
  phone: string;
  email: string;
  items: QuotationItem[];
  subtotal: number;
  discount: number;
  gst: number;
  total: number;
  notes: string;
  status: 'Draft' | 'Sent' | 'Accepted' | 'Expired' | 'Converted';
}
