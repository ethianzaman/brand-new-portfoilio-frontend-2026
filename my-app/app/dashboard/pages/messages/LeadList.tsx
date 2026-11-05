"use client";

import { Inbox, Mail, MessagesSquare, RefreshCw, Search, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LeadSummary } from "@/lib/types/message";
import { initials, relativeTime } from "./format";

export type Filter = "all" | "unread" | "starred";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "starred", label: "Starred" },
];

interface Props {
  leads: LeadSummary[];
  selectedId: string | null;
  unreadCount: number;
  canEdit: boolean;
  isLoading: boolean;
  isError: boolean;
  isFetching: boolean;
  search: string;
  /** The search the list was fetched with, once typing has settled. */
  activeSearch: string;
  filter: Filter;
  onSearch: (value: string) => void;
  onFilter: (filter: Filter) => void;
  onOpen: (lead: LeadSummary) => void;
  onRefresh: () => void;
  onMarkAllRead: () => void;
}

export function LeadList({
  leads,
  selectedId,
  unreadCount,
  canEdit,
  isLoading,
  isError,
  isFetching,
  search,
  activeSearch,
  filter,
  onSearch,
  onFilter,
  onOpen,
  onRefresh,
  onMarkAllRead,
}: Props) {
  return (
    <>
      <div className="flex items-center justify-between gap-2 border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <Inbox className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          <span className="text-sm font-bold text-zinc-900 dark:text-white">
            Inbox
          </span>
          {unreadCount > 0 && (
            <span className="grid min-w-5 place-items-center rounded-full bg-indigo-600 px-1.5 text-[10px] font-bold leading-4 text-white">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onRefresh}
            aria-label="Refresh"
            className="grid h-7 w-7 place-items-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white"
          >
            <RefreshCw
              className={cn(
                "h-3.5 w-3.5",
                isFetching && "animate-spin",
              )}
            />
          </button>
          {canEdit && (
          <button
            type="button"
            onClick={onMarkAllRead}
            disabled={unreadCount === 0}
            className="rounded-lg px-2 py-1 text-[11px] font-semibold text-indigo-600 transition-colors hover:bg-indigo-50 disabled:pointer-events-none disabled:opacity-40 dark:text-indigo-400 dark:hover:bg-indigo-950"
          >
            Mark all read
          </button>
          )}
        </div>
      </div>

      {/* Search + filters */}
      <div className="space-y-2 border-b border-zinc-100 px-3 py-3 dark:border-zinc-800">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search people or messages..."
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2 pl-9 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
          />
        </div>
        <div className="flex gap-1">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => onFilter(f.id)}
              className={cn(
                "flex-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                filter === f.id
                  ? "bg-indigo-600 text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-2 p-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-16 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800"
              />
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center gap-2 px-4 py-16 text-center">
            <Mail className="h-8 w-8 text-zinc-300 dark:text-zinc-600" />
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Could not load messages.
            </p>
            <button
              type="button"
              onClick={onRefresh}
              className="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
            >
              Try again
            </button>
          </div>
        ) : leads.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-16 text-center">
            <Inbox className="h-8 w-8 text-zinc-300 dark:text-zinc-600" />
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {activeSearch
                ? "No people match your search."
                : filter === "unread"
                  ? "No unread messages."
                  : filter === "starred"
                    ? "No starred messages."
                    : "Your inbox is empty."}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {leads.map((lead) => {
              const active = selectedId === lead.id;
              const unread = lead.unreadCount > 0;
              return (
                <li key={lead.id}>
                  <button
                    type="button"
                    onClick={() => onOpen(lead)}
                    className={cn(
                      "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors",
                      active
                        ? "bg-indigo-50/70 dark:bg-indigo-950/40"
                        : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50",
                    )}
                  >
                    <span
                      className={cn(
                        "grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-bold",
                        unread
                          ? "bg-linear-to-br from-indigo-500 to-purple-600 text-white"
                          : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
                      )}
                    >
                      {initials(lead.name || lead.email)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5">
                        <span
                          className={cn(
                            "truncate text-sm",
                            unread
                              ? "font-bold text-zinc-900 dark:text-white"
                              : "font-medium text-zinc-700 dark:text-zinc-300",
                          )}
                        >
                          {lead.name || lead.email}
                        </span>
                        {lead.hasStarred && (
                          <Star className="h-3 w-3 shrink-0 fill-amber-400 text-amber-400" />
                        )}
                        {unread && (
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
                        )}
                        <span className="ml-auto shrink-0 text-[10px] text-zinc-400 dark:text-zinc-500">
                          {relativeTime(lead.lastMessageAt)}
                        </span>
                      </span>
                      <span
                        className={cn(
                          "mt-0.5 block truncate text-xs",
                          unread
                            ? "font-semibold text-zinc-800 dark:text-zinc-200"
                            : "text-zinc-500 dark:text-zinc-400",
                        )}
                      >
                        {lead.preview?.subject || "General Inquiry"}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-zinc-400 dark:text-zinc-500">
                        {lead.preview?.body}
                      </span>
                      {(lead.messageCount > 1 || unread) && (
                        <span className="mt-1.5 flex items-center gap-1.5">
                          {lead.messageCount > 1 && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                              <MessagesSquare className="h-2.5 w-2.5" />
                              {lead.messageCount}
                            </span>
                          )}
                          {unread && (
                            <span className="inline-flex items-center rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                              {lead.unreadCount} new
                            </span>
                          )}
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
