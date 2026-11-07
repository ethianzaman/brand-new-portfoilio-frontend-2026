"use client";

import { Select } from "radix-ui";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FormSelectOption {
  value: string;
  label: string;
  /** Tailwind background class for a small coloured dot. */
  dot?: string;
}

/** Radix can't hold an empty value, so "nothing chosen" travels as this. */
const NONE = "__none__";

/**
 * A dropdown for dashboard forms, matching the inputs around it. An option
 * whose value is "" stands for "nothing chosen".
 */
export function FormSelect({
  id,
  value,
  options,
  onChange,
  label,
  className,
}: {
  id?: string;
  value: string;
  options: FormSelectOption[];
  onChange: (value: string) => void;
  /** Accessible name when no visible label points at `id`. */
  label?: string;
  className?: string;
}) {
  const current = options.find((o) => o.value === value);

  return (
    <Select.Root value={value || NONE} onValueChange={(next) => onChange(next === NONE ? "" : next)}>
      <Select.Trigger
        id={id}
        aria-label={label}
        className={cn(
          "group/select flex h-[42px] w-full items-center justify-between gap-2 rounded-xl border border-zinc-200 bg-zinc-50 pl-4 pr-3 text-sm text-zinc-900 outline-none transition-colors",
          "hover:border-indigo-300 focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-indigo-500",
          "data-[state=open]:border-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:hover:border-indigo-700",
          className,
        )}
      >
        <span className="flex min-w-0 items-center gap-2">
          {current?.dot && <span className={cn("h-2 w-2 shrink-0 rounded-full", current.dot)} />}
          <span className={cn("truncate", !value && "text-zinc-400")}>
            <Select.Value />
          </span>
        </span>
        <Select.Icon>
          <ChevronDown className="h-4 w-4 shrink-0 text-zinc-400 transition-transform group-data-[state=open]/select:rotate-180" />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          position="popper"
          sideOffset={6}
          collisionPadding={12}
          className="z-[60] max-h-72 min-w-(--radix-select-trigger-width) overflow-hidden rounded-xl bg-white shadow-xl shadow-zinc-950/10 ring-1 ring-zinc-950/10 dark:bg-zinc-900 dark:ring-white/10"
        >
          <Select.Viewport className="p-1">
            {options.map((option) => (
              <Select.Item
                key={option.value || NONE}
                value={option.value || NONE}
                className="flex cursor-pointer select-none items-center gap-2.5 rounded-lg py-2 pl-3 pr-2 text-sm font-medium text-zinc-700 outline-none data-highlighted:bg-indigo-50 data-highlighted:text-indigo-600 data-[state=checked]:text-indigo-600 dark:text-zinc-200 dark:data-highlighted:bg-indigo-950 dark:data-highlighted:text-indigo-400 dark:data-[state=checked]:text-indigo-400"
              >
                <span
                  className={cn(
                    "h-2 w-2 shrink-0 rounded-full",
                    option.dot ?? "border border-dashed border-zinc-300 dark:border-zinc-600",
                  )}
                />
                <span className="min-w-0 flex-1 truncate">
                  <Select.ItemText>{option.label}</Select.ItemText>
                </span>
                <Select.ItemIndicator>
                  <Check className="h-4 w-4" />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
