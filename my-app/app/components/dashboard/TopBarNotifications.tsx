"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AlertTriangle, Bell, CheckCheck, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toneClasses, type AppNotification } from "./sidebar-config";

type Props = {
  /** Unread messages on the server — may be more than the visible list. */
  unreadCount: number;
  /** Resolves once the write settles; rejects are handled by the caller. */
  onMarkAllRead: () => void | Promise<unknown>;
  /** Live items from the contact inbox. */
  notifications?: AppNotification[];
  /** The inbox query is still in flight — shows a skeleton, not an empty state. */
  loading?: boolean;
  /** The inbox query failed — shows a retry hint instead of "nothing here". */
  error?: boolean;
};

export function TopBarNotifications({
  unreadCount,
  onMarkAllRead,
  notifications = [],
  loading = false,
  error = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [marking, setMarking] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreFocus = useRef(false);
  const pendingFocus = useRef<"first" | "last" | null>(null);
  const pathname = usePathname();
  const panelId = useId();

  const close = useCallback(() => {
    // Focus has to be moved back before the panel unmounts, otherwise the
    // browser drops it to <body> and keyboard users lose their place.
    const active = document.activeElement;
    if (active instanceof HTMLElement && rootRef.current?.contains(active)) {
      restoreFocus.current = true;
    }
    setOpen(false);
  }, []);

  // Close on outside click / focus leaving the widget / Escape.
  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        close();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        close();
      }
    };
    const handleFocusIn = (e: FocusEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        close();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("focusin", handleFocusIn);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("focusin", handleFocusIn);
    };
  }, [open, close]);

  // Give the focus back to the trigger once the panel is gone.
  useEffect(() => {
    if (open) return;
    if (!restoreFocus.current) return;
    restoreFocus.current = false;
    triggerRef.current?.focus();
  }, [open]);

  // ArrowDown / ArrowUp on the trigger jump straight into the list.
  useEffect(() => {
    if (!open || !pendingFocus.current) return;
    const mode = pendingFocus.current;
    pendingFocus.current = null;
    const items = panelRef.current?.querySelectorAll<HTMLElement>(
      "[data-notification-item]",
    );
    if (!items?.length) return;
    (mode === "first" ? items[0] : items[items.length - 1]).focus();
  }, [open]);

  // A navigation elsewhere should not leave the panel hanging open.
  useEffect(() => {
    close();
  }, [pathname, close]);

  async function handleMarkAllRead() {
    if (marking) return;
    setMarking(true);
    try {
      await onMarkAllRead();
    } catch {
      // The hook already surfaces the failure with a toast.
    } finally {
      setMarking(false);
    }
  }

  const badge = unreadCount > 99 ? "99+" : unreadCount;

  return (
    <div ref={rootRef} className="relative">
      {/* Bell trigger */}
      <button
        ref={triggerRef}
        type="button"
        aria-label={
          unreadCount > 0
            ? `Notifications (${unreadCount} unread)`
            : "Notifications"
        }
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => (open ? close() : setOpen(true))}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            pendingFocus.current = e.key === "ArrowDown" ? "first" : "last";
            setOpen(true);
          }
        }}
        className={cn(
          "relative grid h-8 w-8 place-items-center rounded-lg transition-all duration-150 hover:scale-105",
          open
            ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white"
            : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white",
        )}
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span
            aria-hidden="true"
            className="absolute -right-1 -top-1 grid min-w-4 place-items-center rounded-full bg-red-500 px-1 text-[9px] font-bold leading-4 text-white ring-2 ring-white motion-safe:animate-pulse dark:ring-zinc-950"
          >
            {badge}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          id={panelId}
          ref={panelRef}
          className="fixed left-4 right-4 top-16 z-50 mt-2 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:w-76 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl shadow-zinc-900/10 animate-in fade-in-0 zoom-in-95 duration-150 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-black/40"
        >
          {/* Panel header */}
          <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
            <span className="flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-white">
              Notifications
              {unreadCount > 0 && (
                <span
                  aria-hidden="true"
                  className="grid min-w-4.5 place-items-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold leading-4 text-white"
                >
                  {badge}
                </span>
              )}
            </span>
            <button
              type="button"
              onClick={handleMarkAllRead}
              disabled={unreadCount === 0 || marking}
              className="flex items-center gap-1 rounded-md px-1.5 py-1 text-[11px] font-semibold text-indigo-600 transition-colors hover:bg-indigo-50 disabled:pointer-events-none disabled:opacity-40 dark:text-indigo-400 dark:hover:bg-indigo-950"
            >
              {marking ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <CheckCheck className="h-3 w-3" />
              )}
              {marking ? "Marking…" : "Mark all read"}
            </button>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto p-2">
            {loading && notifications.length === 0 && (
              <ul aria-hidden="true" className="flex flex-col gap-1">
                {[0, 1, 2].map((i) => (
                  <li key={i} className="flex items-center gap-3 px-2.5 py-2.5">
                    <span className="h-8 w-8 shrink-0 animate-pulse rounded-lg bg-zinc-100 motion-reduce:animate-none dark:bg-zinc-800" />
                    <span className="flex-1 space-y-1.5">
                      <span className="block h-2.5 w-1/2 animate-pulse rounded bg-zinc-100 motion-reduce:animate-none dark:bg-zinc-800" />
                      <span className="block h-2.5 w-3/4 animate-pulse rounded bg-zinc-100 motion-reduce:animate-none dark:bg-zinc-800" />
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {!loading && !error && notifications.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center">
                <Bell className="h-6 w-6 text-zinc-400 dark:text-zinc-600" />
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  No notifications yet
                </p>
              </div>
            )}

            {error && notifications.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center">
                <AlertTriangle className="h-6 w-6 text-amber-500 dark:text-amber-400" />
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Couldn&apos;t load notifications
                </p>
              </div>
            )}

            {notifications.length > 0 && (
              <ul className="flex flex-col">
                {notifications.map((n) => {
                  const Icon = n.icon;
                  // The dot reflects the item's own status — never a guess
                  // based on its position in the list.
                  const unread = n.unread === true;
                  return (
                    <li key={n.id}>
                      <Link
                        href={n.href}
                        data-notification-item
                        onClick={close}
                        className="flex items-start gap-3 rounded-xl px-2.5 py-2.5 transition-colors hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:hover:bg-zinc-800/60"
                      >
                        <span
                          className={cn(
                            "grid h-8 w-8 shrink-0 place-items-center rounded-lg",
                            toneClasses[n.tone],
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span
                            className={cn(
                              "flex items-center gap-1.5 text-xs font-semibold",
                              unread
                                ? "text-zinc-900 dark:text-white"
                                : "text-zinc-500 dark:text-zinc-400",
                            )}
                          >
                            <span className="truncate">{n.title}</span>
                            {unread && (
                              <span
                                aria-hidden="true"
                                className="h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500"
                              />
                            )}
                          </span>
                          <span className="mt-0.5 block truncate text-[11px] text-zinc-500 dark:text-zinc-400">
                            {n.desc}
                          </span>
                        </span>
                        <span className="shrink-0 text-[10px] text-zinc-500 dark:text-zinc-400">
                          {n.time}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Panel footer */}
          <div className="flex items-center justify-between gap-2 border-t border-zinc-100 px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
            <span>
              {unreadCount > 0
                ? `${unreadCount} unread message${unreadCount > 1 ? "s" : ""}`
                : "You're all caught up"}
            </span>
            <Link
              href="/dashboard/pages/messages"
              onClick={close}
              className="rounded font-semibold text-indigo-600 transition-colors hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              View inbox
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
