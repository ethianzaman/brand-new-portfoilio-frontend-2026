"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { SocialIcon } from "@/app/components/brand/SocialIcon";
import { useCurrentUser } from "@/app/components/dashboard/useCurrentUser";
import { SOCIAL_PLACEMENTS, displayHref } from "@/lib/socials";
import type { SiteSettings, SiteSocial } from "@/lib/types/settings";
import { useDeleteSocial } from "../settings/useSiteSettingsMutations";
import { SocialLinkForm } from "./SocialLinkForm";

const MAX_SOCIALS = 30;

type Editing = { mode: "create" } | { mode: "edit"; social: SiteSocial } | null;

export function SocialLibrary({ settings }: { settings: SiteSettings }) {
  const { canDelete } = useCurrentUser();
  const remove = useDeleteSocial();
  const [editing, setEditing] = useState<Editing>(null);
  const socials = settings.socials;

  function sectionCount(id: string) {
    return SOCIAL_PLACEMENTS.filter(({ key }) =>
      settings.socialPlacements?.[key]?.includes(id),
    ).length;
  }

  function handleDelete(social: SiteSocial) {
    const confirmed = window.confirm(
      `Delete "${social.label}"? It will also be removed from every section.`,
    );
    if (confirmed) remove.mutate(social.id);
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {socials.length} of {MAX_SOCIALS} links. A new link shows nowhere until
          you add it to a section.
        </p>
        <Button
          onClick={() => setEditing({ mode: "create" })}
          disabled={socials.length >= MAX_SOCIALS}
          className="rounded-xl bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          Add link
        </Button>
      </div>

      {socials.length === 0 ? (
        <p className="rounded-2xl bg-white px-4 py-12 text-center text-sm text-zinc-400 shadow-sm ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10">
          No social links yet. Add your first one.
        </p>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {socials.map((social) => {
            const used = sectionCount(social.id);
            return (
              <li
                key={social.id}
                className="group flex items-center gap-3.5 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-950/5 transition-shadow hover:shadow-md dark:bg-zinc-900 dark:ring-white/10"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                  <SocialIcon
                    icon={social.icon}
                    imageUrl={social.imageUrl}
                    className="h-5 w-5"
                  />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-zinc-900 dark:text-white">
                    {social.label}
                  </p>
                  <p
                    className="truncate text-xs text-zinc-500 dark:text-zinc-400"
                    title={social.href}
                  >
                    {displayHref(social.href)}
                  </p>
                  <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
                    {used === 0
                      ? "Not in any section"
                      : `${used} ${used === 1 ? "section" : "sections"}`}
                  </p>
                </div>
                <div className="flex shrink-0 items-center transition-opacity focus-within:opacity-100 md:opacity-0 md:group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => setEditing({ mode: "edit", social })}
                    aria-label={`Edit ${social.label}`}
                    className="grid h-9 w-9 place-items-center rounded-lg text-zinc-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  {canDelete && (
                    <button
                      type="button"
                      onClick={() => handleDelete(social)}
                      disabled={remove.isPending}
                      aria-label={`Delete ${social.label}`}
                      className="grid h-9 w-9 place-items-center rounded-lg text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-50 dark:hover:bg-red-950/40"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Sheet
        open={editing !== null}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
      >
        <SheetContent className="flex w-full flex-col gap-0 sm:max-w-md">
          <SheetHeader>
            <SheetTitle>
              {editing?.mode === "edit"
                ? `Edit ${editing.social.label}`
                : "Add a social link"}
            </SheetTitle>
            <SheetDescription>
              Changes reach every section that uses this link.
            </SheetDescription>
          </SheetHeader>
          {editing && (
            <SocialLinkForm
              key={editing.mode === "edit" ? editing.social.id : "new"}
              social={editing.mode === "edit" ? editing.social : null}
              onClose={() => setEditing(null)}
            />
          )}
        </SheetContent>
      </Sheet>
    </section>
  );
}
