"use client";

import { useMemo, useState } from "react";
import { Loader2, Lock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { dashboardUpdateRolePermissions } from "@/lib/services/user.service";
import {
  CONFIGURABLE_ROLES,
  PERMISSION_ACTIONS,
  ROLE_DESCRIPTIONS,
  ROLE_LABELS,
  USER_ROLES,
  type ConfigurableRole,
  type PermissionAction,
  type PermissionSection,
  type RolePermissionConfig,
  type UserRole,
} from "@/lib/types/user";
import { cn } from "@/lib/utils";
import { RoleBadge } from "./RoleSelect";

type View = "edit" | "compare";

const ACTION_LABELS: Record<PermissionAction, string> = {
  view: "View",
  create: "Create",
  edit: "Edit",
  delete: "Delete",
};

const allKeys = (sections: PermissionSection[]) =>
  sections.flatMap((section) =>
    section.actions.map((action) => `${section.key}.${action}`),
  );

export function RolePermissions({
  config,
  currentRole,
  editable,
  onSaved,
}: {
  config: RolePermissionConfig;
  currentRole: UserRole;
  editable: boolean;
  onSaved: (config: RolePermissionConfig) => void;
}) {
  const { sections } = config;
  const total = useMemo(() => allKeys(sections).length, [sections]);

  const [draft, setDraft] = useState(config.roles);
  const [selected, setSelected] = useState<UserRole>(currentRole);
  const [view, setView] = useState<View>("edit");
  const [saving, setSaving] = useState(false);

  const isLocked = selected === "super_admin" || !editable;
  const granted = useMemo(() => new Set(draft[selected]), [draft, selected]);

  const changedRoles = CONFIGURABLE_ROLES.filter(
    (role) =>
      [...draft[role]].sort().join() !== [...config.roles[role]].sort().join(),
  );

  function update(next: (current: Set<string>) => void) {
    if (isLocked) return;
    const set = new Set(draft[selected]);
    next(set);
    setDraft((prev) => ({
      ...prev,
      [selected]: allKeys(sections).filter((key) => set.has(key)),
    }));
  }

  /** Viewing is what the other actions build on, so they stay in step. */
  function setAction(
    set: Set<string>,
    section: PermissionSection,
    action: PermissionAction,
    on: boolean,
  ) {
    const key = `${section.key}.${action}`;
    if (on) {
      set.add(key);
      set.add(`${section.key}.view`);
    } else {
      set.delete(key);
      if (action === "view") {
        section.actions.forEach((other) => set.delete(`${section.key}.${other}`));
      }
    }
  }

  function toggle(section: PermissionSection, action: PermissionAction) {
    const on = !granted.has(`${section.key}.${action}`);
    update((set) => setAction(set, section, action, on));
  }

  function toggleColumn(action: PermissionAction) {
    const usable = sections.filter((section) => section.actions.includes(action));
    const on = !usable.every((section) => granted.has(`${section.key}.${action}`));
    update((set) => usable.forEach((section) => setAction(set, section, action, on)));
  }

  function toggleRow(section: PermissionSection) {
    const on = !section.actions.every((action) =>
      granted.has(`${section.key}.${action}`),
    );
    update((set) =>
      section.actions.forEach((action) => setAction(set, section, action, on)),
    );
  }

  /** Quick starting points. Users stays off unless access is meant to be full. */
  function applyPreset(actions: PermissionAction[] | "all" | "none") {
    update((set) => {
      set.clear();
      if (actions === "none") return;
      for (const section of sections) {
        if (actions !== "all" && section.key === "users") continue;
        for (const action of section.actions) {
          if (actions === "all" || actions.includes(action)) {
            set.add(`${section.key}.${action}`);
          }
        }
      }
    });
  }

  async function publish() {
    setSaving(true);
    try {
      const saved = await dashboardUpdateRolePermissions(
        Object.fromEntries(CONFIGURABLE_ROLES.map((role) => [role, draft[role]])),
      );
      onSaved(saved);
      setDraft(saved.roles);
      toast.success("Permissions updated. They apply right away.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save permissions.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {!editable && (
        <p className="flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
          <Lock className="h-4 w-4 shrink-0" />
          Only a Super Admin can change what each role can do.
        </p>
      )}

      {/* ── Roles ── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {USER_ROLES.map((role) => {
          const count = draft[role].length;
          const active = selected === role && view === "edit";
          return (
            <button
              key={role}
              type="button"
              aria-pressed={active}
              onClick={() => {
                setSelected(role);
                setView("edit");
              }}
              className={cn(
                "flex flex-col items-start gap-3 rounded-2xl border bg-white p-4 text-left transition-all dark:bg-zinc-900",
                active
                  ? "border-indigo-500 ring-2 ring-indigo-500/20"
                  : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700",
              )}
            >
              <span className="flex w-full items-center justify-between gap-2">
                <RoleBadge role={role} />
                {role === "super_admin" && (
                  <Lock className="h-3.5 w-3.5 text-zinc-400" aria-label="Locked" />
                )}
              </span>
              <span>
                <span className="block text-lg font-bold text-zinc-900 dark:text-white">
                  {count}
                  <span className="text-sm font-medium text-zinc-400"> / {total}</span>
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  permissions
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        {/* ── Header ── */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 bg-zinc-50 px-5 py-4 dark:border-zinc-800 dark:bg-zinc-800/50">
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
              {view === "compare"
                ? "Compare roles"
                : `${ROLE_LABELS[selected]} access`}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {view === "compare"
                ? "Who can do what, side by side"
                : ROLE_DESCRIPTIONS[selected]}
            </p>
          </div>
          <div className="flex rounded-lg bg-zinc-200/60 p-0.5 dark:bg-zinc-800">
            {(["edit", "compare"] as const).map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={view === option}
                onClick={() => setView(option)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                  view === option
                    ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-950 dark:text-white"
                    : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200",
                )}
              >
                {option === "edit" ? "Permissions" : "Compare"}
              </button>
            ))}
          </div>
        </div>

        {view === "compare" ? (
          <CompareTable sections={sections} roles={draft} />
        ) : (
          <>
            {selected === "super_admin" ? (
              <p className="flex items-center gap-2 border-b border-zinc-100 px-5 py-3 text-sm text-violet-700 dark:border-zinc-800 dark:text-violet-300">
                <ShieldCheck className="h-4 w-4 shrink-0" />
                Super Admin always has every permission. This cannot be changed.
              </p>
            ) : (
              editable && (
                <div className="flex flex-wrap items-center gap-2 border-b border-zinc-100 px-5 py-3 dark:border-zinc-800">
                  <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    Quick set
                  </span>
                  {(
                    [
                      ["Full access", "all"],
                      ["Create, edit, delete", ["view", "create", "edit", "delete"]],
                      ["Create and edit", ["view", "create", "edit"]],
                      ["View only", ["view"]],
                      ["No access", "none"],
                    ] as const
                  ).map(([label, actions]) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() =>
                        applyPreset(
                          actions as PermissionAction[] | "all" | "none",
                        )
                      }
                      className="rounded-full border border-zinc-200 px-3 py-1 text-xs font-medium text-zinc-600 transition-colors hover:border-indigo-300 hover:text-indigo-600 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-indigo-700 dark:hover:text-indigo-400"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )
            )}

            <div className="overflow-x-auto">
              <table className="w-full min-w-140 text-sm">
                <thead>
                  <tr className="border-b border-zinc-100 text-[11px] uppercase tracking-wider text-zinc-500 dark:border-zinc-800">
                    <th className="sticky left-0 z-10 bg-white dark:bg-zinc-900 px-5 py-3 text-left font-semibold">Section</th>
                    {PERMISSION_ACTIONS.map((action) => (
                      <th key={action} className="w-24 px-2 py-3 text-center font-semibold">
                        {isLocked ? (
                          ACTION_LABELS[action]
                        ) : (
                          <button
                            type="button"
                            onClick={() => toggleColumn(action)}
                            aria-label={`Toggle ${ACTION_LABELS[action]} for every section`}
                            className="uppercase tracking-wider transition-colors hover:text-indigo-600 dark:hover:text-indigo-400"
                          >
                            {ACTION_LABELS[action]}
                          </button>
                        )}
                      </th>
                    ))}
                    <th className="w-20 px-2 py-3 text-center font-semibold">All</th>
                  </tr>
                </thead>
                <tbody>
                  {sections.map((section) => {
                    const allOn = section.actions.every((action) =>
                      granted.has(`${section.key}.${action}`),
                    );
                    return (
                      <tr
                        key={section.key}
                        className="border-b border-zinc-100 last:border-0 dark:border-zinc-800/60"
                      >
                        <td className="sticky left-0 z-10 bg-white dark:bg-zinc-900 px-5 py-3 font-medium text-zinc-900 dark:text-white">
                          {section.label}
                        </td>
                        {PERMISSION_ACTIONS.map((action) => (
                          <td key={action} className="px-2 py-3 text-center">
                            {section.actions.includes(action) ? (
                              <Toggle
                                on={granted.has(`${section.key}.${action}`)}
                                disabled={isLocked}
                                label={`${ROLE_LABELS[selected]}: ${section.label} ${ACTION_LABELS[action]}`}
                                onClick={() => toggle(section, action)}
                              />
                            ) : (
                              <span className="text-zinc-300 dark:text-zinc-700">—</span>
                            )}
                          </td>
                        ))}
                        <td className="px-2 py-3 text-center">
                          <Toggle
                            on={allOn}
                            disabled={isLocked}
                            label={`${ROLE_LABELS[selected]}: all ${section.label} permissions`}
                            onClick={() => toggleRow(section)}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {changedRoles.length > 0 && (
          <div
            role="status"
            className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-100 bg-zinc-50 px-5 py-3 dark:border-zinc-800 dark:bg-zinc-800/50"
          >
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Unpublished changes: {changedRoles.map((role) => ROLE_LABELS[role]).join(", ")}
            </p>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setDraft(config.roles)}
                disabled={saving}
                className="rounded-xl px-3 py-2 text-sm text-zinc-500 transition-colors hover:text-zinc-900 disabled:opacity-50 dark:hover:text-white"
              >
                Discard
              </button>
              <Button
                onClick={publish}
                disabled={saving}
                className="rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {saving ? "Publishing..." : "Publish permissions"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Toggle({
  on,
  disabled,
  label,
  onClick,
}: {
  on: boolean;
  disabled: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-900",
        on ? "bg-indigo-600" : "bg-zinc-200 dark:bg-zinc-700",
        disabled && "cursor-not-allowed opacity-60",
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 rounded-full bg-white shadow transition-transform",
          on ? "translate-x-4.5" : "translate-x-0.5",
        )}
      />
    </button>
  );
}

function CompareTable({
  sections,
  roles,
}: {
  sections: PermissionSection[];
  roles: Record<UserRole, string[]>;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-160 text-sm">
        <thead>
          <tr className="border-b border-zinc-100 dark:border-zinc-800">
            <th className="sticky left-0 z-10 bg-white dark:bg-zinc-900 px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
              Section
            </th>
            {USER_ROLES.map((role) => (
              <th key={role} className="px-2 py-3 text-left">
                <RoleBadge role={role} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sections.map((section) => (
            <tr
              key={section.key}
              className="border-b border-zinc-100 last:border-0 dark:border-zinc-800/60"
            >
              <td className="sticky left-0 z-10 bg-white dark:bg-zinc-900 px-5 py-3 font-medium text-zinc-900 dark:text-white">
                {section.label}
              </td>
              {USER_ROLES.map((role) => (
                <td key={role} className="px-2 py-3">
                  <PermissionChips
                    actions={section.actions.filter((action) =>
                      roles[role].includes(`${section.key}.${action}`),
                    )}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function PermissionChips({ actions }: { actions: readonly PermissionAction[] }) {
  if (actions.length === 0) {
    return <span className="text-xs text-zinc-400 dark:text-zinc-500">No access</span>;
  }

  return (
    <span className="flex flex-wrap gap-1">
      {actions.map((action) => (
        <span
          key={action}
          className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-[11px] font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
        >
          {ACTION_LABELS[action]}
        </span>
      ))}
    </span>
  );
}

export const asConfigurable = (role: UserRole): role is ConfigurableRole =>
  role !== "super_admin";
