import { NextRequest, NextResponse } from "next/server";

import { getAbout } from "@/lib/api/about";

const MAX_BYTES = 20 * 1024 * 1024;
const TIMEOUT_MS = 15_000;
const MAX_REDIRECTS = 5;

const PRIVATE_HOST =
  /^(localhost|0\.0\.0\.0|127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|\[?::1\]?$|\[?f[cd][0-9a-f]{2}:|\[?fe80:)/i;

/** Only public https hosts, so a saved link can never reach internal services. */
function isAllowedTarget(raw: string): boolean {
  try {
    const url = new URL(raw);
    return url.protocol === "https:" && !PRIVATE_HOST.test(url.hostname);
  } catch {
    return false;
  }
}

// Google Drive /view and /open links return an HTML viewer, not the file.
function toDirectDownloadUrl(url: string): string {
  const id =
    url.match(/drive\.google\.com\/file\/d\/([^/?]+)/)?.[1] ??
    url.match(/drive\.google\.com\/open\?id=([^&]+)/)?.[1] ??
    url.match(/drive\.google\.com\/uc\?[^#]*\bid=([^&]+)/)?.[1];

  return id ? `https://drive.google.com/uc?export=download&id=${id}` : url;
}

// For large files Google Drive answers with a "confirm" page holding the real link.
function extractDriveConfirmLink(html: string): string | null {
  const match = html.match(
    /href="(https:\/\/drive\.usercontent\.google\.com\/download\?[^"]+)"/,
  );
  return match ? match[1].replace(/&amp;/g, "&") : null;
}

function isPdf(bytes: Uint8Array): boolean {
  return (
    bytes.length > 4 &&
    bytes[0] === 0x25 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x44 &&
    bytes[3] === 0x46 &&
    bytes[4] === 0x2d
  );
}

/** Follows redirects by hand, because each hop has to pass the same check. */
async function fetchChecked(start: string, signal: AbortSignal): Promise<Response> {
  let url = start;

  for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
    if (!isAllowedTarget(url)) throw new Error("Blocked download target");

    const res = await fetch(url, { cache: "no-store", redirect: "manual", signal });
    const location = res.headers.get("location");

    if (res.status < 300 || res.status >= 400 || !location) return res;
    url = new URL(location, url).toString();
  }

  throw new Error("Too many redirects");
}

async function readLimited(res: Response): Promise<Uint8Array> {
  if (!res.body) return new Uint8Array();

  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;

    total += value.length;
    if (total > MAX_BYTES) {
      await reader.cancel();
      throw new Error("File is too large");
    }
    chunks.push(value);
  }

  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  return bytes;
}

function safeFilename(res: Response): string {
  const header = res.headers.get("content-disposition") ?? "";
  const raw = header.match(/filename\*?=(?:UTF-8'')?"?([^";]+)/i)?.[1];
  if (!raw) return "resume.pdf";

  let decoded = raw;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    // Not percent-encoded, so use it as it came.
  }

  const clean = decoded.replace(/[^\w.\- ]/g, "_").slice(0, 100);
  return clean.toLowerCase().endsWith(".pdf") ? clean : "resume.pdf";
}

/**
 * GET /api/download?url=... — downloads the site's resume.
 *
 * Public, so it only ever fetches the resume link saved in the dashboard. It
 * must not accept arbitrary URLs: this server can reach addresses a visitor
 * cannot, and would hand back whatever it found.
 */
export async function GET(request: NextRequest) {
  const requested = request.nextUrl.searchParams.get("url");
  const { hero } = await getAbout();

  if (!requested || requested !== hero.resumeUrl) {
    return NextResponse.json({ error: "Unknown file." }, { status: 403 });
  }

  const signal = AbortSignal.timeout(TIMEOUT_MS);

  try {
    let res = await fetchChecked(toDirectDownloadUrl(requested), signal);
    if (!res.ok) throw new Error(`Upstream responded ${res.status}`);

    let bytes = await readLimited(res);

    if (res.headers.get("content-type")?.includes("text/html")) {
      const confirmLink = extractDriveConfirmLink(new TextDecoder().decode(bytes));
      if (!confirmLink) throw new Error("Upstream returned a page, not a file");

      res = await fetchChecked(confirmLink, signal);
      if (!res.ok) throw new Error(`Upstream responded ${res.status}`);
      bytes = await readLimited(res);
    }

    if (!isPdf(bytes)) throw new Error("Upstream file is not a PDF");

    return new Response(bytes.buffer as ArrayBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${safeFilename(res)}"`,
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("[download]", error);
    return NextResponse.json(
      { error: "The resume could not be downloaded right now." },
      { status: 502 },
    );
  }
}
