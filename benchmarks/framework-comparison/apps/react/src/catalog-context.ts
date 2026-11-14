import { createContext, useContext } from 'react';
import type { Product } from '../../../products.mjs';

export const CatalogProductsContext = createContext<Product[]>([]);
export function useCatalogProducts() {
  return useContext(CatalogProductsContext);
}
