import { useParams, Link } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { money } from '../../../../shared/catalog-utils.mjs';
import { useCatalogProducts } from '../catalog-context';
import { toggleFavorite, type AppDispatch, type RootState } from '../favorites-store';

export default function DetailPage() {
  const { id } = useParams();
  const product = useCatalogProducts().find((item) => item.id === id);
  const favorites = useSelector((state: RootState) => state.favorites.ids);
  const dispatch = useDispatch<AppDispatch>();
  if (!product) return <main className="page-shell"><h1>Product not found</h1><Link to="/products">Back to products</Link></main>;
  const isFavorite = favorites.includes(product.id);
  return (
    <main className="page-shell" data-testid="product-detail" data-product-id={product.id}>
      <Link className="back-link" to="/products">← Back to products</Link>
      <div className="detail-layout"><div className="detail-art" aria-hidden="true">{product.id.slice(-2)}</div><section className="detail-panel"><h1>{product.name}</h1><p className="page-intro">{product.category}</p><dl><dt>Price</dt><dd>{money(product.priceCents)}</dd><dt>In stock</dt><dd>{product.stock}</dd><dt>Rating</dt><dd>{(product.ratingTenths / 10).toFixed(1)} / 5</dd></dl><button className="button" data-testid="favorite-toggle" aria-pressed={isFavorite} onClick={() => dispatch(toggleFavorite(product.id))}>{isFavorite ? 'Remove favorite' : 'Add favorite'}</button></section></div>
    </main>
  );
}
