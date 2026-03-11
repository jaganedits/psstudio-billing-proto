import { Component, ChangeDetectionStrategy, viewChild, signal, inject } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { TooltipModule } from 'primeng/tooltip';
import { Menu, MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { NotificationPanel } from '../../shared/components/notification-panel/notification-panel';
import { RouteLoader } from '../../shared/components/route-loader/route-loader';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-main-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TooltipModule, MenuModule, NotificationPanel, RouteLoader],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayout {
  private readonly router = inject(Router);
  private readonly themeService = inject(ThemeService);
  readonly userMenu = viewChild<Menu>('userMenu');
  readonly isDark = this.themeService.isDark;
  readonly sidebarExpanded = signal(false);
  readonly mobileSidebarOpen = signal(false);

  readonly userMenuItems: MenuItem[] = [
    { label: 'My Profile', icon: 'pi pi-user', command: () => this.router.navigate(['/profile']) },
    { label: 'Change Password', icon: 'pi pi-lock', command: () => this.router.navigate(['/change-password']) },
    { label: 'Settings', icon: 'pi pi-cog', command: () => this.router.navigate(['/settings']) },
    { separator: true },
    { label: 'Sign Out', icon: 'pi pi-sign-out', command: () => this.router.navigate(['/login']) },
  ];

  toggleTheme(): void {
    this.themeService.toggleTheme();
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
