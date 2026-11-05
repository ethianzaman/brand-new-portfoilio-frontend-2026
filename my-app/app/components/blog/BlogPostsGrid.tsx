"use client";
import { useState, useMemo } from "react";
import {
  CategoryFilter,
  setCategoryParam,
  useCategoryParam,
} from "@/app/components/CategoryFilter";
import { resizedImageUrl } from "@/lib/images";
import Reveal from "@/app/components/motion/Reveal";
import SpotlightCard from "@/app/components/motion/SpotlightCard";
import {
  Search,
  X,
  ChevronDown,
  ArrowRight,
  Clock3,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BlogPost } from "@/lib/types/blog";

const PAGE_SIZE = 3;
function PostCard({ post }: { post: BlogPost }) {
  const date = post.createdAt
    ? new Date(post.createdAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <SpotlightCard
      className="rounded-2xl
                 border border-zinc-200 dark:border-zinc-800
                 bg-white dark:bg-zinc-900
                 hover:border-indigo-300 dark:hover:border-indigo-700
                 hover:shadow-lg hover:shadow-indigo-500/5"
    >
    <a
      href={`/blog/${post.slug}`}
      className="flex flex-col rounded-2xl
                 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-500"
    >
      {/* Cover */}
      <div className="aspect-video overflow-hidden bg-zinc-100 dark:bg-zinc-800 relative">
        {post.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={resizedImageUrl(post.coverImage!, 640)}
            alt={post.title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-sm font-semibold text-zinc-400">
              {post.category}
            </span>
          </div>
        )}
        <span
          className="absolute top-3 left-3 px-2.5 py-1 rounded-full
                     bg-white/90 dark:bg-zinc-900/90 backdrop-blur
                     text-xs font-semibold text-indigo-600 dark:text-indigo-400"
        >
          {post.category}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-center gap-2 text-xs text-zinc-400 dark:text-zinc-500 mb-2">
          {date && <span>{date}</span>}
          {date && <span>·</span>}
          <span className="flex items-center gap-1">
            <Clock3 className="w-3 h-3" /> {post.readTime} min read
          </span>
        </div>

        <h3 className="text-base font-bold text-zinc-900 dark:text-white leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {post.title}
        </h3>

        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
          {post.excerpt}
        </p>

        <div className="flex flex-wrap gap-1.5 mt-4">
          {post.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded-md text-[11px] font-medium
                         bg-zinc-100 dark:bg-zinc-800
                         text-zinc-500 dark:text-zinc-400"
            >
              {tag}
            </span>
          ))}
        </div>

        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400">
          Read article
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </a>
    </SpotlightCard>
  );
}

function FeaturedHero({ post }: { post: BlogPost }) {
  const date = post.createdAt
    ? new Date(post.createdAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <SpotlightCard
      className="rounded-2xl
                 border border-zinc-200 dark:border-zinc-800
                 bg-white dark:bg-zinc-900
                 hover:border-indigo-300 dark:hover:border-indigo-700"
    >
    <a
      href={`/blog/${post.slug}`}
      className="grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-2xl
                 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-500"
    >
      <div className="aspect-16/10 lg:aspect-auto overflow-hidden bg-zinc-100 dark:bg-zinc-800 relative">
        {post.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={resizedImageUrl(post.coverImage!, 960)}
            alt={post.title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Star className="w-8 h-8 text-amber-400" />
          </div>
        )}
      </div>

      <div className="flex flex-col justify-center p-6 md:p-10">
        <div className="flex items-center gap-2 mb-3">
          <span
            className="px-2.5 py-1 rounded-full text-xs font-semibold
                       bg-indigo-50 dark:bg-indigo-950
                       text-indigo-600 dark:text-indigo-400"
          >
            Featured
          </span>
          <span
            className="px-2.5 py-1 rounded-full text-xs font-semibold
                       bg-zinc-100 dark:bg-zinc-800
                       text-zinc-600 dark:text-zinc-400"
          >
            {post.category}
          </span>
        </div>

        <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {post.title}
        </h2>

        <p className="text-sm md:text-base text-zinc-500 dark:text-zinc-400 mt-3 leading-relaxed line-clamp-3">
          {post.excerpt}
        </p>

        <div className="flex items-center gap-3 text-xs text-zinc-400 dark:text-zinc-500 mt-4">
          {date && <span>{date}</span>}
          {date && <span>·</span>}
          <span className="flex items-center gap-1">
            <Clock3 className="w-3 h-3" /> {post.readTime} min read
          </span>
        </div>

        <span
          className="mt-6 inline-flex items-center gap-2 text-sm font-semibold
                     text-indigo-600 dark:text-indigo-400"
        >
          Read article
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </a>
    </SpotlightCard>
  );
}

export function BlogPostsGrid({ posts }: { posts: BlogPost[] }) {
  const [query, setQuery] = useState("");
  const [more, setMore] = useState({ filter: "", visible: PAGE_SIZE });
  const urlCategory = useCategoryParam();

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const post of posts) {
      counts.set(post.category, (counts.get(post.category) ?? 0) + 1);
    }
    return Array.from(counts, ([name, count]) => ({
      value: name,
      label: name,
      count,
    }));
  }, [posts]);

  // A shared or edited link can name a category that no longer exists.
  const category = categories.some((c) => c.value === urlCategory)
    ? urlCategory
    : null;
  const search = query.trim().toLowerCase();
  const isFiltering = category !== null || search !== "";

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      const matchCategory = category === null || p.category === category;
      const matchQuery =
        !search ||
        p.title.toLowerCase().includes(search) ||
        p.excerpt.toLowerCase().includes(search) ||
        p.tags.some((t) => t.toLowerCase().includes(search));
      return matchCategory && matchQuery;
    });
  }, [posts, search, category]);

  // While filtering, the featured post is an ordinary result in the grid.
  const featured = isFiltering ? undefined : posts.find((p) => p.featured);
  const rest = filtered.filter((p) => p !== featured);

  // "See more" starts over whenever the filter changes, including back/forward.
  const filterKey = `${category ?? ""}|${search}`;
  const visible = more.filter === filterKey ? more.visible : PAGE_SIZE;
  const shown = rest.slice(0, visible);
  const hasMore = visible < rest.length;

  function handleSeeMore() {
    setMore({ filter: filterKey, visible: visible + PAGE_SIZE });
  }

  function clearFilters() {
    setQuery("");
    if (category !== null) setCategoryParam(null);
  }

  return (
    <div className="flex flex-col gap-10">
      {/* ── Filter section ── */}
      <Reveal className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row">
          {/* Search */}
          <div className="relative min-w-0 flex-1">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none"
            />
            <input
              type="text"
              aria-label="Search articles"
              placeholder="Search articles..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-10 rounded-xl text-sm
                         bg-white dark:bg-zinc-900
                         border border-zinc-200 dark:border-zinc-700
                         text-zinc-900 dark:text-white placeholder:text-zinc-400
                         focus:outline-none focus:ring-2 focus:ring-indigo-500
                         transition-colors"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2
                           w-6 h-6 rounded-md flex items-center justify-center
                           text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white
                           hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category */}
          <CategoryFilter options={categories} value={category} />
        </div>

        {/* Result summary */}
        <div className="flex min-h-7 items-center justify-between gap-3">
          <p
            aria-live="polite"
            className="min-w-0 text-sm text-zinc-500 dark:text-zinc-400"
          >
            {filtered.length} article{filtered.length !== 1 ? "s" : ""}
            {category && (
              <>
                {" in "}
                <span className="font-medium text-zinc-900 dark:text-white">
                  {category}
                </span>
              </>
            )}
          </p>
          {isFiltering && (
            <button
              type="button"
              onClick={clearFilters}
              className="flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-sm font-medium text-indigo-600 transition-colors hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950"
            >
              <X className="h-3.5 w-3.5" />
              Clear filters
            </button>
          )}
        </div>
      </Reveal>

      {/* Featured */}
      {featured && (
        <Reveal>
          <FeaturedHero post={featured} />
        </Reveal>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center gap-3 py-20
                        text-zinc-400 rounded-2xl border border-dashed
                        border-zinc-300 dark:border-zinc-700"
        >
          <Search className="w-10 h-10 opacity-20" />
          <div className="text-center">
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              No articles found
            </p>
            <p className="text-xs text-zinc-400 mt-1">
              Try a different search or category
            </p>
          </div>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-1 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
          >
            Clear filters
          </button>
        </div>
      ) : (
        shown.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {shown.map((post, i) => (
              <Reveal key={post.id} delay={(i % 3) * 90}>
                <PostCard post={post} />
              </Reveal>
            ))}
          </div>
        )
      )}

      {/* ── See More ── */}
      {hasMore && (
        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            size="lg"
            onClick={handleSeeMore}
            className="gap-2 rounded-full px-8
                       border-zinc-200 dark:border-zinc-700
                       hover:border-indigo-400 dark:hover:border-indigo-500
                       hover:text-indigo-600 dark:hover:text-indigo-400
                       transition-all"
          >
            <ChevronDown className="w-4 h-4" />
            See More Articles
          </Button>
        </div>
      )}

      {!hasMore && filtered.length > PAGE_SIZE && (
        <p className="text-center text-sm text-zinc-400 dark:text-zinc-500">
          All {filtered.length} articles shown
        </p>
      )}
    </div>
  );
}
