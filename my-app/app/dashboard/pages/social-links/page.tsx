"use client";

import { useState } from "react";
import { Library, LayoutList, Loader2, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/app/components/dashboard/PageHeader";
import { cn } from "@/lib/utils";
import {
  useSetupSocialLibrary,
  useSiteSettingsQuery,
} from "../settings/useSiteSettingsMutations";
import { SettingsError, SettingsSkeleton } from "../settings/SettingsStates";
import { SocialLibrary } from "./SocialLibrary";
import { useCurrentUser } from "@/app/components/dashboard/useCurrentUser";
import { SocialPlacements } from "./SocialPlacements";

const TABS = [
  { key: "library", label: "Library", icon: Library },
  { key: "placements", label: "Sections", icon: LayoutList },
] as const;

type Tab = (typeof TABS)[number]["key"];

/**
 * Social Links: one library of links, and a choice per section of which of them
 * to show. How many a section shows is simply how many are selected for it.
 */
export default function SocialLinksPage() {
  const query = useSiteSettingsQuery();
  const setup = useSetupSocialLibrary();
  const { can } = useCurrentUser();
  const [tab, setTab] = useState<Tab>("library");

  const settings = query.data;
  const placementsVersion = settings
    ? JSON.stringify([
        settings.socials.map((social) => social.id),
        settings.socialPlacements,
      ])
    : "";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        icon={Share2}
        title="Social Links"
        description="Add your links once, then choose which ones each section shows"
        className="items-start"
      />

      {query.isLoading ? (
        <SettingsSkeleton />
      ) : query.isError || !settings ? (
        <SettingsError
          message={query.error instanceof Error ? query.error.message : ""}
          onRetry={() => void query.refetch()}
        />
      ) : !settings.socialsConfigured ? (
        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-white">
            Bring your existing links into one library
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-zinc-500 dark:text-zinc-400">
            Your links from the Navbar, Footer, Home hero and Contact page will
            be merged without duplicates. Each section keeps showing what it
            shows today, so the public site will not change.
          </p>
          {can("socialLinks.edit") && (
            <Button
              onClick={() => setup.mutate()}
              disabled={setup.isPending}
              className="mt-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {setup.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {setup.isPending ? "Setting up..." : "Set up library"}
            </Button>
          )}
        </section>
      ) : (
        <>
          <div role="tablist" className="flex w-fit gap-1 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800/70">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={tab === key}
                onClick={() => setTab(key)}
                className={cn(
                  "flex h-9 items-center gap-2 rounded-lg px-4 text-sm font-medium transition-colors",
                  tab === key
                    ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-950 dark:text-white"
                    : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200",
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Both stay mounted so unsaved section choices survive a tab switch. */}
          <div className={cn(tab !== "library" && "hidden")}>
            <SocialLibrary settings={settings} />
          </div>
          <div className={cn(tab !== "placements" && "hidden")}>
            <SocialPlacements key={placementsVersion} settings={settings} />
          </div>
        </>
      )}
    </div>
  );
}
