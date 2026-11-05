"use client";
import { useEffect } from "react";
import { useCurrentUser } from "@/app/components/dashboard/useCurrentUser";
import {
  X,
  ExternalLink,
  Star,
  ImageIcon,
  Tag,
  Layers,
  Clock3,
  Calendar,
  User,
  FileText,
} from "lucide-react";
import { BlogPost } from "@/lib/types/blog";
import { cn } from "@/lib/utils";

interface Props {
  post: BlogPost | null;
  onClose: () => void;
  onEdit: (post: BlogPost) => void;
  onDelete: (post: BlogPost) => void;
}

function DetailRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex items-start gap-3 py-3
                    border-b border-zinc-100 dark:border-zinc-800
                    last:border-0"
    >
      <div
        className="w-8 h-8 rounded-lg shrink-0
                      bg-zinc-100 dark:bg-zinc-800
                      flex items-center justify-center mt-0.5"
      >
        <Icon className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
      </div>
      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
        <span
          className="text-xs font-semibold uppercase tracking-wider
                         text-zinc-400 dark:text-zinc-500"
        >
          {label}
        </span>
        <div className="text-sm text-zinc-900 dark:text-white">{children}</div>
      </div>
    </div>
  );
}

export function BlogDrawer({ post, onClose, onEdit, onDelete }: Props) {
  const { can } = useCurrentUser();
  const canDelete = can("blog.delete");
  const isOpen = !!post;

  // ✅ Close on Escape key
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // ✅ Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const date = post?.createdAt
    ? new Date(post.createdAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "—";

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-40 bg-zinc-950/40 backdrop-blur-sm",
          "transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
      />

      {/* ── Drawer panel ── */}
      <div
        className={cn(
          "fixed top-0 right-0 z-50 h-full w-full sm:w-lg",
          "bg-white dark:bg-zinc-900",
          "border-l border-zinc-200 dark:border-zinc-800",
          "shadow-2xl shadow-zinc-900/20",
          "flex flex-col",
          "transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        {!post ? null : (
          <>
            {/* ── Cover image ── */}
            <div
              className="relative w-full h-48 shrink-0
                            bg-zinc-100 dark:bg-zinc-800 overflow-hidden"
            >
              {post.coverImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-10 h-10 text-zinc-400" />
                </div>
              )}

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-3 right-3
                           w-8 h-8 rounded-full
                           bg-white/90 dark:bg-zinc-900/90
                           flex items-center justify-center
                           text-zinc-600 dark:text-zinc-400
                           hover:text-zinc-900 dark:hover:text-white
                           transition-colors shadow-sm"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Featured badge */}
              {post.featured && (
                <div
                  className="absolute top-3 left-3
                                flex items-center gap-1.5 px-3 py-1
                                rounded-full bg-amber-500 text-white
                                text-xs font-semibold shadow-sm"
                >
                  <Star className="w-3 h-3 fill-white" />
                  Featured
                </div>
              )}
            </div>

            {/* ── Scrollable content ── */}
            <div className="flex-1 overflow-y-auto">
              {/* Header */}
              <div className="p-6 border-b border-zinc-100 dark:border-zinc-800">
                <h2
                  className="text-xl font-bold
                               text-zinc-900 dark:text-white
                               leading-snug mb-3"
                >
                  {post.title}
                </h2>
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold
                               bg-indigo-50 dark:bg-indigo-950
                               text-indigo-600 dark:text-indigo-400
                               border border-indigo-200 dark:border-indigo-900"
                  >
                    {post.category}
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold",
                      post.status === "published"
                        ? "bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400",
                    )}
                  >
                    {post.status === "published" ? "Published" : "Draft"}
                  </span>
                </div>

                <p
                  className="mt-4 text-sm text-zinc-500 dark:text-zinc-400
                               leading-relaxed"
                >
                  {post.excerpt}
                </p>
              </div>

              {/* Details */}
              <div className="px-6 py-2">
                <DetailRow icon={Tag} label="Tags">
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {post.tags.length > 0 ? (
                      post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium
                                     bg-zinc-100 dark:bg-zinc-800
                                     text-zinc-600 dark:text-zinc-400"
                        >
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-zinc-400">No tags</span>
                    )}
                  </div>
                </DetailRow>

                <DetailRow icon={Layers} label="Category">
                  <span className="capitalize">{post.category}</span>
                </DetailRow>

                <DetailRow icon={Calendar} label="Created">
                  {date}
                </DetailRow>

                <DetailRow icon={Clock3} label="Read Time">
                  {post.readTime} min
                </DetailRow>

                <DetailRow icon={User} label="Author">
                  {post.author ?? "—"}
                </DetailRow>

                <DetailRow icon={FileText} label="Slug">
                  <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">
                    /blog/{post.slug}
                  </span>
                </DetailRow>
              </div>

              {/* Content preview */}
              {post.content && (
                <div className="px-6 pb-6">
                  <span
                    className="text-xs font-semibold uppercase tracking-wider
                               text-zinc-400 dark:text-zinc-500"
                  >
                    Content
                  </span>
                  <p
                    className="mt-2 text-sm text-zinc-600 dark:text-zinc-400
                                 leading-relaxed whitespace-pre-line
                                 line-clamp-6"
                  >
                    {post.content}
                  </p>
                </div>
              )}
            </div>

            {/* ── Action footer ── */}
            <div
              className="shrink-0 p-4
                            border-t border-zinc-100 dark:border-zinc-800
                            bg-zinc-50 dark:bg-zinc-800/50
                            flex gap-3"
            >
              {canDelete && (
                <button
                  onClick={() => onDelete(post)}
                  className="flex items-center justify-center gap-2
                             flex-1 py-2.5 rounded-xl text-sm font-medium
                             border border-red-200 dark:border-red-900
                             text-red-600 dark:text-red-400
                             hover:bg-red-50 dark:hover:bg-red-950
                             transition-colors"
                >
                  <X className="w-4 h-4" />
                  Delete
                </button>
              )}
              {post.status === "published" && (
                <a
                  href={`/blog/${post.slug}`}
                  className="flex items-center justify-center gap-2
                             flex-1 py-2.5 rounded-xl text-sm font-medium
                             border border-zinc-200 dark:border-zinc-700
                             text-zinc-700 dark:text-zinc-300
                             hover:bg-zinc-100 dark:hover:bg-zinc-800
                             transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Post
                </a>
              )}
              {can("blog.edit") && (
              <button
                onClick={() => onEdit(post)}
                className="flex items-center justify-center gap-2
                           flex-1 py-2.5 rounded-xl text-sm font-medium
                           bg-indigo-600 hover:bg-indigo-700
                           text-white transition-colors"
              >
                Edit
              </button>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
