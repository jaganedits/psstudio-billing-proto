import { Injectable, signal, computed } from '@angular/core';
import { AlbumOrder } from '../models/album-order.model';

const MOCK_ALBUM_ORDERS: AlbumOrder[] = [
  { id: 1, invoiceNumber: 'PS-001', customer: 'Rajesh Kumar', phone: '9876543210', albumType: 'Premium', size: '12x36', pages: 30, designStatus: 'Approved', orderStatus: 'In Production', revisions: 2, expectedDate: 'March 25, 2026', deliveryDate: '', notes: 'Wedding album - approved after 2 revisions' },
  { id: 2, invoiceNumber: 'PS-002', customer: 'Priya Sharma', phone: '9876543211', albumType: 'Classic', size: '10x14', pages: 20, designStatus: 'In Design', orderStatus: 'Not Ordered', revisions: 0, expectedDate: 'March 30, 2026', deliveryDate: '', notes: 'Baby shoot album' },
  { id: 3, invoiceNumber: 'PS-003', customer: 'Suresh Babu', phone: '9876543212', albumType: 'Premium', size: '12x36', pages: 35, designStatus: 'Review', orderStatus: 'Not Ordered', revisions: 1, expectedDate: 'April 5, 2026', deliveryDate: '', notes: 'Birthday album - client reviewing design' },
  { id: 4, invoiceNumber: 'PS-007', customer: 'Deepak Murugan', phone: '9876543216', albumType: 'Flush Mount', size: '12x36', pages: 40, designStatus: 'Pending', orderStatus: 'Not Ordered', revisions: 0, expectedDate: 'April 10, 2026', deliveryDate: '', notes: 'Wedding deluxe album - design not started' },
  { id: 5, invoiceNumber: 'PS-005', customer: 'Vikram Reddy', phone: '9876543214', albumType: 'Magazine', size: '10x14', pages: 25, designStatus: 'Approved', orderStatus: 'Ordered', revisions: 1, expectedDate: 'March 28, 2026', deliveryDate: '', notes: 'Pre-wedding magazine album' },
  { id: 6, invoiceNumber: 'PS-004', customer: 'Meena Devi', phone: '9876543213', albumType: 'Classic', size: '8x10', pages: 15, designStatus: 'Approved', orderStatus: 'Delivered', revisions: 0, expectedDate: 'March 15, 2026', deliveryDate: 'March 14, 2026', notes: '' },
  { id: 7, invoiceNumber: 'PS-006', customer: 'Anitha Krishnan', phone: '9876543215', albumType: 'Canvas', size: '12x18', pages: 20, designStatus: 'Rejected', orderStatus: 'Not Ordered', revisions: 3, expectedDate: 'April 15, 2026', deliveryDate: '', notes: 'Client wants complete redesign' },
  { id: 8, invoiceNumber: 'PS-001', customer: 'Rajesh Kumar', phone: '9876543210', albumType: 'Magazine', size: '10x14', pages: 30, designStatus: 'Approved', orderStatus: 'Ready', revisions: 1, expectedDate: 'March 20, 2026', deliveryDate: '', notes: 'Photo magazine companion album' },
];

@Injectable({ providedIn: 'root' })
export class AlbumOrderService {
  private readonly ordersSignal = signal<AlbumOrder[]>(MOCK_ALBUM_ORDERS);

  readonly orders = this.ordersSignal.asReadonly();
  readonly totalCount = computed(() => this.ordersSignal().length);

  readonly pendingOrders = computed(() =>
    this.ordersSignal().filter((o) => o.orderStatus !== 'Delivered')
  );

  updateDesignStatus(id: number, designStatus: AlbumOrder['designStatus']): void {
    this.ordersSignal.update((list) =>
      list.map((o) => (o.id === id ? { ...o, designStatus } : o))
    );
  }

  updateOrderStatus(id: number, orderStatus: AlbumOrder['orderStatus'], deliveryDate?: string): void {
    this.ordersSignal.update((list) =>
      list.map((o) =>
        o.id === id ? { ...o, orderStatus, deliveryDate: deliveryDate ?? o.deliveryDate } : o
      )
    );
  }

  incrementRevision(id: number): void {
    this.ordersSignal.update((list) =>
      list.map((o) => (o.id === id ? { ...o, revisions: o.revisions + 1 } : o))
    );
  }

  updateOrder(updated: AlbumOrder): void {
    this.ordersSignal.update((list) =>
      list.map((o) => (o.id === updated.id ? { ...updated } : o))
    );
  }
}
