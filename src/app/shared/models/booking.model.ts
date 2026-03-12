export interface Booking {
  id: number;
  customer: string;
  eventType: string;
  eventDate: string;
  location: string;
  photographer: string;
  package: string;
  packageId: number | null;
  invoiceId: number | null;
  totalAmount: number;
  advancePaid: number;
  balance: number;
  deliveryDate: string;
  notes: string;
  status: 'Confirmed' | 'Completed' | 'Cancelled' | 'Pending';
}
