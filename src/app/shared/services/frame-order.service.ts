import { Injectable, signal, computed } from '@angular/core';
import { FrameOrder } from '../models/frame-order.model';

const MOCK_FRAME_ORDERS: FrameOrder[] = [
  { id: 1, invoiceNumber: 'PS-002', customer: 'Priya Sharma', phone: '9876543211', frameName: 'Classic Wood Frame', size: '8x12', qty: 2, status: 'Delivered', orderDate: 'March 3, 2026', expectedDate: 'March 10, 2026', deliveryDate: 'March 9, 2026', notes: '' },
  { id: 2, invoiceNumber: 'PS-003', customer: 'Suresh Babu', phone: '9876543212', frameName: 'Premium Metal Frame', size: '12x18', qty: 1, status: 'In Progress', orderDate: 'March 5, 2026', expectedDate: 'March 15, 2026', deliveryDate: '', notes: 'Custom engraving requested' },
  { id: 3, invoiceNumber: 'PS-006', customer: 'Anitha Krishnan', phone: '9876543215', frameName: 'Glass Photo Frame', size: '6x8', qty: 3, status: 'Ordered', orderDate: 'March 9, 2026', expectedDate: 'March 18, 2026', deliveryDate: '', notes: '' },
  { id: 4, invoiceNumber: 'PS-007', customer: 'Deepak Murugan', phone: '9876543216', frameName: 'Large Canvas Frame', size: '24x36', qty: 1, status: 'Ready', orderDate: 'March 10, 2026', expectedDate: 'March 20, 2026', deliveryDate: '', notes: 'Wedding highlight canvas' },
  { id: 5, invoiceNumber: 'PS-001', customer: 'Rajesh Kumar', phone: '9876543210', frameName: 'Acrylic Photo Frame', size: '8x12', qty: 2, status: 'Delivered', orderDate: 'March 1, 2026', expectedDate: 'March 8, 2026', deliveryDate: 'March 7, 2026', notes: '' },
  { id: 6, invoiceNumber: 'PS-005', customer: 'Vikram Reddy', phone: '9876543214', frameName: 'Fiber Wall Frame', size: '16x24', qty: 1, status: 'Ordered', orderDate: 'March 8, 2026', expectedDate: 'March 22, 2026', deliveryDate: '', notes: 'Pre-wedding photo frame' },
  { id: 7, invoiceNumber: 'PS-003', customer: 'Suresh Babu', phone: '9876543212', frameName: 'Gold Metal Frame', size: '8x12', qty: 2, status: 'In Progress', orderDate: 'March 5, 2026', expectedDate: 'March 15, 2026', deliveryDate: '', notes: '' },
  { id: 8, invoiceNumber: 'PS-007', customer: 'Deepak Murugan', phone: '9876543216', frameName: 'Rustic Wood Frame', size: '12x18', qty: 3, status: 'Ordered', orderDate: 'March 10, 2026', expectedDate: 'March 25, 2026', deliveryDate: '', notes: 'Match with album cover' },
];

@Injectable({ providedIn: 'root' })
export class FrameOrderService {
  private readonly ordersSignal = signal<FrameOrder[]>(MOCK_FRAME_ORDERS);

  readonly orders = this.ordersSignal.asReadonly();
  readonly totalCount = computed(() => this.ordersSignal().length);

  readonly pendingOrders = computed(() =>
    this.ordersSignal().filter((o) => o.status !== 'Delivered' && o.status !== 'Cancelled')
  );

  updateStatus(id: number, status: FrameOrder['status'], deliveryDate?: string): void {
    this.ordersSignal.update((list) =>
      list.map((o) =>
        o.id === id ? { ...o, status, deliveryDate: deliveryDate ?? o.deliveryDate } : o
      )
    );
  }

  updateOrder(updated: FrameOrder): void {
    this.ordersSignal.update((list) =>
      list.map((o) => (o.id === updated.id ? { ...updated } : o))
    );
  }
}
