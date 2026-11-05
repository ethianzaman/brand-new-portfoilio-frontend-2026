"use client";

import { Fragment } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, ChevronRight, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { adminProfile, sidebarSections } from "./sidebar-config";
import { ROLE_LABELS } from "@/lib/types/user";
import { useCurrentUser } from "./useCurrentUser";

type NavSharedProps = {
  collapsed?: boolean;
  onNavigate?: () => void;
  className?: string;
};

const itemBase =
  "group relative flex w-full items-center gap-3 rounded-xl text-sm font-medium outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-indigo-500/60";

const itemIdle =
  "text-zinc-400 hover:translate-x-0.5 hover:bg-zinc-800/70 hover:text-white";

const itemActive =
  "bg-linear-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-600/30";

const iconChip =
  "relative grid h-8 w-8 shrink-0 place-items-center rounded-lg transition-all duration-200";

const chipIdle =
  "bg-zinc-800 text-zinc-400 group-hover:bg-zinc-700 group-hover:text-indigo-400";

const chipActive = "bg-white/15 text-white";

export function SidebarNav({
  collapsed = false,
  onNavigate,
  className,
}: NavSharedProps) {
  const pathname = usePathname();
  const { can } = useCurrentUser();

  return (
    <TooltipProvider delayDuration={0}>
      <div className={cn("flex min-h-0 flex-1 flex-col", className)}>
        {/* ── Navigation ── */}
        <nav className="sidebar-scroll flex-1 space-y-6 overflow-y-auto px-3 py-4">
          {sidebarSections.map((section) => {
            const links = section.links.filter(
              (link) => !link.permission || can(link.permission),
            );
            if (links.length === 0) return null;

            return (
            <section key={section.label}>
              {!collapsed && (
                <p className="mb-2 px-2.5 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-600">
                  {section.label}
                </p>
              )}

              <div className="space-y-1">
                {links.map((link) => {
                  const active = pathname === link.href;

                  const node = (
                    <Link
                      href={link.href}
                      onClick={onNavigate}
                      className={cn(
                        itemBase,
                        collapsed ? "h-10 justify-center px-0" : "px-2.5 py-2",
                        active ? itemActive : itemIdle,
                      )}
                    >
                      <span
                        className={cn(
                          iconChip,
                          active ? chipActive : chipIdle,
                        )}
                      >
                        <link.icon className="h-4 w-4" />
                      </span>
                      {!collapsed && (
                        <>
                          <span className="truncate">{link.label}</span>
                          {active && (
                            <ChevronRight className="ml-auto h-3.5 w-3.5 shrink-0 opacity-70" />
                          )}
                        </>
                      )}
                    </Link>
                  );

                  return (
                    <Fragment key={link.href}>
                      {collapsed ? (
                        <Tooltip>
                          <TooltipTrigger asChild>{node}</TooltipTrigger>
                          <TooltipContent side="right" className="font-medium">
                            {link.label}
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        node
                      )}
                    </Fragment>
                  );
                })}
              </div>
            </section>
            );
          })}
        </nav>

        {/* ── Footer ── */}
        <div className="space-y-2 border-t border-zinc-800/80 p-3">
          <FooterLink collapsed={collapsed} />
          <ProfileCard collapsed={collapsed} />
        </div>
      </div>
    </TooltipProvider>
  );
}

function FooterLink({ collapsed }: { collapsed: boolean }) {
  return (
    <Link
      href="/"
      target="_blank"
      className={cn(
        itemBase,
        collapsed ? "h-10 justify-center px-0" : "px-2.5 py-2",
        itemIdle,
      )}
    >
      <span
        className={cn(
          iconChip,
          "bg-zinc-800 text-zinc-400 group-hover:bg-emerald-500/15 group-hover:text-emerald-400",
        )}
      >
        <Globe className="h-4 w-4" />
      </span>
      {!collapsed && (
        <>
          <span className="truncate">Live Site</span>
          <ArrowUpRight className="ml-auto h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
        </>
      )}
    </Link>
  );
}

function ProfileCard({ collapsed }: { collapsed: boolean }) {
  const { user, isError, errorMessage } = useCurrentUser();

  const email = user?.email ?? adminProfile.email;
  const roleLabel = isError
    ? (errorMessage ?? "Session expired — log in again")
    : user
      ? ROLE_LABELS[user.role]
      : adminProfile.role;
  const initials =
    email
      .split(/[._@-]/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "U";

  const avatar = (
    <span className="relative shrink-0">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 text-xs font-bold text-white shadow-md shadow-indigo-600/30">
        {initials}
      </span>
      <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-zinc-900" />
    </span>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex justify-center rounded-xl bg-zinc-800/50 py-2 ring-1 ring-inset ring-zinc-800">
            {avatar}
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" className="font-medium">
          {email} · {roleLabel}
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-xl bg-zinc-800/50 px-2.5 py-2 ring-1 ring-inset ring-zinc-800">
      {avatar}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-xs font-semibold text-white">
          {email}
        </span>
        <span className="mt-0.5 block truncate text-[10px] text-zinc-500">
          {roleLabel}
        </span>
      </span>
    </div>
  );
}
