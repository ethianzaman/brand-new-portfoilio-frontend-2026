"use client";

import { useId, useRef, useState, type ChangeEvent } from "react";
import { ImageOff, Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";

import { inputCls, labelCls } from "@/components/ui/shared";

const MAX_BYTES = 3 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

/**
 * A share image: paste a link, or upload a file and its link fills in here.
 * Like every other SEO field, it takes effect when the form is published.
 */
export function OgImageField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
}) {
  const id = useId();
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [failedPreview, setFailedPreview] = useState("");

  const trimmed = value.trim();

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!ACCEPTED.includes(file.type)) {
      toast.error("Use a JPG, PNG or WebP image.");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("The image must be 3 MB or smaller.");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      // Text fields first, so the server has them when it reaches the file.
      formData.append("replaces", trimmed);
      formData.append("image", file);
      const res = await fetch("/api/backend/settings/og-image", {
        method: "POST",
        body: formData,
      });
      const body = (await res.json().catch(() => null)) as {
        url?: string;
        message?: string;
      } | null;

      if (!res.ok || !body?.url) {
        toast.error(body?.message ?? "Could not upload the image.");
        return;
      }
      onChange(body.url);
      toast.success("Image uploaded. Publish to apply it.");
    } catch {
      toast.error("Cannot reach the server. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  function removeImage() {
    onChange("");
    // The server keeps the file if a saved page still uses it.
    void fetch("/api/backend/settings/og-image", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: trimmed }),
    }).catch(() => {});
  }

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={id} className={labelCls}>
        {label}
      </label>
      <div className="flex gap-2">
        <input
          id={id}
          type="text"
          placeholder="https://... or /images/og.png"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputCls} min-w-0 flex-1`}
        />
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          disabled={uploading}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3.5 text-sm font-medium text-zinc-700 transition-colors hover:border-indigo-300 hover:text-indigo-600 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-indigo-700 dark:hover:text-indigo-400"
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          {uploading ? "Uploading..." : "Upload"}
        </button>
        <input
          ref={fileInput}
          type="file"
          accept={ACCEPTED.join(",")}
          onChange={handleFile}
          aria-label={`Upload ${label}`}
          className="hidden"
        />
      </div>
      <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
        JPG, PNG or WebP up to 3 MB. Uploads are cropped to 1200×630.
      </p>

      {trimmed && (
        <div className="relative mt-1 aspect-[1200/630] w-full max-w-xs overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800">
          {failedPreview === trimmed ? (
            <div className="flex h-full flex-col items-center justify-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
              <ImageOff className="h-5 w-5" />
              This image could not be loaded
            </div>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={trimmed}
              alt="Share image preview"
              onError={() => setFailedPreview(trimmed)}
              className="h-full w-full object-cover"
            />
          )}
          <button
            type="button"
            onClick={removeImage}
            aria-label="Remove image"
            className="absolute right-1.5 top-1.5 grid h-7 w-7 place-items-center rounded-lg bg-zinc-900/70 text-white transition-colors hover:bg-zinc-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
