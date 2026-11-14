import { createAction, createReducer, createSelector, on, props } from '@ngrx/store';
import { createFeatureSelector } from '@ngrx/store';

export interface FavoritesState {
  ids: string[];
}

export const toggleFavorite = createAction('[Favorites] Toggle', props<{ id: string }>());
export const clearFavorites = createAction('[Favorites] Clear');

const initialState: FavoritesState = { ids: [] };
export const favoritesReducer = createReducer(
  initialState,
  on(toggleFavorite, (state, { id }) => ({
    ids: state.ids.includes(id) ? state.ids.filter((item) => item !== id) : [...state.ids, id],
  })),
  on(clearFavorites, () => initialState),
);

const selectFavoritesState = createFeatureSelector<FavoritesState>('favorites');
export const selectFavoriteIds = createSelector(selectFavoritesState, (state) => state.ids);
