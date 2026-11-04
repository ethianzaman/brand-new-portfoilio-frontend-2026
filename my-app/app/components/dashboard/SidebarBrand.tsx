import Link from "next/link";
import { Zap } from "lucide-react";

import { cn } from "@/lib/utils";
import { adminProfile } from "./sidebar-config";

type Props = {
  collapsed?: boolean;
  onNavigate?: () => void;
  className?: string;
};

/**
 * Brand row shared by the desktop and mobile sidebars.
 *
 * The name is derived from `adminProfile.name`, so desktop and mobile can
 * never drift apart again.
 */
export function SidebarBrand({ collapsed = false, onNavigate, className }: Props) {
  return (
    <Link
      href="/dashboard"
      onClick={onNavigate}
      className={cn("flex items-center gap-2.5", className)}
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-600/30">
        <Zap className="h-4 w-4 fill-white text-white" />
      </span>
      {!collapsed && (
        <span className="min-w-0">
          <span className="block truncate text-sm font-bold leading-none">
            {adminProfile.name}CMS
          </span>
          <span className="mt-1 block text-[10px] text-zinc-500">
            Admin Panel
          </span>
        </span>
      )}
    </Link>
  );
}
