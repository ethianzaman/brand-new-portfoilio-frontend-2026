"use client";

import { ThemeProvider } from "next-themes";

/**
 * Client-side providers that must wrap the whole tree.
 *
 * Extracted from the old client `app/layout.tsx` so the root layout can be a
 * Server Component and export `generateMetadata` — metadata exports are only
 * supported in Server Components. Behaviour is unchanged: `next-themes` owns
 * the class-based dark mode and `suppressHydrationWarning` on `<html>` covers
 * the theme class it injects before hydration.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </ThemeProvider>
  );
}
