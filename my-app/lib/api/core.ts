import "server-only";

import {
  apiUrl,
  isProductionBuild,
  PUBLIC_FETCH_TIMEOUT_MS,
  PUBLIC_REVALIDATE_SECONDS,
} from "@/lib/api/config";

/**
 * ─────────────────────────────────────────────────────────────────────────
 *  publicFetch — the ONE helper every public (server-rendered) page uses.
 * ─────────────────────────────────────────────────────────────────────────
 *
 *  Adding a new public page is ~1 line:
 *
 *      const data = await publicFetch<{ home: HomeData }>("/home", {
 *        tag: "home",
 *        fallback: { home: DEMO_HOME },
 *      });
 *
 *  Behaviour:
 *   • success  → value is stored in `lastGood[tag]` and returned
 *   • failure  → returns `lastGood[tag]` when we have one (stale-but-good)
 *   • build    → returns `fallback` when the backend is unreachable, so
 *                `next build` never fails offline
 *   • else     → throws, so Next.js keeps serving the previously cached
 *                page and `error.tsx` handles a truly first-load failure
 *
 *  It NEVER invents empty data on failure: an empty payload would be cached
 *  by Next and permanently blank the page.
 */

type EmptyCheck = (value: unknown) => boolean;

export interface PublicFetchOptions<T> {
  /** Cache tag. Must match the backend's `publishChange(tag)`. */
  tag: string;
  /**
   * Key used for the `lastGood` memory map. Defaults to `tag`, so pass a
   * distinct key only when one tag serves several different payloads
   * (e.g. `blog` list vs `blog` list filtered by category).
   */
  key?: string;
  /**
   * Value returned during `next build` when the backend is unreachable.
   * Required — a build must never block on the network.
   */
  fallback: T;
  /** ISR window in seconds. Default 60. */
  revalidate?: number;
  /** Extra tags to revalidate alongside `tag`. */
  tags?: readonly string[];
  /** Override the 5s upstream timeout. */
  timeoutMs?: number;
  /** Opt out of the "empty payload is a failure" guard. */
  allowEmpty?: boolean;
  /** Custom emptiness test. Receives the parsed body. */
  isEmpty?: EmptyCheck;
  /**
   * Upstream statuses that are a legitimate ANSWER rather than an outage.
   *
   * A `404` from the backend means "this resource does not exist" — a real
   * result the caller must be able to act on (the page turns it into
   * `notFound()`). Treating it as a failure would send the visitor to the
   * error boundary instead of a real 404 page.
   *
   * The body of a tolerated status is returned as-is and is deliberately NOT
   * stored as last-good, so a later outage never serves "not found" as if it
   * were real content.
   */
  tolerateStatuses?: readonly number[];
  /**
   * Returned instead of throwing when the fetch fails at RUNTIME and there is
   * no cached payload. Omit to keep the default behaviour: throw, so Next
   * serves the previously cached page and `error.tsx` takes over.
   *
   * Use it on dynamic routes that must degrade gracefully offline — the old
   * `fetchBlogPostBySlug` served demo content when the backend was down, and
   * blog detail pages have no prerendered build fallback to lean on.
   */
  runtimeFallback?: T;
}

/**
 * `lastGood` is parked on `globalThis` so it survives Next's dev-mode module
 * reloading (and is shared by every request hitting this process).
 */
const lastGoodStore: Map<string, unknown> = (() => {
  const g = globalThis as typeof globalThis & {
    __publicFetchLastGood?: Map<string, unknown>;
  };
  if (!g.__publicFetchLastGood) g.__publicFetchLastGood = new Map();
  return g.__publicFetchLastGood;
})();

function defaultIsEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

/**
 * Pull a key out of the backend's response envelope, or throw.
 *
 * Every backend route answers with a named envelope (`{ home }`, `{ about }`,
 * `{ contact }`, …). Destructuring it directly means a `200` carrying a
 * malformed body yields `undefined` — and `undefined` propagating into JSX
 * crashes the render *during `next build`*, before the fallback can help.
 *
 * Throwing here routes the failure through `publicFetch`'s catch instead:
 * last-good data at runtime, the build fallback while prerendering.
 */
export function requireEnvelope<K extends string, T>(body: unknown, key: K): T {
  if (body !== null && typeof body === "object" && key in body) {
    const value = (body as Record<string, unknown>)[key];
    if (value !== null && value !== undefined) {
      return value as T;
    }
  }
  throw new Error(
    `upstream payload is missing the "${key}" envelope (got ${describe(body)})`,
  );
}

function describe(error: unknown): string {
  if (error instanceof Error) {
    return error.name === "TimeoutError"
      ? `timed out after ${PUBLIC_FETCH_TIMEOUT_MS}ms`
      : error.message;
  }
  return String(error);
}

export async function publicFetch<T>(
  path: string,
  options: PublicFetchOptions<T>,
): Promise<T> {
  const { tag, fallback, key = tag } = options;
  const isEmpty = options.isEmpty ?? defaultIsEmpty;
  const timeoutMs = options.timeoutMs ?? PUBLIC_FETCH_TIMEOUT_MS;
  const url = `${apiUrl()}${path.startsWith("/") ? path : `/${path}`}`;

  const cached = lastGoodStore.get(key) as T | undefined;
  const remember = (value: T) => lastGoodStore.set(key, value);

  // During a build we still try the real endpoint — a build with the backend
  // UP should bake in real content, not the fallback. Only a failed build-time
  // request drops to `fallback`, which keeps `next build` green when the API
  // is down. If this process already has a good payload, reuse it immediately.
  if (isProductionBuild() && cached !== undefined) {
    return cached;
  }

  const startedAt = Date.now();

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(timeoutMs),
      next: {
        revalidate: options.revalidate ?? PUBLIC_REVALIDATE_SECONDS,
        tags: [tag, ...(options.tags ?? [])],
      },
    });

    if (!res.ok) {
      if (options.tolerateStatuses?.includes(res.status)) {
        // A real answer from upstream — pass it through untouched so the
        // caller can distinguish "does not exist" from "could not be reached".
        return (await res.json().catch(() => ({}))) as T;
      }
      throw new Error(`upstream responded ${res.status} ${res.statusText}`);
    }

    const body = (await res.json()) as T;

    if (!options.allowEmpty && isEmpty(body)) {
      // A 200 with an empty body is a degraded upstream, not real content.
      throw new Error("upstream returned an empty payload");
    }

    remember(body);
    return body;
  } catch (error) {
    const elapsed = Date.now() - startedAt;

    if (cached !== undefined) {
      // Serve the last known good payload instead of breaking the page.
      console.warn(
        `[publicFetch] ${tag} failed after ${elapsed}ms (${describe(error)}) — serving last good data`,
      );
      return cached;
    }

    if (isProductionBuild()) {
      // Only reachable during `next build` with the API unreachable.
      console.warn(
        `[publicFetch] ${tag} unavailable after ${elapsed}ms (${describe(error)}) — using build fallback`,
      );
      remember(fallback);
      return fallback;
    }

    if (options.runtimeFallback !== undefined) {
      // Opt-in graceful degradation. Dynamic routes with no prerendered build
      // fallback use this so an unreachable backend does not blank the page.
      console.warn(
        `[publicFetch] ${tag} unavailable after ${elapsed}ms (${describe(error)}) — using runtime fallback`,
      );
      return options.runtimeFallback;
    }

    throw new Error(
      `publicFetch(${tag}) failed for ${url} after ${elapsed}ms: ${describe(error)}`,
      { cause: error },
    );
  }
}

/** Read the cached-good payload for a tag. Useful in tests/debugging. */
export function peekLastGood<T>(key: string): T | undefined {
  return lastGoodStore.get(key) as T | undefined;
}

/** Drop the in-memory good data (e.g. after a manual purge). */
export function clearLastGood(key?: string): void {
  if (key) lastGoodStore.delete(key);
  else lastGoodStore.clear();
}
