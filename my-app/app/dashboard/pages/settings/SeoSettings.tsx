"use client";

import { useState } from "react";
import { Loader2, Save, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { inputCls, labelCls } from "@/components/ui/shared";
import { cn } from "@/lib/utils";
import type { SiteSeo, SiteSettings } from "@/lib/types/settings";
import {
  usePublishSiteSeo,
  useSiteSettingsQuery,
} from "./useSiteSettingsMutations";
import { SettingsError, SettingsSkeleton } from "./SettingsStates";

/**
 * Global Site Settings → SEO defaults.
 *
 * These values are the site-wide fallbacks every page inherits when it has no
 * SEO override of its own: the title template, default meta description, a
 * default Open Graph image, the Twitter handle and — importantly — the site
 * origin used to build canonical + sitemap URLs.
 */
export function SeoSettings() {
  const query = useSiteSettingsQuery();

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5 lg:col-span-2 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-4 flex items-center gap-2.5">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
          <Search className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-white">
            SEO Defaults
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Site-wide fallbacks for titles, descriptions, social previews and
            canonical URLs
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
        <SeoForm initial={query.data} />
      ) : (
        <SettingsSkeleton />
      )}
    </section>
  );
}

type FormState = {
  defaultMetaTitle: string;
  defaultTitleTemplate: string;
  defaultMetaDescription: string;
  defaultOgImage: string;
  twitterHandle: string;
  siteUrl: string;
};

function toFormState(seo: SiteSeo | undefined): FormState {
  return {
    defaultMetaTitle: seo?.defaultMetaTitle ?? "",
    defaultTitleTemplate: seo?.defaultTitleTemplate || "%s",
    defaultMetaDescription: seo?.defaultMetaDescription ?? "",
    defaultOgImage: seo?.defaultOgImage ?? "",
    twitterHandle: seo?.twitterHandle ?? "",
    siteUrl: seo?.siteUrl ?? "",
  };
}

const TITLE_MAX = 70;
const DESC_MAX = 160;

/** Same policy the backend enforces for the site origin. */
function isValidOrigin(value: string): boolean {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function SeoForm({ initial }: { initial: SiteSettings }) {
  const publish = usePublishSiteSeo();
  const [form, setForm] = useState<FormState>(toFormState(initial.seo));

  function set<K extends keyof FormState>(key: K, val: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  const originInvalid = !isValidOrigin(form.siteUrl.trim());
  const templateInvalid =
    Boolean(form.defaultTitleTemplate.trim()) &&
    form.defaultTitleTemplate.split("%s").length !== 2;

  function handlePublish() {
    if (originInvalid || templateInvalid) return;

    const payload: SiteSeo = {
      defaultMetaTitle: form.defaultMetaTitle.trim(),
      defaultTitleTemplate: form.defaultTitleTemplate.trim() || "%s",
      defaultMetaDescription: form.defaultMetaDescription.trim(),
      defaultOgImage: form.defaultOgImage.trim(),
      twitterHandle: form.twitterHandle.trim(),
      siteUrl: form.siteUrl.trim(),
    };

    publish.mutate(payload, {
      onSuccess: (settings) => setForm(toFormState(settings.seo)),
    });
  }

  const canPublish = !originInvalid && !templateInvalid && !publish.isPending;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className={labelCls}>Default Meta Title</label>
            <span
              className={cn(
                "text-[11px]",
                form.defaultMetaTitle.length > TITLE_MAX
                  ? "text-red-500"
                  : "text-zinc-400",
              )}
            >
              {form.defaultMetaTitle.length}/{TITLE_MAX}
            </span>
          </div>
          <input
            type="text"
            placeholder="e.g. Your Name — Developer"
            value={form.defaultMetaTitle}
            onChange={(e) => set("defaultMetaTitle", e.target.value)}
            className={inputCls}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>
            Title Template
            <span className="ml-1 normal-case font-normal text-zinc-400">
              (%s = page title)
            </span>
          </label>
          <input
            type="text"
            placeholder="%s | Your Name"
            value={form.defaultTitleTemplate}
            onChange={(e) => set("defaultTitleTemplate", e.target.value)}
            className={cn(inputCls, "font-mono text-xs")}
          />
          {templateInvalid && (
            <p className="text-[11px] text-red-500">
              Must contain exactly one &quot;%s&quot; placeholder.
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label className={labelCls}>Default Meta Description</label>
          <span
            className={cn(
              "text-[11px]",
              form.defaultMetaDescription.length > DESC_MAX
                ? "text-red-500"
                : "text-zinc-400",
            )}
          >
            {form.defaultMetaDescription.length}/{DESC_MAX}
          </span>
        </div>
        <textarea
          rows={2}
          placeholder="A short summary of your site used when a page has no description…"
          value={form.defaultMetaDescription}
          onChange={(e) => set("defaultMetaDescription", e.target.value)}
          className={cn(inputCls, "resize-none")}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>Default OG Image</label>
          <input
            type="text"
            placeholder="https://... or /images/og.png"
            value={form.defaultOgImage}
            onChange={(e) => set("defaultOgImage", e.target.value)}
            className={inputCls}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>Twitter Handle</label>
          <input
            type="text"
            placeholder="@yourhandle"
            value={form.twitterHandle}
            onChange={(e) => set("twitterHandle", e.target.value)}
            className={inputCls}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelCls}>
          Site URL
          <span className="ml-1 normal-case font-normal text-zinc-400">
            (used for canonical + sitemap)
          </span>
        </label>
        <input
          type="url"
          placeholder="https://example.com"
          value={form.siteUrl}
          onChange={(e) => set("siteUrl", e.target.value)}
          className={inputCls}
        />
        {originInvalid && (
          <p className="text-[11px] text-red-500">
            Enter a full URL including https:// (no trailing slash).
          </p>
        )}
      </div>

      <Button
        onClick={handlePublish}
        disabled={!canPublish}
        className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 sm:w-auto"
      >
        {publish.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        {publish.isPending ? "Publishing..." : "Publish SEO Defaults"}
      </Button>
    </div>
  );
}
