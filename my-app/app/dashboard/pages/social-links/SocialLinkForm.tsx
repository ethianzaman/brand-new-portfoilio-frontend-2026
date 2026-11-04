"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { inputCls, labelCls } from "@/components/ui/shared";
import {
  SOCIAL_ICONS,
  SocialIcon,
  type SocialIconKey,
} from "@/app/components/brand/SocialIcon";
import { cn } from "@/lib/utils";
import type { SiteSocial, SocialIconType } from "@/lib/types/settings";
import { useSaveSocial } from "../settings/useSiteSettingsMutations";

const ICON_KEYS = Object.keys(SOCIAL_ICONS) as SocialIconKey[];
const MAX_LOGO_BYTES = 1024 * 1024;

// Same rule the backend enforces (settings.controller.ts isValidUrl).
const HREF_RE = /^(https?:\/\/|mailto:|tel:|#|\/)/;

export function SocialLinkForm({
  social,
  onClose,
}: {
  social: SiteSocial | null;
  onClose: () => void;
}) {
  const save = useSaveSocial();
  const [label, setLabel] = useState(social?.label ?? "");
  const [href, setHref] = useState(social?.href ?? "");
  const [description, setDescription] = useState(social?.description ?? "");
  const [icon, setIcon] = useState(social?.icon ?? "link");
  const [iconType, setIconType] = useState<SocialIconType>(
    social?.iconType ?? "icon",
  );
  const [file, setFile] = useState<File | null>(null);

  const filePreview = useMemo(
    () => (file ? URL.createObjectURL(file) : ""),
    [file],
  );
  useEffect(
    () => () => {
      if (filePreview) URL.revokeObjectURL(filePreview);
    },
    [filePreview],
  );

  function handleFile(next: File | undefined) {
    if (!next) return;
    if (!next.type.startsWith("image/")) {
      toast.error("Logo must be an image file");
      return;
    }
    if (next.size > MAX_LOGO_BYTES) {
      toast.error("Logo must be 1 MB or smaller");
      return;
    }
    setFile(next);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!label.trim() || !href.trim()) {
      toast.error("Fill in both the label and the URL");
      return;
    }
    if (!HREF_RE.test(href.trim())) {
      toast.error("URL must start with https:// (e.g. https://github.com/you)");
      return;
    }
    if (iconType === "image" && !file && !social?.imageUrl) {
      toast.error("Choose a logo image to upload");
      return;
    }

    const formData = new FormData();
    formData.append("label", label.trim());
    formData.append("href", href.trim());
    formData.append("description", description.trim());
    formData.append("icon", icon);
    formData.append("iconType", iconType);
    if (iconType === "image" && file) formData.append("logo", file);

    save.mutate({ id: social?.id, formData }, { onSuccess: onClose });
  }

  const savedLogo = social?.iconType === "image" ? social.imageUrl : "";

  return (
    <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-4 pb-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="social-label" className={labelCls}>
            Label
          </label>
          <input
            id="social-label"
            type="text"
            maxLength={50}
            placeholder="GitHub"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className={inputCls}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="social-href" className={labelCls}>
            URL
          </label>
          <input
            id="social-href"
            type="text"
            maxLength={500}
            placeholder="https://github.com/you"
            value={href}
            onChange={(e) => setHref(e.target.value)}
            className={inputCls}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="social-description" className={labelCls}>
            Short description{" "}
            <span className="font-normal normal-case text-zinc-400">
              (shown on the Contact card)
            </span>
          </label>
          <input
            id="social-description"
            type="text"
            maxLength={120}
            placeholder="Check my open source work"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={inputCls}
          />
        </div>

        <div className="flex flex-col gap-2.5">
          <span className={labelCls}>Icon or logo</span>
          <div className="grid grid-cols-2 gap-1 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800">
            {(
              [
                { value: "icon", text: "Choose icon" },
                { value: "image", text: "Upload logo" },
              ] as const
            ).map(({ value, text }) => (
              <button
                key={value}
                type="button"
                onClick={() => setIconType(value)}
                aria-pressed={iconType === value}
                className={cn(
                  "rounded-lg py-1.5 text-xs font-medium transition-colors",
                  iconType === value
                    ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-950 dark:text-white"
                    : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200",
                )}
              >
                {text}
              </button>
            ))}
          </div>

          {iconType === "icon" ? (
            <div className="grid grid-cols-6 gap-1.5">
              {ICON_KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setIcon(key)}
                  aria-label={key}
                  aria-pressed={icon === key}
                  title={key}
                  className={cn(
                    "grid aspect-square place-items-center rounded-xl transition-colors",
                    icon === key
                      ? "bg-indigo-600 text-white"
                      : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-800 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-white",
                  )}
                >
                  <SocialIcon icon={key} className="h-4 w-4" />
                </button>
              ))}
            </div>
          ) : (
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-zinc-300 p-3 transition-colors hover:border-indigo-400 hover:bg-indigo-50/40 focus-within:border-indigo-500 dark:border-zinc-700 dark:hover:border-indigo-600 dark:hover:bg-indigo-950/20">
              <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
                {filePreview ? (
                  // A local preview, before the file has reached Cloudinary.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={filePreview}
                    alt=""
                    className="h-7 w-7 object-contain"
                  />
                ) : savedLogo ? (
                  <SocialIcon icon={icon} imageUrl={savedLogo} className="h-7 w-7" />
                ) : (
                  <Upload className="h-4 w-4 text-zinc-400" />
                )}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-zinc-800 dark:text-zinc-200">
                  {file ? file.name : savedLogo ? "Replace logo" : "Choose an image"}
                </span>
                <span className="block text-xs text-zinc-400">
                  Any image type, up to 1 MB. Transparent works best.
                </span>
              </span>
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
            </label>
          )}
        </div>
      </div>

      <div className="flex gap-2 border-t border-zinc-100 p-4 dark:border-zinc-800">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="flex-1 rounded-xl"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={save.isPending}
          className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-700"
        >
          {save.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {save.isPending ? "Saving..." : "Save link"}
        </Button>
      </div>
    </form>
  );
}
