// ─────────────────────────────────────────────
// Shared pagination contracts.
//
// Every paginated endpoint answers with the same envelope, so the frontend
// can treat blogs, projects and services identically:
//
//   {
//     success: true,
//     <collection>: Item[],   // the rows for THIS page
//     total: number,          // how many rows match the filter overall
//     hasMore: boolean,       // is there a page after this one
//     page: number,           // 1-based
//     pageSize: number
//   }
//
// `total` is the number of rows matching the CURRENT filter (not the size of
// the collection) — that is what makes "Page 3 of 7" correct while a search
// term is active.
// ─────────────────────────────────────────────

export interface PageParams {
  page: number;
  pageSize: number;
}

export interface PageMeta {
  total: number;
  hasMore: boolean;
  page: number;
  pageSize: number;
}

/** A full page of rows plus its pagination metadata. */
export type PageResult<T> = PageMeta & { items: T[] };

export type SortDirection = "asc" | "desc";
