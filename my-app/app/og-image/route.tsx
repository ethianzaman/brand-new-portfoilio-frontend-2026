import { ImageResponse } from "next/og";

import { getAbout } from "@/lib/api/about";
import { getSiteSettings } from "@/lib/api/settings";
import { resolvePersonName } from "@/lib/seo/jsonld";

// The share preview for pages with no image of their own, drawn from the real
// name and title on the site. It is not under /api, which robots.txt blocks:
// social networks would refuse to read it there.
export const revalidate = 3600;

export async function GET() {
  const [settings, about] = await Promise.all([
    getSiteSettings(),
    getAbout().catch(() => null),
  ]);

  const name = resolvePersonName(about?.hero?.name, settings.brand.name);
  const title = about?.hero?.title || settings.brand.tagline;

  if (!name) return new Response(null, { status: 404 });

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 96,
          color: "white",
          backgroundColor: "#1e1b4b",
          backgroundImage: "linear-gradient(135deg, #1e1b4b 0%, #4f46e5 100%)",
        }}
      >
        <div style={{ fontSize: 84, fontWeight: 700, lineHeight: 1.1 }}>{name}</div>
        {title ? (
          <div style={{ marginTop: 28, fontSize: 40, color: "#c7d2fe" }}>{title}</div>
        ) : null}
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
