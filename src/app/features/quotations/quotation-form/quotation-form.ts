import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
} from '@angular/core';
import {
  FormBuilder,
  FormArray,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { AutoCompleteModule, AutoCompleteCompleteEvent, AutoCompleteSelectEvent } from 'primeng/autocomplete';
import { TextareaModule } from 'primeng/textarea';
import { Quotation } from '../../../shared/models/quotation.model';
import { QuotationService } from '../../../shared/services/quotation.service';
import { ServiceService } from '../../../shared/services/service.service';
import { CustomerService } from '../../../shared/services/customer.service';
import { FrameService } from '../../../shared/services/frame.service';
import { AlbumService } from '../../../shared/services/album.service';
import { ServiceItem } from '../../../shared/models/service.model';
import { Customer } from '../../../shared/models/customer.model';

@Component({
  selector: 'app-quotation-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    DatePickerModule,
    AutoCompleteModule,
    TextareaModule,
    RouterLink,
  ],
  templateUrl: './quotation-form.html',
  styleUrl: './quotation-form.scss',
})
export class QuotationForm {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly quotationService = inject(QuotationService);
  private readonly serviceService = inject(ServiceService);
  private readonly customerService = inject(CustomerService);
  private readonly frameService = inject(FrameService);
  private readonly albumService = inject(AlbumService);

  readonly isEditing = signal(false);
  private editingQuotation: Quotation | null = null;

  readonly searchQuery = signal('');
  readonly activeCategory = signal('All');
  readonly activeBorderFilter = signal('All');
  readonly editingPriceIndex = signal(-1);
  readonly customerSuggestions = signal<Customer[]>([]);

  readonly allServices = computed(() => {
    const services = this.serviceService.services().filter(s => s.status === 'Active');
    const frames = this.frameService.frames().filter(f => f.status === 'Active').map(f => ({
      id: f.id + 10000,
      name: `(${f.size}) ${f.name}`,
      category: 'Frames',
      price: f.price,
      unit: 'per piece',
      tax: 0,
      description: f.material,
      status: 'Active' as const,
      border: f.border,
    }));
    const albums = this.albumService.albums().filter(a => a.status === 'Active').map(a => ({
      id: a.id + 20000,
      name: `(${a.size}) ${a.name}`,
      category: 'Albums',
      price: a.basePrice,
      unit: `${a.basePages} pages`,
      tax: 0,
      description: `${a.albumType} - ${a.coverType}`,
      status: 'Active' as const,
    }));
    return [...services, ...frames, ...albums];
  });

  readonly categories = computed(() => {
    const cats = new Set(this.allServices().map(s => s.category));
    return ['All', ...cats];
  });

  readonly borderOptions = ['All', '½ inch', '1 inch', '2 inch', '3 inch'];

  readonly filteredServices = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const cat = this.activeCategory();
    const border = this.activeBorderFilter();
    return this.allServices().filter(s => {
      const matchCat = cat === 'All' || s.category === cat;
      const matchQuery = !query || s.name.toLowerCase().includes(query) || s.category.toLowerCase().includes(query);
      const matchBorder = cat !== 'Frames' || border === 'All' || ('border' in s && s.border === border);
      return matchCat && matchQuery && matchBorder;
    });
  });

  readonly form = this.fb.nonNullable.group({
    quotationNumber: [this.quotationService.nextQuotationNumber()],
    date: [new Date() as Date | null, [Validators.required]],
    customer: ['' as string | Customer, [Validators.required]],
    phone: ['', [Validators.required]],
    email: [''],
    items: this.fb.array([] as FormGroup[]),
    discount: [0],
    gstPercent: [18],
    validUntil: [null as Date | null, [Validators.required]],
    notes: [''],
  });

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const quotation = this.quotationService.quotations().find(q => q.id === +id);
      if (quotation) {
        this.editingQuotation = quotation;
        this.isEditing.set(true);
        this.form.patchValue({
          quotationNumber: quotation.quotationNumber,
          date: new Date(quotation.date),
          customer: quotation.customer,
          phone: quotation.phone,
          email: quotation.email,
          discount: quotation.discount,
          gstPercent: quotation.subtotal > 0 ? Math.round((quotation.gst / (quotation.subtotal - quotation.discount)) * 100) : 18,
          validUntil: new Date(quotation.validUntil),
          notes: quotation.notes,
        });
        for (const item of quotation.items) {
          this.items.push(this.fb.nonNullable.group({
            name: [item.name, [Validators.required]],
            quantity: [item.quantity, [Validators.required]],
            price: [item.price, [Validators.required]],
          }));
        }
      }
    }
  }

  get items(): FormArray {
    return this.form.get('items') as FormArray;
  }

  get pageTitle(): string {
    return this.isEditing() ? 'Edit Quotation' : 'New Quotation';
  }

  addServiceToCart(service: ServiceItem): void {
    for (let i = 0; i < this.items.length; i++) {
      const item = this.items.at(i);
      if (item.get('name')?.value === service.name) {
        const currentQty = item.get('quantity')?.value || 1;
        item.patchValue({ quantity: currentQty + 1 });
        return;
      }
    }
    this.items.push(this.fb.nonNullable.group({
      name: [service.name, [Validators.required]],
      quantity: [1, [Validators.required]],
      price: [service.price, [Validators.required]],
    }));
  }

  addCustomItem(): void {
    this.items.push(this.fb.nonNullable.group({
      name: ['', [Validators.required]],
      quantity: [1, [Validators.required]],
      price: [0, [Validators.required]],
    }));
  }

  removeItem(index: number): void {
    this.items.removeAt(index);
  }

  updateQuantity(index: number, delta: number): void {
    const item = this.items.at(index);
    const currentQty = item.get('quantity')?.value || 1;
    const newQty = Math.max(1, currentQty + delta);
    item.patchValue({ quantity: newQty });
  }

  getItemTotal(index: number): number {
    const item = this.items.at(index);
    const qty = item.get('quantity')?.value || 0;
    const price = item.get('price')?.value || 0;
    return qty * price;
  }

  getSubtotal(): number {
    let subtotal = 0;
    for (let i = 0; i < this.items.length; i++) {
      subtotal += this.getItemTotal(i);
    }
    return subtotal;
  }

  getGstAmount(): number {
    const subtotal = this.getSubtotal();
    const discount = this.form.get('discount')?.value || 0;
    const gstPercent = this.form.get('gstPercent')?.value || 0;
    return Math.round(((subtotal - discount) * gstPercent) / 100);
  }

  getTotal(): number {
    const subtotal = this.getSubtotal();
    const discount = this.form.get('discount')?.value || 0;
    return subtotal - discount + this.getGstAmount();
  }

  setCategory(cat: string): void {
    this.activeCategory.set(cat);
    this.activeBorderFilter.set('All');
  }

  onSearchInput(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  searchCustomers(event: AutoCompleteCompleteEvent): void {
    const query = event.query.toLowerCase();
    const activeCustomers = this.customerService.customers().filter(c => c.status === 'Active');
    this.customerSuggestions.set(
      activeCustomers.filter(c =>
        c.name.toLowerCase().includes(query) || c.phone.includes(query)
      )
    );
  }

  onCustomerSelect(event: AutoCompleteSelectEvent): void {
    const customer = event.value as Customer;
    this.form.patchValue({ phone: customer.phone, email: customer.email });
  }

  getCustomerDisplay(customer: string | Customer): string {
    if (typeof customer === 'string') return customer;
    return customer.name;
  }

  private formatDate(date: Date | null): string {
    if (!date) return '';
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  }

  onSubmit(): void {
    if (this.form.invalid || this.items.length === 0) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.getRawValue();
    const subtotal = this.getSubtotal();
    const discount = formValue.discount;
    const gst = this.getGstAmount();
    const total = this.getTotal();

    const items = formValue.items.map((item, i) => ({
      name: item['name'],
      quantity: item['quantity'],
      price: item['price'],
      total: this.getItemTotal(i),
    }));

    const customerName = typeof formValue.customer === 'string'
      ? formValue.customer
      : (formValue.customer as Customer).name;
    const phone = formValue.phone;
    const email = formValue.email;
    const dateStr = this.formatDate(formValue.date);
    const validUntilStr = this.formatDate(formValue.validUntil);

    if (this.editingQuotation) {
      this.quotationService.updateQuotation({
        ...this.editingQuotation,
        quotationNumber: formValue.quotationNumber,
        date: dateStr,
        validUntil: validUntilStr,
        customer: customerName,
        phone,
        email,
        items,
        subtotal,
        discount,
        gst,
        total,
        notes: formValue.notes,
      });
    } else {
      this.quotationService.addQuotation({
        quotationNumber: formValue.quotationNumber,
        date: dateStr,
        validUntil: validUntilStr,
        customer: customerName,
        phone,
        email,
        items,
        subtotal,
        discount,
        gst,
        total,
        notes: formValue.notes,
        status: 'Draft',
      });
    }

    this.router.navigate(['/quotations']);
  }

  onCancel(): void {
    this.router.navigate(['/quotations']);
  }
}
