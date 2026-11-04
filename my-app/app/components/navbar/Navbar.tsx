"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import { NavLinks } from "./navLinks";
import { MobileMenu } from "./mobileMenu";
import { ThemeToggle } from "../ThemeToggle";
import { BrandMark } from "../brand/BrandMark";
import { SocialIcon } from "../brand/SocialIcon";
import { useAuthStatus } from "./useAuthStatus";
import { resolveSocials } from "@/lib/socials";
import type { SiteSettings } from "@/lib/types/settings";

export function Navbar({ settings }: { settings: SiteSettings }) {
  const { name, tagline, logo } = settings.brand;
  const socials = resolveSocials(settings, "navbar");
  const [scrolled, setScrolled] = useState(false);

  // The dashboard link is only rendered while a valid session exists. The
  // public pages are statically cached, so the state is resolved in the
  // browser against the authoritative /api/auth/me endpoint instead of
  // being baked into the cached HTML.
  const isAuthenticated = useAuthStatus();

  // ✅ Add border + backdrop on scroll
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 h-16",
        "transition-all duration-300",
        scrolled
          ? "bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800"
          : "bg-transparent",
      )}
    >
      <div className="max-w-6xl mx-auto px-4 h-full flex items-center justify-between">
        {/* ─── Logo ─── */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div
            className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center overflow-hidden
                          transition-transform duration-200 group-hover:scale-110"
          >
            <BrandMark logo={logo} className="w-4 h-4 text-white" />
          </div>
          {(name || tagline) && (
            <div className="hidden sm:block">
              {name && (
                <p className="text-sm font-bold text-zinc-900 dark:text-white leading-none">
                  {name}
                </p>
              )}
              {tagline && (
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {tagline}
                </p>
              )}
            </div>
          )}
        </Link>

        {/* ─── Desktop nav ─── */}
        <nav className="hidden xl:flex items-center gap-0.5">
          <NavLinks isAuthenticated={isAuthenticated} />
        </nav>

        {/* ─── Desktop right side ─── */}
        <div className="hidden xl:flex items-center gap-2">
          {/* Theme toggle */}
          <ThemeToggle />

          {/* Social icons */}
          {socials.map(({ id, href, label, icon, imageUrl }) => (
            <a
              key={id}
              href={href}
              target="_blank"
              rel="noreferrer"
              aria-label={label}
              className="p-2 rounded-lg text-zinc-500 dark:text-zinc-400
                         hover:text-zinc-900 dark:hover:text-white
                         hover:bg-zinc-100 dark:hover:bg-zinc-800
                         transition-all duration-150 hover:scale-110"
            >
              <SocialIcon icon={icon} imageUrl={imageUrl} className="w-4 h-4" />
            </a>
          ))}

          {/* CTA */}
          <Button
            asChild
            size="sm"
            className="ml-2 bg-indigo-600 hover:bg-indigo-700 text-white
                       transition-transform duration-150 hover:scale-105"
          >
            <Link href="/contact">Hire Me</Link>
          </Button>
        </div>

        {/* ─── Mobile theme toggle + hamburger ─── */}
        <div className="flex xl:hidden items-center gap-1">
          <ThemeToggle className="size-10 xl:size-8" />
          <MobileMenu settings={settings} isAuthenticated={isAuthenticated} />
        </div>
      </div>
    </header>
  );
}
