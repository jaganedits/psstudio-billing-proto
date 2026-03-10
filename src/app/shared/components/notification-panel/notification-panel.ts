import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  ElementRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';

import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-notification-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonModule, BadgeModule],
  templateUrl: './notification-panel.html',
  styleUrl: './notification-panel.scss',
  host: {
    '(document:click)': 'onDocumentClick($event)',
    '(document:keydown.escape)': 'closePanel()',
  },
})
export class NotificationPanel {
  private readonly router = inject(Router);
  private readonly elementRef = inject(ElementRef);
  readonly notificationService = inject(NotificationService);

  readonly showPanel = signal(false);

  readonly notifications = this.notificationService.notifications;
  readonly unreadCount = this.notificationService.unreadCount;

  getIconByType(type: string): string {
    switch (type) {
      case 'success':
        return 'pi pi-check-circle';
      case 'warning':
        return 'pi pi-exclamation-triangle';
      case 'error':
        return 'pi pi-times-circle';
      default:
        return 'pi pi-info-circle';
    }
  }

  togglePanel(): void {
    this.showPanel.update((v) => !v);
  }

  closePanel(): void {
    this.showPanel.set(false);
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead();
  }

  onNotificationClick(id: number, link: string): void {
    this.notificationService.markAsRead(id);
    this.closePanel();
    this.router.navigate([link]);
  }

  onDocumentClick(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.showPanel.set(false);
    }
  }
}
