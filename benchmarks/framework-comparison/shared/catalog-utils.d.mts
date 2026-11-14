import type { Product } from '../products.mjs';
export function selectProducts(products: Product[], query: string, category: string, sort: string): Product[];
export function paginate<T>(items: T[], page: number, pageSize?: number): { items: T[]; page: number; pageCount: number };
export function validateContact(values: { name: string; email: string; message: string }): Record<string, string>;
export function money(priceCents: number): string;
