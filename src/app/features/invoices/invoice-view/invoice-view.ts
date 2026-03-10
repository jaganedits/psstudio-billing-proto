import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DecimalPipe } from '@angular/common';
import { Invoice } from '../../../shared/models/invoice.model';
import { InvoiceService } from '../../../shared/services/invoice.service';

@Component({
  selector: 'app-invoice-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    ButtonModule,
    TagModule,
    DecimalPipe,
  ],
  templateUrl: './invoice-view.html',
  styleUrl: './invoice-view.scss',
})
export class InvoiceView {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly invoiceService = inject(InvoiceService);

  readonly invoice = signal<Invoice | null>(null);
  readonly notFound = signal(false);

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const found = this.invoiceService.invoices().find(i => i.id === +id);
      if (found) {
        this.invoice.set(found);
      } else {
        this.notFound.set(true);
      }
    } else {
      this.notFound.set(true);
    }
  }

  getStatusSeverity(status: string): 'success' | 'danger' | 'warn' | 'info' {
    switch (status) {
      case 'Paid':
        return 'success';
      case 'Partial':
        return 'warn';
      case 'Unpaid':
        return 'danger';
      case 'Cancelled':
        return 'info';
      default:
        return 'info';
    }
  }

  printInvoice(): void {
    window.print();
  }

  editInvoice(): void {
    const inv = this.invoice();
    if (inv) {
      this.router.navigate(['/invoices/edit', inv.id]);
    }
  }

  goBack(): void {
    this.router.navigate(['/invoices']);
  }
}
