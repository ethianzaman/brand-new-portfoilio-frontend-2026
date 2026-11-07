"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DRAGGABLE_CLASS, notDraggable, useDragSensors } from "@/app/components/dashboard/dragSensors";
import { useQuery } from "@tanstack/react-query";
import { Check, ListChecks, Loader2, Pencil, Plus, X } from "lucide-react";
import { Popover } from "radix-ui";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { inputCls } from "@/components/ui/shared";
import { dashboardUpdateFormOptions } from "@/lib/services/contact.service";
import { dashboardGetServices } from "@/lib/services/service.service";
import { cn } from "@/lib/utils";
import type { ContactFormOptions as Options } from "@/lib/types/contact";

const MAX_OPTIONS = 30;
const MAX_LENGTH = 100;

type Item = { id: string; text: string };
type ListKey = keyof Options;

const LISTS: { key: ListKey; title: string; hint: string; placeholder: string }[] = [
  {
    key: "services",
    title: "Service needed",
    hint: "Contact form dropdown",
    placeholder: "e.g. Mobile App",
  },
  {
    key: "budgets",
    title: "Estimated budget",
    hint: "Contact form dropdown",
    placeholder: "e.g. $1,000 – $3,000",
  },
];

let nextItemId = 0;
const newItem = (text: string): Item => ({
  id: `option-${nextItemId++}`,
  text,
});
const toItems = (values: string[]) => values.map(newItem);

const sameText = (a: string, b: string) =>
  a.trim().toLowerCase() === b.trim().toLowerCase();

export function ContactFormOptions({ initial }: { initial: Options }) {
  const [saved, setSaved] = useState(initial);
  const [lists, setLists] = useState(() => ({
    services: toItems(initial.services),
    budgets: toItems(initial.budgets),
  }));
  const [saving, setSaving] = useState(false);

  const current: Options = {
    services: lists.services.map((item) => item.text),
    budgets: lists.budgets.map((item) => item.text),
  };
  const isDirty = JSON.stringify(current) !== JSON.stringify(saved);

  function addTo(key: ListKey, text: string): boolean {
    const clean = text.trim();
    if (!clean) return false;

    if (lists[key].length >= MAX_OPTIONS) {
      toast.error(`You can add up to ${MAX_OPTIONS} options`);
      return false;
    }
    if (lists[key].some((item) => sameText(item.text, clean))) {
      toast.error(`"${clean}" is already in the list`);
      return false;
    }

    setLists((prev) => ({
      ...prev,
      [key]: [...prev[key], newItem(clean)],
    }));
    return true;
  }

  function discard() {
    setLists({
      services: toItems(saved.services),
      budgets: toItems(saved.budgets),
    });
  }

  async function publish() {
    setSaving(true);
    try {
      const result = await dashboardUpdateFormOptions(current);
      setSaved(result);
      setLists({
        services: toItems(result.services),
        budgets: toItems(result.budgets),
      });
      toast.success("Contact form options published");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to publish the options",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center gap-3 border-b border-zinc-100 bg-zinc-50 px-5 py-4 dark:border-zinc-800 dark:bg-zinc-800/50">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950">
          <ListChecks className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
            Contact Form Options
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Drag to reorder. An empty list hides its dropdown on the form.
          </p>
        </div>
      </div>

      <div className="grid items-stretch gap-4 p-4 sm:p-5 lg:grid-cols-2">
        {LISTS.map(({ key, title, hint, placeholder }) => (
          <OptionList
            key={key}
            title={title}
            hint={hint}
            placeholder={placeholder}
            items={lists[key]}
            onAdd={(text) => addTo(key, text)}
            onChange={(next) =>
              setLists((prev) => ({ ...prev, [key]: next }))
            }
            showServicePicker={key === "services"}
          />
        ))}
      </div>

      {isDirty && (
        <div
          role="status"
          className="flex items-center justify-between gap-3 border-t border-zinc-100 bg-zinc-50 px-5 py-3 dark:border-zinc-800 dark:bg-zinc-800/50"
        >
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Unpublished changes
          </p>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={discard}
              disabled={saving}
              className="rounded-xl px-3 py-2 text-sm text-zinc-500 transition-colors hover:text-zinc-900 disabled:opacity-50 dark:hover:text-white"
            >
              Discard
            </button>
            <Button
              onClick={publish}
              disabled={saving}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {saving ? "Publishing..." : "Publish options"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function OptionList({
  title,
  hint,
  placeholder,
  items,
  onAdd,
  onChange,
  showServicePicker,
}: {
  title: string;
  hint: string;
  placeholder: string;
  items: Item[];
  onAdd: (text: string) => boolean;
  onChange: (next: Item[]) => void;
  showServicePicker: boolean;
}) {
  const [draft, setDraft] = useState("");
  const sensors = useDragSensors();

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    const from = items.findIndex((item) => item.id === active.id);
    const to = items.findIndex((item) => item.id === over.id);
    onChange(arrayMove(items, from, to));
  }

  function submitDraft() {
    if (onAdd(draft)) setDraft("");
  }

  function rename(id: string, text: string) {
    const clean = text.trim();
    if (!clean) return;
    if (items.some((item) => item.id !== id && sameText(item.text, clean))) {
      toast.error(`"${clean}" is already in the list`);
      return;
    }
    onChange(items.map((item) => (item.id === id ? { ...item, text: clean } : item)));
  }

  return (
    <section
      aria-label={title}
      className="flex min-w-0 flex-col gap-4 rounded-2xl bg-zinc-50 p-4 ring-1 ring-zinc-950/5 dark:bg-zinc-800/40 dark:ring-white/10"
    >
      <div className="flex min-h-9 items-center justify-between gap-3">
        <div className="min-w-0">
          <h4 className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-white">
            {title}
            <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              {items.length}
            </span>
          </h4>
          <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
            {hint}
          </p>
        </div>
        {showServicePicker && (
          <ServicePicker existing={items} onAdd={onAdd} />
        )}
      </div>

      <div className="flex-1">
      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-300 px-4 py-6 text-center text-sm text-zinc-400 dark:border-zinc-700 dark:text-zinc-500">
          This dropdown is hidden on the form.
        </p>
      ) : (
        <DndContext
          id={`contact-options-${title}`}
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={items.map((item) => item.id)}
            strategy={rectSortingStrategy}
          >
            <ul className="flex flex-wrap gap-2">
              {items.map((item) => (
                <OptionPill
                  key={item.id}
                  item={item}
                  onRename={(text) => rename(item.id, text)}
                  onRemove={() =>
                    onChange(items.filter((other) => other.id !== item.id))
                  }
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}
      </div>

      <div className="flex items-stretch gap-2">
        <input
          type="text"
          value={draft}
          maxLength={MAX_LENGTH}
          placeholder={placeholder}
          aria-label={`New ${title} option`}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              submitDraft();
            }
          }}
          className={cn(
            inputCls,
            "h-10 min-w-0 flex-1 bg-white py-0 dark:bg-zinc-900",
          )}
        />
        <Button
          type="button"
          onClick={submitDraft}
          disabled={!draft.trim()}
          aria-label={`Add ${title} option`}
          className="h-10 shrink-0 rounded-xl bg-indigo-600 px-4 text-white hover:bg-indigo-700 disabled:opacity-100"
        >
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>
    </section>
  );
}

function OptionPill({
  item,
  onRename,
  onRemove,
}: {
  item: Item;
  onRename: (text: string) => void;
  onRemove: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(item.text);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id, disabled: editing });

  function commit() {
    onRename(value);
    setEditing(false);
  }

  const stopDrag = {
    ...notDraggable,
  };

  if (editing) {
    return (
      <li
        ref={setNodeRef}
        className="flex h-8 max-w-full items-center gap-1 rounded-full bg-white pl-3 pr-1 ring-2 ring-indigo-500 dark:bg-zinc-900"
      >
        <input
          autoFocus
          value={value}
          maxLength={MAX_LENGTH}
          aria-label={`Edit ${item.text}`}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commit();
            }
            if (e.key === "Escape") {
              setValue(item.text);
              setEditing(false);
            }
          }}
          className="w-40 min-w-0 bg-transparent text-sm text-zinc-900 outline-none dark:text-white"
        />
        <button
          type="button"
          onClick={commit}
          aria-label={`Save ${item.text}`}
          className="grid h-6 w-6 place-items-center rounded-full text-indigo-600 transition-colors hover:bg-indigo-100 dark:text-indigo-400 dark:hover:bg-indigo-900"
        >
          <Check className="h-3.5 w-3.5" />
        </button>
      </li>
    );
  }

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      {...attributes}
      {...listeners}
      aria-label={`${item.text}. Drag to reorder.`}
      className={cn(
        DRAGGABLE_CLASS,
        "group flex h-8 max-w-full cursor-grab items-center gap-0.5 rounded-full bg-white pl-3 pr-1 text-sm font-medium text-zinc-800 shadow-sm outline-none ring-1 ring-zinc-950/5 transition-shadow hover:shadow focus-visible:ring-2 focus-visible:ring-indigo-500 active:cursor-grabbing dark:bg-zinc-900 dark:text-zinc-100 dark:ring-white/10",
        isDragging && "relative z-10 shadow-lg ring-indigo-500/40",
      )}
    >
      <span className="mr-1 truncate">{item.text}</span>
      <button
        type="button"
        aria-label={`Edit ${item.text}`}
        onClick={() => {
          setValue(item.text);
          setEditing(true);
        }}
        {...stopDrag}
        className="grid h-6 w-6 shrink-0 cursor-pointer place-items-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-800 dark:hover:bg-zinc-700 dark:hover:text-white"
      >
        <Pencil className="h-3 w-3" />
      </button>
      <button
        type="button"
        aria-label={`Remove ${item.text}`}
        onClick={onRemove}
        {...stopDrag}
        className="grid h-6 w-6 shrink-0 cursor-pointer place-items-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-800 dark:hover:bg-zinc-700 dark:hover:text-white"
      >
        <X className="h-3 w-3" />
      </button>
    </li>
  );
}

/** Copies a title from the Services section. Later edits there do not follow. */
function ServicePicker({
  existing,
  onAdd,
}: {
  existing: Item[];
  onAdd: (text: string) => boolean;
}) {
  const [open, setOpen] = useState(false);
  const query = useQuery({
    queryKey: ["contact-form-options", "services"],
    queryFn: () => dashboardGetServices({ page: 1, pageSize: 100 }),
    enabled: open,
    staleTime: 30_000,
  });

  const titles = (query.data?.services ?? [])
    .map((service) => service.title)
    .filter(
      (title) => !existing.some((item) => sameText(item.text, title)),
    );

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger className="flex h-8 shrink-0 items-center gap-1 rounded-lg bg-white px-2.5 text-xs font-medium text-indigo-600 shadow-sm ring-1 ring-zinc-950/5 transition-colors hover:bg-indigo-50 dark:bg-zinc-900 dark:text-indigo-400 dark:ring-white/10 dark:hover:bg-indigo-950">
        <Plus className="h-3.5 w-3.5" />
        From Services
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={6}
          collisionPadding={12}
          className="z-50 w-72 max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-xl bg-white shadow-xl ring-1 ring-zinc-950/10 dark:bg-zinc-900 dark:ring-white/10"
        >
          <ul className="max-h-64 overflow-y-auto p-1">
            {query.isLoading && (
              <li className="px-3 py-4 text-center text-xs text-zinc-400">
                Loading...
              </li>
            )}
            {!query.isLoading && titles.length === 0 && (
              <li className="px-3 py-4 text-center text-xs text-zinc-400">
                Every service is already in the list
              </li>
            )}
            {titles.map((title) => (
              <li key={title}>
                <button
                  type="button"
                  onClick={() => onAdd(title)}
                  className="w-full truncate rounded-lg px-2.5 py-2 text-left text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100 focus-visible:bg-zinc-100 focus-visible:outline-none dark:text-white dark:hover:bg-zinc-800 dark:focus-visible:bg-zinc-800"
                >
                  {title}
                </button>
              </li>
            ))}
          </ul>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
