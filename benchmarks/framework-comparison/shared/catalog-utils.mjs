/** Apply the benchmark's common search, filter, and ordering rules. */
export function selectProducts(products, query, category, sort) {
  const normalized = query.trim().toLocaleLowerCase('en-US');
  const result = products.filter((product) => {
    const matchesQuery = !normalized || `${product.name} ${product.category}`.toLocaleLowerCase('en-US').includes(normalized);
    const matchesCategory = category === 'all' || product.category === category;
    return matchesQuery && matchesCategory;
  });

  result.sort((left, right) => {
    if (sort === 'price-asc') return left.priceCents - right.priceCents || left.id.localeCompare(right.id);
    if (sort === 'price-desc') return right.priceCents - left.priceCents || left.id.localeCompare(right.id);
    return left.id.localeCompare(right.id);
  });
  return result;
}

export function paginate(items, page, pageSize = 20) {
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(Math.max(page, 1), pageCount);
  const start = (currentPage - 1) * pageSize;
  return { items: items.slice(start, start + pageSize), page: currentPage, pageCount };
}

export function validateContact(values) {
  const errors = {};
  if (!values.name.trim()) errors.name = 'Name is required.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) errors.email = 'Enter a valid email address.';
  if (!values.message.trim()) errors.message = 'Message is required.';
  return errors;
}

export function money(priceCents) {
  return `$${(priceCents / 100).toFixed(2)}`;
}
