import { ref } from 'vue';
import { createProducts } from '../../../products.mjs';
import type { Product } from '../../../products.mjs';

const initialCount = Math.min(Number(new URLSearchParams(location.search).get('size')) || 100, 10_000);
export const products = ref<Product[]>(createProducts(initialCount));
export const query = ref('');
export const category = ref('all');
export const sort = ref('id-asc');
export const page = ref(1);

export function setProductCount(count: number) {
  products.value = createProducts(count);
}

export function resetCatalog() {
  query.value = '';
  category.value = 'all';
  sort.value = 'id-asc';
  page.value = 1;
}
