"use client";

import { useState, useRef, ChangeEvent } from "react";
import {
  Save,
  Plus,
  Trash2,
  Upload,
  Image as ImageIcon,
  FileText,
  Loader2,
  Link2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LabeledInput, LabeledTextarea } from "@/components/ui/LabeledInputs";
import { toast } from "sonner";
import { HomeData, HomeStat, HomeSocial } from "@/lib/types/hero";
import { useHomeQuery, usePublishHero, usePublishStats } from "./useHomeMutations";
import { cn } from "@/lib/utils";
import { inputCls, labelCls } from "@/components/ui/shared";

type HeroForm = {
  name: string;
  title: string;
  bio: string;
  image: string;
  imageMode: "url" | "upload";
  imageFile: File | null;
  resumeUrl: string;
  resumeMode: "url" | "upload";
  resumeFile: File | null;
};

// Same rule the backend enforces (home.controller.ts isValidUrl).
const HREF_RE = /^(https?:\/\/|mailto:|tel:|#|\/)/;

/**
 * Prepare social rows for publish.
 *
 * - rows where nothing is typed are leftovers from "Add link" → drop silently
 * - half-filled rows or hrefs without a protocol would be rejected (or
 *   silently dropped) by the backend AFTER the optimistic write, which made
 *   the link "never get added" from the user's point of view → block publish
 *   with a precise message instead
 *
 * Returns the cleaned list, or an error message to show in a toast.
 */
function sanitizeSocials(list: HomeSocial[]): HomeSocial[] | string {
  const filled = list.filter((s) => s.label.trim() || s.href.trim());
  for (let i = 0; i < filled.length; i++) {
    const label = filled[i].label.trim();
    const href = filled[i].href.trim();
    if (!label || !href) {
      return `Social link #${i + 1}: fill in both the label and the URL (or delete the row)`;
    }
    if (!HREF_RE.test(href)) {
      return `Social link "${label}": URL must start with https:// (e.g. https://github.com/you)`;
    }
  }
  return filled.map((s) => ({ label: s.label.trim(), href: s.href.trim() }));
}

// ── Toggle (URL / UPLOAD) ───────────────────────────────────
function ModeToggle({
  mode,
  onChange,
}: {
  mode: "url" | "upload";
  onChange: (mode: "url" | "upload") => void;
}) {
  return (
    <div className="flex bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-lg border border-zinc-200 dark:border-zinc-700">
      <button
        type="button"
        onClick={() => onChange("url")}
        className={cn(
          "px-3 py-1 text-[10px] font-bold rounded-md transition-all",
          mode === "url"
            ? "bg-white dark:bg-zinc-700 shadow-sm text-indigo-600"
            : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300",
        )}
      >
        URL
      </button>
      <button
        type="button"
        onClick={() => onChange("upload")}
        className={cn(
          "px-3 py-1 text-[10px] font-bold rounded-md transition-all",
          mode === "upload"
            ? "bg-white dark:bg-zinc-700 shadow-sm text-indigo-600"
            : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300",
        )}
      >
        UPLOAD
      </button>
    </div>
  );
}

export function HomeCMS({ initial }: { initial: HomeData }) {
  const [hero, setHero] = useState<HeroForm>(() => ({
    name: initial.hero.name,
    title: initial.hero.title,
    bio: initial.hero.bio,
    image: initial.hero.image ?? "",
    imageMode: initial.hero.image?.startsWith("data:") ? "upload" : "url",
    imageFile: null,
    resumeUrl: initial.hero.resumeUrl,
    resumeMode: "url",
    resumeFile: null,
  }));
  const [socials, setSocials] = useState<HomeSocial[]>(initial.hero.socials);
  const [titles, setTitles] = useState<string[]>(
    initial.hero.titles?.length ? initial.hero.titles : [],
  );
  const [stats, setStats] = useState<HomeStat[]>(initial.stats);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  // TanStack Query owns the server state: retries with exponential backoff,
  // optimistic writes, rollback on error, and sonner toasts.
  // `useHomeQuery` seeds the ["home"] cache with the server-rendered payload so
  // the mutations below can snapshot / patch / roll back it.
  useHomeQuery(initial);
  const publishHero = usePublishHero();
  const publishStats = usePublishStats();

  const isSavingHero = publishHero.isPending;
  const isSavingStats = publishStats.isPending;

  // ── Hero image ───────────────────────────────────────────
  function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setHero((prev) => ({
        ...prev,
        imageFile: file,
        image: URL.createObjectURL(file),
      }));
    }
  }

  // ── Resume ───────────────────────────────────────────────
  function handleResumeChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setHero((prev) => ({ ...prev, resumeFile: file }));
    }
  }

  // ── Publish hero ─────────────────────────────────────────
  function handlePublishHero() {
    if (!hero.name.trim() || !hero.title.trim()) {
      toast.error("Name and title are required");
      return;
    }

    const cleanSocials = sanitizeSocials(socials);
    if (typeof cleanSocials === "string") {
      toast.error(cleanSocials);
      return;
    }
    const cleanTitles = titles.map((t) => t.trim()).filter(Boolean);

    const formData = new FormData();
    formData.append("name", hero.name.trim());
    formData.append("title", hero.title.trim());
    formData.append("bio", hero.bio.trim());
    formData.append("socials", JSON.stringify(cleanSocials));
    formData.append("titles", JSON.stringify(cleanTitles));

    if (hero.imageMode === "upload" && hero.imageFile) {
      formData.append("image", hero.imageFile);
    } else if (hero.image.trim()) {
      formData.append("image", hero.image.trim());
    }

    if (hero.resumeMode === "upload" && hero.resumeFile) {
      formData.append("resume", hero.resumeFile);
    } else if (hero.resumeUrl.trim()) {
      formData.append("resumeUrl", hero.resumeUrl.trim());
    }

    // Snapshot for local rollback if the request fails.
    const previousHero = hero;
    const previousSocials = socials;
    const previousTitles = titles;

    publishHero.mutate(
      {
        formData,
        optimistic: {
          ...initial.hero,
          name: hero.name.trim(),
          title: hero.title.trim(),
          bio: hero.bio.trim(),
          image: hero.image || null,
          resumeUrl: hero.resumeUrl.trim(),
          socials: cleanSocials,
          titles: cleanTitles,
        },
      },
      {
        onSuccess: (updatedHero) => {
          setHero((prev) => ({
            ...prev,
            name: updatedHero.name,
            title: updatedHero.title,
            bio: updatedHero.bio,
            image: updatedHero.image ?? "",
            resumeUrl: updatedHero.resumeUrl,
            imageMode: "url",
            imageFile: null,
            resumeMode: "url",
            resumeFile: null,
          }));
          // Always adopt the server's arrays — including when they became
          // EMPTY (deleting every row used to leave stale rows in the form).
          setSocials(updatedHero.socials ?? []);
          setTitles(updatedHero.titles ?? []);
        },
        onError: () => {
          setHero(previousHero);
          setSocials(previousSocials);
          setTitles(previousTitles);
        },
      },
    );
  }

  // ── Publish stats ────────────────────────────────────────
  function handlePublishStats() {
    const clean = stats.filter((s) => s.value.trim() && s.label.trim());
    if (clean.length === 0) {
      toast.error("Add at least one stat");
      return;
    }
    const previous = stats;
    publishStats.mutate(clean, {
      onSuccess: (updated) => setStats(updated),
      onError: () => setStats(previous),
    });
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* ── Left column: forms ─────────────────────────── */}
      <div className="lg:col-span-2 space-y-8">
        {/* Hero */}
        <section className="space-y-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                Hero Content
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Name, title, bio, image, resume &amp; social links
              </p>
            </div>
            <Button
              onClick={handlePublishHero}
              disabled={isSavingHero}
              className="bg-indigo-600 hover:bg-indigo-700 rounded-xl"
            >
              {isSavingHero ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isSavingHero ? "Publishing..." : "Publish Hero"}
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <LabeledInput
              label="Public Name"
              value={hero.name}
              onChange={(e) =>
                setHero((prev) => ({ ...prev, name: e.target.value }))
              }
            />
            <LabeledInput
              label="Professional Title"
              value={hero.title}
              onChange={(e) =>
                setHero((prev) => ({ ...prev, title: e.target.value }))
              }
            />
          </div>

          <LabeledTextarea
            label="Detailed Bio"
            value={hero.bio}
            onChange={(e) =>
              setHero((prev) => ({ ...prev, bio: e.target.value }))
            }
          />

          {/* Image upload / URL */}
          <div className="flex flex-col gap-2 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
            <div className="flex items-center justify-between">
              <label className={labelCls}>Profile Image</label>
              <ModeToggle
                mode={hero.imageMode}
                onChange={(mode) =>
                  setHero((prev) => ({ ...prev, imageMode: mode }))
                }
              />
            </div>
            <div className="flex gap-4 items-center">
              <div className="min-w-0 flex-1">
                {hero.imageMode === "url" ? (
                  <input
                    type="text"
                    placeholder="https://i.ibb.co/..."
                    value={hero.image}
                    onChange={(e) =>
                      setHero((prev) => ({ ...prev, image: e.target.value }))
                    }
                    className={inputCls}
                  />
                ) : (
                  <div
                    onClick={() => imageInputRef.current?.click()}
                    className="cursor-pointer w-full px-4 py-2.5 border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-xl flex items-center justify-center gap-2.5 hover:border-indigo-500 transition-all bg-white dark:bg-zinc-800"
                  >
                    <Upload className="w-4 h-4 text-zinc-400" />
                    <span className="text-xs text-zinc-500 font-medium">
                      {hero.imageFile
                        ? hero.imageFile.name
                        : "Choose Local Image"}
                    </span>
                    <input
                      type="file"
                      ref={imageInputRef}
                      hidden
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </div>
                )}
              </div>
              <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 border-2 border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                {hero.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={hero.image}
                    alt="Profile preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="w-6 h-6 text-zinc-400" />
                )}
              </div>
            </div>
          </div>

          {/* Resume upload / URL */}
          <div className="flex flex-col gap-2 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
            <div className="flex items-center justify-between">
              <label className={labelCls}>Resume / CV</label>
              <ModeToggle
                mode={hero.resumeMode}
                onChange={(mode) =>
                  setHero((prev) => ({ ...prev, resumeMode: mode }))
                }
              />
            </div>
            {hero.resumeMode === "url" ? (
              <input
                type="text"
                placeholder="https://.../resume.pdf or /resume.pdf"
                value={hero.resumeUrl}
                onChange={(e) =>
                  setHero((prev) => ({ ...prev, resumeUrl: e.target.value }))
                }
                className={inputCls}
              />
            ) : (
              <div
                onClick={() => resumeInputRef.current?.click()}
                className="cursor-pointer w-full px-4 py-2.5 border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-xl flex items-center justify-center gap-2.5 hover:border-indigo-500 transition-all bg-white dark:bg-zinc-800"
              >
                <FileText className="w-4 h-4 text-zinc-400" />
                <span className="text-xs text-zinc-500 font-medium">
                  {hero.resumeFile
                    ? hero.resumeFile.name
                    : "Upload PDF / Resume"}
                </span>
                <input
                  type="file"
                  ref={resumeInputRef}
                  hidden
                  accept=".pdf,.doc,.docx"
                  onChange={handleResumeChange}
                />
              </div>
            )}
            <p className="text-[10px] text-zinc-400">
              Upload করলে ব্যাকএন্ডের দেওয়া resume URL দিয়ে সাইটে ডাউনলোড
              বাটন কাজ করবে
            </p>
          </div>

          {/* Socials */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className={labelCls}>
                Social Links{" "}
                <span className="text-zinc-400 normal-case font-normal">
                  (github / linkedin / twitter ...)
                </span>
              </label>
              <button
                type="button"
                onClick={() =>
                  setSocials((prev) => [
                    ...prev,
                    { label: "", href: "" },
                  ])
                }
                className="flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                <Plus className="w-3.5 h-3.5" /> Add link
              </button>
            </div>
            {socials.length === 0 && (
              <p className="text-xs text-zinc-400">
                No social links yet — add one to show icons in the hero.
              </p>
            )}
            {socials.map((social, i) => (
              <div key={i} className="flex flex-col sm:flex-row gap-2.5 sm:items-center">
                <Link2 className="hidden sm:block w-4 h-4 text-zinc-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Label (e.g. github)"
                  value={social.label}
                  onChange={(e) =>
                    setSocials((prev) =>
                      prev.map((s, idx) =>
                        idx === i ? { ...s, label: e.target.value } : s,
                      ),
                    )
                  }
                  className={cn(inputCls, "sm:w-40 sm:shrink-0")}
                />
                <input
                  type="text"
                  placeholder="https://..."
                  value={social.href}
                  onChange={(e) =>
                    setSocials((prev) =>
                      prev.map((s, idx) =>
                        idx === i ? { ...s, href: e.target.value } : s,
                      ),
                    )
                  }
                  className={cn(inputCls, "min-w-0 flex-1")}
                />
                <button
                  type="button"
                  onClick={() =>
                    setSocials((prev) =>
                      prev.filter((_, idx) => idx !== i),
                    )
                  }
                  className="self-start sm:self-auto p-2 shrink-0 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        {/* Typing Titles */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className={labelCls}>
                Typing Titles{" "}
                <span className="text-zinc-400 normal-case font-normal">
                  (typewriter effect)
                </span>
              </label>
              <button
                type="button"
                onClick={() => setTitles((prev) => [...prev, ""])}
                className="flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                <Plus className="w-3.5 h-3.5" /> Add title
              </button>
            </div>
            {titles.length === 0 && (
              <p className="text-xs text-zinc-400">
                No titles yet — add one to show in the hero typewriter effect.
              </p>
            )}
            {titles.map((title, i) => (
              <div key={i} className="flex gap-2.5 items-center">
                <input
                  type="text"
                  placeholder="e.g. Django & Next.js Specialist"
                  value={title}
                  onChange={(e) =>
                    setTitles((prev) =>
                      prev.map((t, idx) => (idx === i ? e.target.value : t)),
                    )
                  }
                  className={inputCls}
                />
                <button
                  type="button"
                  onClick={() =>
                    setTitles((prev) => prev.filter((_, idx) => idx !== i))
                  }
                  className="p-2 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </section>
        <section className="space-y-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                Statistics
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Numbers shown below the hero section
              </p>
            </div>
            <Button
              onClick={handlePublishStats}
              disabled={isSavingStats}
              variant="outline"
              className="rounded-xl"
            >
              {isSavingStats ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isSavingStats ? "Saving..." : "Publish Stats"}
            </Button>
          </div>

          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              className="text-indigo-600"
              onClick={() =>
                setStats((prev) => [
                  ...prev,
                  { value: "", label: "" },
                ])
              }
            >
              <Plus className="w-4 h-4 mr-1" /> Add Stat
            </Button>
          </div>

          {stats.length === 0 && (
            <p className="text-xs text-zinc-400">No stats yet.</p>
          )}

          {stats.map((stat, i) => (
            <div
              key={stat._id ?? i}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-end bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800"
            >
              <div className="sm:w-32">
                <LabeledInput
                  label="Value"
                  value={stat.value}
                  onChange={(e) =>
                    setStats((prev) =>
                      prev.map((s, idx) =>
                        idx === i ? { ...s, value: e.target.value } : s,
                      ),
                    )
                  }
                />
              </div>
              <div className="min-w-0 flex-1">
                <LabeledInput
                  label="Label"
                  value={stat.label}
                  onChange={(e) =>
                    setStats((prev) =>
                      prev.map((s, idx) =>
                        idx === i ? { ...s, label: e.target.value } : s,
                      ),
                    )
                  }
                />
              </div>
              <button
                type="button"
                onClick={() =>
                  setStats((prev) => prev.filter((_, idx) => idx !== i))
                }
                className="self-end sm:self-auto p-2 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </section>
      </div>

      {/* ── Right column: live preview ──────────────────── */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
          Preview
        </h3>
        <div className="sticky top-6 flex flex-col gap-4 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <div className="relative w-40 h-40 rounded-full mx-auto overflow-hidden border-2 border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
            {hero.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={hero.image}
                alt={hero.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <ImageIcon className="w-10 h-10 text-zinc-400" />
            )}
          </div>
          <div className="text-center space-y-1">
            <p className="text-lg font-bold text-zinc-900 dark:text-white">
              {hero.name || "Your Name"}
            </p>
            <p className="text-sm text-indigo-600 dark:text-indigo-400">
              {hero.title || "Your Title"}
            </p>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-4">
            {hero.bio || "Your bio will appear here."}
          </p>
          <div className="flex flex-wrap gap-1.5 justify-center">
            {stats
              .filter((s) => s.value.trim() && s.label.trim())
              .slice(0, 4)
              .map((s, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 text-xs font-semibold rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400"
                >
                  {s.value} {s.label}
                </span>
              ))}
          </div>
          {hero.resumeUrl && (
            <p className="text-xs text-zinc-400 flex items-center justify-center gap-1.5 truncate">
              <FileText className="w-3.5 h-3.5 shrink-0" />
              {hero.resumeUrl}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
