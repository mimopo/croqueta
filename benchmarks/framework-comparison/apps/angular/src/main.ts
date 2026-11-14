import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideStore } from '@ngrx/store';
import { AppComponent } from './app.component';
import { routes } from './app.routes';
import { favoritesReducer } from './favorites-state';

bootstrapApplication(AppComponent, {
  providers: [provideRouter(routes), provideStore({ favorites: favoritesReducer })],
}).catch((error: unknown) => console.error(error));
