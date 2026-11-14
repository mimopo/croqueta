import { createProducts } from '../products.mjs';
import { selectProducts } from './catalog-utils.mjs';

const selectors = {
  search: '[data-testid="search-input"]',
  category: '[data-testid="category-filter"]',
  sort: '[data-testid="sort-select"]',
  grid: '[data-testid="product-grid"]',
  resultCount: '[data-testid="result-count"]',
  nextPage: '[data-testid="next-page"]',
  page: '[data-testid="page-indicator"]',
  favoriteCount: '[data-testid="favorite-count"]',
  formName: '[data-testid="contact-name"]',
  formEmail: '[data-testid="contact-email"]',
  formMessage: '[data-testid="contact-message"]',
  formSubmit: '[data-testid="contact-submit"]',
  formSuccess: '[data-testid="form-success"]',
};

const nextFrame = () => new Promise((resolve) => requestAnimationFrame(() => resolve()));

async function waitFor(predicate, label) {
  const deadline = performance.now() + 3000;
  while (performance.now() < deadline) {
    if (predicate()) return;
    await nextFrame();
  }
  throw new Error(`Timed out waiting for ${label}`);
}

function inputValue(selector, value) {
  const element = document.querySelector(selector);
  if (!(element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement)) {
    throw new Error(`Missing input ${selector}`);
  }
  const descriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(element), 'value');
  descriptor?.set?.call(element, value);
  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
}

function selectValue(selector, value) {
  const element = document.querySelector(selector);
  if (!(element instanceof HTMLSelectElement)) throw new Error(`Missing select ${selector}`);
  const descriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(element), 'value');
  descriptor?.set?.call(element, value);
  element.dispatchEvent(new Event('change', { bubbles: true }));
}

function click(selector) {
  const element = document.querySelector(selector);
  if (!(element instanceof HTMLElement)) throw new Error(`Missing control ${selector}`);
  element.click();
}

async function routeTo(path) {
  const link = [...document.querySelectorAll('a[href]')].find((item) => {
    const target = new URL(item.href, location.href);
    return target.pathname === path;
  });
  if (link instanceof HTMLAnchorElement) link.click();
  else throw new Error(`Missing navigation link to ${path}`);
  await waitFor(() => location.pathname === path, `route ${path}`);
  await nextFrame();
}

function gridItems() {
  return [...document.querySelectorAll(`${selectors.grid} [data-testid="product-card"]`)];
}

export function installBenchmarkHooks({ setProductCount, reset, navigate }) {
  window.__frameworkComparison = {
    async ready() {
      await waitFor(() => document.querySelector(selectors.grid), 'catalog grid');
    },
    async runScenario(name) {
      const size = name.endsWith('-10000') ? 10_000 : name.endsWith('-1000') ? 1_000 : 100;
      await setProductCount(size);
      await reset();
      await navigate('/products');
      await waitFor(() => document.querySelector(selectors.grid), 'catalog before scenario');
      await nextFrame();

      let start;
      if (name.startsWith('search-')) {
        const search = document.querySelector(selectors.search);
        if (!(search instanceof HTMLInputElement)) throw new Error('Search input not found');
        start = performance.now();
        inputValue(selectors.search, '00042');
        await waitFor(() => gridItems().length === 1 && gridItems()[0].getAttribute('data-product-id') === 'product-00042', 'one matching product');
        return { durationMs: performance.now() - start };
      }

      if (name === 'filter-1000') {
        start = performance.now();
        selectValue(selectors.category, 'category-3');
        await waitFor(() => document.querySelector(selectors.resultCount)?.textContent?.trim() === '125 products', '125 filtered products');
        return { durationMs: performance.now() - start };
      }

      if (name === 'sort-1000') {
        const expectedIds = selectProducts(createProducts(1_000), '', 'all', 'price-asc').slice(0, 20).map((item) => item.id);
        start = performance.now();
        selectValue(selectors.sort, 'price-asc');
        await waitFor(() => gridItems().length === 20 && gridItems().every((item, index) => item.getAttribute('data-product-id') === expectedIds[index]), 'sorted product cards');
        const values = gridItems().map((item) => ({
          price: Number(item.getAttribute('data-price-cents')),
          id: item.getAttribute('data-product-id') ?? '',
        }));
        const ordered = values.every((item, index) => index === 0 || values[index - 1].price < item.price || (values[index - 1].price === item.price && values[index - 1].id.localeCompare(item.id) <= 0));
        if (!ordered) throw new Error('The first page is not sorted by price and ID');
        return { durationMs: performance.now() - start };
      }

      if (name === 'paginate-1000') {
        const firstBefore = gridItems()[0]?.getAttribute('data-product-id');
        start = performance.now();
        click(selectors.nextPage);
        await waitFor(() => document.querySelector(selectors.page)?.textContent?.trim() === 'Page 2 of 50' && gridItems()[0]?.getAttribute('data-product-id') !== firstBefore, 'second page');
        return { durationMs: performance.now() - start };
      }

      if (name === 'favorites') {
        start = performance.now();
        click('[data-testid="product-card"] [data-testid="favorite-toggle"]');
        await waitFor(() => document.querySelector(selectors.favoriteCount)?.textContent?.trim() === '1', 'favorite count 1');
        await routeTo('/favorites');
        await waitFor(() => gridItems().some((item) => item.getAttribute('data-product-id') === 'product-00001'), 'favorite in list');
        return { durationMs: performance.now() - start };
      }

      if (name === 'form-validation') {
        await routeTo('/contact');
        start = performance.now();
        click(selectors.formSubmit);
        await waitFor(() => document.querySelectorAll('[data-testid="field-error"]').length === 3, 'three required-field errors');
        if (document.querySelector(selectors.formSuccess)) throw new Error('Invalid form showed success');
        return { durationMs: performance.now() - start };
      }

      if (name === 'form-valid-submit') {
        await routeTo('/contact');
        inputValue(selectors.formName, 'Benchmark User');
        inputValue(selectors.formEmail, 'benchmark@example.test');
        inputValue(selectors.formMessage, 'This is a benchmark message.');
        start = performance.now();
        click(selectors.formSubmit);
        await waitFor(() => document.querySelector(selectors.formSuccess), 'form success');
        return { durationMs: performance.now() - start };
      }

      throw new Error(`Unknown benchmark scenario: ${name}`);
    },
  };
}

