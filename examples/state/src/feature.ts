import { type Reducers, Store, createAction, createFeature, createFeatureSelector, createSelector, inject } from '@mimopo/croqueta';

import type { ApiCharactersResponse, CharactersFeatureState } from './model';
import { ApiService } from './service';

// Set the initial state for the feature
const key = 'characters';
const initialState: CharactersFeatureState = {
  characters: [],
  page: 1,
  total: 0,
  status: 'loading',
};

// Define the action set of the feature
const actions = {
  get: createAction<void>('get'),
  success: createAction<ApiCharactersResponse>('success'),
  error: createAction<void>('error'),
};

// Define the reducer for each action
const reducers: Reducers<CharactersFeatureState, typeof actions> = {
  get: (state) => ({ ...state, status: 'loading' }),
  error: (state) => ({ ...state, status: 'idle' }),
  success: (state, payload) => ({
    ...state,
    status: payload.next ? 'idle' : 'completed',
    total: payload.pages,
    pages: payload.pages,
    page: state.page + 1,
    characters: [...state.characters, ...payload.results],
  }),
};

// Define the selectors to access the data
const featureSelector = createFeatureSelector<CharactersFeatureState>(key);

const selectors = {
  characters: createSelector(featureSelector, (s) => s.characters),
  page: createSelector(featureSelector, (s) => s.page),
  status: createSelector(featureSelector, (s) => s.status),
};

// Export the feature
export const charactersFeature = createFeature({
  key,
  initialState,
  actions,
  reducers,
  selectors,
  effects: [
    async (store: Store) => {
      const actionType = actions.get().type;
      const action = store.actions.get();
      if (action.type === actionType) {
        const api = inject(ApiService);
        const page = store.select(selectors.page).get();
        const result = await api.getCharacters(page);
        return actions.success(result);
      }
    },
  ],
});
