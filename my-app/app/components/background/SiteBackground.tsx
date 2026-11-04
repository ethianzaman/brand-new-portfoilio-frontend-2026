import { cn } from "@/lib/utils";

type SiteBackgroundProps = {
  /**
   * Where the background lives.
   *
   * - `fixed` (default): one ambient background behind the whole public app.
   *   This is the single instance mounted by `(public)/layout.tsx`.
   * - `page`: scoped to a page wrapper. The grid stays at the top of the page
   *   so the radial fade looks the same regardless of page height.
   * - `section`: scoped to a section (for example a hero).
   */
  variant?: "fixed" | "page" | "section";
  className?: string;
};

/**
 * The one and only grid + aurora background.
 *
 * Colors, grid size, fade mask, and animations all come from `globals.css`
 * (`.site-grid`, `.animate-aurora`, `.animate-aurora-slow`), so there is a
 * single place to tune the look for the entire application.
 *
 * Place it inside a wrapper that has `relative isolate` (for `page`/`section`)
 * or anywhere in the public layout (for `fixed`).
 */
export function SiteBackground({
  variant = "fixed",
  className,
}: SiteBackgroundProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none overflow-hidden",
        variant === "fixed" ? "fixed inset-0 -z-10" : "absolute inset-0 -z-10",
        className,
      )}
    >
      {/* Grid */}
      <div
        className={cn(
          "site-grid absolute",
          variant === "page" ? "inset-x-0 top-0 h-195" : "inset-0",
        )}
      />

      {/* Aurora blobs */}
      <div className="animate-aurora absolute -top-24 -left-24 h-96 w-96 rounded-full bg-indigo-400/30 blur-3xl dark:bg-indigo-600/25" />
      <div className="animate-aurora-slow absolute top-20 right-0 h-80 w-80 rounded-full bg-sky-300/30 blur-3xl dark:bg-sky-500/20" />
    </div>
  );
}
