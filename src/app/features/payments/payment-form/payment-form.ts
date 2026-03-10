import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  input,
  output,
  effect,
  inject,
} from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { AutoCompleteModule, AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { DatePickerModule } from 'primeng/datepicker';
import { TextareaModule } from 'primeng/textarea';

import { Payment } from '../../../shared/models/payment.model';
import { Invoice } from '../../../shared/models/invoice.model';
import { InvoiceService } from '../../../shared/services/invoice.service';

@Component({
  selector: 'app-payment-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    SelectModule,
    AutoCompleteModule,
    DatePickerModule,
    TextareaModule,
  ],
  templateUrl: './payment-form.html',
  styleUrl: './payment-form.scss',
})
export class PaymentForm {
  private readonly fb = inject(FormBuilder);
  private readonly invoiceService = inject(InvoiceService);

  readonly visible = input<boolean>(false);
  readonly preselectedInvoice = input<Invoice | null>(null);
  readonly save = output<Omit<Payment, 'id'>>();
  readonly cancel = output<void>();

  readonly paymentModes = [
    { label: 'Cash', value: 'Cash' },
    { label: 'UPI', value: 'UPI' },
    { label: 'Card', value: 'Card' },
    { label: 'Bank Transfer', value: 'Bank Transfer' },
    { label: 'Cheque', value: 'Cheque' },
  ];

  readonly filteredInvoices = signal<Invoice[]>([]);
  readonly selectedInvoice = signal<Invoice | null>(null);

  readonly invoiceBalance = computed(() => {
    const inv = this.selectedInvoice();
    return inv ? inv.balance : 0;
  });

  readonly form = this.fb.nonNullable.group({
    invoice: [null as Invoice | null, [Validators.required]],
    amount: [0, [Validators.required, Validators.min(1)]],
    paymentMode: ['Cash' as string, [Validators.required]],
    date: [new Date(), [Validators.required]],
    reference: [''],
    notes: [''],
  });

  constructor() {
    effect(() => {
      if (this.visible()) {
        const preselected = this.preselectedInvoice();
        if (preselected) {
          this.selectedInvoice.set(preselected);
          this.form.patchValue({
            invoice: preselected,
            amount: preselected.balance,
          });
        }
      } else {
        this.form.reset({
          invoice: null,
          amount: 0,
          paymentMode: 'Cash',
          date: new Date(),
          reference: '',
          notes: '',
        });
        this.selectedInvoice.set(null);
      }
    });
  }

  searchInvoices(event: AutoCompleteCompleteEvent): void {
    const query = event.query.toLowerCase();
    const invoices = this.invoiceService.invoices();
    this.filteredInvoices.set(
      invoices.filter(
        (i) =>
          i.status !== 'Cancelled' &&
          i.balance > 0 &&
          (i.invoiceNumber.toLowerCase().includes(query) ||
            i.customer.toLowerCase().includes(query))
      )
    );
  }

  onInvoiceSelect(event: { value: Invoice }): void {
    const inv = event.value;
    this.selectedInvoice.set(inv);
    this.form.patchValue({ amount: inv.balance });
  }

  onInvoiceClear(): void {
    this.selectedInvoice.set(null);
    this.form.patchValue({ amount: 0 });
  }

  getInvoiceLabel(invoice: Invoice): string {
    return `${invoice.invoiceNumber} - ${invoice.customer}`;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.getRawValue();
    const inv = formValue.invoice;

    if (!inv) return;

    // Validate amount doesn't exceed balance
    if (formValue.amount > inv.balance) {
      return;
    }

    const dateValue = formValue.date;
    const dateStr = dateValue instanceof Date
      ? dateValue.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : String(dateValue);

    this.save.emit({
      invoiceId: inv.id,
      invoiceNumber: inv.invoiceNumber,
      customer: inv.customer,
      amount: formValue.amount,
      paymentMode: formValue.paymentMode as Payment['paymentMode'],
      date: dateStr,
      reference: formValue.reference,
      notes: formValue.notes,
    });
  }
}
