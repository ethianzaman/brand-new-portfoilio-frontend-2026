"use client";

import { CornerUpLeft, Star, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ContactMessage } from "@/lib/types/message";
import { fullDate } from "./format";

export function MessageCard({
  message: m,
  canEdit,
  canDelete,
  onToggleStar,
  onDelete,
}: {
  message: ContactMessage;
  canEdit: boolean;
  canDelete: boolean;
  onToggleStar: () => void;
  onDelete: () => void;
}) {
  return (
    <div
        className="rounded-2xl border border-zinc-100 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/40"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
            {m.subject || "General Inquiry"}
          </h3>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-400 dark:text-zinc-500">
            <span>{fullDate(m.createdAt)}</span>
            {m.budget && (
              <span className="rounded-full bg-zinc-100 px-2 py-0.5 font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                Budget: {m.budget}
              </span>
            )}
            {m.replied && (
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-medium text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                Replied
              </span>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          {canEdit && (
          <button
            type="button"
            onClick={onToggleStar}
            aria-label={m.starred ? "Unstar" : "Star"}
            title={m.starred ? "Unstar" : "Star"}
            className={cn(
              "grid h-7 w-7 place-items-center rounded-lg transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800",
              m.starred
                ? "text-amber-500"
                : "text-zinc-400 hover:text-amber-500",
            )}
          >
            <Star
              className={cn(
                "h-3.5 w-3.5",
                m.starred && "fill-amber-400 text-amber-400",
              )}
            />
          </button>
          )}
          {canDelete && (
            <button
              type="button"
              onClick={onDelete}
              aria-label="Delete message"
              title="Delete message"
              className="grid h-7 w-7 place-items-center rounded-lg text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
        {m.body}
      </p>

      {m.replies.length > 0 && (
        <div className="mt-4 space-y-2.5 border-t border-zinc-100 pt-4 dark:border-zinc-800">
          {m.replies.map((r) => (
            <div
              key={r.id}
              className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-3 dark:border-indigo-900/60 dark:bg-indigo-950/30"
            >
              <div className="mb-1 flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                <CornerUpLeft className="h-3 w-3" />
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                  You
                </span>
                <span>·</span>
                <span>{fullDate(r.sentAt)}</span>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700 dark:text-zinc-200">
                {r.body}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
