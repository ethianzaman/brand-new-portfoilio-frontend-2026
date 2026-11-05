"use client";

import { useMemo, useRef, useState, type ChangeEvent } from "react";
import { useCurrentUser } from "@/app/components/dashboard/useCurrentUser";
import {
  Image as ImageIcon,
  Link2,
  Loader2,
  Palette,
  Save,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LabeledInput } from "@/components/ui/LabeledInputs";
import { inputCls, labelCls } from "@/components/ui/shared";
import { cn } from "@/lib/utils";
import {
  BRAND_ICONS,
  BrandMark,
  type BrandIconKey,
} from "@/app/components/brand/BrandMark";
import type { SiteLogoType, SiteSettings } from "@/lib/types/settings";
import {
  usePublishSiteSettings,
  useSiteSettingsQuery,
} from "./useSiteSettingsMutations";
import { SettingsError, SettingsSkeleton } from "./SettingsStates";

const ICON_KEYS = Object.keys(BRAND_ICONS) as BrandIconKey[];

/**
 * Global Site Settings → Brand.
 *
 * Manages the ONE shared brand document consumed by both the Navbar and the
 * Footer. Navbar-specific (links, CTA) and Footer-specific (bio, contact,
 * links) content is intentionally NOT part of this form.
 */
export function BrandSettings() {
  const query = useSiteSettingsQuery();

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5 lg:col-span-2 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-4 flex items-center gap-2.5">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
          <Palette className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-white">
            Global Brand
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            The shared brand name and logo shown in both the Navbar and Footer
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
        <BrandForm initial={query.data} />
      ) : (
        <SettingsSkeleton />
      )}
    </section>
  );
}

// ── Segmented control ────────────────────────────────────────────
function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="flex rounded-lg border border-zinc-200 bg-zinc-100 p-0.5 dark:border-zinc-700 dark:bg-zinc-800">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "rounded-md px-3 py-1 text-[10px] font-bold transition-all",
            value === option.value
              ? "bg-white text-indigo-600 shadow-sm dark:bg-zinc-700"
              : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

// ── Form ─────────────────────────────────────────────────────────
function BrandForm({ initial }: { initial: SiteSettings }) {
  const { can } = useCurrentUser();
  const publish = usePublishSiteSettings();

  const [name, setName] = useState(initial.brand.name);
  const [tagline, setTagline] = useState(initial.brand.tagline);
  const [logoType, setLogoType] = useState<SiteLogoType>(initial.brand.logo.type);
  const [logoIcon, setLogoIcon] = useState<BrandIconKey>(
    (initial.brand.logo.icon as BrandIconKey) in BRAND_ICONS
      ? (initial.brand.logo.icon as BrandIconKey)
      : "zap",
  );
  const [logoUrl, setLogoUrl] = useState(initial.brand.logo.url);
  const [source, setSource] = useState<"url" | "upload">("url");
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const objectUrl = useMemo(
    () => (logoFile ? URL.createObjectURL(logoFile) : ""),
    [logoFile],
  );
  const previewUrl = objectUrl || logoUrl;
  const previewLogo =
    logoType === "image"
      ? { type: "image" as const, icon: logoIcon, url: previewUrl }
      : { type: "icon" as const, icon: logoIcon, url: "" };

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setLogoFile(file);
  }

  function handlePublish() {
    if (!name.trim()) {
      return; // validated visually below; button also guarded
    }

    if (logoType === "image") {
      const hasUpload = source === "upload" && logoFile;
      const hasUrl = source === "url" && logoUrl.trim();
      const hasExisting = Boolean(initial.brand.logo.url);
      if (!hasUpload && !hasUrl && !hasExisting) {
        return;
      }
    }

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("tagline", tagline.trim());
    formData.append("logoType", logoType);

    if (logoType === "icon") {
      formData.append("logoIcon", logoIcon);
    } else if (source === "upload" && logoFile) {
      formData.append("logo", logoFile);
    } else {
      formData.append("logoUrl", logoUrl.trim());
    }

    publish.mutate(formData, {
      onSuccess: (settings) => {
        setName(settings.brand.name);
        setTagline(settings.brand.tagline);
        setLogoType(settings.brand.logo.type);
        setLogoIcon(
          (settings.brand.logo.icon as BrandIconKey) in BRAND_ICONS
            ? (settings.brand.logo.icon as BrandIconKey)
            : "zap",
        );
        setLogoUrl(settings.brand.logo.url);
        setLogoFile(null);
        setSource("url");
      },
    });
  }

  const nameMissing = !name.trim();
  const hasImage =
    source === "upload"
      ? Boolean(logoFile || initial.brand.logo.url)
      : Boolean(logoUrl.trim() || initial.brand.logo.url);
  const imageMissing = logoType === "image" && !hasImage;
  const canPublish = !nameMissing && !imageMissing && !publish.isPending;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <LabeledInput
            label="Brand Name"
            placeholder="e.g. Ethian"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {nameMissing && (
            <p className="mt-1 text-[11px] text-red-500">
              Brand name is required.
            </p>
          )}
        </div>
        <LabeledInput
          label="Tagline"
          placeholder="e.g. Full Stack Engineer"
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
        />
      </div>

      {/* Logo */}
      <div className="flex flex-col gap-3 rounded-xl border border-zinc-100 bg-zinc-50 p-3 sm:p-4 dark:border-zinc-800 dark:bg-zinc-800/50">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className={labelCls}>Logo</label>
          <Segmented
            value={logoType}
            onChange={(value) => setLogoType(value)}
            options={[
              { value: "icon", label: "ICON" },
              { value: "image", label: "IMAGE" },
            ]}
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="min-w-0 flex-1">
            {logoType === "icon" ? (
              <select
                value={logoIcon}
                onChange={(e) => setLogoIcon(e.target.value as BrandIconKey)}
                className={inputCls}
              >
                {ICON_KEYS.map((key) => (
                  <option key={key} value={key}>
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </option>
                ))}
              </select>
            ) : (
              <div className="space-y-2.5">
                <Segmented
                  value={source}
                  onChange={(value) => setSource(value)}
                  options={[
                    { value: "url", label: "URL" },
                    { value: "upload", label: "UPLOAD" },
                  ]}
                />
                {source === "url" ? (
                  <div className="relative">
                    <Link2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="text"
                      placeholder="https://.../logo.png"
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      className={cn(inputCls, "pl-9")}
                    />
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex w-full min-w-0 cursor-pointer items-center justify-center gap-2.5 rounded-xl border-2 border-dashed border-zinc-200 bg-white px-4 py-2.5 transition-all hover:border-indigo-500 dark:border-zinc-700 dark:bg-zinc-800"
                  >
                    <Upload className="h-4 w-4 shrink-0 text-zinc-400" />
                    <span className="truncate text-xs font-medium text-zinc-500">
                      {logoFile ? logoFile.name : "Choose Logo Image"}
                    </span>
                    <input
                      type="file"
                      ref={fileInputRef}
                      hidden
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Preview swatch */}
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-zinc-200 bg-indigo-600 dark:border-zinc-700">
            {logoType === "image" && !previewUrl ? (
              <ImageIcon className="h-6 w-6 text-white/70" />
            ) : (
              <BrandMark logo={previewLogo} className="h-6 w-6 text-white" />
            )}
          </div>
        </div>

        {imageMissing && (
          <p className="text-[11px] text-red-500">
            Add a logo image URL or upload a file.
          </p>
        )}
      </div>

      {/* Live preview of the shared brand block */}
      <div className="flex items-center gap-3 rounded-xl border border-zinc-100 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-indigo-600">
          <BrandMark logo={previewLogo} className="h-4 w-4 text-white" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold leading-none text-zinc-900 dark:text-white">
            {name.trim() || "—"}
          </p>
          {tagline.trim() && (
            <p className="mt-0.5 truncate text-xs text-zinc-500 dark:text-zinc-400">
              {tagline.trim()}
            </p>
          )}
        </div>
        <span className="ml-auto hidden text-[10px] font-medium uppercase tracking-wider text-zinc-400 sm:block">
          Navbar + Footer
        </span>
      </div>

      {can("settings.edit") && (
      <Button
        onClick={handlePublish}
        disabled={!canPublish}
        className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 sm:w-auto text-white"
      >
        {publish.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        {publish.isPending ? "Publishing..." : "Publish Brand"}
      </Button>
      )}
    </div>
  );
}
