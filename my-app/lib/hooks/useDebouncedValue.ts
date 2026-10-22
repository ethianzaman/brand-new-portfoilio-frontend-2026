"use client";

import { useEffect, useState } from "react";

import { SEARCH_DEBOUNCE_MS } from "@/lib/constants/pagination";

/**
 * Return `value` only after it has stopped changing for `delay` ms.
 *
 * Used by the dashboard search boxes: the input stays fully responsive while
 * the (expensive) server-side search only fires once the user pauses.
 */
export function useDebouncedValue<T>(
  value: T,
  delay: number = SEARCH_DEBOUNCE_MS,
): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
