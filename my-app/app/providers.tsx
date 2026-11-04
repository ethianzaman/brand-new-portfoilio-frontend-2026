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
// next-themes renders an inline <script>. It only needs to run from the server
// HTML; a script React creates in the browser never executes, and React 19 warns
// about it unless it is typed as a data block.
const themeScriptProps = {
  type: typeof window === "undefined" ? undefined : "application/json",
};

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      scriptProps={themeScriptProps}
    >
      {children}
    </ThemeProvider>
  );
}
