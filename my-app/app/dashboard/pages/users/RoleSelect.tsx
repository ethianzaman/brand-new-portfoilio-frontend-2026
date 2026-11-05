"use client";

import { Select } from "radix-ui";
import { Check, ChevronDown } from "lucide-react";

import { ROLE_DESCRIPTIONS, ROLE_LABELS, type UserRole } from "@/lib/types/user";
import { cn } from "@/lib/utils";

export const ROLE_STYLES: Record<UserRole, string> = {
  super_admin:
    "bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
  admin: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300",
  manager: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  editor:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
};

const ROLE_DOTS: Record<UserRole, string> = {
  super_admin: "bg-violet-500",
  admin: "bg-indigo-500",
  manager: "bg-amber-500",
  editor: "bg-emerald-500",
};

export function RoleBadge({ role }: { role: UserRole }) {
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold",
        ROLE_STYLES[role],
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", ROLE_DOTS[role])} />
      {ROLE_LABELS[role]}
    </span>
  );
}

export function RoleSelect({
  id,
  value,
  roles,
  disabled,
  label,
  onChange,
  className,
}: {
  id?: string;
  value: UserRole;
  roles: readonly UserRole[];
  disabled?: boolean;
  label: string;
  onChange: (role: UserRole) => void;
  className?: string;
}) {
  return (
    <Select.Root
      value={value}
      disabled={disabled}
      onValueChange={(next) => onChange(next as UserRole)}
    >
      <Select.Trigger
        id={id}
        aria-label={label}
        className={cn(
          "inline-flex h-8 items-center justify-between gap-2 rounded-lg border border-zinc-200 bg-white pl-2.5 pr-2 text-xs font-semibold text-zinc-800 outline-none transition-colors hover:border-indigo-300 focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:border-indigo-700",
          className,
        )}
      >
        <span className="flex min-w-0 items-center gap-2">
          <span className={cn("h-2 w-2 shrink-0 rounded-full", ROLE_DOTS[value])} />
          <Select.Value />
        </span>
        <Select.Icon>
          <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          position="popper"
          sideOffset={6}
          collisionPadding={12}
          className="z-60 w-72 max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-xl bg-white shadow-xl ring-1 ring-zinc-950/10 dark:bg-zinc-900 dark:ring-white/10"
        >
          <Select.Viewport className="p-1">
            {roles.map((role) => (
              <Select.Item
                key={role}
                value={role}
                className="flex cursor-pointer select-none items-start gap-2.5 rounded-lg px-2.5 py-2 outline-none data-highlighted:bg-zinc-100 dark:data-highlighted:bg-zinc-800"
              >
                <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", ROLE_DOTS[role])} />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-zinc-900 dark:text-white">
                    <Select.ItemText>{ROLE_LABELS[role]}</Select.ItemText>
                  </span>
                  <span className="block text-xs text-zinc-500 dark:text-zinc-400">
                    {ROLE_DESCRIPTIONS[role]}
                  </span>
                </span>
                <Select.ItemIndicator>
                  <Check className="mt-0.5 h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
