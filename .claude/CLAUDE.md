
You are an expert in TypeScript, Angular, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices.

## Project Overview

PS STUDIO — A photography studio billing application built with Angular 21 and PrimeNG 21.

### Tech Stack

- **Framework:** Angular 21.1.0 (standalone components, signals)
- **UI Library:** PrimeNG 21.1.3 with PrimeIcons 7.0
- **Theme System:** @primeuix/themes 2.0.3 (Aura base with custom "Strapi" preset)
- **Font:** Poppins (Google Fonts)
- **Testing:** Vitest 4.0.8
- **Language:** TypeScript 5.9.2

### Design System

- **Primary Color:** `#4945ff` (Strapi purple)
- **Dark Background:** `#181826` (header/sidebar), `#1e1e30` (cards), `#25253a` (hover)
- **Default Theme:** Dark mode (soft dark, `.dark-mode` class on `<html>`)
- **Base Font Size:** 13px
- **Border Radius:** 4px (default), 8px (dialogs, menus)
- **All styles live in `src/styles.scss`** — component SCSS files are empty

## Project Structure

```
src/
├── main.ts                              # Bootstrap entry
├── styles.scss                          # ALL styles (global, single file)
├── app/
│   ├── app.ts / app.html / app.scss     # Root component
│   ├── app.config.ts                    # Providers, PrimeNG theme preset
│   ├── app.routes.ts                    # Lazy-loaded routes
│   ├── features/
│   │   ├── auth/login/                  # Login page (UI only, no auth service yet)
│   │   ├── customers/
│   │   │   ├── customer-list/           # Customer table with tabs, search, CRUD
│   │   │   └── customer-form/           # Add/Edit dialog form
│   │   ├── dashboard/                   # Not implemented
│   │   ├── billing/                     # Not implemented
│   │   ├── invoices/                    # Not implemented
│   │   ├── reports/                     # Not implemented
│   │   └── settings/                    # Not implemented
│   ├── shared/
│   │   ├── layouts/main-layout/         # App shell: header, sidebar, router-outlet
│   │   ├── models/customer.model.ts     # Customer interface
│   │   ├── services/customer.service.ts # Signal-based CRUD (mock data)
│   │   ├── components/                  # Empty — for future shared components
│   │   ├── directives/                  # Empty
│   │   ├── pipes/                       # Empty
│   │   └── validators/                  # Empty
│   └── core/                            # Empty — for guards, interceptors, utils
```

## Styling Conventions

- **Single global stylesheet:** ALL styles in `src/styles.scss`, organized in 14 sections
- **No component-scoped styles** — component `.scss` files contain only a comment
- **CSS variables** for theming — light/dark mode toggle via `.dark-mode` class
- **No `:host ::ng-deep`** — not needed with global styles
- **PrimeNG overrides** use `!important` where needed to beat framework specificity
- Use existing CSS classes when building new pages — reuse `.page-header`, `.tab-nav`, `.toolbar`, `.form-field`, etc.

### styles.scss Sections

1. CSS Variables (light + `.dark-mode`)
2. Reset & Base
3. Utilities (`.w-full`, `.text-muted`)
4. App Layout (header, sidebar, page content)
5. Page Header (`.page-header`, `.page-title`, `.page-subtitle`)
6. Tab Navigation (`.tab-nav`, `.tab-item`)
7. Toolbar (`.toolbar`, `.toolbar-left`, `.toolbar-right`)
8. Data Table Cells (`.client-cell`, `.client-avatar`, `.service-tag`)
9. Empty State (`.empty-message`, `.empty-icon-wrap`)
10. Forms (`.customer-form`, `.form-field`, `.field-label`, `.form-actions`)
11. Login Page (`.login-page`, `.login-card`, `.login-form`)
12. PrimeNG Overrides — global (buttons, table, tags, inputs, selects, dialogs, menus)
13. PrimeNG Component Overrides — theme-aware (dialog, menu, tooltip, checkbox, paginator)
14. Dark Mode Specific Overrides (deeper shadows, `surface-hover` backgrounds)

## Routing

- `/login` — Login page (lazy loaded)
- `/` → redirects to `/customers`
- `/customers` — Customer list (lazy loaded, inside MainLayout)
- Sidebar nav links exist for `/dashboard`, `/billing`, `/invoices`, `/reports` (not implemented)

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

## Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default in Angular v20+.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.

## Accessibility Requirements

- It MUST pass all AXE checks.
- It MUST follow all WCAG AA minimums, including focus management, color contrast, and ARIA attributes.

### Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `computed()` for derived state
- Set `changeDetection: ChangeDetectionStrategy.OnPush` in `@Component` decorator
- Prefer inline templates for small components
- Prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead
- When using external templates/styles, use paths relative to the component TS file.

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
- Do not assume globals like (`new Date()`) are available.
- Do not write arrow functions in templates (they are not supported).

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Use the `inject()` function instead of constructor injection

## PrimeNG v21 Notes

- Theme configured in `app.config.ts` using `definePreset(Aura, {...})` from `@primeuix/themes/aura`
- Dark mode selector: `.dark-mode` on document root
- Overlay components (dialog, menu, select dropdown) append to `<body>` — style globally, not in component scope
- PrimeNG v21 CSS class names: `.p-menu-item-content`, `.p-menu-item-label`, `.p-select-overlay`, `.p-paginator-page-selected`, etc.

### PrimeNG Documentation (LLM-friendly)

- Overview & component list: https://primeng.org/llms/llms.txt
- Full documentation: https://primeng.org/llms/llms-full.txt
- Individual component docs: `https://primeng.org/llms/components/{component}.md`
  - Example: https://primeng.org/llms/components/button.md

### Angular Documentation (LLM-friendly)

- Full documentation: https://angular.dev/assets/context/llms-full.txt
