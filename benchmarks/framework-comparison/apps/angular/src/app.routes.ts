import { Routes } from '@angular/router';
import { CatalogPageComponent } from './catalog-page.component';
import { ContactPageComponent } from './contact-page.component';
import { DetailPageComponent } from './detail-page.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'products' },
  { path: 'products', component: CatalogPageComponent },
  { path: 'favorites', component: CatalogPageComponent, data: { favoritesOnly: true } },
  { path: 'products/:id', component: DetailPageComponent },
  { path: 'contact', component: ContactPageComponent },
  { path: '**', redirectTo: 'products' },
];
