"use client";

import { useState } from "react";
import { useCurrentUser } from "@/app/components/dashboard/useCurrentUser";
import { Check, ChevronDown, Files, Loader2, Save } from "lucide-react";
import { Select } from "radix-ui";
import { Button } from "@/components/ui/button";
import { labelCls } from "@/components/ui/shared";
import { cn } from "@/lib/utils";
import {
  SeoFields,
  fromSeoFormValue,
  toSeoFormValue,
  type SeoFormValue,
} from "@/app/components/seo/SeoFields";
import type { PageSeoMap } from "@/lib/services/settings.service";
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

const STATUS = {
  custom: {
    label: "Custom",
    className: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300",
  },
  default: {
    label: "Default",
    className: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
  },
  noindex: {
    label: "Noindex",
    className: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  },
};

/** Whether a page has its own SEO, or would stay out of search results. */
function pageStatus(value: PageSeoMap[string] | undefined) {
  const seo = toSeoFormValue(value);
  if (seo.noindex) return STATUS.noindex;
  const hasOverride =
    seo.nofollow ||
    [seo.metaTitle, seo.metaDescription, seo.ogImage, seo.canonicalUrl].some(
      (field) => field.trim(),
    );
  return hasOverride ? STATUS.custom : STATUS.default;
}

function StatusBadge({ status }: { status: (typeof STATUS)[keyof typeof STATUS] }) {
  return (
    <span
      className={cn(
        "shrink-0 rounded-md px-1.5 py-0.5 text-[11px] font-semibold",
        status.className,
      )}
    >
      {status.label}
    </span>
  );
}

function PageSelect({
  pages,
  value,
  onChange,
}: {
  pages: PageSeoMap;
  value: string;
  onChange: (page: string) => void;
}) {
  return (
    <Select.Root value={value} onValueChange={onChange}>
      <Select.Trigger
        id="page-seo-select"
        className="group/select flex h-11 w-full items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white pl-4 pr-3 text-sm font-medium text-zinc-900 outline-none transition-colors hover:border-indigo-300 focus-visible:ring-2 focus-visible:ring-indigo-500 sm:w-80 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:hover:border-indigo-700"
      >
        <span className="min-w-0 flex-1 truncate text-left">
          <Select.Value />
        </span>
        <StatusBadge status={pageStatus(pages[value])} />
        <Select.Icon>
          <ChevronDown className="h-4 w-4 shrink-0 text-zinc-400 transition-transform group-data-[state=open]/select:rotate-180" />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          position="popper"
          sideOffset={6}
          collisionPadding={12}
          className="z-50 max-h-80 w-(--radix-select-trigger-width) overflow-hidden rounded-xl bg-white shadow-xl shadow-zinc-950/10 ring-1 ring-zinc-950/10 dark:bg-zinc-900 dark:ring-white/10"
        >
          <Select.Viewport className="p-1">
            {PAGES.map((page) => (
              <Select.Item
                key={page.key}
                value={page.key}
                className="flex cursor-pointer select-none items-center gap-3 rounded-lg py-2 pl-3 pr-2 text-sm font-medium text-zinc-700 outline-none data-highlighted:bg-indigo-50 data-highlighted:text-indigo-600 data-[state=checked]:text-indigo-600 dark:text-zinc-200 dark:data-highlighted:bg-indigo-950 dark:data-highlighted:text-indigo-400 dark:data-[state=checked]:text-indigo-400"
              >
                <span className="min-w-0 flex-1 truncate">
                  <Select.ItemText>{page.label}</Select.ItemText>
                </span>
                <StatusBadge status={pageStatus(pages[page.key])} />
                <span className="grid w-4 shrink-0 place-items-center">
                  <Select.ItemIndicator>
                    <Check className="h-4 w-4" />
                  </Select.ItemIndicator>
                </span>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}

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
  const { can } = useCurrentUser();
  const [selected, setSelected] = useState<string>(PAGES[0].key);
  const [form, setForm] = useState<SeoFormValue>(() =>
    toSeoFormValue(pages[selected]),
  );
  const [loaded, setLoaded] = useState({ pages, selected });
  const publish = usePublishPageSeo();

  // Load the selected page's stored override into the form whenever the
  // selection (or the fetched data) changes.
  if (loaded.pages !== pages || loaded.selected !== selected) {
    setLoaded({ pages, selected });
    setForm(toSeoFormValue(pages[selected]));
  }

  const hasUnpublishedEdits =
    JSON.stringify(fromSeoFormValue(form)) !==
    JSON.stringify(fromSeoFormValue(toSeoFormValue(pages[selected])));

  function handleSelect(page: string) {
    const current = PAGES.find((p) => p.key === selected)?.label;
    if (
      hasUnpublishedEdits &&
      !window.confirm(`Discard your unpublished changes to ${current}?`)
    ) {
      return;
    }
    setSelected(page);
  }

  function handlePublish() {
    publish.mutate({ page: selected, seo: fromSeoFormValue(form) });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="page-seo-select" className={labelCls}>
          Page
        </label>
        <PageSelect pages={pages} value={selected} onChange={handleSelect} />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Fields left blank use the SEO Defaults above.
        </p>
      </div>

      <SeoFields value={form} onChange={setForm} defaultOpen />

      {can("seo.edit") && (
      <Button
        onClick={handlePublish}
        disabled={publish.isPending}
        className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 sm:w-auto text-white"
      >
        {publish.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        {publish.isPending ? "Publishing..." : "Publish Page SEO"}
      </Button>
      )}
    </div>
  );
}
