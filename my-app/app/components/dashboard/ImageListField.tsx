"use client";

import { useEffect, useRef, useState } from "react";
import {
  DndContext,
  closestCenter,
  type Announcements,
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
import { GripVertical, ImagePlus, Link2, X } from "lucide-react";
import { itemFromFile, itemFromUrl, releaseItem, type ImageItem } from "@/lib/media";
import { cn } from "@/lib/utils";

const MAX_BYTES = 3 * 1024 * 1024;
const isSafeLink = (url: string) => /^https:\/\//i.test(url) || (url.startsWith("/") && !url.startsWith("//"));

interface Props {
  id: string;
  label: string;
  hint?: string;
  items: ImageItem[];
  onChange: (items: ImageItem[]) => void;
  max: number;
  /** Marks the first image as the main one. */
  firstIsMain?: boolean;
  /** Also lets an image be added by pasting a link. */
  allowLinks?: boolean;
}

/**
 * An ordered set of images for a dashboard form: upload, paste a link, drag to
 * reorder and remove. Nothing is uploaded here; the form sends the list when
 * saved.
 */
export function ImageListField({ id, label, hint, items, onChange, max, firstIsMain, allowLinks }: Props) {
  const [link, setLink] = useState("");
  const [error, setError] = useState("");
  const room = max - items.length;
  const singular = label.replace(/s$/, "").toLowerCase();

  const sensors = useDragSensors();

  // Previews of picked files are freed when the form closes.
  const latest = useRef(items);
  useEffect(() => {
    latest.current = items;
  }, [items]);
  useEffect(() => () => latest.current.forEach(releaseItem), []);

  function addFiles(files: File[]) {
    const tooBig = files.filter((f) => f.size > MAX_BYTES);
    const fitting = files.filter((f) => f.size <= MAX_BYTES).slice(0, room);
    setError(tooBig.length ? `${tooBig.length} file(s) over 3 MB were skipped` : "");
    if (fitting.length) onChange([...items, ...fitting.map(itemFromFile)]);
  }

  function addLink() {
    const url = link.trim();
    if (!url) return;
    if (!isSafeLink(url)) {
      setError("Use an https link or a path starting with /");
      return;
    }
    setError("");
    setLink("");
    onChange([...items, itemFromUrl(url)]);
  }

  function remove(item: ImageItem) {
    releaseItem(item);
    onChange(items.filter((i) => i.id !== item.id));
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    lockSelection(false);
    if (!over || active.id === over.id) return;
    const from = items.findIndex((i) => i.id === active.id);
    const to = items.findIndex((i) => i.id === over.id);
    if (from >= 0 && to >= 0) onChange(arrayMove(items, from, to));
  }

  // Dragging across the form would otherwise select its text.
  const lockSelection = (locked: boolean) => {
    document.body.style.userSelect = locked ? "none" : "";
  };
  useEffect(() => () => lockSelection(false), []);

  const position = (itemId: unknown) => items.findIndex((i) => i.id === itemId) + 1;
  const announcements: Announcements = {
    onDragStart: ({ active }) => `Picked up ${singular} ${position(active.id)}.`,
    onDragOver: ({ over }) => (over ? `Over position ${position(over.id)}.` : undefined),
    onDragEnd: ({ over }) =>
      over
        ? `Dropped at position ${position(over.id)}${firstIsMain && position(over.id) === 1 ? ", now the main image" : ""}.`
        : "Dropped.",
    onDragCancel: () => "Moving cancelled.",
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
        {label}
        <span className="ml-1 font-normal normal-case text-zinc-400">
          ({items.length}/{max}, up to 3 MB each)
        </span>
      </span>
      {hint && <p className="-mt-1 text-xs text-zinc-400">{hint}</p>}

      <DndContext
        id={`image-list-${id}`}
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={() => lockSelection(true)}
        onDragEnd={handleDragEnd}
        onDragCancel={() => lockSelection(false)}
        accessibility={{ announcements }}
      >
        <SortableContext items={items.map((i) => i.id)} strategy={rectSortingStrategy}>
          <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {items.map((item, index) => (
              <SortableImage
                key={item.id}
                item={item}
                name={`${singular} ${index + 1}`}
                main={Boolean(firstIsMain) && index === 0}
                draggable={items.length > 1}
                onRemove={() => remove(item)}
              />
            ))}

            {room > 0 && (
              <li>
                <label
                  htmlFor={id}
                  className="flex aspect-video cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-zinc-300 text-zinc-400 transition-colors hover:border-indigo-400 hover:text-indigo-500 dark:border-zinc-600"
                >
                  <ImagePlus className="h-5 w-5" />
                  <span className="text-[11px] font-medium">Upload</span>
                </label>
              </li>
            )}
          </ul>
        </SortableContext>
      </DndContext>

      {items.length > 1 && (
        <p className="text-xs text-zinc-400">
          Drag to reorder{firstIsMain ? "; the first one is the main image" : ""}.
        </p>
      )}

      <input
        id={id}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          addFiles(Array.from(e.target.files ?? []));
          e.target.value = "";
        }}
      />

      {allowLinks && room > 0 && (
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Link2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              aria-label={`${label}: paste an image link`}
              placeholder="Or paste an image link"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addLink();
                }
              }}
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2 pl-9 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            />
          </div>
          <button
            type="button"
            onClick={addLink}
            className="rounded-xl border border-zinc-200 px-3 text-sm font-medium text-zinc-700 transition-colors hover:border-indigo-300 hover:text-indigo-600 dark:border-zinc-700 dark:text-zinc-300"
          >
            Add
          </button>
        </div>
      )}

      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}

function SortableImage({
  item,
  name,
  main,
  draggable,
  onRemove,
}: {
  item: ImageItem;
  name: string;
  main: boolean;
  draggable: boolean;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    disabled: !draggable,
  });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      {...attributes}
      {...listeners}
      aria-label={`${name}${main ? ", main image" : ""}${draggable ? ". Drag to reorder." : ""}`}
      className={cn(
        "group relative aspect-video overflow-hidden rounded-lg border bg-zinc-100 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:bg-zinc-800",
        main ? "border-indigo-500 ring-2 ring-indigo-500/30" : "border-zinc-200 dark:border-zinc-700",
        draggable && cn("cursor-grab active:cursor-grabbing", DRAGGABLE_CLASS),
        isDragging && "z-10 opacity-90 shadow-xl ring-2 ring-indigo-500",
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={item.url} alt="" draggable={false} className="pointer-events-none h-full w-full object-cover" />

      {draggable && (
        <span className="absolute left-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-zinc-950/60 text-white opacity-0 transition-opacity group-hover:opacity-100">
          <GripVertical className="h-3.5 w-3.5" />
        </span>
      )}

      <div className="absolute inset-x-1 bottom-1 flex flex-wrap gap-1">
        {main && (
          <span className="rounded bg-indigo-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">Main</span>
        )}
        {item.file && (
          <span className="rounded bg-zinc-900/80 px-1.5 py-0.5 text-[10px] font-semibold text-white">New</span>
        )}
      </div>

      <button
        type="button"
        // Not a drag: a press on the button only removes.
        {...notDraggable}
        onClick={onRemove}
        aria-label={`Remove ${name}`}
        title="Remove"
        className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-zinc-950/70 text-white transition-colors hover:bg-red-600"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </li>
  );
}
