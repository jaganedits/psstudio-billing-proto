import { Injectable, signal, computed } from '@angular/core';
import { AuditLog } from '../models/audit.model';

const MOCK_AUDIT_LOGS: AuditLog[] = [
  {
    id: 1,
    action: 'Created Customer',
    user: 'PS Studio',
    module: 'Customers',
    details: 'Added new customer "Priya Sharma" with phone 9876543210',
    timestamp: '2026-03-10T09:15:00',
    ipAddress: '192.168.1.10',
  },
  {
    id: 2,
    action: 'Updated Invoice',
    user: 'Ravi Admin',
    module: 'Invoices',
    details: 'Updated invoice #INV-1042 status to "Paid"',
    timestamp: '2026-03-10T08:45:00',
    ipAddress: '192.168.1.12',
  },
  {
    id: 3,
    action: 'Deleted Expense',
    user: 'PS Studio',
    module: 'Expenses',
    details: 'Deleted expense "Studio Rent - February" (₹25,000)',
    timestamp: '2026-03-09T17:30:00',
    ipAddress: '192.168.1.10',
  },
  {
    id: 4,
    action: 'Created Booking',
    user: 'Meera Staff',
    module: 'Bookings',
    details: 'New wedding booking for "Vikram Patel" on April 15, 2026',
    timestamp: '2026-03-09T14:20:00',
    ipAddress: '192.168.1.15',
  },
  {
    id: 5,
    action: 'Updated Service',
    user: 'PS Studio',
    module: 'Services',
    details: 'Changed price of "Pre-Wedding Shoot" from ₹15,000 to ₹18,000',
    timestamp: '2026-03-09T11:00:00',
    ipAddress: '192.168.1.10',
  },
  {
    id: 6,
    action: 'Created Package',
    user: 'Ravi Admin',
    module: 'Packages',
    details: 'Created new package "Gold Wedding Bundle" with 5 services',
    timestamp: '2026-03-08T16:45:00',
    ipAddress: '192.168.1.12',
  },
  {
    id: 7,
    action: 'Updated Customer',
    user: 'Meera Staff',
    module: 'Customers',
    details: 'Updated address for "Anita Desai" to "78, Jubilee Hills, Hyderabad"',
    timestamp: '2026-03-08T13:10:00',
    ipAddress: '192.168.1.15',
  },
  {
    id: 8,
    action: 'Deleted Customer',
    user: 'PS Studio',
    module: 'Customers',
    details: 'Soft-deleted customer "Meera Reddy" (ID: 5)',
    timestamp: '2026-03-08T10:30:00',
    ipAddress: '192.168.1.10',
  },
  {
    id: 9,
    action: 'Created Invoice',
    user: 'Ravi Admin',
    module: 'Invoices',
    details: 'Generated invoice #INV-1043 for "Lakshmi Venkat" - ₹35,000',
    timestamp: '2026-03-07T15:55:00',
    ipAddress: '192.168.1.12',
  },
  {
    id: 10,
    action: 'Updated Settings',
    user: 'PS Studio',
    module: 'Settings',
    details: 'Changed studio GST number to "29AABCU9603R1ZM"',
    timestamp: '2026-03-07T12:00:00',
    ipAddress: '192.168.1.10',
  },
  {
    id: 11,
    action: 'Created User',
    user: 'PS Studio',
    module: 'Users',
    details: 'Added new staff user "Deepa Iyer" with role "Photographer"',
    timestamp: '2026-03-07T09:30:00',
    ipAddress: '192.168.1.10',
  },
  {
    id: 12,
    action: 'Updated Booking',
    user: 'Meera Staff',
    module: 'Bookings',
    details: 'Rescheduled booking #BK-207 from March 20 to March 25',
    timestamp: '2026-03-06T16:20:00',
    ipAddress: '192.168.1.15',
  },
  {
    id: 13,
    action: 'Created Expense',
    user: 'Ravi Admin',
    module: 'Expenses',
    details: 'Added expense "Camera Lens Repair" - ₹8,500',
    timestamp: '2026-03-06T11:45:00',
    ipAddress: '192.168.1.12',
  },
  {
    id: 14,
    action: 'Deleted Service',
    user: 'PS Studio',
    module: 'Services',
    details: 'Removed discontinued service "Passport Photo"',
    timestamp: '2026-03-05T14:10:00',
    ipAddress: '192.168.1.10',
  },
  {
    id: 15,
    action: 'Updated User',
    user: 'PS Studio',
    module: 'Users',
    details: 'Changed role of "Karthik Menon" from "Staff" to "Senior Photographer"',
    timestamp: '2026-03-05T10:00:00',
    ipAddress: '192.168.1.10',
  },
  {
    id: 16,
    action: 'Deleted Package',
    user: 'Ravi Admin',
    module: 'Packages',
    details: 'Removed package "Basic Portrait Bundle" (no longer offered)',
    timestamp: '2026-03-04T17:00:00',
    ipAddress: '192.168.1.12',
  },
  {
    id: 17,
    action: 'Created Customer',
    user: 'Meera Staff',
    module: 'Customers',
    details: 'Added new customer "Ganesh Raman" with phone 9876543221',
    timestamp: '2026-03-04T13:25:00',
    ipAddress: '192.168.1.15',
  },
  {
    id: 18,
    action: 'Updated Invoice',
    user: 'PS Studio',
    module: 'Invoices',
    details: 'Added 18% GST to invoice #INV-1039 for "Arjun Nair"',
    timestamp: '2026-03-03T15:40:00',
    ipAddress: '192.168.1.10',
  },
];

@Injectable({ providedIn: 'root' })
export class AuditService {
  private readonly auditLogsSignal = signal<AuditLog[]>(MOCK_AUDIT_LOGS);

  readonly auditLogs = this.auditLogsSignal.asReadonly();

  filteredLogs(module?: string, action?: string): AuditLog[] {
    let logs = this.auditLogsSignal();
    if (module) {
      logs = logs.filter((l) => l.module === module);
    }
    if (action) {
      logs = logs.filter((l) => l.action.toLowerCase().includes(action.toLowerCase()));
    }
    return logs;
  }
}
