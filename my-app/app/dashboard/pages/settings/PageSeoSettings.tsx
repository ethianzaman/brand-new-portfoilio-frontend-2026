"use client";

import { useEffect, useState } from "react";
import { Files, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { inputCls, labelCls } from "@/components/ui/shared";
import {
  SeoFields,
  EMPTY_SEO_FORM,
  fromSeoFormValue,
  toSeoFormValue,
  type SeoFormValue,
} from "@/app/components/seo/SeoFields";
import type { PageSeoMap } from "@/lib/services/settings.services";
import {
  usePageSeoQuery,
  usePublishPageSeo,
} from "./useSiteSettingsMutations";
import { SettingsError, SettingsSkeleton } from "./SettingsStates";

const PAGES = [
  { key: "home", label: "Home" },
  { key: "about", label: "About" },
  { key: "skills", label: "Skills" },
  { key: "services", label: "Services" },
  { key: "projects", label: "Projects" },
  { key: "blog", label: "Blog" },
  { key: "contact", label: "Contact" },
] as const;

/**
 * Global Site Settings → Static-page SEO.
 *
 * Overrides the metadata for each of the site's static routes. A page with no
 * override simply inherits the global SEO defaults above.
 */
export function PageSeoSettings() {
  const query = usePageSeoQuery();

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5 lg:col-span-2 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-4 flex items-center gap-2.5">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
          <Files className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-white">
            Page SEO
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Per-page metadata overrides for the static routes
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
      ) : (
        <PageSeoEditor pages={query.data ?? {}} />
      )}
    </section>
  );
}

function PageSeoEditor({ pages }: { pages: PageSeoMap }) {
  const [selected, setSelected] = useState<string>(PAGES[0].key);
  const [form, setForm] = useState<SeoFormValue>(EMPTY_SEO_FORM);
  const publish = usePublishPageSeo();

  // Load the selected page's stored override into the form whenever the
  // selection (or the fetched data) changes.
  useEffect(() => {
    setForm(toSeoFormValue(pages[selected]));
  }, [pages, selected]);

  function handlePublish() {
    publish.mutate({ page: selected, seo: fromSeoFormValue(form) });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1.5">
        <label className={labelCls}>Page</label>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className={inputCls}
        >
          {PAGES.map((page) => (
            <option key={page.key} value={page.key}>
              {page.label}
            </option>
          ))}
        </select>
      </div>

      <SeoFields value={form} onChange={setForm} defaultOpen />

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
        {publish.isPending ? "Publishing..." : "Publish Page SEO"}
      </Button>
    </div>
  );
}
