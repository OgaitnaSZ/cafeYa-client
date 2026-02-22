import { ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { routes } from './app.routes';
import { APP_INITIALIZER } from '@angular/core';
import { SocketService } from './core/services/socket';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    importProvidersFrom(HttpClientModule),
    {
      provide: APP_INITIALIZER,
      useFactory: (socketService: SocketService) => () => {
        // Socket se conectará automáticamente si hay sesión
        return Promise.resolve();
      },
      deps: [SocketService],
      multi: true
    }
  ]
};
