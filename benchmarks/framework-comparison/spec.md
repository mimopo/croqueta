# Shared application specification

This is the behavioral contract for the Croqueta, Vue, Angular and React benchmark implementations. All four apps must use the same dataset generator, content, styles, routes, page size, and interaction checks.

## App: Product catalog

A small storefront shell with four routes:

- `/products`: searchable, filterable, sortable, paginated catalog.
- `/products/:id`: product detail.
- `/favorites`: products marked as favorites.
- `/contact`: contact form with client-side validation.

Use the same responsive layout and plain shared CSS. Do not add a component library, network API, image service, authentication, or framework-specific visual extras. Use text/ CSS placeholders for product images so asset weight is equal.

## Product model and shared data

Use `products.mjs` in this directory as the one source of deterministic data for all implementations. It exports `createProducts(count)` and produces the same records for a given count.

| Field | Type | Rule |
|---|---|---|
| `id` | string | `product-00001` through `product-10000` |
| `name` | string | `Product 00001` etc. |
| `category` | string | One of `category-1` through `category-8`, cycling by ID |
| `priceCents` | integer | Deterministic range from 100 to 50,000 |
| `stock` | integer | Deterministic range from 0 to 100 |
| `ratingTenths` | integer | Rating from 0.1 to 5.0, in tenths |

Do not use Math.random() or framework-specific mock-data packages. Test the app with 100, 1,000 and 10,000 records.

## Required behavior and expected results

- The catalog starts on page 1, shows 20 items per page, and sorts by product ID ascending.
- Search trims surrounding whitespace and matches case-insensitively against product name and category. Search updates the result count and returns to page 1.
- Category filtering is single-select with an “All categories” option. Search and category filters combine with AND semantics.
- Sort options are product ID ascending, price ascending and price descending. Price ties break by product ID ascending.
- Pagination shows no more than 20 items and disables Previous/Next at the correct boundaries. Changing search, filter or sort returns to page 1.
- A favorite toggle changes its label and count immediately. The same favorite state and header count appear on list, detail and favorites routes; favorites survive client-side navigation during a run.
- A product card opens the matching detail route. The detail page shows the same product fields and supports browser back/forward.
- Contact fields are name, email and message. All are required; email must have a valid basic email shape. Invalid submission shows field errors and does not show success. Valid submission shows a confirmation and sends no network request.
- Empty search/filter results show a consistent empty state. Unknown product IDs show a not-found state.

## Stable test hooks and accessibility

Use semantic controls (labels, buttons, links, form fields) and preserve keyboard operation. Each app should expose the same test IDs for stable browser automation:

- `search-input`, `category-filter`, `sort-select`
- `product-grid`, `product-card` (with `data-product-id`)
- `previous-page`, `next-page`, `page-indicator`, `result-count`
- `favorite-toggle`, `favorite-count`
- `contact-name`, `contact-email`, `contact-message`, `contact-submit`, `form-success`

Each app must also implement the `window.__frameworkComparison` hook described in the harness README. A scenario returns `{ durationMs }`, measured with `performance.now()` from immediately before the user action until the expected rendered result is observable. Throw or return a descriptive error when an assertion fails; do not return a duration for an incorrect result.

## Browser scenarios

Use the same scenario names, initial state and expected assertions in all four apps:

| Scenario | Dataset | Action | Expected result |
|---|---:|---|---|
| `search-100` | 100 | Search for `00042` | Exactly product-00042 is visible |
| `search-1000` | 1,000 | Search for `00042` | Exactly product-00042 is visible |
| `search-10000` | 10,000 | Search for `00042` | Exactly product-00042 is visible |
| `filter-1000` | 1,000 | Choose category-3 | Only category-3 items remain; count matches fixture |
| `sort-1000` | 1,000 | Sort price ascending | First page is ordered by price then product ID |
| `paginate-1000` | 1,000 | Go to next page | Page indicator becomes 2 and visible IDs change |
| `favorites` | 100 | Favorite first item, open Favorites | Item appears and count is 1 |
| `form-validation` | 100 | Submit empty form | Required field errors appear, no success state |
| `form-valid-submit` | 100 | Submit valid fixed values | Success state appears; no request is made |

Use a fresh page/context per measured iteration, reset application state before every scenario, and do not include setup or assertion time in the returned interaction duration. Keep navigation, load, transfer and interaction timings as separate metrics.

## Fairness checklist

Before publishing numbers, record exact framework, router, build-tool and test-tool versions; source commit; Node and browser versions; OS/CPU; production build command; cache/network policy; dataset size; and run date. Keep CSS, markup density, fonts, data, test actions and acceptance checks equal. Disclose any feature that needs a third-party package, and include that package in the stack and bundle measurement.
