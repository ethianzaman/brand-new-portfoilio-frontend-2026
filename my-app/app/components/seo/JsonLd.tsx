import { serializeJsonLd } from "@/lib/seo/jsonld";

/**
 * Inline JSON-LD script for a Server Component.
 *
 * The payload is serialized with `serializeJsonLd`, which escapes `<`, `>`,
 * `&` and the Unicode line separators, so a `</script>` inside any value
 * cannot escape the element.
 */
export function JsonLd({ data }: { data: unknown }) {
  if (!data) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
