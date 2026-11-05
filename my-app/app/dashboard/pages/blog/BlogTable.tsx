"use client";

import { toast } from "sonner";
import { useMemo, useState } from "react";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCurrentUser } from "@/app/components/dashboard/useCurrentUser";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Star,
  Eye,
  Clock3,
  AlertCircle,
  RotateCcw,
  X,
} from "lucide-react";
import { BlogPost } from "@/lib/types/blog";
import { BlogFormModal } from "./BlogFormModal";
import { ConfirmDeleteModal, DeleteTarget } from "@/app/components/dashboard/ConfirmDeleteModal";
import { BlogDrawer } from "./BlogDrawer";
import {
  dashboardCreatePost,
  dashboardUpdatePost,
  dashboardDeletePost,
  dashboardGetBlogPosts,
  dashboardGetBlogStats,
  type BlogStats,
  type BlogStatusFilter,
} from "@/lib/services/blog.service";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Pagination } from "@/app/components/dashboard/Pagination";
import {
  DASHBOARD_PAGE_SIZE,
  DASHBOARD_PAGE_SIZES,
} from "@/lib/constants/pagination";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";

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
  onOpen,
  onEdit,
  onDelete,
  canDelete,
}: {
  post: BlogPost;
  onOpen: (p: BlogPost) => void;
  onEdit: (p: BlogPost) => void;
  onDelete: (p: BlogPost) => void;
  canDelete: boolean;
}) {
  const { can } = useCurrentUser();
  const date = post.createdAt
    ? new Date(post.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

  return (
    <div
      onClick={() => onOpen(post)}
      className={cn(
        "bg-white dark:bg-zinc-900",
        "border border-zinc-200 dark:border-zinc-800",
        "rounded-2xl overflow-hidden",
        "transition-all duration-200 cursor-pointer",
        "hover:border-zinc-300 dark:hover:border-zinc-700",
        "hover:shadow-md hover:shadow-zinc-900/5",
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
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              <Eye className="w-6 h-5 text-zinc-400" />
            </Link>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {can("blog.edit") && (
          <button
            title="Edit post"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(post);
            }}
            className="p-2 rounded-lg text-zinc-500 dark:text-zinc-400
                       hover:text-amber-600 dark:hover:text-amber-400
                       hover:bg-amber-50 dark:hover:bg-amber-950
                       transition-all"
          >
            <Pencil className="w-4 h-4" />
          </button>
          )}
          {canDelete && (
            <button
              title="Delete post"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(post);
              }}
              className="p-2 rounded-lg text-zinc-500 dark:text-zinc-400
                         hover:text-red-600 dark:hover:text-red-400
                         hover:bg-red-50 dark:hover:bg-red-950
                         transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
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

const STATUS_FILTERS: { value: BlogStatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
];

const EMPTY_STATS: BlogStats = {
  total: 0,
  published: 0,
  featured: 0,
  readTime: 0,
  byCategory: {},
};

// ── Main component ───────────────────────────────────────────────
export function BlogTable() {
  const { can } = useCurrentUser();
  const canDelete = can("blog.delete");
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<BlogStatusFilter>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DASHBOARD_PAGE_SIZE);

  const [showForm, setShowForm] = useState(false);
  const [editPost, setEditPost] = useState<BlogPost | null>(null);
  const [deletePost, setDeletePost] = useState<BlogPost | null>(null);
  const [drawerPost, setDrawerPost] = useState<BlogPost | null>(null);

  // The search box stays instant; the (server-side) query waits for a pause.
  const debouncedSearch = useDebouncedValue(search);

  // ── Data ──────────────────────────────────────────────────────
  // The first page + the stats are prefetched on the server and hydrated
  // into the cache by <HydrationBoundary>, so this query resolves instantly
  // on the first render. Later pages/searches hit the API.
  const listParams = useMemo(
    () => ({ page, pageSize, q: debouncedSearch, status }),
    [page, pageSize, debouncedSearch, status],
  );

  const listQuery = useQuery({
    queryKey: ["blogs", "list", listParams],
    queryFn: () => dashboardGetBlogPosts(listParams),
    // Keep the previous page on screen while the next one loads.
    placeholderData: keepPreviousData,
  });

  const statsQuery = useQuery({
    queryKey: ["blogs", "stats"],
    queryFn: () => dashboardGetBlogStats(),
  });

  const posts = listQuery.data?.blogs ?? [];
  const total = listQuery.data?.total ?? 0;
  const stats = statsQuery.data ?? EMPTY_STATS;

  // ── Handlers ──────────────────────────────────────────────────
  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleStatusChange(value: BlogStatusFilter) {
    setStatus(value);
    setPage(1);
  }

  function handlePageSizeChange(value: number) {
    setPageSize(value);
    setPage(1);
  }

  async function handleSave(
    data: Omit<BlogPost, "id" | "createdAt" | "updatedAt">,
    image?: File,
  ) {
    try {
      if (editPost) {
        const updated = await dashboardUpdatePost(editPost.id, data, image);
        if (updated) {
          setDrawerPost((prev) => (prev?.id === updated.id ? updated : prev));
          toast.success("Post updated successfully");
          queryClient.invalidateQueries({ queryKey: ["blogs"] });
        }
      } else {
        const created = await dashboardCreatePost(data, image);
        if (created) {
          toast.success("Post published successfully");
          queryClient.invalidateQueries({ queryKey: ["blogs"] });
        }
      }
    } catch (err) {
      console.error("handleSave error:", err);
      const message =
        err instanceof Error ? err.message : "Something went wrong.";
      toast.error(message);
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
        setDrawerPost(null);
        toast.success("Post deleted");
        queryClient.invalidateQueries({ queryKey: ["blogs"] });
      }
    } catch (err) {
      console.error("handleDelete error:", err);
    }
    setDeletePost(null);
  }

  function handleDrawerEdit(post: BlogPost) {
    setDrawerPost(null);
    setEditPost(post);
    setShowForm(true);
  }

  function handleDrawerDelete(post: BlogPost) {
    setDrawerPost(null);
    setDeletePost(post);
  }

  const isEmpty = posts.length === 0;
  const isPending = listQuery.isPending;

  return (
    <>
      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard label="Total Posts" value={stats.total} color="#6366f1" />
        <StatCard
          label="Published"
          value={stats.published}
          sub="visible on blog"
          color="#10b981"
        />
        <StatCard
          label="Featured"
          value={stats.featured}
          sub="hero highlights"
          color="#f59e0b"
        />
        <StatCard
          label="Read Time"
          value={totalReadTime(stats.readTime, stats.total)}
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
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm
                       bg-white dark:bg-zinc-900
                       border border-zinc-200 dark:border-zinc-700
                       text-zinc-900 dark:text-white placeholder:text-zinc-400
                       focus:outline-none focus:ring-2 focus:ring-indigo-500
                       transition-colors"
          />
          {search && (
            <button
              type="button"
              onClick={() => handleSearchChange("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2
                         p-1 rounded-md text-zinc-400 hover:text-zinc-700
                         hover:bg-zinc-100 dark:hover:bg-zinc-800
                         dark:hover:text-zinc-200 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {can("blog.create") && (
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
        )}
      </div>

      {/* ── Status filter ── */}
      <div className="flex items-center gap-1.5 mb-4 flex-wrap">
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => handleStatusChange(filter.value)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors",
              status === filter.value
                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                : "bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300",
            )}
          >
            {filter.label}
          </button>
        ))}
        <p className="text-xs text-zinc-400 ml-auto hidden sm:block">
          Click any row to view details
        </p>
      </div>

      {/* ── Rows ── */}
      {isPending ? (
        <div className="flex flex-col gap-3" aria-busy="true">
          {Array.from({ length: pageSize }).map((_, index) => (
            <div
              key={index}
              className="h-[78px] rounded-2xl bg-zinc-100 dark:bg-zinc-800/60
                         animate-pulse"
            />
          ))}
        </div>
      ) : listQuery.isError ? (
        <div
          className="flex flex-col items-center justify-center
                        gap-3 py-20 text-zinc-400
                        bg-white dark:bg-zinc-900
                        border border-zinc-200 dark:border-zinc-800
                        rounded-2xl"
        >
          <AlertCircle className="w-10 h-10 opacity-30 text-red-500" />
          <div className="text-center">
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
              Could not load posts
            </p>
            <p className="text-xs text-zinc-400 mt-1">
              The server did not respond. Please try again.
            </p>
          </div>
          <button
            type="button"
            onClick={() => listQuery.refetch()}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg
                       text-xs font-semibold bg-indigo-600 text-white
                       hover:bg-indigo-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      ) : isEmpty && !listQuery.isFetching ? (
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
        <div
          className={cn(
            "flex flex-col gap-3 transition-opacity",
            listQuery.isFetching && "opacity-60",
          )}
        >
          {posts.map((post) => (
            <BlogRow
              key={post.id}
              post={post}
              onOpen={(p) => setDrawerPost(p)}
              onEdit={(p) => {
                setEditPost(p);
                setShowForm(true);
              }}
              onDelete={(p) => setDeletePost(p)}
              canDelete={canDelete}
            />
          ))}
        </div>
      )}

      {/* ── Pagination ── */}
      <Pagination
        page={page}
        pageSize={pageSize}
        total={total}
        itemLabel="posts"
        pageSizeOptions={DASHBOARD_PAGE_SIZES}
        onPageChange={setPage}
        onPageSizeChange={handlePageSizeChange}
        busy={listQuery.isFetching}
      />

      {/* ── Blog detail drawer ── */}
      <BlogDrawer
        post={drawerPost}
        onClose={() => setDrawerPost(null)}
        onEdit={handleDrawerEdit}
        onDelete={handleDrawerDelete}
      />

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
        <ConfirmDeleteModal
          title="Delete post?"
          onConfirm={handleDelete}
          onCancel={() => setDeletePost(null)}
        >
          You are about to delete <DeleteTarget>&quot;{deletePost.title}&quot;</DeleteTarget>. This
          will permanently remove the article from your blog. This action cannot be undone.
        </ConfirmDeleteModal>
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
