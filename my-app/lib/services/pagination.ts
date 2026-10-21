/**
 * Build a query string from a flat object, skipping empty values.
 *
 * Keeps the list endpoints' query construction in one place so `page`,
 * `pageSize` and the search term are always encoded the same way.
 */
export function buildQuery(
  params: Record<string, string | number | boolean | undefined | null>,
): string {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    search.set(key, String(value));
  }

  return search.toString();
}
