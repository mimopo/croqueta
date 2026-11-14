import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { installBenchmarkHooks } from '../../../shared/bench-hooks.mjs';
import { CatalogState } from './catalog-state';
import { clearFavorites, selectFavoriteIds } from './favorites-state';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <header class="site-header">
      <div class="header-inner">
        <a class="brand" routerLink="/products">Croqueta <span>Catalog</span></a>
        <nav class="main-nav" aria-label="Main navigation">
          <a routerLink="/products" routerLinkActive="active">Products</a>
          <a routerLink="/favorites" routerLinkActive="active">Favorites <span class="favorite-count" data-testid="favorite-count">{{ favoriteCount() }}</span></a>
          <a routerLink="/contact" routerLinkActive="active">Contact</a>
        </nav>
      </div>
    </header>
    <router-outlet />
  `,
})
export class AppComponent {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly catalog = inject(CatalogState);
  private readonly favoriteIds = this.store.selectSignal(selectFavoriteIds);
  readonly favoriteCount = computed(() => this.favoriteIds().length);

  constructor() {
    installBenchmarkHooks({
      setProductCount: (count) => this.catalog.setProductCount(count),
      reset: () => {
        this.catalog.reset();
        this.store.dispatch(clearFavorites());
      },
      navigate: async (path) => { await this.router.navigateByUrl(path); },
    });
  }
}
