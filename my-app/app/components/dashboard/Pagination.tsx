"use client";

import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

interface Props {
  page: number;
  pageSize: number;
  total: number;
  /** Plural noun for the collection, e.g. "posts". */
  itemLabel: string;
  pageSizeOptions?: readonly number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  /** Dim the controls while a page is in flight. */
  busy?: boolean;
}

/**
 * Build the page-number strip, collapsing long ranges with an ellipsis.
 *
 *   1 … 4 5 6 … 20
 */
function buildPageNumbers(current: number, totalPages: number): (number | "…")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | "…")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(totalPages - 1, current + 1);

  if (start > 2) pages.push("…");
  for (let page = start; page <= end; page += 1) pages.push(page);
  if (end < totalPages - 1) pages.push("…");

  pages.push(totalPages);

  return pages;
}

export function Pagination({
  page,
  pageSize,
  total,
  itemLabel,
  pageSizeOptions,
  onPageChange,
  onPageSizeChange,
  busy = false,
}: Props) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(page, totalPages);

  const first = total === 0 ? 0 : (current - 1) * pageSize + 1;
  const last = Math.min(current * pageSize, total);

  return (
    <div
      className="flex flex-col sm:flex-row sm:items-center
                justify-between gap-3 pt-3 mt-3
                border-t border-zinc-100 dark:border-zinc-800"
    >
      {/* ── Range summary ── */}
      <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
        {busy && <Loader2 className="h-3 w-3 animate-spin text-zinc-400" />}
        <span>
          Showing{" "}
          <span className="font-semibold text-zinc-700 dark:text-zinc-300">
            {first}–{last}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-zinc-700 dark:text-zinc-300">
            {total}
          </span>{" "}
          {itemLabel}
        </span>
      </div>

      {/* ── Controls ── */}
      <div className="flex items-center gap-3">
        {/* Page size */}
        {pageSizeOptions && pageSizeOptions.length > 0 && (
          <label className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
            <span className="hidden sm:inline">Rows</span>
            <select
              value={pageSize}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
              className="rounded-lg border border-zinc-200 bg-white px-2 py-1.5
                         text-xs text-zinc-700 transition-colors
                         focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500
                         dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        )}

        {/* Prev */}
        <button
          type="button"
          onClick={() => onPageChange(current - 1)}
          disabled={current <= 1 || busy}
          aria-label="Previous page"
          className="grid h-8 w-8 place-items-center rounded-lg border border-zinc-200
                     text-zinc-600 transition-colors
                     hover:bg-zinc-100 hover:text-zinc-900
                     disabled:pointer-events-none disabled:opacity-40
                     dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {buildPageNumbers(current, totalPages).map((entry, index) =>
            entry === "…" ? (
              <span
                key={`gap-${index}`}
                className="px-1 text-xs text-zinc-400 dark:text-zinc-500"
              >
                …
              </span>
            ) : (
              <button
                key={entry}
                type="button"
                onClick={() => onPageChange(entry)}
                disabled={busy}
                aria-current={entry === current ? "page" : undefined}
                className={cn(
                  "h-8 min-w-8 rounded-lg px-2 text-xs font-semibold transition-colors",
                  entry === current
                    ? "bg-indigo-600 text-white"
                    : "border border-zinc-200 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900",
                  "disabled:pointer-events-none",
                  "dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800",
                )}
              >
                {entry}
              </button>
            ),
          )}
        </div>

        {/* Next */}
        <button
          type="button"
          onClick={() => onPageChange(current + 1)}
          disabled={current >= totalPages || busy}
          aria-label="Next page"
          className="grid h-8 w-8 place-items-center rounded-lg border border-zinc-200
                     text-zinc-600 transition-colors
                     hover:bg-zinc-100 hover:text-zinc-900
                     disabled:pointer-events-none disabled:opacity-40
                     dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
