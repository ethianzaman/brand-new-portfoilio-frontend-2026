"use client";

import { CornerUpLeft, Loader2, Send } from "lucide-react";

export function ReplyComposer({
  name,
  open,
  text,
  sending,
  onOpen,
  onClose,
  onChange,
  onSend,
}: {
  name: string;
  open: boolean;
  text: string;
  sending: boolean;
  onOpen: () => void;
  onClose: () => void;
  onChange: (text: string) => void;
  onSend: () => void;
}) {
  return (
    <div className="border-t border-zinc-100 p-4 dark:border-zinc-800">
      {open ? (
        <div className="space-y-2">
          <textarea
            autoFocus
            rows={4}
            value={text}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`Reply to ${name}...`}
            className="w-full resize-none rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
          />
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
              Attaches to the latest message.
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-3.5 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onSend}
                disabled={sending || !text.trim()}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-60"
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Send reply
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={onOpen}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:border-indigo-300 hover:text-indigo-600 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-indigo-700 dark:hover:text-indigo-400"
        >
          <CornerUpLeft className="h-4 w-4" />
          Reply to{" "}
          {name.split(" ")[0]}
        </button>
      )}
    </div>
  );
}
