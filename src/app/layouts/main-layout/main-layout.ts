import { Component, ChangeDetectionStrategy, viewChild, signal, inject, DOCUMENT } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { TooltipModule } from 'primeng/tooltip';
import { Menu, MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { NotificationPanel } from '../../shared/components/notification-panel/notification-panel';

@Component({
  selector: 'app-main-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TooltipModule, MenuModule, NotificationPanel],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayout {
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);
  readonly userMenu = viewChild<Menu>('userMenu');
  readonly isDark = signal(true);
  readonly sidebarExpanded = signal(false);
  readonly mobileSidebarOpen = signal(false);

  readonly userMenuItems: MenuItem[] = [
    { label: 'My Profile', icon: 'pi pi-user', command: () => this.router.navigate(['/profile']) },
    { label: 'Change Password', icon: 'pi pi-lock', command: () => this.router.navigate(['/change-password']) },
    { label: 'Settings', icon: 'pi pi-cog', command: () => this.router.navigate(['/settings']) },
    { separator: true },
    { label: 'Sign Out', icon: 'pi pi-sign-out', command: () => this.router.navigate(['/login']) },
  ];

  constructor() {
    this.document.documentElement.classList.add('dark-mode');
  }

  toggleTheme(): void {
    const root = this.document.documentElement;
    const dark = !this.isDark();

    const applyTheme = () => {
      this.isDark.set(dark);
      root.classList.toggle('dark-mode', dark);
    };

    if ('startViewTransition' in this.document) {
      (this.document as any).startViewTransition(applyTheme);
    } else {
      applyTheme();
    }
  }

  toggleSidebar(): void {
    this.sidebarExpanded.update((v) => !v);
  }

  toggleMobileSidebar(): void {
    this.mobileSidebarOpen.update((v) => !v);
  }

  closeMobileSidebar(): void {
    this.mobileSidebarOpen.set(false);
  }

  navigateToNewInvoice(): void {
    this.router.navigate(['/invoices/add']);
  }

  toggleUserMenu(event: Event): void {
    this.userMenu()?.toggle(event);
  }
}
