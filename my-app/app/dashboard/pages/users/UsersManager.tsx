"use client";

import { useState } from "react";
import { ShieldCheck, Users } from "lucide-react";

import type {
  CurrentUser,
  ManagedUser,
  RolePermissionConfig,
} from "@/lib/types/user";
import { cn } from "@/lib/utils";
import { RolePermissions } from "./RolePermissions";
import { UsersTable } from "./UsersTable";

const TABS = [
  { key: "users", label: "Users", icon: Users },
  { key: "roles", label: "Roles & Permissions", icon: ShieldCheck },
] as const;

export function UsersManager({
  users,
  config: initialConfig,
  currentUser,
}: {
  users: ManagedUser[];
  config: RolePermissionConfig;
  currentUser: CurrentUser;
}) {
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("users");
  const [config, setConfig] = useState(initialConfig);

  return (
    <div className="flex flex-col gap-4">
      <div
        role="tablist"
        className="flex w-fit max-w-full gap-1 overflow-x-auto rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800/70"
      >
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={cn(
              "flex h-9 items-center gap-2 whitespace-nowrap rounded-lg px-4 text-sm font-medium transition-colors",
              tab === key
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-950 dark:text-white"
                : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200",
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Both stay mounted so unsaved permission changes survive a tab switch. */}
      <div className={cn("flex flex-col gap-4", tab !== "users" && "hidden")}>
        <UsersTable initial={users} currentUser={currentUser} config={config} />
      </div>
      <div className={cn(tab !== "roles" && "hidden")}>
        <RolePermissions
          config={config}
          currentRole={currentUser.role}
          editable={currentUser.role === "super_admin"}
          onSaved={setConfig}
        />
      </div>
    </div>
  );
}
