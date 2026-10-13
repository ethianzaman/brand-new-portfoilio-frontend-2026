"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const emptySubscribe = () => () => {};

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "relative rounded-lg text-zinc-500 dark:text-zinc-400",
        "hover:text-zinc-900 dark:hover:text-white",
        "hover:bg-zinc-100 dark:hover:bg-zinc-800",
        "transition-all duration-150 hover:scale-110",
        className,
      )}
    >
      <Sun
        className={cn(
          "absolute w-4 h-4 transition-all duration-300",
          !mounted
            ? "opacity-0"
            : isDark
              ? "rotate-0 scale-100 opacity-100"
              : "-rotate-90 scale-0 opacity-0",
        )}
      />
      <Moon
        className={cn(
          "absolute w-4 h-4 transition-all duration-300",
          !mounted
            ? "opacity-0"
            : isDark
              ? "rotate-90 scale-0 opacity-0"
              : "rotate-0 scale-100 opacity-100",
        )}
      />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
