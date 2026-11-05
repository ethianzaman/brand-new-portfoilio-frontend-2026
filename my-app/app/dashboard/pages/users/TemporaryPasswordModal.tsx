"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";

/** Shows a generated password the one time the backend ever returns it. */
export function TemporaryPasswordModal({
  title,
  email,
  password,
  onClose,
}: {
  title: string;
  email: string;
  password: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  async function copyPassword() {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy — select the password manually.");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4
                  bg-zinc-950/60 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-md my-4 bg-white dark:bg-zinc-900
                    rounded-2xl border border-zinc-200 dark:border-zinc-800
                    shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div
            className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950
                        flex items-center justify-center mb-4"
          >
            <Check className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
            {title}
          </h3>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            A temporary password was generated for{" "}
            <span className="font-semibold text-zinc-900 dark:text-white">
              {email}
            </span>
            . Share it securely — it is shown only once.
          </p>

          <div
            className="mt-4 flex items-center gap-2 rounded-xl border
                        border-zinc-200 dark:border-zinc-700
                        bg-zinc-50 dark:bg-zinc-950 p-3"
          >
            <code className="flex-1 font-mono text-sm text-zinc-900 dark:text-white break-all">
              {password}
            </code>
            <button
              type="button"
              onClick={copyPassword}
              aria-label="Copy temporary password"
              className="p-2 rounded-lg text-zinc-500 hover:text-indigo-600
                         hover:bg-indigo-50 dark:hover:bg-indigo-950
                         transition-colors"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="mt-5 w-full py-2.5 rounded-xl text-sm font-medium
                       bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
