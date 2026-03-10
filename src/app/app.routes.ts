import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: '',
    loadComponent: () =>
      import('./layouts/main-layout/main-layout').then((m) => m.MainLayout),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'customers',
        loadComponent: () =>
          import('./features/customers/customer-list/customer-list').then((m) => m.CustomerList),
      },
      {
        path: 'customers/:id',
        loadComponent: () =>
          import('./features/customers/customer-details/customer-details').then((m) => m.CustomerDetails),
      },
      {
        path: 'services',
        loadComponent: () =>
          import('./features/services/service-list/service-list').then((m) => m.ServiceList),
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./features/categories/category-list/category-list').then((m) => m.CategoryList),
      },
      {
        path: 'packages',
        loadComponent: () =>
          import('./features/packages/package-list/package-list').then((m) => m.PackageList),
      },
      {
        path: 'packages/add',
        loadComponent: () =>
          import('./features/packages/package-form/package-form').then((m) => m.PackageForm),
      },
      {
        path: 'packages/edit/:id',
        loadComponent: () =>
          import('./features/packages/package-form/package-form').then((m) => m.PackageForm),
      },
      {
        path: 'bookings',
        loadComponent: () =>
          import('./features/bookings/booking-list/booking-list').then((m) => m.BookingList),
      },
      {
        path: 'bookings/add',
        loadComponent: () =>
          import('./features/bookings/booking-form/booking-form').then((m) => m.BookingForm),
      },
      {
        path: 'bookings/edit/:id',
        loadComponent: () =>
          import('./features/bookings/booking-form/booking-form').then((m) => m.BookingForm),
      },
      {
        path: 'invoices',
        loadComponent: () =>
          import('./features/invoices/invoice-list/invoice-list').then((m) => m.InvoiceList),
      },
      {
        path: 'invoices/add',
        loadComponent: () =>
          import('./features/invoices/invoice-form/invoice-form').then((m) => m.InvoiceForm),
      },
      {
        path: 'invoices/edit/:id',
        loadComponent: () =>
          import('./features/invoices/invoice-form/invoice-form').then((m) => m.InvoiceForm),
      },
      {
        path: 'deliveries',
        loadComponent: () =>
          import('./features/deliveries/delivery-list/delivery-list').then((m) => m.DeliveryList),
      },
      {
        path: 'payments',
        loadComponent: () =>
          import('./features/payments/payment-list/payment-list').then((m) => m.PaymentList),
      },
      {
        path: 'expenses',
        loadComponent: () =>
          import('./features/expenses/expense-list/expense-list').then((m) => m.ExpenseList),
      },
      {
        path: 'profit-loss',
        loadComponent: () =>
          import('./features/profit-loss/profit-loss').then((m) => m.ProfitLoss),
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('./features/reports/reports').then((m) => m.Reports),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./features/users/user-list/user-list').then((m) => m.UserList),
      },
      {
        path: 'users/add',
        loadComponent: () =>
          import('./features/users/user-form/user-form').then((m) => m.UserForm),
      },
      {
        path: 'users/edit/:id',
        loadComponent: () =>
          import('./features/users/user-form/user-form').then((m) => m.UserForm),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/profile/profile').then((m) => m.Profile),
      },
      {
        path: 'audit',
        loadComponent: () =>
          import('./features/audit/audit').then((m) => m.Audit),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./features/settings/settings').then((m) => m.Settings),
      },
    ],
  },
];
