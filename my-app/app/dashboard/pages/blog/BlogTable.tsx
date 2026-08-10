"use client";
import { useState, useMemo } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Star,
  Check,
  Eye,
  Clock3,
} from "lucide-react";
import { BlogPost } from "@/lib/types/blog";
import { BlogFormModal } from "./BlogFormModal";
import { BlogDeleteModal } from "./BlogDeleteModal";
import {
  dashboardCreatePost,
  dashboardUpdatePost,
  dashboardDeletePost,
} from "@/lib/services/blog.services";
import { cn } from "@/lib/utils";
import Link from "next/link";

// ── Stat card ────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: number | string;
  sub?: string;
  color: string;
}) {
  return (
    <div
      className="flex flex-col gap-3 p-4 rounded-2xl
                    bg-white dark:bg-zinc-900
                    border border-zinc-200 dark:border-zinc-800"
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: `${color}18` }}
      >
        <Clock3 className="w-4 h-4" style={{ color }} />
      </div>
      <div>
        <p className="text-2xl font-bold text-zinc-900 dark:text-white">
          {value}
        </p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
          {label}
        </p>
        {sub && (
          <p className="text-xs text-zinc-400 dark:text-zinc-500">{sub}</p>
        )}
      </div>
    </div>
  );
}

// ── Blog post row ────────────────────────────────────────────────
function BlogRow({
  post,
  onEdit,
  onDelete,
}: {
  post: BlogPost;
  onEdit: (p: BlogPost) => void;
  onDelete: (p: BlogPost) => void;
}) {
  const date = post.createdAt
    ? new Date(post.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

  return (
    <div
      className={cn(
        "bg-white dark:bg-zinc-900",
        "border border-zinc-200 dark:border-zinc-800",
        "rounded-2xl overflow-hidden",
        "transition-all duration-200",
        "hover:border-zinc-300 dark:hover:border-zinc-700",
      )}
    >
      <div className="flex items-center gap-4 px-5 py-4">
        {/* Cover / placeholder */}
        <div
          className="w-14 h-12 rounded-xl shrink-0 overflow-hidden
                        bg-zinc-100 dark:bg-zinc-800
                        flex items-center justify-center"
        >
          {post.coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-xs font-bold text-zinc-400">
              {initials(post.title)}
            </span>
          )}
        </div>

        {/* Title + meta */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-bold text-zinc-900 dark:text-white truncate">
              {post.title}
            </p>
            {post.featured && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                <Star className="w-3 h-3 fill-current" />
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5 text-xs text-zinc-400 dark:text-zinc-500 flex-wrap">
            <span
              className={cn(
                "px-1.5 py-0.5 rounded-md font-medium",
                "bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400",
              )}
            >
              {post.category}
            </span>
            <span>{date}</span>
            <span className="flex items-center gap-0.5">
              <Clock3 className="w-3 h-3" /> {post.readTime} min
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 truncate">
            {post.excerpt}
          </p>
        </div>

        {/* Status */}
        <div className="hidden md:flex flex-row items-end gap-3 shrink-0">
          <span
            className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold",
              post.status === "published"
                ? "bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400",
            )}
          >
            {post.status === "published" ? "Published" : "Draft"}
          </span>
          {post.status === "published" && (
            <Link
              href={`/blog/${post.slug}`}
              className="inline-flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              <Eye className="w-6 h-5 text-zinc-400" />
            </Link>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            title="Edit post"
            onClick={() => onEdit(post)}
            className="p-2 rounded-lg text-zinc-400
                       hover:text-amber-600 dark:hover:text-amber-400
                       hover:bg-amber-50 dark:hover:bg-amber-950
                       transition-all"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            title="Delete post"
            onClick={() => onDelete(post)}
            className="p-2 rounded-lg text-zinc-400
                       hover:text-red-600 dark:hover:text-red-400
                       hover:bg-red-50 dark:hover:bg-red-950
                       transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function initials(title: string): string {
  return title
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

// ── Main component ───────────────────────────────────────────────
export function BlogTable({ initial }: { initial: BlogPost[] }) {
  const [posts, setPosts] = useState<BlogPost[]>(initial);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editPost, setEditPost] = useState<BlogPost | null>(null);
  const [deletePost, setDeletePost] = useState<BlogPost | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  const filtered = useMemo(() => {
    if (!search.trim()) return posts;
    const q = search.toLowerCase();
    return posts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }, [posts, search]);

  const publishedCount = posts.filter((p) => p.status === "published").length;
  const featuredCount = posts.filter((p) => p.featured).length;
  const totalRead = posts.reduce((acc, p) => acc + (p.readTime ?? 0), 0);

  async function handleSave(
    data: Omit<BlogPost, "id" | "createdAt" | "updatedAt">,
    image?: File,
  ) {
    try {
      if (editPost) {
        const updated = await dashboardUpdatePost(editPost.id, data, image);
        if (updated) {
          setPosts((prev) =>
            prev.map((item) => (item.id === updated.id ? updated : item)),
          );
          showToast("Post updated successfully");
        }
      } else {
        const created = await dashboardCreatePost(data, image);
        if (created) {
          setPosts((prev) => [created, ...prev]);
          showToast("Post published successfully");
        }
      }
    } catch (err) {
      console.error("handleSave error:", err);
      const message =
        err instanceof Error ? err.message : "Something went wrong.";
      showToast(message);
    } finally {
      setShowForm(false);
      setEditPost(null);
    }
  }

  async function handleDelete() {
    if (!deletePost) return;
    try {
      const ok = await dashboardDeletePost(deletePost.id);
      if (ok) {
        setPosts((prev) => prev.filter((p) => p.id !== deletePost.id));
        showToast("Post deleted");
      }
    } catch (err) {
      console.error("handleDelete error:", err);
    }
    setDeletePost(null);
  }

  return (
    <>
      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard label="Total Posts" value={posts.length} color="#6366f1" />
        <StatCard
          label="Published"
          value={publishedCount}
          sub="visible on blog"
          color="#10b981"
        />
        <StatCard
          label="Featured"
          value={featuredCount}
          sub="hero highlights"
          color="#f59e0b"
        />
        <StatCard
          label="Read Time"
          value={totalReadTime(totalRead, posts.length)}
          sub="total minutes"
          color="#8b5cf6"
        />
      </div>

      {/* ── Toolbar ── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2
                             w-4 h-4 text-zinc-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search posts, categories, tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm
                       bg-white dark:bg-zinc-900
                       border border-zinc-200 dark:border-zinc-700
                       text-zinc-900 dark:text-white placeholder:text-zinc-400
                       focus:outline-none focus:ring-2 focus:ring-indigo-500
                       transition-colors"
          />
        </div>

        <button
          onClick={() => {
            setEditPost(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl
                     bg-indigo-600 hover:bg-indigo-700
                     text-white text-sm font-medium
                     transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          Write Post
        </button>
      </div>

      {/* ── Count bar ── */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Showing{" "}
          <span className="font-semibold text-zinc-700 dark:text-zinc-300">
            {filtered.length}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-zinc-700 dark:text-zinc-300">
            {posts.length}
          </span>{" "}
          posts
        </p>
        <p className="text-xs text-zinc-400 hidden sm:block">
          Published posts get a public /blog/{`{slug}`} link
        </p>
      </div>

      {/* ── Rows ── */}
      {filtered.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center
                        gap-3 py-20 text-zinc-400
                        bg-white dark:bg-zinc-900
                        border border-zinc-200 dark:border-zinc-800
                        rounded-2xl"
        >
          <Search className="w-10 h-10 opacity-20" />
          <div className="text-center">
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              No posts found
            </p>
            <p className="text-xs text-zinc-400 mt-1">
              Try adjusting your search or write a new post
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((post) => (
            <BlogRow
              key={post.id}
              post={post}
              onEdit={(p) => {
                setEditPost(p);
                setShowForm(true);
              }}
              onDelete={(p) => setDeletePost(p)}
            />
          ))}
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div
          className="fixed top-6 left-1/2 -translate-x-1/2 z-100
               flex items-center gap-3 px-5 py-3 rounded-2xl
               bg-zinc-900 dark:bg-white
               text-white dark:text-zinc-900
               text-sm font-semibold shadow-2xl
               animate-in fade-in slide-in-from-top-4 duration-300
               whitespace-nowrap border border-white/10 dark:border-zinc-200"
        >
          <div className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-500">
            <Check className="w-3.5 h-3.5 stroke-[3px]" />
          </div>
          <span>{toast}</span>
        </div>
      )}

      {/* ── Modals ── */}
      {showForm && (
        <BlogFormModal
          key={editPost?.id ?? "new-post"}
          post={editPost}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditPost(null);
          }}
        />
      )}

      {deletePost && (
        <BlogDeleteModal
          post={deletePost}
          onConfirm={handleDelete}
          onCancel={() => setDeletePost(null)}
        />
      )}
    </>
  );
}

function totalReadTime(total: number, count: number): string {
  if (count === 0) return "0";
  return total >= 60
    ? `${Math.round(total / 60)}h ${total % 60}m`
    : `${total}m`;
}
