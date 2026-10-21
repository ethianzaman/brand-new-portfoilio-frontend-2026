/**
 * Pagination defaults for the dashboard lists.
 *
 * The dashboard shows 6 rows per page by default — dense enough that the
 * stat cards and the list fit on one screen, sparse enough that each row
 * stays readable.
 */
export const DASHBOARD_PAGE_SIZE = 6;

/** Options offered in the "rows per page" selector. */
export const DASHBOARD_PAGE_SIZES = [6, 12, 24] as const;

/**
 * How long to wait after the last keystroke before a search term is sent to
 * the server. Without this, every character typed fires a database query.
 */
export const SEARCH_DEBOUNCE_MS = 300;

/**
 * Upper bound the backend enforces (`MAX_PAGE_SIZE`). The frontend never asks
 * for more than this, so the two stay in sync.
 */
export const MAX_PAGE_SIZE = 100;
