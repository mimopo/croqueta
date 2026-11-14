<script setup lang="ts">
import { onMounted } from 'vue';
import { installBenchmarkHooks } from '../../../shared/bench-hooks.mjs';
import { resetCatalog, setProductCount } from './catalog-state';
import { useFavorites } from './favorites';
import { router } from './router';

const favorites = useFavorites();

onMounted(() => {
  installBenchmarkHooks({
    setProductCount,
    reset() {
      resetCatalog();
      favorites.clear();
    },
    navigate(path) {
      return router.push(path);
    },
  });
});
</script>

<template>
  <header class="site-header">
    <div class="header-inner">
      <RouterLink class="brand" to="/products">Croqueta <span>Catalog</span></RouterLink>
      <nav class="main-nav" aria-label="Main navigation">
        <RouterLink to="/products">Products</RouterLink>
        <RouterLink to="/favorites">Favorites <span class="favorite-count" data-testid="favorite-count">{{ favorites.count }}</span></RouterLink>
        <RouterLink to="/contact">Contact</RouterLink>
      </nav>
    </div>
  </header>
  <RouterView />
</template>
