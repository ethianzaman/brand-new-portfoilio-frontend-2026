"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { publicApiUrl } from "@/lib/api/config";

/** Coalesce bursts of SSE events into a single refresh. */
const DEBOUNCE_MS = 300;

/**
 * Next.js revalidates an ISR page in the BACKGROUND: the request that triggers
 * revalidation is answered immediately from the stale copy while the new
 * upstream fetch runs. A single `router.refresh()` landing in that window gets
 * stale HTML and nothing would correct it until the 60s ISR window lapses.
 *
 * Guessing one follow-up delay is not enough — how long regeneration takes
 * depends on the page (the hero is one small payload, `/` renders six). So we
 * retry with a backoff and stop as soon as fresh content actually lands: the
 * rendered page is diffed against the snapshot taken when the burst started.
 * The ladder is bounded, so an event that changes nothing visible costs a few
 * cheap refreshes and then stops.
 */
const RETRY_DELAYS_MS = [0, 300, 800, 1600, 3200, 5000] as const;

/** How long to let a refresh response commit before diffing the DOM. */
const SETTLE_MS = 700;

/**
 * Subtrees that animate on their own. Without this the typewriter on the home
 * page would make every diff look like a content change and the loop would exit
 * after the first attempt — the exact bug this replaces.
 */
const IGNORE_SELECTOR = "[data-live-refresh-ignore]";

/**
 * Live refresh for PUBLIC pages.
 *
 * The backend broadcasts an SSE `content` event on every CRUD write. When one
 * arrives we call `router.refresh()`, which re-runs the server components and
 * pulls the freshly revalidated payload — no full page reload, no visitor
 * interaction required.
 *
 * Mount this in the public layout ONLY. The dashboard must not have it: its
 * state lives in React/TanStack Query and a refresh would clobber in-progress
 * edits.
 */
export function LiveRefresh() {
  const router = useRouter();
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const attemptTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const baseline = useRef<string | null>(null);

  useEffect(() => {
    let source: EventSource | null = null;
    let lastSeenChange: number | null = null;

    /** Text of the rendered page, minus self-animating nodes. */
    const snapshot = () =>
      Array.from(document.querySelectorAll<HTMLElement>("main"))
        .map((main) => {
          const clone = main.cloneNode(true) as HTMLElement;
          clone
            .querySelectorAll(IGNORE_SELECTOR)
            .forEach((node) => node.remove());
          return (clone.textContent ?? "").replace(/\s+/g, " ").trim();
        })
        .join("|");

    const clearAll = () => {
      if (debounce.current) clearTimeout(debounce.current);
      if (attemptTimer.current) clearTimeout(attemptTimer.current);
      if (settleTimer.current) clearTimeout(settleTimer.current);
      debounce.current = null;
      attemptTimer.current = null;
      settleTimer.current = null;
      baseline.current = null;
    };

    const attempt = (index: number) => {
      if (index >= RETRY_DELAYS_MS.length) return;

      attemptTimer.current = setTimeout(() => {
        attemptTimer.current = null;
        router.refresh();

        settleTimer.current = setTimeout(() => {
          settleTimer.current = null;
          // Identical to the pre-burst snapshot → regeneration still in flight.
          if (snapshot() === baseline.current) attempt(index + 1);
        }, SETTLE_MS);
      }, RETRY_DELAYS_MS[index]);
    };

    const schedule = () => {
      // A new burst supersedes every pending refresh, so we start the ladder
      // over rather than interleaving two of them.
      if (debounce.current) clearTimeout(debounce.current);
      if (attemptTimer.current) clearTimeout(attemptTimer.current);
      if (settleTimer.current) clearTimeout(settleTimer.current);
      debounce.current = null;
      attemptTimer.current = null;
      settleTimer.current = null;

      debounce.current = setTimeout(() => {
        debounce.current = null;
        baseline.current = snapshot();
        attempt(0);
      }, DEBOUNCE_MS);
    };

    // `ping` is the server keep-alive frame — proof the stream is alive only.
    const onPing = () => {};

    // A tab that came back reconnects, and this is how it spots a missed edit.
    const onHello = (event: MessageEvent<string>) => {
      const { lastContentAt } = JSON.parse(event.data) as {
        lastContentAt?: number;
      };
      if (typeof lastContentAt !== "number") return;
      if (lastSeenChange !== null && lastContentAt > lastSeenChange) schedule();
      lastSeenChange = lastContentAt;
    };

    const onContent = (event: MessageEvent<string>) => {
      const { at } = JSON.parse(event.data) as { at?: number };
      if (typeof at === "number") lastSeenChange = at;
      schedule();
    };

    const connect = () => {
      if (source) return;
      // `EventSource` reconnects on its own; the server's `retry: 3000` line
      // controls the delay between attempts.
      source = new EventSource(`${publicApiUrl()}/events`);
      source.addEventListener("hello", onHello);
      source.addEventListener("content", onContent);
      source.addEventListener("ping", onPing);
    };

    const disconnect = () => {
      source?.close();
      source = null;
    };

    // Hidden tabs give their connection back, which matters at the server's cap.
    const onVisibility = () => {
      if (document.hidden) disconnect();
      else connect();
    };

    if (!document.hidden) connect();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      clearAll();
      document.removeEventListener("visibilitychange", onVisibility);
      disconnect();
    };
  }, [router]);

  return null;
}

export default LiveRefresh;
