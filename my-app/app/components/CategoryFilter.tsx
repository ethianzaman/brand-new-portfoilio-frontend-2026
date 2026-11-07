"use client";

import { useSyncExternalStore } from "react";
import { Select } from "radix-ui";
import { Check, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

const CATEGORY_PARAM = "category";
const CATEGORY_CHANGE_EVENT = "category-filter-change";

// The category lives in the URL so a filtered list can be shared and the back
// button works. It is read from the location instead of useSearchParams, which
// would drop the cards from the page's server HTML.
function subscribe(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  window.addEventListener(CATEGORY_CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("popstate", onChange);
    window.removeEventListener(CATEGORY_CHANGE_EVENT, onChange);
  };
}

function readCategory() {
  return new URLSearchParams(window.location.search).get(CATEGORY_PARAM);
}

function noCategoryOnServer() {
  return null;
}

export function setCategoryParam(category: string | null) {
  const params = new URLSearchParams(window.location.search);
  if (category) params.set(CATEGORY_PARAM, category);
  else params.delete(CATEGORY_PARAM);

  const query = params.toString();
  window.history.pushState(null, "", query ? `?${query}` : window.location.pathname);
  window.dispatchEvent(new Event(CATEGORY_CHANGE_EVENT));
}

/**
 * The category named in the URL, as written there. A shared or edited link can
 * name one that no longer exists, so callers check it against their own list.
 */
export function useCategoryParam() {
  return useSyncExternalStore(subscribe, readCategory, noCategoryOnServer);
}

export interface CategoryOption {
  value: string;
  label: string;
  /** How many items it holds, when the page knows. */
  count?: number;
}

/**
 * An "All" button and a category dropdown. Driven by the URL unless `onChange`
 * is given, which keeps the choice in the caller's own state instead.
 */
export function CategoryFilter({
  options,
  value,
  onChange = setCategoryParam,
  className,
}: {
  options: CategoryOption[];
  value: string | null;
  /** Gets the chosen category, or null for All. */
  onChange?: (category: string | null) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex gap-3", className)}>
      <button
        type="button"
        aria-pressed={value === null}
        onClick={() => {
          if (value !== null) onChange(null);
        }}
        className={cn(
          "h-11 shrink-0 rounded-xl border px-5 text-sm font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-950",
          value === null
            ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
            : "border-zinc-200 bg-white text-zinc-600 hover:border-indigo-300 hover:text-indigo-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-indigo-700 dark:hover:text-indigo-400",
        )}
      >
        All
      </button>

      <Select.Root value={value ?? ""} onValueChange={onChange}>
        <Select.Trigger
          aria-label="Filter by category"
          className={cn(
            "group/select flex h-11 min-w-0 flex-1 items-center justify-between gap-2 rounded-xl border bg-white pl-4 pr-3 text-sm font-medium outline-none transition-colors sm:w-52 sm:flex-none dark:bg-zinc-900",
            "focus-visible:ring-2 focus-visible:ring-indigo-500",
            value
              ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
              : "border-zinc-200 text-zinc-600 hover:border-indigo-300 hover:text-indigo-600 data-placeholder:text-zinc-600 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-indigo-700 dark:hover:text-indigo-400 dark:data-placeholder:text-zinc-400",
          )}
        >
          <span className="truncate">
            <Select.Value placeholder="Category" />
          </span>
          <Select.Icon>
            <ChevronDown className="h-4 w-4 shrink-0 transition-transform group-data-[state=open]/select:rotate-180" />
          </Select.Icon>
        </Select.Trigger>

        <Select.Portal>
          <Select.Content
            position="popper"
            sideOffset={6}
            collisionPadding={12}
            className="z-50 max-h-80 min-w-(--radix-select-trigger-width) overflow-hidden rounded-xl bg-white shadow-xl shadow-zinc-950/10 ring-1 ring-zinc-950/10 dark:bg-zinc-900 dark:ring-white/10"
          >
            <Select.Viewport className="p-1">
              {options.map((option) => (
                <Select.Item
                  key={option.value}
                  value={option.value}
                  className="flex cursor-pointer select-none items-center gap-3 rounded-lg py-2 pl-3 pr-2 text-sm font-medium text-zinc-700 outline-none data-highlighted:bg-indigo-50 data-highlighted:text-indigo-600 data-[state=checked]:text-indigo-600 dark:text-zinc-200 dark:data-highlighted:bg-indigo-950 dark:data-highlighted:text-indigo-400 dark:data-[state=checked]:text-indigo-400"
                >
                  <span className="min-w-0 flex-1 truncate">
                    <Select.ItemText>{option.label}</Select.ItemText>
                  </span>
                  {option.count !== undefined && (
                    <span className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                      {option.count}
                    </span>
                  )}
                  <span className="grid w-4 shrink-0 place-items-center">
                    <Select.ItemIndicator>
                      <Check className="h-4 w-4" />
                    </Select.ItemIndicator>
                  </span>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  );
}
