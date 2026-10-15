"use client";
import { useState } from "react";
import { X, Loader2, Save, ImageIcon, Clock } from "lucide-react";
import { BlogPost, slugify } from "@/lib/types/blog";
import { estimateReadTime } from "@/lib/services/blog.services";
import { cn } from "@/lib/utils";
import Image from "next/image";

const CATEGORIES = [
  "Tutorial",
  "Design",
  "Frontend",
  "Backend",
  "Career",
  "Productivity",
];

const inputCls = cn(
  "w-full px-4 py-2.5 rounded-xl text-sm",
  "bg-zinc-50 dark:bg-zinc-800",
  "border border-zinc-200 dark:border-zinc-700",
  "text-zinc-900 dark:text-white",
  "placeholder:text-zinc-400",
  "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent",
  "transition-colors",
);

const labelCls =
  "text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wide";

interface Props {
  post?: BlogPost | null;
  onSave: (data: Omit<BlogPost, "id" | "createdAt" | "updatedAt">, image?: File) => Promise<void>;
  onCancel: () => void;
}

type FormState = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  tags: string;
  status: "draft" | "published";
  featured: boolean;
};

export function BlogFormModal({ post, onSave, onCancel }: Props) {
  const isEdit = !!post;
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [form, setForm] = useState<FormState>({
    title: post?.title ?? "",
    slug: post?.slug ?? "",
    excerpt: post?.excerpt ?? "",
    content: post?.content ?? "",
    coverImage: post?.coverImage ?? "",
    category: post?.category ?? CATEGORIES[0],
    tags: post?.tags.join(", ") ?? "",
    status: post?.status ?? "published",
    featured: post?.featured ?? false,
  });

  function set<K extends keyof FormState>(key: K, val: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  // auto-generate slug from title unless the user typed their own
  function handleTitleChange(value: string) {
    set("title", value);
    if (!form.slug || form.slug === slugify(form.title)) {
      set("slug", slugify(value));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;

    setLoading(true);
    await onSave(
      {
        title: form.title.trim(),
        slug: slugify(form.slug) || slugify(form.title),
        excerpt: form.excerpt.trim(),
        content: form.content.trim(),
        coverImage: form.coverImage.trim() || undefined,
        category: form.category,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        readTime: estimateReadTime(form.content),
        status: form.status,
        featured: form.featured,
      },
      imageFile ?? undefined,
    );
    setLoading(false);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4
                    bg-zinc-950/60 backdrop-blur-sm overflow-y-auto"
    >
      <div
        className="w-full max-w-3xl my-4
                      bg-white dark:bg-zinc-900
                      rounded-2xl border border-zinc-200 dark:border-zinc-800
                      shadow-2xl"
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-6
                        border-b border-zinc-100 dark:border-zinc-800 sticky top-0
                        bg-white dark:bg-zinc-900 rounded-t-2xl z-10"
        >
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-white">
              {isEdit ? "Edit Post" : "Write New Post"}
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              {isEdit
                ? "Update your post details"
                : "Draft and publish your next article"}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 flex flex-col gap-5 max-h-[70vh] overflow-y-auto">
            {/* Title */}
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Post Title *</label>
              <input
                type="text"
                placeholder="e.g. Building a Modern Portfolio"
                value={form.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className={inputCls}
                required
              />
            </div>

            {/* Slug + Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>
                  Slug
                  <span className="ml-1 normal-case font-normal text-zinc-400">
                    (auto from title)
                  </span>
                </label>
                <input
                  type="text"
                  placeholder="how-to-build-a-portfolio"
                  value={form.slug}
                  onChange={(e) => set("slug", slugify(e.target.value))}
                  className={cn(inputCls, "font-mono text-xs")}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Category *</label>
                <select
                  value={form.category}
                  onChange={(e) => set("category", e.target.value)}
                  className={inputCls}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Excerpt */}
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Excerpt</label>
              <textarea
                rows={2}
                placeholder="One or two sentences shown on the blog listing cards..."
                value={form.excerpt}
                onChange={(e) => set("excerpt", e.target.value)}
                className={cn(inputCls, "resize-none")}
              />
            </div>

            {/* Content */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className={labelCls}>
                  Content *
                  <span className="ml-1 normal-case font-normal text-zinc-400">
                    (paragraphs separated by blank lines)
                  </span>
                </label>
                <span className="flex items-center gap-1.5 text-xs text-zinc-400">
                  <Clock className="w-3.5 h-3.5" />
                  ~{estimateReadTime(form.content)} min read
                </span>
              </div>
              <textarea
                rows={12}
                placeholder="Write your article…"
                value={form.content}
                onChange={(e) => set("content", e.target.value)}
                className={cn(inputCls, "resize-none leading-relaxed")}
                required
              />
            </div>

            {/* Tags */}
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>
                Tags
                <span className="ml-1 normal-case font-normal text-zinc-400">
                  (comma separated)
                </span>
              </label>
              <input
                type="text"
                placeholder="Next.js, React, CSS"
                value={form.tags}
                onChange={(e) => set("tags", e.target.value)}
                className={inputCls}
              />
              {form.tags && (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {form.tags
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean)
                    .map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium
                                   bg-zinc-100 dark:bg-zinc-800
                                   text-zinc-600 dark:text-zinc-400"
                      >
                        {tag}
                      </span>
                    ))}
                </div>
              )}
            </div>

            {/* Cover image */}
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Cover Image</label>
              <div className="flex gap-3 items-start">
                <input
                  type="text"
                  placeholder="https://... or /images/blog/cover.png"
                  value={form.coverImage}
                  onChange={(e) => set("coverImage", e.target.value)}
                  className={cn(inputCls, "flex-1")}
                />
                <input
                  type="file"
                  id="blog-cover-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setImageFile(file);
                    set("coverImage", URL.createObjectURL(file));
                  }}
                />
                <label
                  htmlFor="blog-cover-upload"
                  className="w-12 h-12 rounded-xl overflow-hidden shrink-0
                 border border-zinc-200 dark:border-zinc-700
                 bg-zinc-100 dark:bg-zinc-800
                 flex items-center justify-center
                 cursor-pointer hover:border-indigo-500 hover:bg-zinc-200
                 dark:hover:bg-zinc-700 transition-all"
                >
                  {form.coverImage ? (
                    <Image
                      src={form.coverImage}
                      alt="preview"
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <ImageIcon className="w-5 h-5 text-zinc-400" />
                  )}
                </label>
              </div>
              <p className="text-xs text-zinc-400">
                Paste a URL or click the icon to upload an image.
              </p>
            </div>

            {/* Status + Featured toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                className="flex flex-col gap-2 p-4 rounded-xl
                              bg-zinc-50 dark:bg-zinc-800
                              border border-zinc-200 dark:border-zinc-700"
              >
                <div>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                    Status
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    {form.status === "published"
                      ? "Visible on the public blog"
                      : "Hidden until you publish"}
                  </p>
                </div>
                <div className="flex gap-2">
                  {(["published", "draft"] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => set("status", s)}
                      className={cn(
                        "flex-1 py-2 rounded-lg text-xs font-semibold capitalize transition-colors",
                        form.status === s
                          ? s === "published"
                            ? "bg-emerald-600 text-white"
                            : "bg-zinc-700 text-white"
                          : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-zinc-300",
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div
                className="flex items-center justify-between p-4 rounded-xl
                              bg-zinc-50 dark:bg-zinc-800
                              border border-zinc-200 dark:border-zinc-700"
              >
                <div>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                    Featured
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Highlights in the blog hero
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => set("featured", !form.featured)}
                  className={cn(
                    "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus:outline-none",
                    form.featured
                      ? "bg-amber-500"
                      : "bg-zinc-300 dark:bg-zinc-600",
                  )}
                >
                  <span
                    className={cn(
                      "inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out",
                      form.featured ? "translate-x-6" : "translate-x-1",
                    )}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            className="flex gap-3 p-6
                          border-t border-zinc-100 dark:border-zinc-800"
          >
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium
                         border border-zinc-200 dark:border-zinc-700
                         text-zinc-700 dark:text-zinc-300
                         hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2
                         py-2.5 rounded-xl text-sm font-medium
                         bg-indigo-600 hover:bg-indigo-700
                         disabled:opacity-60 disabled:cursor-not-allowed
                         text-white transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> {isEdit ? "Update" : "Publish"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}