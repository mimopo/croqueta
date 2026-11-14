import { useEffect, useState } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { BrowserRouter, Link, Route, Routes, useNavigate } from 'react-router';
import { createProducts } from '../../../products.mjs';
import type { Product } from '../../../products.mjs';
import { installBenchmarkHooks } from '../../../shared/bench-hooks.mjs';
import { CatalogProductsContext } from './catalog-context';
import { clearFavorites, store, type AppDispatch, type RootState } from './favorites-store';
import CatalogPage from './views/CatalogPage';
import ContactPage from './views/ContactPage';
import DetailPage from './views/DetailPage';

const initialCount = Math.min(Number(new URLSearchParams(location.search).get('size')) || 100, 10_000);

function AppShell() {
  const [products, setProducts] = useState<Product[]>(() => createProducts(initialCount));
  const favoriteCount = useSelector((state: RootState) => state.favorites.ids.length);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  useEffect(() => {
    installBenchmarkHooks({
      setProductCount(count) {
        setProducts(createProducts(count));
      },
      reset() {
        dispatch(clearFavorites());
      },
      navigate(path) {
        return navigate(path);
      },
    });
  }, [dispatch, navigate]);

  return (
    <CatalogProductsContext.Provider value={products}>
      <header className="site-header">
        <div className="header-inner">
          <Link className="brand" to="/products">Croqueta <span>Catalog</span></Link>
          <nav className="main-nav" aria-label="Main navigation">
            <Link to="/products">Products</Link>
            <Link to="/favorites">Favorites <span className="favorite-count" data-testid="favorite-count">{favoriteCount}</span></Link>
            <Link to="/contact">Contact</Link>
          </nav>
        </div>
      </header>
      <Routes>
        <Route path="/" element={<CatalogPage />} />
        <Route path="/products" element={<CatalogPage />} />
        <Route path="/favorites" element={<CatalogPage favoritesOnly />} />
        <Route path="/products/:id" element={<DetailPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="*" element={<main className="page-shell"><h1>Page not found</h1><Link to="/products">Back to products</Link></main>} />
      </Routes>
    </CatalogProductsContext.Provider>
  );
}

export default function App() {
  return <Provider store={store}><BrowserRouter><AppShell /></BrowserRouter></Provider>;
}
