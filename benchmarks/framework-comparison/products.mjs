export const categories = Object.freeze(
  Array.from({ length: 8 }, (_, index) => `category-${index + 1}`),
);

/**
 * Create a stable benchmark catalog. Every framework implementation must use
 * this fixture instead of generating its own records.
 *
 * @param {number} count Number of records (1 through 10,000).
 * @returns {Array<{id: string, name: string, category: string, priceCents: number, stock: number, ratingTenths: number}>}
 */
export function createProducts(count) {
  if (!Number.isInteger(count) || count < 1 || count > 10_000) {
    throw new RangeError('count must be an integer between 1 and 10000');
  }

  return Array.from({ length: count }, (_, index) => {
    const number = index + 1;
    const idNumber = String(number).padStart(5, '0');
    return {
      id: `product-${idNumber}`,
      name: `Product ${idNumber}`,
      category: categories[index % categories.length],
      priceCents: ((number * 7919) % 49_901) + 100,
      stock: (number * 37) % 101,
      ratingTenths: ((number * 13) % 50) + 1,
    };
  });
}
