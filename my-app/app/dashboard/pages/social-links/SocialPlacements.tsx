"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Loader2, Plus, Search, X } from "lucide-react";
import { Popover } from "radix-ui";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/app/components/dashboard/useCurrentUser";
import { SocialIcon } from "@/app/components/brand/SocialIcon";
import {
  SOCIAL_PLACEMENTS,
  displayHref,
  uniqueByLabel,
  type SocialPlacement,
  type SocialPlacementMap,
} from "@/lib/socials";
import { cn } from "@/lib/utils";
import type { SiteSettings, SiteSocial } from "@/lib/types/settings";
import { usePublishSocialPlacements } from "../settings/useSiteSettingsMutations";

function fromSettings(settings: SiteSettings): SocialPlacementMap {
  return Object.fromEntries(
    SOCIAL_PLACEMENTS.map(({ key }) => [
      key,
      settings.socialPlacements?.[key] ?? [],
    ]),
  ) as SocialPlacementMap;
}

export function SocialPlacements({ settings }: { settings: SiteSettings }) {
  const canEdit = useCurrentUser().can("socialLinks.edit");
  const publish = usePublishSocialPlacements();
  const saved = useMemo(() => fromSettings(settings), [settings]);
  const [draft, setDraft] = useState(saved);

  const changedCount = SOCIAL_PLACEMENTS.filter(
    ({ key }) => JSON.stringify(draft[key]) !== JSON.stringify(saved[key]),
  ).length;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 lg:grid-cols-2">
        {SOCIAL_PLACEMENTS.map(({ key, label, hint }) => (
          <SectionCard
            key={key}
            placement={key}
            label={label}
            hint={hint}
            ids={draft[key]}
            socials={settings.socials}
            onChange={(next) =>
              setDraft((prev) => ({ ...prev, [key]: next }))
            }
          />
        ))}
      </div>

      {canEdit && changedCount > 0 && (
        <div
          role="status"
          className="sticky bottom-4 z-20 mx-auto flex w-full max-w-xl items-center justify-between gap-3 rounded-2xl bg-zinc-900 py-2.5 pl-5 pr-2.5 text-white shadow-xl shadow-zinc-950/20 dark:bg-zinc-800"
        >
          <p className="text-sm font-medium">
            {changedCount} {changedCount === 1 ? "section" : "sections"} changed
          </p>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setDraft(saved)}
              disabled={publish.isPending}
              className="rounded-xl px-3 py-2 text-sm text-zinc-300 transition-colors hover:text-white disabled:opacity-50"
            >
              Discard
            </button>
            <Button
              onClick={() => publish.mutate(draft)}
              disabled={publish.isPending}
              className="rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white"
            >
              {publish.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {publish.isPending ? "Publishing..." : "Publish"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function SectionCard({
  placement,
  label,
  hint,
  ids,
  socials,
  onChange,
}: {
  placement: SocialPlacement;
  label: string;
  hint: string;
  ids: string[];
  socials: SiteSocial[];
  onChange: (next: string[]) => void;
}) {
  const canEdit = useCurrentUser().can("socialLinks.edit");
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 4 } }),
    // The delay leaves a normal swipe free to scroll the page.
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const byId = useMemo(
    () => new Map(socials.map((social) => [social.id, social])),
    [socials],
  );
  const selected = ids.flatMap((id) => {
    const social = byId.get(id);
    return social ? [social] : [];
  });
  const available = socials.filter((social) => !ids.includes(social.id));

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    onChange(
      arrayMove(
        ids,
        ids.indexOf(String(active.id)),
        ids.indexOf(String(over.id)),
      ),
    );
  }

  const name = (id: unknown) => byId.get(String(id))?.label ?? "link";
  const announcements: Announcements = {
    onDragStart: ({ active }) => `Picked up ${name(active.id)}.`,
    onDragOver: ({ active, over }) =>
      over ? `${name(active.id)} is over ${name(over.id)}.` : undefined,
    onDragEnd: ({ active, over }) =>
      over
        ? `${name(active.id)} was moved to the position of ${name(over.id)}.`
        : `${name(active.id)} was dropped.`,
    onDragCancel: ({ active }) => `Moving ${name(active.id)} was cancelled.`,
  };

  return (
    <section
      aria-label={label}
      className="flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">
            {label}
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{hint}</p>
        </div>
        {canEdit && (
          <AddLinkMenu
            label={label}
            available={available}
            onAdd={(id) => onChange([...ids, id])}
          />
        )}
      </div>

      {selected.length === 0 ? (
        <p className="py-1.5 text-sm text-zinc-400 dark:text-zinc-500">
          Nothing shows here.
        </p>
      ) : (
        <DndContext
          id={`social-section-${placement}`}
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          accessibility={{ announcements }}
        >
          <SortableContext items={ids} strategy={rectSortingStrategy}>
            <ul className="flex flex-wrap gap-2">
              {selected.map((social) => (
                <SortablePill
                  key={social.id}
                  social={social}
                  section={label}
                  editable={canEdit}
                  onRemove={() =>
                    onChange(ids.filter((id) => id !== social.id))
                  }
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}
    </section>
  );
}

function SortablePill({
  social,
  section,
  editable,
  onRemove,
}: {
  social: SiteSocial;
  section: string;
  editable: boolean;
  onRemove: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: social.id, disabled: !editable });

  return (
    <li
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        transition,
      }}
      {...attributes}
      {...listeners}
      aria-label={
        editable
          ? `${social.label} in ${section}. Drag to reorder.`
          : `${social.label} in ${section}`
      }
      title={displayHref(social.href)}
      className={cn(
        "group flex touch-manipulation select-none items-center gap-2 rounded-full bg-zinc-100 py-1.5 pl-3 pr-1.5 text-sm font-medium text-zinc-800 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 dark:bg-zinc-800 dark:text-zinc-100",
        editable
          ? "cursor-grab hover:bg-zinc-200/70 active:cursor-grabbing dark:hover:bg-zinc-700"
          : "pr-3",
        isDragging && "relative z-10 bg-white shadow-lg ring-1 ring-indigo-500/40 dark:bg-zinc-800",
      )}
    >
      <SocialIcon
        icon={social.icon}
        imageUrl={social.imageUrl}
        className="h-4 w-4 shrink-0 text-zinc-500 dark:text-zinc-300"
      />
      <span className="max-w-40 truncate">{social.label}</span>
      {editable && (
      <button
        type="button"
        aria-label={`Remove ${social.label} from ${section}`}
        onClick={onRemove}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        className="grid h-5 w-5 shrink-0 cursor-pointer place-items-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-300 hover:text-zinc-800 dark:hover:bg-zinc-600 dark:hover:text-white"
      >
        <X className="h-3 w-3" />
      </button>
      )}
    </li>
  );
}

function AddLinkMenu({
  label,
  available,
  onAdd,
}: {
  label: string;
  available: SiteSocial[];
  onAdd: (id: string) => void;
}) {
  const [query, setQuery] = useState("");

  // Browsing shows each name once, and the next link with that name appears
  // after this one is added. Searching shows every match, so a specific link
  // can always be reached directly.
  const needle = query.trim().toLowerCase();
  const matches = needle
    ? available.filter(
        (social) =>
          social.label.toLowerCase().includes(needle) ||
          social.href.toLowerCase().includes(needle),
      )
    : uniqueByLabel(available);

  return (
    <Popover.Root onOpenChange={() => setQuery("")}>
      <Popover.Trigger
        aria-label={`Add a link to ${label}`}
        disabled={available.length === 0}
        className="flex h-8 shrink-0 items-center gap-1 rounded-lg px-2.5 text-xs font-medium text-indigo-600 transition-colors hover:bg-indigo-50 disabled:pointer-events-none disabled:opacity-40 dark:text-indigo-400 dark:hover:bg-indigo-950"
      >
        <Plus className="h-3.5 w-3.5" />
        Add
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={6}
          collisionPadding={12}
          className="z-50 w-72 max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-xl bg-white shadow-xl ring-1 ring-zinc-950/10 dark:bg-zinc-900 dark:ring-white/10"
        >
          <div className="flex items-center gap-2 border-b border-zinc-100 px-3 dark:border-zinc-800">
            <Search className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search links"
              aria-label="Search links"
              className="h-10 w-full bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-white"
            />
          </div>
          <ul className="max-h-64 overflow-y-auto p-1">
            {matches.length === 0 && (
              <li className="px-3 py-4 text-center text-xs text-zinc-400">
                {available.length === 0 ? "All links added" : "No matching link"}
              </li>
            )}
            {matches.map((social) => (
              <li key={social.id}>
                <button
                  type="button"
                  onClick={() => onAdd(social.id)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-zinc-100 focus-visible:bg-zinc-100 focus-visible:outline-none dark:hover:bg-zinc-800 dark:focus-visible:bg-zinc-800"
                >
                  <SocialIcon
                    icon={social.icon}
                    imageUrl={social.imageUrl}
                    className="h-4 w-4 shrink-0 text-zinc-500 dark:text-zinc-300"
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-zinc-900 dark:text-white">
                      {social.label}
                    </span>
                    <span className="block truncate text-xs text-zinc-500 dark:text-zinc-400">
                      {displayHref(social.href)}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
