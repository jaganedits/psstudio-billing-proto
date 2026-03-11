import { Injectable, signal, inject, DOCUMENT } from '@angular/core';

const THEME_STORAGE_KEY = 'psstudio-theme';

type ThemeValue = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly storage = this.document.defaultView?.sessionStorage ?? null;

  readonly isDark = signal(true);

  constructor() {
    this.restoreTheme();
  }

  toggleTheme(): void {
    this.applyTheme(!this.isDark(), { animate: true, persist: true });
  }

  private restoreTheme(): void {
    const stored = this.storage?.getItem(THEME_STORAGE_KEY) as ThemeValue | null;
    if (stored === 'light' || stored === 'dark') {
      this.applyTheme(stored === 'dark', { animate: false, persist: false });
      return;
    }
    this.applyTheme(true, { animate: false, persist: true });
  }

  private applyTheme(
    dark: boolean,
    options: { animate: boolean; persist: boolean },
  ): void {
    const root = this.document.documentElement;
    const apply = () => {
      this.isDark.set(dark);
      root.classList.toggle('dark-mode', dark);
      if (options.persist) {
        this.storage?.setItem(THEME_STORAGE_KEY, dark ? 'dark' : 'light');
      }
    };

    if (options.animate && 'startViewTransition' in this.document) {
      (this.document as any).startViewTransition(apply);
    } else {
      apply();
    }
  }
}
