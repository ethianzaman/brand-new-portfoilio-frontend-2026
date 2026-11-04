import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BarChart3, Inbox, Layers, ShieldCheck } from "lucide-react";

import { getSiteSettings } from "@/lib/api/settings";
import { DEFAULT_DASHBOARD_PATH, safeReturnUrl } from "@/lib/auth/return-url";
import { verifyCurrentUser } from "@/lib/services/current-user.service";

import { BrandMark } from "../components/brand/BrandMark";
import { ThemeToggle } from "../components/ThemeToggle";
import { LoginForm } from "./LoginForm";

// ─────────────────────────────────────────────────────────────────────────
//  LOGIN PAGE — PUBLIC.
//
//  Anyone may open /login; it is never behind the dashboard guard. A visitor
//  with a verified session is redirected here on the server, before the form
//  renders. Only an "authenticated" result redirects: expired sessions, disabled
//  accounts and an unreachable backend all keep the form, so the dashboard guard
//  can never bounce them back into a redirect loop.
//
//  `returnUrl` is untrusted query-string input, so it is validated HERE, on
//  the server, before it is ever handed to the browser. Anything that is not
//  an approved internal dashboard path falls back to the default dashboard
//  route — that is what stops the login page from becoming an open redirect.
//
//  The layout is a two-panel composition:
//
//    • left  — a branded visual panel (artwork + feature list) that is
//              hidden on small screens;
//    • right — the sign-in card, which stays the single focal point.
//
//  On phones the visual panel collapses into a banner above the form so the
//  page keeps the same identity without stealing vertical space.
// ─────────────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * Decorative artwork for the visual panel. It carries no information, so it
 * is marked `alt=""` and sits behind the content of the panel.
 */
const VISUAL_IMAGE =
  "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1600&q=80";

const HIGHLIGHTS = [
  {
    icon: Layers,
    title: "Projects & case studies",
    copy: "Publish, reorder and update every piece of work you ship.",
  },
  {
    icon: Inbox,
    title: "Messages inbox",
    copy: "Read, triage and reply to new enquiries without leaving the CMS.",
  },
  {
    icon: BarChart3,
    title: "Insights & analytics",
    copy: "Watch visits, clicks and content performance at a glance.",
  },
] as const;

const TRUST_POINTS = [
  "Encrypted session",
  "Role-based access",
  "Instant revalidation",
] as const;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const raw = params.returnUrl;

  const redirectTo =
    safeReturnUrl(typeof raw === "string" ? raw : null) ??
    DEFAULT_DASHBOARD_PATH;

  const { status } = await verifyCurrentUser();
  if (status === "authenticated") redirect(redirectTo);

  // Never throws — the settings API falls back to a neutral brand.
  const settings = await getSiteSettings();
  const brandName = settings.brand.name || "Portfolio CMS";
  const brandTagline = settings.brand.tagline || "Portfolio content management";

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-zinc-950">
      {/* ══════════════ FULL-PAGE BACKGROUND ARTWORK ══════════════
          The photo is the background of the WHOLE page, not just the left
          column. Each panel then lays its own scrim on top of it, so the
          artwork stays visible everywhere while the text keeps its
          contrast. */}
      <Image
        src={VISUAL_IMAGE}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />

      {/* The brand palette — the one the visual panel used — now covers the
          WHOLE page, so the artwork reads as a single continuous scene
          instead of a photo with a coloured half. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-linear-to-br from-indigo-950/95 via-indigo-950/85 to-zinc-950/90"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-linear-to-t from-zinc-950 via-transparent to-indigo-950/40"
      />

      {/* Faint blueprint grid across the whole page */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.14] bg-[linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] bg-size-[56px_56px] mask-[radial-gradient(ellipse_at_center,black,transparent_75%)] [-webkit-mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
      />

      <div className="relative flex justify-center items-center gap-28 min-h-screen lg:flex-cols-[1.05fr_1fr]">
        {/* ══════════════ LEFT — brand / visual panel ══════════════ */}
        <aside className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-14">
          <div className="relative z-10 flex h-full flex-col">
            {/* Brand lockup */}
            <Link
              href="/"
              className="group inline-flex w-fit items-center gap-3"
            >
              <span className="flex size-11 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-950/50 transition-transform duration-200 group-hover:scale-105">
                <BrandMark logo={settings.brand.logo} className="size-5" />
              </span>
              <span>
                <span className="block text-sm font-bold tracking-wide text-white">
                  {brandName}
                </span>
                <span className="block text-xs text-indigo-200/70">
                  {brandTagline}
                </span>
              </span>
            </Link>

            {/* Headline + highlights */}
            <div className="max-w-lg">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-indigo-100 backdrop-blur-md mt-5">
                <ShieldCheck className="size-3.5" />
                Admin workspace
              </span>

              <h1 className="mt-6 text-4xl font-bold leading-[1.15] text-white xl:text-5xl">
                Run your whole portfolio
                <span className="mt-1 block bg-linear-to-r from-indigo-300 via-purple-300 to-fuchsia-300 bg-clip-text text-transparent">
                  from one dashboard
                </span>
              </h1>

              <p className="mt-5 max-w-md text-base leading-relaxed text-indigo-100/70">
                Update your projects, publish new articles, reply to messages
                and watch your numbers — all protected behind a single secure
                sign-in.
              </p>

              <ul className="mt-9 space-y-4">
                {HIGHLIGHTS.map(({ icon: Icon, title, copy }) => (
                  <li key={title} className="flex items-start gap-4">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-indigo-200 backdrop-blur-md transition-colors duration-200 hover:bg-white/15">
                      <Icon className="size-5" />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-white">
                        {title}
                      </span>
                      <span className="block text-sm text-indigo-100/60">
                        {copy}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Trust strip */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-indigo-100/60 mt-5">
              {TRUST_POINTS.map((point) => (
                <span key={point} className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="size-3.5 text-emerald-300/80" />
                  {point}
                </span>
              ))}
            </div>
          </div>
        </aside>

        {/* ══════════════ RIGHT — sign-in card ══════════════ */}
        <main className="relative flex min-h-screen items-center justify-center px-5 py-12 sm:px-8">
          <ThemeToggle className="absolute right-4 top-4 z-20 size-9 rounded-full border border-white/15 bg-white/10 text-indigo-100 shadow-sm backdrop-blur-md transition-colors hover:bg-white/20 hover:text-white dark:border-white/15 dark:bg-white/10 dark:text-indigo-100 dark:hover:bg-white/20 dark:hover:text-white" />

          <div className="relative w-full max-w-md mt-10 animate-fade-in">
            {/* Brand lockup — shown on small screens only, where the left
                visual panel is hidden. */}
            <div className="mb-6 flex items-center gap-3 lg:hidden">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-950/40">
                <BrandMark logo={settings.brand.logo} className="size-5" />
              </span>
              <span>
                <span className="block text-sm font-bold tracking-wide text-white">
                  {brandName}
                </span>
                <span className="block text-xs text-indigo-200/70">
                  {brandTagline}
                </span>
              </span>
            </div>

            <LoginForm redirectTo={redirectTo} />
          </div>
        </main>
      </div>
    </div>
  );
}
