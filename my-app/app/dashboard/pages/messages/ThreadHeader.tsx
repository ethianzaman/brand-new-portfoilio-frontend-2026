"use client";

import { ArrowLeft, Trash2 } from "lucide-react";
import type { LeadSummary } from "@/lib/types/message";
import { initials } from "./format";

export function ThreadHeader({
  lead,
  canDelete,
  onBack,
  onDelete,
}: {
  lead: LeadSummary;
  canDelete: boolean;
  onBack: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-start gap-3 border-b border-zinc-100 px-4 py-4 dark:border-zinc-800">
      <button
        type="button"
        onClick={onBack}
        aria-label="Back to list"
        className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 lg:hidden"
      >
        <ArrowLeft className="h-4 w-4" />
      </button>

      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-linear-to-br from-indigo-500 to-purple-600 text-sm font-bold text-white">
        {initials(lead.name || lead.email)}
      </span>

      <div className="min-w-0 flex-1">
        <h2 className="truncate text-sm font-bold text-zinc-900 dark:text-white">
          {lead.name || lead.email}
        </h2>
        <a
          href={`mailto:${lead.email}`}
          className="truncate text-xs text-indigo-600 hover:underline dark:text-indigo-400"
        >
          {lead.email}
        </a>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <span className="hidden rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 sm:inline">
          {lead.messageCount}{" "}
          {lead.messageCount === 1 ? "message" : "messages"}
        </span>
        {canDelete && (
          <button
            type="button"
            onClick={onDelete}
            aria-label="Delete contact"
            title="Delete contact"
            className="grid h-8 w-8 place-items-center rounded-lg text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
