"use client";

import { useState, type ReactNode } from "react";
import { AlertTriangle, Loader2, Trash2, X } from "lucide-react";

interface Props {
  title: string;
  /** What is being deleted, and what that means. */
  children: ReactNode;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

/** The one confirmation shown before anything in the dashboard is deleted. */
export function ConfirmDeleteModal({ title, children, onConfirm, onCancel }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    try {
      await onConfirm();
    } catch (err) {
      console.error("Delete failed:", err);
    }
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-zinc-950/60 p-4 backdrop-blur-sm">
      <div className="my-4 w-full max-w-md rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between p-6 pb-0">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-950">
            <AlertTriangle className="h-6 w-6 text-red-500" />
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close"
            className="rounded-xl p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <h3 className="mb-2 text-lg font-bold text-zinc-900 dark:text-white">{title}</h3>
          <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">{children}</p>
        </div>

        <div className="flex gap-3 p-6 pt-0">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-zinc-200 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" /> Delete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/** The item's name, picked out from the sentence around it. */
export function DeleteTarget({ children }: { children: ReactNode }) {
  return (
    <span className="break-all font-semibold text-zinc-900 dark:text-white">{children}</span>
  );
}
