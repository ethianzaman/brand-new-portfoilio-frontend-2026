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
import { useRouter, usePathname } from "next/navigation";
import { Sidebar } from "./SideBar";
import { MobileSidebar } from "./MobileSideBar";
import { TopBarNotifications } from "./TopBarNotifications";
import { ThemeToggle } from "../ThemeToggle";
import { notificationSeed } from "./sidebar-config";
import { cn } from "@/lib/utils";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [unreadCount, setUnreadCount] = useState(notificationSeed.length);
  const router = useRouter();
  const pathname = usePathname();
  const onSettings = pathname === "/dashboard/pages/settings";

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      <Sidebar collapsed={collapsed} />

      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <header
          className="h-14 shrink-0 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800
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
              onMarkAllRead={() => setUnreadCount(0)}
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
              Admin
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
