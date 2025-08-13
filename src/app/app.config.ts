import { ApplicationConfig, provideZoneChangeDetection, LOCALE_ID  } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import { providePrimeNG } from 'primeng/config';
import { MessageService } from 'primeng/api';
import { registerLocaleData } from '@angular/common';
import localeTr from '@angular/common/locales/tr';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { authInterceptorProvider } from '../services/auth.interceptor';
import Aura from '@primeuix/themes/aura';
import { routes } from './app.routes';

registerLocaleData(localeTr);

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideAnimationsAsync(),
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    authInterceptorProvider,
    providePrimeNG({ theme: {preset: Aura,}}),
    MessageService,
    { provide: LOCALE_ID, useValue: 'tr-TR' }
  ]
};
