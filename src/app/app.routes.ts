import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./features/auth/forgot-password/forgot-password').then((m) => m.ForgotPassword),
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
        path: 'bookings/:id',
        loadComponent: () =>
          import('./features/bookings/booking-details/booking-details').then((m) => m.BookingDetails),
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
        path: 'invoices/:id',
        loadComponent: () =>
          import('./features/invoices/invoice-view/invoice-view').then((m) => m.InvoiceView),
      },
      {
        path: 'quotations',
        loadComponent: () =>
          import('./features/quotations/quotation-list/quotation-list').then((m) => m.QuotationList),
      },
      {
        path: 'quotations/add',
        loadComponent: () =>
          import('./features/quotations/quotation-form/quotation-form').then((m) => m.QuotationForm),
      },
      {
        path: 'quotations/edit/:id',
        loadComponent: () =>
          import('./features/quotations/quotation-form/quotation-form').then((m) => m.QuotationForm),
      },
      {
        path: 'quotations/:id',
        loadComponent: () =>
          import('./features/quotations/quotation-view/quotation-view').then((m) => m.QuotationView),
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
        path: 'users/:id/login-activity',
        loadComponent: () =>
          import('./features/users/user-login-activity/user-login-activity').then((m) => m.UserLoginActivity),
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
        path: 'frames',
        loadComponent: () =>
          import('./features/frames/frame-list/frame-list').then((m) => m.FrameList),
      },
      {
        path: 'albums',
        loadComponent: () =>
          import('./features/albums/album-list/album-list').then((m) => m.AlbumList),
      },
      {
        path: 'change-password',
        loadComponent: () =>
          import('./features/auth/change-password/change-password').then((m) => m.ChangePassword),
      },
      {
        path: 'permissions',
        loadComponent: () =>
          import('./features/permissions/permission-matrix/permission-matrix').then((m) => m.PermissionMatrix),
      },
      {
        path: 'email-logs',
        loadComponent: () =>
          import('./features/notifications/email-logs/email-logs').then((m) => m.EmailLogs),
      },
      {
        path: 'email-templates',
        loadComponent: () =>
          import('./features/notifications/email-templates/email-templates').then((m) => m.EmailTemplates),
      },
      {
        path: 'backups',
        loadComponent: () =>
          import('./features/backups/backups').then((m) => m.Backups),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./features/settings/settings').then((m) => m.Settings),
      },
      {
        path: 'calendar',
        loadComponent: () =>
          import('./features/calendar/calendar').then((m) => m.CalendarView),
      },
      {
        path: 'frame-orders',
        loadComponent: () =>
          import('./features/frame-orders/frame-order-list/frame-order-list').then((m) => m.FrameOrderList),
      },
      {
        path: 'album-orders',
        loadComponent: () =>
          import('./features/album-orders/album-order-list/album-order-list').then((m) => m.AlbumOrderList),
      },
    ],
  },
];
