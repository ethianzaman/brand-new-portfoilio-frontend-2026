"use client";

import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { SidebarBrand } from "./SidebarBrand";
import { SidebarNav } from "./SidebarNav";

export function MobileSidebar() {
  const [open, setOpen] = useState(false);

  // ✅ Close whenever the viewport grows to desktop
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const handler = (e: MediaQueryListEvent) => {
      if (e.matches) setOpen(false);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="shrink-0 md:hidden dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="left"
          showCloseButton={false}
          className="flex w-72 flex-col gap-0 overflow-hidden border-zinc-800 bg-zinc-900 p-0 text-white"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation Menu</SheetTitle>
          </SheetHeader>

          {/* Brand row */}
          <div className="relative flex h-14 shrink-0 items-center justify-between border-b border-zinc-800 px-4">
            <span className="absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-indigo-500 via-purple-500 to-fuchsia-500" />
            <SidebarBrand onNavigate={() => setOpen(false)} />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="text-zinc-400 hover:bg-zinc-800 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <SidebarNav onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
}
