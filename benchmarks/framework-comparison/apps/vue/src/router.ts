import { createRouter, createWebHistory } from 'vue-router';

import CatalogPage from './views/CatalogPage.vue';
import ContactPage from './views/ContactPage.vue';
import DetailPage from './views/DetailPage.vue';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/products' },
    { path: '/products', component: CatalogPage },
    { path: '/favorites', component: CatalogPage, props: { favoritesOnly: true } },
    { path: '/products/:id', component: DetailPage },
    { path: '/contact', component: ContactPage },
    { path: '/:pathMatch(.*)*', redirect: '/products' },
  ],
});
