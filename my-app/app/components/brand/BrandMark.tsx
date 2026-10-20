import {
  Bolt,
  Code2,
  Cpu,
  Globe,
  Rocket,
  Sparkles,
  Star,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SiteBrandLogo } from "@/lib/types/settings";

/**
 * The full set of selectable brand icon keys. Kept in one place so the admin
 * picker and the renderer can never drift apart.
 */
export const BRAND_ICONS = {
  zap: Zap,
  bolt: Bolt,
  sparkles: Sparkles,
  star: Star,
  rocket: Rocket,
  globe: Globe,
  code: Code2,
  cpu: Cpu,
} as const;

export type BrandIconKey = keyof typeof BRAND_ICONS;

/**
 * Renders the shared brand logo — either an uploaded/remote image or a
 * configured icon. Used by the Navbar, the mobile menu and the Footer so all
 * three stay in sync. Falls back to the existing `zap` mark when no icon key
 * is configured.
 */
export function BrandMark({
  logo,
  className,
}: {
  logo?: SiteBrandLogo | null;
  className?: string;
}) {
  if (logo?.type === "image" && logo.url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logo.url}
        alt=""
        className={cn("h-full w-full object-cover", className)}
      />
    );
  }

  const Icon = BRAND_ICONS[(logo?.icon ?? "zap") as BrandIconKey] ?? Zap;

  return <Icon className={className} aria-hidden />;
}
