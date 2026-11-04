"use client";
import { useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  LogOut,
  PanelLeftOpen,
  PanelLeftClose,
  Settings,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./SideBar";
import { MobileSidebar } from "./MobileSideBar";
import { TopBarNotifications } from "./TopBarNotifications";
import { ThemeToggle } from "../ThemeToggle";
import { useMessageNotifications } from "./useMessageNotifications";
import { useCurrentUser } from "./useCurrentUser";
import { SiteBackground } from "../background/SiteBackground";
import { ROLE_LABELS } from "@/lib/types/user";
import { cn } from "@/lib/utils";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const { unreadCount, notifications, loading, error, markAllRead } =
    useMessageNotifications();
  const { user } = useCurrentUser();
  const pathname = usePathname();
  const onSettings = pathname === "/dashboard/pages/settings";

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    // A full navigation also drops the router cache and in-memory dashboard data,
    // so Back cannot restore a protected page from the client.
    window.location.replace("/login");
  }

  return (
    <div className="relative isolate flex h-screen overflow-hidden">
      {/* One shared site background — identical to the public pages. The
          shell stays transparent so the grid is visible; the sidebar and
          cards below remain opaque for readability. */}
      <SiteBackground />
      <Sidebar collapsed={collapsed} />

      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <header
          className="h-14 shrink-0 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800
                           flex items-center px-4 gap-3 z-10"
        >
          {/* ✅ Desktop toggle — always visible, switches icon based on state */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed((c) => !c)}
            className="hidden md:flex text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100
                       dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <PanelLeftOpen className="w-5 h-5" />
            ) : (
              <PanelLeftClose className="w-5 h-5" />
            )}
          </Button>

          {/* Mobile hamburger */}
          <MobileSidebar />

          <span className="font-semibold text-zinc-800 dark:text-zinc-100 text-sm">
            Dashboard
          </span>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            {/* Notifications */}
            <TopBarNotifications
              unreadCount={unreadCount}
              notifications={notifications}
              loading={loading}
              error={error}
              onMarkAllRead={markAllRead}
            />

            {/* Settings */}
            <Link
              href="/dashboard/pages/settings"
              aria-label="Settings"
              className={cn(
                "grid h-8 w-8 place-items-center rounded-lg transition-all duration-150 hover:scale-105",
                onSettings
                  ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white"
                  : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white",
              )}
            >
              <Settings className="h-4 w-4" />
            </Link>

            <ThemeToggle />
            <span className="text-sm text-zinc-500 dark:text-zinc-400 hidden sm:block">
              {user ? ROLE_LABELS[user.role] : "…"}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:block">Logout</span>
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
