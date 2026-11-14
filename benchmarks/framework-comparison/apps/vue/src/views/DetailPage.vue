<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { money } from '../../../../shared/catalog-utils.mjs';
import { products } from '../catalog-state';
import { useFavorites } from '../favorites';

const route = useRoute();
const favorites = useFavorites();
const product = computed(() => products.value.find((item) => item.id === route.params.id));
</script>

<template>
  <main v-if="product" class="page-shell" data-testid="product-detail" :data-product-id="product.id">
    <RouterLink class="back-link" to="/products">← Back to products</RouterLink>
    <div class="detail-layout"><div class="detail-art" aria-hidden="true">{{ product.id.slice(-2) }}</div><section class="detail-panel"><h1>{{ product.name }}</h1><p class="page-intro">{{ product.category }}</p><dl><dt>Price</dt><dd>{{ money(product.priceCents) }}</dd><dt>In stock</dt><dd>{{ product.stock }}</dd><dt>Rating</dt><dd>{{ (product.ratingTenths / 10).toFixed(1) }} / 5</dd></dl><button class="button" data-testid="favorite-toggle" :aria-pressed="favorites.ids.includes(product.id)" @click="favorites.toggle(product.id)">{{ favorites.ids.includes(product.id) ? 'Remove favorite' : 'Add favorite' }}</button></section></div>
  </main>
  <main v-else class="page-shell"><h1>Product not found</h1><RouterLink to="/products">Back to products</RouterLink></main>
</template>
