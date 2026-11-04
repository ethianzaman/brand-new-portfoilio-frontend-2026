"use client";

import { cn } from "@/lib/utils";
import { SidebarBrand } from "./SidebarBrand";
import { SidebarNav } from "./SidebarNav";

type Props = {
  collapsed: boolean;
};

export function Sidebar({ collapsed }: Props) {
  return (
    <aside
      className={cn(
        "relative hidden shrink-0 flex-col overflow-hidden",
        "h-screen border-r border-zinc-800 bg-zinc-900 text-white",
        "transition-[width] duration-300 ease-in-out md:flex",
        collapsed ? "w-16" : "w-60",
      )}
    >
      {/* Accent line */}
      <span className="absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-indigo-500 via-purple-500 to-fuchsia-500" />

      {/* Brand */}
      <div
        className={cn(
          "flex h-14 shrink-0 items-center gap-2.5 border-b border-zinc-800",
          collapsed ? "justify-center px-0" : "px-4",
        )}
      >
        <SidebarBrand collapsed={collapsed} />
      </div>

      <SidebarNav collapsed={collapsed} />
    </aside>
  );
}
