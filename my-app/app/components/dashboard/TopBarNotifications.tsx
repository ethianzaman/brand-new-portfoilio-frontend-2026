"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { notificationSeed, toneClasses } from "./sidebar-config";

type Props = {
  unreadCount: number;
  onMarkAllRead: () => void;
};

export function TopBarNotifications({
  unreadCount,
  onMarkAllRead,
}: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    if (!open) return;

    const handlePointer = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      {/* Bell trigger */}
      <button
        type="button"
        aria-label={
          unreadCount > 0
            ? `Notifications (${unreadCount} unread)`
            : "Notifications"
        }
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "relative grid h-8 w-8 place-items-center rounded-lg transition-all duration-150 hover:scale-105",
          open
            ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white"
            : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white",
        )}
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 grid min-w-4 place-items-center rounded-full bg-red-500 px-1 text-[9px] font-bold leading-4 text-white ring-2 ring-white animate-pulse dark:ring-zinc-950">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          role="menu"
          aria-label="Notifications"
          className="fixed left-4 right-4 top-16 z-50 mt-2 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:w-[19rem] overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl shadow-zinc-900/10 animate-in fade-in-0 zoom-in-95 duration-150 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-black/40"
        >
          {/* Panel header */}
          <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
            <span className="flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-white">
              Notifications
              {unreadCount > 0 && (
                <span className="grid min-w-4.5 place-items-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold leading-4 text-white">
                  {unreadCount}
                </span>
              )}
            </span>
            <button
              type="button"
              onClick={onMarkAllRead}
              disabled={unreadCount === 0}
              className="flex items-center gap-1 rounded-md px-1.5 py-1 text-[11px] font-semibold text-indigo-600 transition-colors hover:bg-indigo-50 disabled:pointer-events-none disabled:opacity-40 dark:text-indigo-400 dark:hover:bg-indigo-950"
            >
              <CheckCheck className="h-3 w-3" />
              Mark all read
            </button>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto p-2">
            {notificationSeed.map((n, index) => {
              const unread = index < unreadCount;
              return (
                <Link
                  key={n.id}
                  href={n.href}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className="flex items-start gap-3 rounded-xl px-2.5 py-2.5 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
                >
                  <span
                    className={cn(
                      "grid h-8 w-8 shrink-0 place-items-center rounded-lg",
                      toneClasses[n.tone],
                    )}
                  >
                    <n.icon className="h-4 w-4" />
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
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
                      )}
                    </span>
                    <span className="mt-0.5 block truncate text-[11px] text-zinc-500 dark:text-zinc-400">
                      {n.desc}
                    </span>
                  </span>
                  <span className="shrink-0 text-[10px] text-zinc-400 dark:text-zinc-500">
                    {n.time}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Panel footer */}
          <div className="border-t border-zinc-100 px-4 py-2.5 text-center text-[10px] font-medium uppercase tracking-wider text-zinc-400 dark:border-zinc-800 dark:text-zinc-500">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
              : "You're all caught up"}
          </div>
        </div>
      )}
    </div>
  );
}
