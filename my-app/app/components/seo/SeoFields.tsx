"use client";

import { ChevronDown, Search } from "lucide-react";
import { useState } from "react";
import { inputCls, labelCls } from "@/components/ui/shared";
import { cn } from "@/lib/utils";
import { OgImageField } from "./OgImageField";

export interface SeoFormValue {
  metaTitle: string;
  metaDescription: string;
  ogImage: string;
  canonicalUrl: string;
  noindex: boolean;
  nofollow: boolean;
}

export const EMPTY_SEO_FORM: SeoFormValue = {
  metaTitle: "",
  metaDescription: "",
  ogImage: "",
  canonicalUrl: "",
  noindex: false,
  nofollow: false,
};

export function toSeoFormValue(value: unknown): SeoFormValue {
  if (!value || typeof value !== "object") return { ...EMPTY_SEO_FORM };
  const raw = value as Record<string, unknown>;
  const str = (k: string) => (typeof raw[k] === "string" ? (raw[k] as string) : "");
  return {
    metaTitle: str("metaTitle"),
    metaDescription: str("metaDescription"),
    ogImage: str("ogImage"),
    canonicalUrl: str("canonicalUrl"),
    noindex: raw.noindex === true,
    nofollow: raw.nofollow === true,
  };
}

/** Strip empty values so the backend stores a clean subdocument. */
export function fromSeoFormValue(value: SeoFormValue) {
  return {
    metaTitle: value.metaTitle.trim(),
    metaDescription: value.metaDescription.trim(),
    ogImage: value.ogImage.trim(),
    canonicalUrl: value.canonicalUrl.trim(),
    noindex: value.noindex,
    nofollow: value.nofollow,
  };
}

const TITLE_MAX = 70;
const DESC_MAX = 160;

/**
 * Collapsible SEO section for per-item editors (blog post, project, service).
 * Every field is optional; blank values fall back to the site defaults.
 */
export function SeoFields({
  value,
  onChange,
  title = "SEO",
  defaultOpen = false,
}: {
  value: SeoFormValue;
  onChange: (next: SeoFormValue) => void;
  title?: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  function set<K extends keyof SeoFormValue>(key: K, val: SeoFormValue[K]) {
    onChange({ ...value, [key]: val });
  }

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
      >
        <span className="flex items-center gap-2">
          <Search className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          <span className="text-sm font-semibold text-zinc-900 dark:text-white">
            {title}
          </span>
          <span className="text-xs text-zinc-400">(optional)</span>
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-zinc-400 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="flex flex-col gap-4 border-t border-zinc-100 px-4 py-4 dark:border-zinc-800">
          {/* Meta title */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className={labelCls}>Meta Title</label>
              <span
                className={cn(
                  "text-[11px]",
                  value.metaTitle.length > TITLE_MAX
                    ? "text-red-500"
                    : "text-zinc-400",
                )}
              >
                {value.metaTitle.length}/{TITLE_MAX}
              </span>
            </div>
            <input
              type="text"
              placeholder="Leave blank to use the page title"
              value={value.metaTitle}
              onChange={(e) => set("metaTitle", e.target.value)}
              className={inputCls}
            />
          </div>

          {/* Meta description */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className={labelCls}>Meta Description</label>
              <span
                className={cn(
                  "text-[11px]",
                  value.metaDescription.length > DESC_MAX
                    ? "text-red-500"
                    : "text-zinc-400",
                )}
              >
                {value.metaDescription.length}/{DESC_MAX}
              </span>
            </div>
            <textarea
              rows={3}
              placeholder="Leave blank to use the default description"
              value={value.metaDescription}
              onChange={(e) => set("metaDescription", e.target.value)}
              className={cn(inputCls, "resize-none")}
            />
          </div>

          {/* OG image + canonical */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <OgImageField
              label="OG Image"
              value={value.ogImage}
              onChange={(next) => set("ogImage", next)}
            />
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Canonical URL</label>
              <input
                type="text"
                placeholder="https://... or /path"
                value={value.canonicalUrl}
                onChange={(e) => set("canonicalUrl", e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          {/* Robots */}
          <div className="flex flex-wrap gap-4">
            <Toggle
              label="No-index"
              hint="Hide from search engines"
              on={value.noindex}
              onClick={() => set("noindex", !value.noindex)}
            />
            <Toggle
              label="No-follow"
              hint="Don't follow links on this page"
              on={value.nofollow}
              onClick={() => set("nofollow", !value.nofollow)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function Toggle({
  label,
  hint,
  on,
  onClick,
}: {
  label: string;
  hint: string;
  on: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onClick}
      className="flex items-center gap-2.5 text-left"
    >
      <span
        className={cn(
          "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200",
          on ? "bg-indigo-600" : "bg-zinc-300 dark:bg-zinc-600",
        )}
      >
        <span
          className={cn(
            "inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out",
            on ? "translate-x-4" : "translate-x-1",
          )}
        />
      </span>
      <span className="min-w-0">
        <span className="block text-xs font-semibold text-zinc-800 dark:text-zinc-200">
          {label}
        </span>
        <span className="block text-[11px] text-zinc-400">{hint}</span>
      </span>
    </button>
  );
}
