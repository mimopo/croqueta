import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { money, paginate, selectProducts } from '../../../../shared/catalog-utils.mjs';
import type { Product } from '../../../../products.mjs';
import { useCatalogProducts } from '../catalog-context';
import { toggleFavorite, type AppDispatch, type RootState } from '../favorites-store';

export default function CatalogPage({ favoritesOnly = false }: { favoritesOnly?: boolean }) {
  const products = useCatalogProducts();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('id-asc');
  const [page, setPage] = useState(1);
  const favorites = useSelector((state: RootState) => state.favorites.ids);
  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    setQuery('');
    setCategory('all');
    setSort('id-asc');
    setPage(1);
  }, [products]);
  const filtered = useMemo(() => selectProducts(products, query, category, sort), [products, query, category, sort]);
  const collection = favoritesOnly ? products.filter((product) => favorites.includes(product.id)) : filtered;
  const pageData = paginate(collection, page);
  const countText = `${collection.length} products`;

  function productCard(product: Product) {
    const isFavorite = favorites.includes(product.id);
    return (
      <article key={product.id} className="product-card" data-testid="product-card" data-product-id={product.id} data-price-cents={product.priceCents}>
        <Link to={`/products/${product.id}`}><div className="product-art" aria-hidden="true">{product.id.slice(-2)}</div><h2>{product.name}</h2></Link>
        <p className="product-meta">{product.category} · {product.stock} in stock · {(product.ratingTenths / 10).toFixed(1)} / 5</p>
        <p className="product-price">{money(product.priceCents)}</p>
        <button className={isFavorite ? 'button' : 'button secondary'} data-testid="favorite-toggle" aria-pressed={isFavorite} onClick={() => dispatch(toggleFavorite(product.id))}>{isFavorite ? 'Remove favorite' : 'Add favorite'}</button>
      </article>
    );
  }

  return (
    <main className="page-shell">
      <h1>{favoritesOnly ? 'Your favorites' : 'Product catalog'}</h1>
      <p className="page-intro">A shared catalog benchmark built with React.</p>
      {!favoritesOnly && <section className="toolbar" aria-label="Catalog filters">
        <div className="field"><label htmlFor="catalog-search">Search products</label><input id="catalog-search" data-testid="search-input" type="search" value={query} placeholder="Search by name or category" onChange={(event) => { setQuery(event.target.value); setPage(1); }} /></div>
        <div className="field"><label htmlFor="catalog-category">Category</label><select id="catalog-category" data-testid="category-filter" value={category} onChange={(event) => { setCategory(event.target.value); setPage(1); }}><option value="all">All categories</option>{Array.from({ length: 8 }, (_, index) => <option key={index + 1} value={`category-${index + 1}`}>Category {index + 1}</option>)}</select></div>
        <div className="field"><label htmlFor="catalog-sort">Sort by</label><select id="catalog-sort" data-testid="sort-select" value={sort} onChange={(event) => { setSort(event.target.value); setPage(1); }}><option value="id-asc">Product ID</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option></select></div>
      </section>}
      <div className="result-line"><span data-testid="result-count">{countText}</span></div>
      {pageData.items.length ? <div className="product-grid" data-testid="product-grid">{pageData.items.map(productCard)}</div> : <div className="empty-state" data-testid="empty-state">No products found.</div>}
      <nav className="pagination" aria-label="Catalog pages">
        <button className="button secondary" data-testid="previous-page" disabled={pageData.page <= 1} onClick={() => setPage(Math.max(1, pageData.page - 1))}>Previous</button>
        <span data-testid="page-indicator">Page {pageData.page} of {pageData.pageCount}</span>
        <button className="button" data-testid="next-page" disabled={pageData.page >= pageData.pageCount} onClick={() => setPage(pageData.page + 1)}>Next</button>
      </nav>
    </main>
  );
}
