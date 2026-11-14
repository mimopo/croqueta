import { defineStore } from 'pinia';

export const useFavorites = defineStore('favorites', {
  state: () => ({ ids: [] as string[] }),
  getters: {
    count: (state) => state.ids.length,
  },
  actions: {
    toggle(id: string) {
      this.ids = this.ids.includes(id) ? this.ids.filter((item) => item !== id) : [...this.ids, id];
    },
    clear() {
      this.ids = [];
    },
  },
});
