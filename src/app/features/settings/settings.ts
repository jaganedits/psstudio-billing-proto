import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TextareaModule } from 'primeng/textarea';

type SettingsTab = 'studio' | 'invoice' | 'tax' | 'smtp' | 'notifications';

@Component({
  selector: 'app-settings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    ToggleSwitchModule,
    TextareaModule,
  ],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class Settings {
  private readonly fb = inject(FormBuilder);

  readonly activeTab = signal<SettingsTab>('studio');
  readonly saveSuccess = signal(false);

  readonly tabs: { key: SettingsTab; label: string; icon: string }[] = [
    { key: 'studio', label: 'Studio Profile', icon: 'pi pi-building' },
    { key: 'invoice', label: 'Invoice Settings', icon: 'pi pi-file-check' },
    { key: 'tax', label: 'Tax Settings', icon: 'pi pi-percentage' },
    { key: 'smtp', label: 'SMTP Configuration', icon: 'pi pi-envelope' },
    { key: 'notifications', label: 'Notification Preferences', icon: 'pi pi-bell' },
  ];

  readonly paymentModeOptions = [
    { label: 'Cash', value: 'Cash' },
    { label: 'UPI', value: 'UPI' },
    { label: 'Card', value: 'Card' },
    { label: 'Bank Transfer', value: 'Bank Transfer' },
  ];

  readonly gstPercentOptions = [
    { label: '0%', value: 0 },
    { label: '5%', value: 5 },
    { label: '12%', value: 12 },
    { label: '18%', value: 18 },
    { label: '28%', value: 28 },
  ];

  readonly studioForm = this.fb.nonNullable.group({
    studioName: ['PS Studio', [Validators.required]],
    phone: ['+91 98765 43210', [Validators.required]],
    email: ['contact@psstudio.in', [Validators.required, Validators.email]],
    address: ['123, MG Road'],
    city: ['Bangalore'],
  });

  readonly invoiceForm = this.fb.nonNullable.group({
    invoicePrefix: ['PS-', [Validators.required]],
    defaultPaymentMode: ['Cash' as string],
    defaultGstPercent: [18 as number],
    termsAndConditions: [
      '1. All payments are non-refundable.\n2. Photos will be delivered within 7 working days.\n3. Additional edits will be charged separately.',
    ],
  });

  readonly taxForm = this.fb.nonNullable.group({
    gstNumber: ['29ABCDE1234F1Z5'],
    gstPercent: [18 as number],
    enableGst: [true],
  });

  readonly encryptionOptions = [
    { label: 'SSL', value: 'SSL' },
    { label: 'TLS', value: 'TLS' },
    { label: 'None', value: 'None' },
  ];

  readonly smtpForm = this.fb.nonNullable.group({
    smtpHost: ['', [Validators.required]],
    smtpPort: [587, [Validators.required]],
    smtpUsername: ['', [Validators.required]],
    smtpPassword: ['', [Validators.required]],
    fromEmail: ['', [Validators.required, Validators.email]],
    fromName: ['PS Studio'],
    encryption: ['TLS' as string],
  });

  readonly notificationsForm = this.fb.nonNullable.group({
    emailOnNewBooking: [true],
    emailOnPayment: [true],
    emailOnInvoice: [true],
    emailOnDelivery: [false],
    smsEnabled: [false],
  });

  setTab(tab: SettingsTab): void {
    this.activeTab.set(tab);
    this.saveSuccess.set(false);
  }

  onSave(): void {
    const tab = this.activeTab();
    if (tab === 'studio') {
      this.studioForm.markAllAsTouched();
      if (this.studioForm.invalid) return;
    } else if (tab === 'invoice') {
      this.invoiceForm.markAllAsTouched();
      if (this.invoiceForm.invalid) return;
    } else if (tab === 'smtp') {
      this.smtpForm.markAllAsTouched();
      if (this.smtpForm.invalid) return;
    } else if (tab === 'notifications') {
      this.notificationsForm.markAllAsTouched();
      if (this.notificationsForm.invalid) return;
    } else {
      this.taxForm.markAllAsTouched();
      if (this.taxForm.invalid) return;
    }
    this.saveSuccess.set(true);
  }
}
