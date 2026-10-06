import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { revalidateSecret } from "@/lib/api/config";
import { clearLastGood } from "@/lib/api/core";

export const dynamic = "force-dynamic";

/**
 * On-demand revalidation endpoint.
 *
 * The backend calls this from `publishChange(tag)` right after a successful
 * DB write so the public cache is dropped immediately instead of waiting out
 * the 60s ISR window.
 *
 * Auth: `x-revalidate-secret` header must equal `REVALIDATE_SECRET`.
 * A logged-in session is also accepted, so the dashboard can trigger it.
 */
export async function POST(request: NextRequest) {
  const secret = revalidateSecret();
  const provided = request.headers.get("x-revalidate-secret") ?? "";

  const authorizedBySecret = secret.length > 0 && provided === secret;
  const authorizedByCookie = request.cookies.has("auth_token");

  if (!authorizedBySecret && !authorizedByCookie) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const { tag, tags } = body as { tag?: unknown; tags?: unknown };

  const targets = Array.isArray(tags)
    ? tags.filter((t): t is string => typeof t === "string" && t.length > 0)
    : typeof tag === "string" && tag.length > 0
      ? [tag]
      : [];

  if (targets.length === 0) {
    return NextResponse.json({ error: "tag is required" }, { status: 400 });
  }

  // Next 16 signature: the second argument is a cache profile.
  // `expire: 0` expires the entries immediately so the next request
  // re-fetches instead of serving stale data for another 60 seconds.
  for (const target of targets) {
    revalidateTag(target, { expire: 0 });
  }

  // `publicFetch` keeps an in-process last-good copy of every payload it has
  // seen. If the upstream is briefly unreachable during the regeneration this
  // invalidation just triggered, that copy would be served and baked into the
  // FRESH cache entry — turning a transient blip into a page that is stale until
  // the next edit. Drop it so the next render either fetches real data or falls
  // back to the demo payload, never to a pre-edit snapshot.
  clearLastGood();

  return NextResponse.json({ revalidated: true, tags: targets, at: Date.now() });
}
