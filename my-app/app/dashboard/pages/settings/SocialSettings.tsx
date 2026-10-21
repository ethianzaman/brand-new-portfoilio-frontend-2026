"use client";

import { useState } from "react";
import { Loader2, Plus, Save, Share2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { inputCls } from "@/components/ui/shared";
import { cn } from "@/lib/utils";
import {
  SOCIAL_ICONS,
  SocialIcon,
  type SocialIconKey,
} from "@/app/components/brand/SocialIcon";
import type { SiteSocial, SiteSettings } from "@/lib/types/settings";
import {
  usePublishSocials,
  useSiteSettingsQuery,
} from "./useSiteSettingsMutations";
import { SettingsError, SettingsSkeleton } from "./SettingsStates";

const MAX_SOCIALS = 12;
const ICON_KEYS = Object.keys(SOCIAL_ICONS) as SocialIconKey[];

// Same rule the backend enforces (settings.controller.ts isValidUrl).
const HREF_RE = /^(https?:\/\/|mailto:|tel:|#|\/)/;

/**
 * Global Site Settings → Social Links.
 *
 * One shared, dynamic list rendered by BOTH the Navbar and the Footer. Add or
 * remove rows freely; extra networks work through the generic icon set.
 */
export function SocialSettings() {
  const query = useSiteSettingsQuery();

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5 lg:col-span-2 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-4 flex items-center gap-2.5">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
          <Share2 className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-white">
            Social Links
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Shared by the Navbar and the Footer — add as many as you need
          </p>
        </div>
      </div>

      {query.isLoading ? (
        <SettingsSkeleton />
      ) : query.isError ? (
        <SettingsError
          message={query.error instanceof Error ? query.error.message : ""}
          onRetry={() => void query.refetch()}
        />
      ) : query.data ? (
        <SocialForm initial={query.data} />
      ) : (
        <SettingsSkeleton />
      )}
    </section>
  );
}

/**
 * Clean the rows before publish — mirrors HomeCMS.sanitizeSocials.
 * Blank rows are dropped silently; half-filled or protocol-less rows are
 * rejected with a precise message so the admin is never left guessing.
 */
function sanitizeSocials(list: SiteSocial[]): SiteSocial[] | string {
  const filled = list.filter((s) => s.label.trim() || s.href.trim());

  for (let i = 0; i < filled.length; i++) {
    const label = filled[i].label.trim();
    const href = filled[i].href.trim();
    if (!label || !href) {
      return `Social link #${i + 1}: fill in both the label and the URL (or delete the row)`;
    }
    if (!HREF_RE.test(href)) {
      return `"${label}": URL must start with https:// (e.g. https://github.com/you)`;
    }
  }

  return filled.map((s) => ({
    label: s.label.trim(),
    href: s.href.trim(),
    icon: s.icon || "link",
  }));
}

function SocialForm({ initial }: { initial: SiteSettings }) {
  const publish = usePublishSocials();
  const [rows, setRows] = useState<SiteSocial[]>(initial.socials);

  function updateRow(index: number, patch: Partial<SiteSocial>) {
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    );
  }

  function addRow() {
    if (rows.length >= MAX_SOCIALS) {
      toast.error(`You can add up to ${MAX_SOCIALS} social links`);
      return;
    }
    setRows((prev) => [...prev, { label: "", href: "", icon: "link" }]);
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  function handlePublish() {
    const clean = sanitizeSocials(rows);
    if (typeof clean === "string") {
      toast.error(clean);
      return;
    }
    publish.mutate(clean, {
      onSuccess: (settings) => setRows(settings.socials),
      onError: () => setRows(initial.socials),
    });
  }

  return (
    <div className="space-y-4">
      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-200 px-4 py-6 text-center text-xs text-zinc-400 dark:border-zinc-700">
          No social links yet — add one to show icons in the Navbar and Footer.
        </p>
      ) : (
        <div className="space-y-2.5">
          {rows.map((row, index) => (
            <div
              key={index}
              className="flex flex-col gap-2.5 sm:flex-row sm:items-center"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                  <SocialIcon icon={row.icon} className="h-4 w-4" />
                </span>
                <select
                  value={row.icon}
                  onChange={(e) =>
                    updateRow(index, { icon: e.target.value })
                  }
                  className={cn(inputCls, "min-w-0 flex-1 capitalize sm:w-28 sm:flex-none")}
                  aria-label={`Icon for social link ${index + 1}`}
                >
                  {ICON_KEYS.map((key) => (
                    <option key={key} value={key}>
                      {key}
                    </option>
                  ))}
                </select>
              </div>

              <input
                type="text"
                placeholder="Label (e.g. GitHub)"
                value={row.label}
                onChange={(e) => updateRow(index, { label: e.target.value })}
                className={cn(inputCls, "min-w-0 sm:w-40 sm:shrink-0")}
              />

              <input
                type="text"
                placeholder="https://..."
                value={row.href}
                onChange={(e) => updateRow(index, { href: e.target.value })}
                className={cn(inputCls, "min-w-0 sm:flex-1")}
              />

              <button
                type="button"
                onClick={() => removeRow(index)}
                aria-label={`Remove social link ${index + 1}`}
                className="grid h-9 w-9 shrink-0 place-items-center self-end rounded-lg text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-500 sm:self-auto dark:hover:bg-red-950/40"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={addRow}
          disabled={rows.length >= MAX_SOCIALS}
          className="flex items-center justify-center gap-1 text-xs font-medium text-indigo-600 hover:underline disabled:cursor-not-allowed disabled:opacity-50 dark:text-indigo-400"
        >
          <Plus className="h-3.5 w-3.5" /> Add social link
        </button>

        <Button
          onClick={handlePublish}
          disabled={publish.isPending}
          className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 sm:w-auto"
        >
          {publish.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {publish.isPending ? "Publishing..." : "Publish Social Links"}
        </Button>
      </div>
    </div>
  );
}
