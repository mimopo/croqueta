export interface Product {
  id: string;
  name: string;
  category: string;
  priceCents: number;
  stock: number;
  ratingTenths: number;
}
export const categories: readonly string[];
export function createProducts(count: number): Product[];
