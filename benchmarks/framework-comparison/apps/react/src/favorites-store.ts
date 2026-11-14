import { configureStore, createSlice, type PayloadAction } from '@reduxjs/toolkit';

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState: { ids: [] as string[] },
  reducers: {
    toggle(state, action: PayloadAction<string>) {
      state.ids = state.ids.includes(action.payload) ? state.ids.filter((id) => id !== action.payload) : [...state.ids, action.payload];
    },
    clear(state) {
      state.ids = [];
    },
  },
});

export const { toggle: toggleFavorite, clear: clearFavorites } = favoritesSlice.actions;
export const store = configureStore({ reducer: { favorites: favoritesSlice.reducer } });
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
