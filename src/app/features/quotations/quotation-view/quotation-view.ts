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
import { Quotation } from '../../../shared/models/quotation.model';
import { QuotationService } from '../../../shared/services/quotation.service';

@Component({
  selector: 'app-quotation-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    ButtonModule,
    TagModule,
    DecimalPipe,
  ],
  templateUrl: './quotation-view.html',
  styleUrl: './quotation-view.scss',
})
export class QuotationView {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly quotationService = inject(QuotationService);

  readonly quotation = signal<Quotation | null>(null);
  readonly notFound = signal(false);

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const found = this.quotationService.quotations().find(q => q.id === +id);
      if (found) {
        this.quotation.set(found);
      } else {
        this.notFound.set(true);
      }
    } else {
      this.notFound.set(true);
    }
  }

  getStatusSeverity(status: string): 'success' | 'danger' | 'warn' | 'info' {
    switch (status) {
      case 'Draft':
        return 'info';
      case 'Sent':
        return 'warn';
      case 'Accepted':
        return 'success';
      case 'Expired':
        return 'danger';
      case 'Converted':
        return 'info';
      default:
        return 'info';
    }
  }

  printQuotation(): void {
    window.print();
  }

  editQuotation(): void {
    const q = this.quotation();
    if (q) {
      this.router.navigate(['/quotations/edit', q.id]);
    }
  }

  goBack(): void {
    this.router.navigate(['/quotations']);
  }
}
