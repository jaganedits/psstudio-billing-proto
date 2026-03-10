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
import { DecimalPipe } from '@angular/common';
import { Package } from '../../../shared/models/package.model';
import { PackageService } from '../../../shared/services/package.service';
import { ServiceService } from '../../../shared/services/service.service';
import { CategoryService } from '../../../shared/services/category.service';
import { ServiceItem } from '../../../shared/models/service.model';

@Component({
  selector: 'app-package-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    DecimalPipe,
    RouterLink,
  ],
  templateUrl: './package-form.html',
  styleUrl: './package-form.scss',
})
export class PackageForm {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly packageService = inject(PackageService);
  private readonly serviceService = inject(ServiceService);
  private readonly categoryService = inject(CategoryService);

  readonly isEditing = signal(false);
  private editingPackage: Package | null = null;

  readonly searchQuery = signal('');
  readonly selectedCategory = signal('All');

  readonly activeCategories = computed(() =>
    this.categoryService.categories().filter(c => c.status === 'Active')
  );

  readonly categoryNames = computed(() =>
    ['All', ...this.activeCategories().map(c => c.name)]
  );

  readonly activeServices = computed(() =>
    this.serviceService.services().filter(s => s.status === 'Active')
  );

  readonly filteredAvailableServices = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const category = this.selectedCategory();
    return this.activeServices().filter(s => {
      const matchesCategory = category === 'All' || s.category === category;
      const matchesSearch = !query || s.name.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  });

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
    packagePrice: [0, [Validators.required]],
    services: this.fb.array([] as FormGroup[]),
  });

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const pkg = this.packageService.packages().find(p => p.id === +id);
      if (pkg) {
        this.editingPackage = pkg;
        this.isEditing.set(true);
        this.form.patchValue({
          name: pkg.name,
          description: pkg.description,
          packagePrice: pkg.packagePrice,
        });
        for (const svc of pkg.services) {
          this.services.push(this.fb.nonNullable.group({
            serviceId: [svc.serviceId],
            name: [svc.name],
            quantity: [svc.quantity],
            price: [svc.price],
          }));
        }
      }
    }
  }

  get services(): FormArray {
    return this.form.get('services') as FormArray;
  }

  get pageTitle(): string {
    return this.isEditing() ? 'Edit Package' : 'Add Package';
  }

  selectCategory(category: string): void {
    this.selectedCategory.set(category);
  }

  addServiceToPackage(service: ServiceItem): void {
    for (let i = 0; i < this.services.length; i++) {
      const item = this.services.at(i);
      if (item.get('serviceId')?.value === service.id) {
        const currentQty = item.get('quantity')?.value || 1;
        item.patchValue({ quantity: currentQty + 1 });
        return;
      }
    }
    this.services.push(this.fb.nonNullable.group({
      serviceId: [service.id],
      name: [service.name],
      quantity: [1],
      price: [service.price],
    }));
  }

  removeServiceFromPackage(index: number): void {
    this.services.removeAt(index);
  }

  updateServiceQty(index: number, delta: number): void {
    const item = this.services.at(index);
    const currentQty = item.get('quantity')?.value || 1;
    const newQty = Math.max(1, currentQty + delta);
    item.patchValue({ quantity: newQty });
  }

  getItemTotal(index: number): number {
    const item = this.services.at(index);
    const qty = item.get('quantity')?.value || 0;
    const price = item.get('price')?.value || 0;
    return qty * price;
  }

  getTotalValue(): number {
    let total = 0;
    for (let i = 0; i < this.services.length; i++) {
      total += this.getItemTotal(i);
    }
    return total;
  }

  getSavings(): number {
    const packagePrice = this.form.get('packagePrice')?.value || 0;
    return this.getTotalValue() - packagePrice;
  }

  onSearchInput(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  onSubmit(): void {
    if (this.form.invalid || this.services.length === 0) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.getRawValue();
    const totalValue = this.getTotalValue();
    const packagePrice = formValue.packagePrice;
    const discount = totalValue - packagePrice;

    const services = formValue.services.map((s: Record<string, unknown>) => ({
      serviceId: s['serviceId'] as number,
      name: s['name'] as string,
      quantity: s['quantity'] as number,
      price: s['price'] as number,
    }));

    if (this.editingPackage) {
      this.packageService.updatePackage({
        ...this.editingPackage,
        name: formValue.name,
        description: formValue.description,
        services,
        totalValue,
        packagePrice,
        discount,
      });
    } else {
      this.packageService.addPackage({
        name: formValue.name,
        description: formValue.description,
        services,
        totalValue,
        packagePrice,
        discount,
        status: 'Active',
      });
    }

    this.router.navigate(['/packages']);
  }

  onCancel(): void {
    this.router.navigate(['/packages']);
  }
}
