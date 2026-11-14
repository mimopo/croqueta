import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { map } from 'rxjs';
import { money } from '../../../shared/catalog-utils.mjs';
import { CatalogState } from './catalog-state';
import { selectFavoriteIds, toggleFavorite } from './favorites-state';

@Component({
  standalone: true,
  imports: [RouterLink],
  template: `
    @if (product(); as item) {
      <main class="page-shell" data-testid="product-detail" [attr.data-product-id]="item.id">
        <a class="back-link" routerLink="/products">← Back to products</a>
        <div class="detail-layout"><div class="detail-art" aria-hidden="true">{{ item.id.slice(-2) }}</div><section class="detail-panel"><h1>{{ item.name }}</h1><p class="page-intro">{{ item.category }}</p><dl><dt>Price</dt><dd>{{ money(item.priceCents) }}</dd><dt>In stock</dt><dd>{{ item.stock }}</dd><dt>Rating</dt><dd>{{ (item.ratingTenths / 10).toFixed(1) }} / 5</dd></dl><button class="button" data-testid="favorite-toggle" [attr.aria-pressed]="favoriteIds().includes(item.id)" (click)="toggle(item.id)">{{ favoriteIds().includes(item.id) ? 'Remove favorite' : 'Add favorite' }}</button></section></div>
      </main>
    } @else {
      <main class="page-shell"><h1>Product not found</h1><a routerLink="/products">Back to products</a></main>
    }
  `,
})
export class DetailPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly catalog = inject(CatalogState);
  private readonly store = inject(Store);
  private readonly id = toSignal(this.route.paramMap.pipe(map((params) => params.get('id') ?? '')), { initialValue: this.route.snapshot.paramMap.get('id') ?? '' });
  readonly favoriteIds = this.store.selectSignal(selectFavoriteIds);
  readonly product = computed(() => this.catalog.products().find((item) => item.id === this.id()));
  readonly money = money;
  toggle(id: string) {
    this.store.dispatch(toggleFavorite({ id }));
  }
}
