<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';

import { money, paginate, selectProducts } from '../../../../shared/catalog-utils.mjs';
import { category, page, products, query, sort } from '../catalog-state';
import { useFavorites } from '../favorites';

const props = withDefaults(defineProps<{ favoritesOnly?: boolean }>(), { favoritesOnly: false });
const favorites = useFavorites();
const filtered = computed(() => selectProducts(products.value, query.value, category.value, sort.value));
const visibleCollection = computed(() => props.favoritesOnly
  ? products.value.filter((product) => favorites.ids.includes(product.id))
  : filtered.value);
const pageData = computed(() => paginate(visibleCollection.value, page.value));
const visible = computed(() => pageData.value.items);
const countText = computed(() => `${visibleCollection.value.length} products`);

function changeQuery(value: string) {
  query.value = value;
  page.value = 1;
}
function changeCategory(value: string) {
  category.value = value;
  page.value = 1;
}
function changeSort(value: string) {
  sort.value = value;
  page.value = 1;
}
</script>

<template>
  <main class="page-shell">
    <h1>{{ props.favoritesOnly ? 'Your favorites' : 'Product catalog' }}</h1>
    <p class="page-intro">A shared catalog benchmark built with Vue.</p>
    <section v-if="!props.favoritesOnly" class="toolbar" aria-label="Catalog filters">
      <div class="field"><label for="catalog-search">Search products</label><input id="catalog-search" data-testid="search-input" type="search" :value="query" placeholder="Search by name or category" @input="changeQuery(($event.target as HTMLInputElement).value)" /></div>
      <div class="field"><label for="catalog-category">Category</label><select id="catalog-category" data-testid="category-filter" :value="category" @change="changeCategory(($event.target as HTMLSelectElement).value)"><option value="all">All categories</option><option v-for="index in 8" :key="index" :value="`category-${index}`">Category {{ index }}</option></select></div>
      <div class="field"><label for="catalog-sort">Sort by</label><select id="catalog-sort" data-testid="sort-select" :value="sort" @change="changeSort(($event.target as HTMLSelectElement).value)"><option value="id-asc">Product ID</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option></select></div>
    </section>
    <div class="result-line"><span data-testid="result-count">{{ countText }}</span></div>
    <div v-if="visible.length" class="product-grid" data-testid="product-grid">
      <article v-for="product in visible" :key="product.id" class="product-card" data-testid="product-card" :data-product-id="product.id" :data-price-cents="product.priceCents">
        <RouterLink :to="`/products/${product.id}`"><div class="product-art" aria-hidden="true">{{ product.id.slice(-2) }}</div><h2>{{ product.name }}</h2></RouterLink>
        <p class="product-meta">{{ product.category }} · {{ product.stock }} in stock · {{ (product.ratingTenths / 10).toFixed(1) }} / 5</p>
        <p class="product-price">{{ money(product.priceCents) }}</p>
        <button :class="favorites.ids.includes(product.id) ? 'button' : 'button secondary'" data-testid="favorite-toggle" :aria-pressed="favorites.ids.includes(product.id)" @click="favorites.toggle(product.id)">{{ favorites.ids.includes(product.id) ? 'Remove favorite' : 'Add favorite' }}</button>
      </article>
    </div>
    <div v-else class="empty-state" data-testid="empty-state">No products found.</div>
    <nav class="pagination" aria-label="Catalog pages">
      <button class="button secondary" data-testid="previous-page" :disabled="pageData.page <= 1" @click="page = Math.max(1, pageData.page - 1)">Previous</button>
      <span data-testid="page-indicator">Page {{ pageData.page }} of {{ pageData.pageCount }}</span>
      <button class="button" data-testid="next-page" :disabled="pageData.page >= pageData.pageCount" @click="page = pageData.page + 1">Next</button>
    </nav>
  </main>
</template>
