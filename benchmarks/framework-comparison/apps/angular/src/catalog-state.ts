import { Injectable, signal } from '@angular/core';
import { createProducts } from '../../../products.mjs';
import type { Product } from '../../../products.mjs';
import { selectProducts } from '../../../shared/catalog-utils.mjs';

const initialCount = Math.min(Number(new URLSearchParams(location.search).get('size')) || 100, 10_000);

@Injectable({ providedIn: 'root' })
export class CatalogState {
  readonly products = signal<Product[]>(createProducts(initialCount));
  readonly query = signal('');
  readonly category = signal('all');
  readonly sort = signal('id-asc');
  readonly page = signal(1);
  setProductCount(count: number) {
    this.products.set(createProducts(count));
    this.reset();
  }

  updateQuery(query: string) {
    this.query.set(query);
    this.page.set(1);
  }

  updateCategory(category: string) {
    this.category.set(category);
    this.page.set(1);
  }

  updateSort(sort: string) {
    this.sort.set(sort);
    this.page.set(1);
  }

  selectProducts() {
    return selectProducts(this.products(), this.query(), this.category(), this.sort());
  }

  reset() {
    this.query.set('');
    this.category.set('all');
    this.sort.set('id-asc');
    this.page.set(1);
  }
}
