import "server-only";

import { revalidateSecret } from "@/lib/api/config";

/**
 * Tells the backend who the real visitor is. Its rate limits need the visitor's
 * IP, but it only ever sees this server's address on proxied calls. The secret
 * stops anyone else claiming an IP by sending these headers directly.
 */

export function clientHeaders(request: Request): Record<string, string> {
  const ip =
    request.headers.get("x-real-ip")?.trim() ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const secret = revalidateSecret();

  return ip && secret
    ? { "x-client-ip": ip, "x-internal-secret": secret }
    : {};
}

/** The backend's 4xx status, when that is what failed. Otherwise 502. */
export function upstreamStatus(error: unknown): number {
  const status = (error as { status?: unknown })?.status;
  return typeof status === "number" && status >= 400 && status < 500
    ? status
    : 502;
}


