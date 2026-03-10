import { Injectable, signal, computed } from '@angular/core';
import { Customer } from '../models/customer.model';

const MOCK_CUSTOMERS: Customer[] = [
  {
    id: 1,
    name: 'Priya Sharma',
    phone: '9876543210',
    alternatePhone: '9876543200',
    email: 'priya.sharma@example.com',
    address: '12, MG Road, Koramangala',
    city: 'Bangalore',
    notes: 'Regular wedding photography client',
    totalOrders: 8,
    pendingBalance: 4500,
    status: 'Active',
    addDate: 'March 23, 2024',
    lastVisit: 'January 14, 2026',
  },
  {
    id: 2,
    name: 'Ravi Kumar',
    phone: '9876543211',
    alternatePhone: '',
    email: 'ravi.kumar@example.com',
    address: '45, Anna Nagar',
    city: 'Chennai',
    notes: 'Portrait session booked quarterly',
    totalOrders: 3,
    pendingBalance: 0,
    status: 'Active',
    addDate: 'May 10, 2024',
    lastVisit: 'February 20, 2026',
  },
  {
    id: 3,
    name: 'Anita Desai',
    phone: '9876543212',
    alternatePhone: '9876543202',
    email: 'anita.desai@example.com',
    address: '78, Jubilee Hills',
    city: 'Hyderabad',
    notes: 'Baby shoot completed, album pending',
    totalOrders: 2,
    pendingBalance: 1200,
    status: 'Inactive',
    addDate: 'October 24, 2024',
    lastVisit: 'December 31, 2025',
  },
  {
    id: 4,
    name: 'Vikram Patel',
    phone: '9876543213',
    alternatePhone: '',
    email: 'vikram.patel@example.com',
    address: '23, SG Highway',
    city: 'Ahmedabad',
    notes: 'Pre-wedding + wedding package',
    totalOrders: 5,
    pendingBalance: 12000,
    status: 'Active',
    addDate: 'August 7, 2024',
    lastVisit: 'March 2, 2026',
  },
  {
    id: 5,
    name: 'Meera Reddy',
    phone: '9876543214',
    alternatePhone: '',
    email: 'meera.reddy@example.com',
    address: '56, Banjara Hills',
    city: 'Hyderabad',
    notes: '',
    totalOrders: 1,
    pendingBalance: 0,
    status: 'Deleted',
    addDate: 'April 28, 2024',
    lastVisit: 'October 25, 2025',
  },
  {
    id: 6,
    name: 'Arjun Nair',
    phone: '9876543215',
    alternatePhone: '9876543205',
    email: 'arjun.nair@example.com',
    address: '34, Marine Drive',
    city: 'Kochi',
    notes: 'Family portrait annual client',
    totalOrders: 4,
    pendingBalance: 800,
    status: 'Active',
    addDate: 'May 6, 2024',
    lastVisit: 'December 29, 2025',
  },
  {
    id: 7,
    name: 'Deepa Iyer',
    phone: '9876543216',
    alternatePhone: '',
    email: 'deepa.iyer@example.com',
    address: '89, Adyar',
    city: 'Chennai',
    notes: 'Maternity + baby shoot combo',
    totalOrders: 2,
    pendingBalance: 3500,
    status: 'Active',
    addDate: 'June 15, 2024',
    lastVisit: 'January 5, 2026',
  },
  {
    id: 8,
    name: 'Karthik Menon',
    phone: '9876543217',
    alternatePhone: '',
    email: 'karthik.menon@example.com',
    address: '67, Indiranagar',
    city: 'Bangalore',
    notes: 'Product photography for e-commerce',
    totalOrders: 12,
    pendingBalance: 0,
    status: 'Active',
    addDate: 'July 22, 2024',
    lastVisit: 'February 10, 2026',
  },
  {
    id: 9,
    name: 'Lakshmi Venkat',
    phone: '9876543218',
    alternatePhone: '9876543208',
    email: 'lakshmi.venkat@example.com',
    address: '12, T Nagar',
    city: 'Chennai',
    notes: 'Wedding photography - premium package',
    totalOrders: 6,
    pendingBalance: 8500,
    status: 'Active',
    addDate: 'September 3, 2024',
    lastVisit: 'March 1, 2026',
  },
  {
    id: 10,
    name: 'Suresh Babu',
    phone: '9876543219',
    alternatePhone: '',
    email: 'suresh.babu@example.com',
    address: '45, Whitefield',
    city: 'Bangalore',
    notes: 'Corporate headshots',
    totalOrders: 1,
    pendingBalance: 0,
    status: 'Inactive',
    addDate: 'November 18, 2024',
    lastVisit: 'January 20, 2026',
  },
  {
    id: 11,
    name: 'Divya Krishnan',
    phone: '9876543220',
    alternatePhone: '',
    email: 'divya.krishnan@example.com',
    address: '78, Velachery',
    city: 'Chennai',
    notes: 'Engagement + wedding booking',
    totalOrders: 3,
    pendingBalance: 15000,
    status: 'Active',
    addDate: 'December 5, 2024',
    lastVisit: 'February 28, 2026',
  },
  {
    id: 12,
    name: 'Ganesh Raman',
    phone: '9876543221',
    alternatePhone: '9876543211',
    email: 'ganesh.raman@example.com',
    address: '90, RS Puram',
    city: 'Coimbatore',
    notes: 'Birthday party coverage',
    totalOrders: 2,
    pendingBalance: 500,
    status: 'Active',
    addDate: 'January 10, 2025',
    lastVisit: 'March 5, 2026',
  },
];

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private readonly customersSignal = signal<Customer[]>(MOCK_CUSTOMERS);

  readonly customers = this.customersSignal.asReadonly();
  readonly totalCount = computed(() => this.customersSignal().length);

  addCustomer(customer: Omit<Customer, 'id'>): void {
    const newId = Math.max(...this.customersSignal().map((c) => c.id), 0) + 1;
    this.customersSignal.update((list) => [{ ...customer, id: newId }, ...list]);
  }

  updateCustomer(updated: Customer): void {
    this.customersSignal.update((list) =>
      list.map((c) => (c.id === updated.id ? { ...updated } : c))
    );
  }

  deleteCustomer(id: number): void {
    this.customersSignal.update((list) =>
      list.map((c) => (c.id === id ? { ...c, status: 'Deleted' as const } : c))
    );
  }
}
