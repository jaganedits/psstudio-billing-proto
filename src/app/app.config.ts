import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withPreloading, withViewTransitions, PreloadAllModules } from '@angular/router';

import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { definePreset } from '@primeuix/themes';

import { routes } from './app.routes';

const Strapi = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#f5f5ff',
      100: '#ececfe',
      200: '#d9d8fd',
      300: '#b8b6fb',
      400: '#9694f8',
      500: '#7b79ff',
      600: '#4945ff',
      700: '#3d39e6',
      800: '#322ebf',
      900: '#282599',
      950: '#1c1a73',
    },
    colorScheme: {
      light: {
        primary: {
          color: '#4945ff',
          inverseColor: '#ffffff',
          hoverColor: '#7b79ff',
          activeColor: '#3d39e6',
        },
        highlight: {
          background: '#f0f0ff',
          focusBackground: '#dfdffe',
          color: '#4945ff',
          focusColor: '#3d39e6',
        },
      },
    },
  },
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withPreloading(PreloadAllModules),
      withViewTransitions({ skipInitialTransition: true }),
    ),
    providePrimeNG({
      theme: {
        preset: Strapi,
        options: {
          darkModeSelector: '.dark-mode',
        },
      },
    }),
  ],
};
