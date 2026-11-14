import {
  Component,
  PathRouterStrategy,
  Router,
  RouterComponent,
  Store,
  computed,
  createAction,
  createFeature,
  createFeatureSelector,
  createSelector,
  html,
  inject,
  provideRouter,
  registerComponent,
  repeat,
  signal,
  type Reducers,
} from '@mimopo/croqueta';
import { installBenchmarkHooks } from '../../../shared/bench-hooks.mjs';
import { money, paginate, selectProducts, validateContact } from '../../../shared/catalog-utils.mjs';
import { createProducts, type Product } from '../../../products.mjs';
import '../../../shared/catalog.css';

interface FavoriteState {
  ids: string[];
}

const favoriteActions = {
  toggle: createAction<{ id: string }>('toggle'),
  clear: createAction<void>('clear'),
};
const favoriteInitialState: FavoriteState = { ids: [] };
const favoriteSelector = createFeatureSelector<FavoriteState>('favorites');
const favoriteFeature = createFeature({
  key: 'favorites',
  initialState: favoriteInitialState,
  actions: favoriteActions,
  reducers: {
    toggle: (state, payload) => ({
      ids: state.ids.includes(payload.id) ? state.ids.filter((id) => id !== payload.id) : [...state.ids, payload.id],
    }),
    clear: () => favoriteInitialState,
  } satisfies Reducers<FavoriteState, typeof favoriteActions>,
  selectors: { ids: createSelector(favoriteSelector, (state) => state.ids) },
});

const productCount = Number(new URLSearchParams(location.search).get('size')) || 100;
const products = signal(createProducts(Math.min(productCount, 10_000)));
const query = signal('');
const category = signal('all');
const sort = signal('id-asc');
const page = signal(1);
const contact = {
  name: signal(''),
  email: signal(''),
  message: signal(''),
};
const formErrors = signal<Record<string, string>>({});
const formSuccess = signal(false);
const selectedProducts = computed(() => selectProducts(products.get(), query.get(), category.get(), sort.get()));
const pagedProducts = computed(() => paginate(selectedProducts.get(), page.get()));
const pageItems = computed(() => pagedProducts.get().items);

class CatalogView extends Component {
  public static tag = 'catalog-view';

  private router = inject(Router);
  private store = inject(Store);
  private favorites = this.store.select(favoriteFeature.selectors.ids);

  public override connectedCallback(): void {
    super.connectedCallback();
    installBenchmarkHooks({
      setProductCount: (count) => {
        products.set(createProducts(count));
      },
      reset: () => {
        query.set('');
        category.set('all');
        sort.set('id-asc');
        page.set(1);
        contact.name.set('');
        contact.email.set('');
        contact.message.set('');
        formErrors.set({});
        formSuccess.set(false);
        this.store.dispatch(favoriteActions.clear());
      },
      navigate: (path) => {
        return this.router.navigate(path);
      },
    });
  }

  protected render(): Node {
    const favoriteCount = computed(() => this.favorites.get().length);
    const view = computed(() => this.renderRoute(this.router.path.get()));
    return html`
      <header class="site-header">
        <div class="header-inner">
          <a class="brand" is="router-link" route="/products">Croqueta <span>Catalog</span></a>
          <nav class="main-nav" aria-label="Main navigation">
            <a is="router-link" route="/products">Products</a>
            <a is="router-link" route="/favorites">Favorites <span class="favorite-count" data-testid="favorite-count">${favoriteCount}</span></a>
            <a is="router-link" route="/contact">Contact</a>
          </nav>
        </div>
      </header>
      ${view}
    `;
  }

  private renderRoute(path: string): Node {
    if (path === '/' || path === '/products') return this.renderCatalog(false);
    if (path === '/favorites') return this.renderCatalog(true);
    if (path === '/contact') return this.renderContact();
    if (path.startsWith('/products/')) return this.renderDetail(path.slice('/products/'.length));
    return html`<main class="page-shell"><h1>Page not found</h1><a is="router-link" route="/products">Back to products</a></main>`;
  }

  private renderCatalog(favoritesOnly: boolean): Node {
    const data = computed(() => {
      const all = favoritesOnly ? products.get().filter((product) => this.favorites.get().includes(product.id)) : selectedProducts.get();
      return paginate(all, page.get());
    });
    const items = computed(() => data.get().items);
    const count = computed(() => `${favoritesOnly ? this.favorites.get().length : selectedProducts.get().length} products`);
    const pageLabel = computed(() => `Page ${data.get().page} of ${data.get().pageCount}`);
    const previousDisabled = computed(() => data.get().page <= 1);
    const nextDisabled = computed(() => data.get().page >= data.get().pageCount);
    return html`
      <main class="page-shell">
        <h1>${favoritesOnly ? 'Your favorites' : 'Product catalog'}</h1>
        <p class="page-intro">A shared catalog benchmark built with Croqueta.</p>
        ${favoritesOnly ? '' : this.renderToolbar()}
        <div class="result-line"><span data-testid="result-count">${count}</span></div>
        ${items.get().length ? html`<div class="product-grid" data-testid="product-grid">${this.renderCards(items)}</div>` : html`<div class="empty-state" data-testid="empty-state">No products found.</div>`}
        <nav class="pagination" aria-label="Catalog pages">
          <button class="button secondary" data-testid="previous-page" [disabled]="${previousDisabled}" (click)="${() => page.set(Math.max(1, data.get().page - 1))}">Previous</button>
          <span data-testid="page-indicator">${pageLabel}</span>
          <button class="button" data-testid="next-page" [disabled]="${nextDisabled}" (click)="${() => page.set(data.get().page + 1)}">Next</button>
        </nav>
      </main>
    `;
  }

  private renderToolbar(): Node {
    return html`
      <section class="toolbar" aria-label="Catalog filters">
        <div class="field"><label for="catalog-search">Search products</label><input id="catalog-search" data-testid="search-input" type="search" value="${query}" placeholder="Search by name or category" (input)="${(event: Event) => { query.set((event.currentTarget as HTMLInputElement).value); page.set(1); }}" /></div>
        <div class="field"><label for="catalog-category">Category</label><select id="catalog-category" data-testid="category-filter" (change)="${(event: Event) => { category.set((event.currentTarget as HTMLSelectElement).value); page.set(1); }}"><option value="all">All categories</option><option value="category-1">Category 1</option><option value="category-2">Category 2</option><option value="category-3">Category 3</option><option value="category-4">Category 4</option><option value="category-5">Category 5</option><option value="category-6">Category 6</option><option value="category-7">Category 7</option><option value="category-8">Category 8</option></select></div>
        <div class="field"><label for="catalog-sort">Sort by</label><select id="catalog-sort" data-testid="sort-select" (change)="${(event: Event) => { sort.set((event.currentTarget as HTMLSelectElement).value); page.set(1); }}"><option value="id-asc">Product ID</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option></select></div>
      </section>
    `;
  }

  private renderCards(items: typeof pageItems): Node {
    return html`${repeat(items, (product: Product) => product.id, (product: Product) => this.renderCard(product))}`;
  }

  private renderCard(product: Product): Node {
    const favorite = computed(() => this.favorites.get().includes(product.id));
    const favoriteLabel = computed(() => favorite.get() ? 'Remove favorite' : 'Add favorite');
    const favoriteClass = computed(() => favorite.get() ? 'button' : 'button secondary');
    return html`
      <article class="product-card" data-testid="product-card" data-product-id="${product.id}" data-price-cents="${product.priceCents}">
        <a is="router-link" route="/products/${product.id}"><div class="product-art" aria-hidden="true">${product.id.slice(-2)}</div><h2>${product.name}</h2></a>
        <p class="product-meta">${product.category} · ${product.stock} in stock · ${(product.ratingTenths / 10).toFixed(1)} / 5</p>
        <p class="product-price">${money(product.priceCents)}</p>
        <button class="${favoriteClass}" data-testid="favorite-toggle" aria-pressed="${favorite}" (click)="${() => this.store.dispatch(favoriteActions.toggle({ id: product.id }))}">${favoriteLabel}</button>
      </article>
    `;
  }

  private renderDetail(id: string): Node {
    const product = products.get().find((item) => item.id === id);
    if (!product) return html`<main class="page-shell"><h1>Product not found</h1><a class="back-link" is="router-link" route="/products">Back to products</a></main>`;
    const favorite = computed(() => this.favorites.get().includes(product.id));
    const favoriteLabel = computed(() => favorite.get() ? 'Remove favorite' : 'Add favorite');
    return html`
      <main class="page-shell" data-testid="product-detail" data-product-id="${product.id}">
        <a class="back-link" is="router-link" route="/products">← Back to products</a>
        <div class="detail-layout"><div class="detail-art" aria-hidden="true">${product.id.slice(-2)}</div><section class="detail-panel"><h1>${product.name}</h1><p class="page-intro">${product.category}</p><dl><dt>Price</dt><dd>${money(product.priceCents)}</dd><dt>In stock</dt><dd>${product.stock}</dd><dt>Rating</dt><dd>${(product.ratingTenths / 10).toFixed(1)} / 5</dd></dl><button class="button" data-testid="favorite-toggle" aria-pressed="${favorite}" (click)="${() => this.store.dispatch(favoriteActions.toggle({ id: product.id }))}">${favoriteLabel}</button></section></div>
      </main>
    `;
  }

  private renderContact(): Node {
    const nameError = computed(() => formErrors.get().name ?? '');
    const emailError = computed(() => formErrors.get().email ?? '');
    const messageError = computed(() => formErrors.get().message ?? '');
    return html`
      <main class="page-shell"><h1>Contact us</h1><p class="page-intro">Send a note to the catalog team.</p>
        <form class="contact-form" novalidate (submit)="${(event: Event) => this.submitContact(event)}">
          <div class="field"><label for="contact-name">Name</label><input id="contact-name" data-testid="contact-name" name="name" value="${contact.name}" (input)="${(event: Event) => contact.name.set((event.currentTarget as HTMLInputElement).value)}" />${computed(() => nameError.get() ? html`<span class="error" data-testid="field-error">${nameError}</span>` : '')}</div>
          <div class="field"><label for="contact-email">Email</label><input id="contact-email" data-testid="contact-email" name="email" type="email" value="${contact.email}" (input)="${(event: Event) => contact.email.set((event.currentTarget as HTMLInputElement).value)}" />${computed(() => emailError.get() ? html`<span class="error" data-testid="field-error">${emailError}</span>` : '')}</div>
          <div class="field"><label for="contact-message">Message</label><textarea id="contact-message" data-testid="contact-message" name="message" (input)="${(event: Event) => contact.message.set((event.currentTarget as HTMLTextAreaElement).value)}">${contact.message}</textarea>${computed(() => messageError.get() ? html`<span class="error" data-testid="field-error">${messageError}</span>` : '')}</div>
          <button class="button" data-testid="contact-submit" type="submit">Send message</button>
          ${computed(() => formSuccess.get() ? html`<p class="success" data-testid="form-success" role="status">Message sent. Thank you!</p>` : '')}
        </form>
      </main>
    `;
  }

  private submitContact(event: Event): void {
    event.preventDefault();
    const values = { name: contact.name.get(), email: contact.email.get(), message: contact.message.get() };
    const errors = validateContact(values);
    formErrors.set(errors);
    formSuccess.set(Object.keys(errors).length === 0);
  }
}

class AppRoot extends Component {
  public static tag = 'app-root';

  constructor() {
    super({ shadow: 'none' });
    registerComponent(RouterComponent);
    registerComponent(CatalogView);
  }

  protected render(): Node {
    return html`<croqueta-router></croqueta-router>`;
  }
}

provideRouter({
  strategy: new PathRouterStrategy(),
  routes: [{ path: '**', component: CatalogView }],
});
const store = inject(Store);
store.registerFeature(favoriteFeature);
registerComponent(AppRoot);

declare global {
  interface Window {
    __frameworkComparison?: { ready(): Promise<void>; runScenario(name: string): Promise<{ durationMs: number }> };
  }
}
