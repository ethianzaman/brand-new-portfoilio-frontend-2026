"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldAlert } from "lucide-react";

import { useCurrentUser } from "./useCurrentUser";

const SECTION_BY_PATH: Record<string, string> = {
  hero: "hero",
  about: "about",
  projects: "projects",
  skills: "skills",
  services: "services",
  blog: "blog",
  contact: "contact",
  messages: "messages",
  "social-links": "socialLinks",
  seo: "seo",
  settings: "settings",
  users: "users",
};

/**
 * Tells someone typing a URL they cannot use. This is for clarity only: the
 * backend checks every private read and every write again.
 */
export function PermissionGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { can, isReady } = useCurrentUser();

  const match = /^\/dashboard\/pages\/([^/]+)/.exec(pathname);
  const section = match ? SECTION_BY_PATH[match[1]] : undefined;

  if (!isReady || !section || can(`${section}.view`)) return <>{children}</>;

  return (
    <div className="mx-auto mt-16 flex max-w-md flex-col items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
        <ShieldAlert className="h-6 w-6" />
      </span>
      <h1 className="text-lg font-bold text-zinc-900 dark:text-white">
        You don&apos;t have access to this page
      </h1>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Ask a Super Admin if you need this section.
      </p>
      <Link
        href="/dashboard"
        className="mt-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
