import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { money, paginate } from '../../../shared/catalog-utils.mjs';
import { CatalogState } from './catalog-state';
import { selectFavoriteIds, toggleFavorite } from './favorites-state';

@Component({
  standalone: true,
  imports: [RouterLink],
  template: `
    <main class="page-shell">
      <h1>{{ isFavorites() ? 'Your favorites' : 'Product catalog' }}</h1>
      <p class="page-intro">A shared catalog benchmark built with Angular.</p>
      @if (!isFavorites()) {
        <section class="toolbar" aria-label="Catalog filters">
          <div class="field"><label for="catalog-search">Search products</label><input id="catalog-search" data-testid="search-input" type="search" [value]="catalog.query()" placeholder="Search by name or category" (input)="updateQuery($event)" /></div>
          <div class="field"><label for="catalog-category">Category</label><select id="catalog-category" data-testid="category-filter" [value]="catalog.category()" (change)="updateCategory($event)"><option value="all">All categories</option>@for (index of categoryNumbers; track index) {<option [value]="'category-' + index">Category {{ index }}</option>}</select></div>
          <div class="field"><label for="catalog-sort">Sort by</label><select id="catalog-sort" data-testid="sort-select" [value]="catalog.sort()" (change)="updateSort($event)"><option value="id-asc">Product ID</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option></select></div>
        </section>
      }
      <div class="result-line"><span data-testid="result-count">{{ collection().length }} products</span></div>
      @if (pageData().items.length) {
        <div class="product-grid" data-testid="product-grid">
          @for (product of pageData().items; track product.id) {
            <article class="product-card" data-testid="product-card" [attr.data-product-id]="product.id" [attr.data-price-cents]="product.priceCents">
              <a [routerLink]="['/products', product.id]"><div class="product-art" aria-hidden="true">{{ product.id.slice(-2) }}</div><h2>{{ product.name }}</h2></a>
              <p class="product-meta">{{ product.category }} · {{ product.stock }} in stock · {{ (product.ratingTenths / 10).toFixed(1) }} / 5</p>
              <p class="product-price">{{ money(product.priceCents) }}</p>
              <button class="button" data-testid="favorite-toggle" [attr.aria-pressed]="favoriteIds().includes(product.id)" (click)="toggle(product.id)">{{ favoriteIds().includes(product.id) ? 'Remove favorite' : 'Add favorite' }}</button>
            </article>
          }
        </div>
      } @else {
        <div class="empty-state" data-testid="empty-state">No products found.</div>
      }
      <nav class="pagination" aria-label="Catalog pages">
        <button class="button secondary" data-testid="previous-page" [disabled]="pageData().page <= 1" (click)="previousPage()">Previous</button>
        <span data-testid="page-indicator">Page {{ pageData().page }} of {{ pageData().pageCount }}</span>
        <button class="button" data-testid="next-page" [disabled]="pageData().page >= pageData().pageCount" (click)="catalog.page.set(pageData().page + 1)">Next</button>
      </nav>
    </main>
  `,
})
export class CatalogPageComponent {
  readonly categoryNumbers = [1, 2, 3, 4, 5, 6, 7, 8];
  private readonly route = inject(ActivatedRoute);
  private readonly routeData = toSignal(this.route.data, { initialValue: this.route.snapshot.data });
  private readonly store = inject(Store);
  readonly catalog = inject(CatalogState);
  readonly favoriteIds = this.store.selectSignal(selectFavoriteIds);
  readonly isFavorites = computed(() => Boolean(this.routeData()['favoritesOnly']));
  readonly collection = computed(() => this.isFavorites()
    ? this.catalog.products().filter((product) => this.favoriteIds().includes(product.id))
    : this.catalog.selectProducts());
  readonly pageData = computed(() => paginate(this.collection(), this.catalog.page()));
  readonly money = money;

  updateQuery(event: Event) {
    this.catalog.updateQuery((event.target as HTMLInputElement).value);
  }
  updateCategory(event: Event) {
    this.catalog.updateCategory((event.target as HTMLSelectElement).value);
  }
  updateSort(event: Event) {
    this.catalog.updateSort((event.target as HTMLSelectElement).value);
  }
  previousPage() {
    this.catalog.page.set(Math.max(1, this.pageData().page - 1));
  }
  toggle(id: string) {
    this.store.dispatch(toggleFavorite({ id }));
  }
}
