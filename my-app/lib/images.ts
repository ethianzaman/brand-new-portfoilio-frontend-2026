/**
 * Asks the image host for a copy no wider than the page needs, in a modern
 * format. Card images come from dashboard URLs on any host, which `next/image`
 * would reject, so this works on the URL instead. Other hosts pass through.
 */
export function resizedImageUrl(url: string, width: number): string {
  if (/res\.cloudinary\.com\/[^/]+\/image\/upload\//.test(url)) {
    return url.replace(
      /(\/image\/upload\/)/,
      `$1f_auto,q_auto,c_limit,w_${width}/`,
    );
  }

  try {
    const parsed = new URL(url);
    if (parsed.hostname === "images.unsplash.com") {
      parsed.searchParams.set("auto", "format");
      parsed.searchParams.set("fit", "max");
      parsed.searchParams.set("q", "70");
      parsed.searchParams.set("w", String(width));
      return parsed.toString();
    }
  } catch {
    return url;
  }

  return url;
}
