"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  /** Content taller than this (px) is clamped with a fade + "See more" toggle. */
  collapsedHeight?: number;
  className?: string;
  /** Gradient base that matches the container behind the content. */
  fadeClassName?: string;
};

export function Expandable({
  children,
  collapsedHeight = 220,
  className,
  fadeClassName = "from-white dark:from-zinc-900",
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    setHasOverflow(el.scrollHeight > collapsedHeight + 8);
  }, [collapsedHeight]);

  return (
    <div className={className}>
      <div className="relative">
        <div
          ref={ref}
          style={{ maxHeight: open ? undefined : collapsedHeight }}
          className="overflow-y-auto card-scroll"
        >
          {children}
        </div>
        {!open && hasOverflow && (
          <div
            className={cn(
              "pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t to-transparent",
              fadeClassName,
            )}
          />
        )}
      </div>
      {hasOverflow && (
        <div className="flex justify-center mt-2">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex items-center gap-1 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-1 text-[11px] font-medium text-zinc-600 dark:text-zinc-300 transition-colors hover:border-indigo-300 dark:hover:border-indigo-700 hover:text-indigo-600 dark:hover:text-indigo-400"
          >
            {open ? "See less" : "See more"}
            <ChevronDown
              className={cn("w-3 h-3 transition-transform", open && "rotate-180")}
            />
          </button>
        </div>
      )}
    </div>
  );
}
