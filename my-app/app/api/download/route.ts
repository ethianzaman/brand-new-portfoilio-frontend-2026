import { NextRequest, NextResponse } from "next/server";

// Google Drive `/view` / `/open` URL গুলো HTML viewer page return করে,
// direct file বাইট না। সেগুলোকে direct-download URL-এ convert করা হয়।
function toDirectDownloadUrl(url: string): string {
  // https://drive.google.com/file/d/<ID>/view?usp=sharing
  let m = url.match(/drive\.google\.com\/file\/d\/([^/?]+)/);
  if (m) return `https://drive.google.com/uc?export=download&id=${m[1]}`;

  // https://drive.google.com/open?id=<ID>
  m = url.match(/drive\.google\.com\/open\?id=([^&]+)/);
  if (m) return `https://drive.google.com/uc?export=download&id=${m[1]}`;

  // https://drive.google.com/uc?id=<ID>&export=download
  m = url.match(/drive\.google\.com\/uc\?[^#]*\bid=([^&]+)/);
  if (m) return `https://drive.google.com/uc?export=download&id=${m[1]}`;

  return url;
}

// Large file-এর জন্য Google Drive একটি HTML "confirm" পেজ দেখায় যেখানে
// আসল download link থাকে। সেটা parse করে নেওয়া হয়।
function extractDriveConfirmLink(html: string): string | null {
  // <a href="https://drive.usercontent.google.com/download?id=...&export=download&confirm=t&uuid=...">
  const m = html.match(
    /href="(https:\/\/drive\.usercontent\.google\.com\/download\?[^"]+)"/,
  );
  return m ? m[1].replace(/&amp;/g, "&") : null;
}

function isPdf(buffer: ArrayBuffer): boolean {
  const bytes = new Uint8Array(buffer);
  return (
    bytes.length > 4 &&
    bytes[0] === 0x25 && // %
    bytes[1] === 0x50 && // P
    bytes[2] === 0x44 && // D
    bytes[3] === 0x46 && // F
    bytes[4] === 0x2d // -
  );
}

// GET /api/download?url=... — resume download proxy
export async function GET(request: NextRequest) {
  const originalUrl = request.nextUrl.searchParams.get("url");

  if (!originalUrl) {
    return NextResponse.json({ error: "url is required" }, { status: 400 });
  }

  const url = toDirectDownloadUrl(originalUrl);

  try {
    const res = await fetch(url, {
      cache: "no-store",
      redirect: "follow",
    });

    if (!res.ok) {
      console.error(`Download proxy fetch failed with status: ${res.status}`);
      return NextResponse.json(
        { error: `Failed to fetch remote file (${res.status})` },
        { status: res.status },
      );
    }

    const contentType = res.headers.get("content-type") || "";
    const buffer = await res.arrayBuffer();

    // Google Drive-এর HTML confirm page এলে আসল download link বের করে retry
    if (contentType.includes("text/html")) {
      const html = new TextDecoder().decode(buffer);
      const confirmLink = extractDriveConfirmLink(html);
      if (!confirmLink) {
        console.error(
          `Download proxy got HTML instead of file: ${originalUrl}`,
        );
        return NextResponse.json(
          {
            error:
              "URL does not point to a direct file (got HTML). Use a direct PDF link or upload the file instead.",
          },
          { status: 422 },
        );
      }
      const res2 = await fetch(confirmLink, {
        cache: "no-store",
        redirect: "follow",
      });
      if (!res2.ok) {
        return NextResponse.json(
          { error: "Failed to download file from Google Drive" },
          { status: res2.status },
        );
      }
      return respondWithFile(res2, await res2.arrayBuffer());
    }

    if (!contentType.includes("pdf") && !isPdf(buffer)) {
      console.error(
        `Download proxy got non-PDF content (${contentType}) from: ${originalUrl}`,
      );
      return NextResponse.json(
        {
          error:
            "The link does not point to a PDF file. Please use a direct PDF URL or upload the file.",
        },
        { status: 422 },
      );
    }

    return respondWithFile(res, buffer);
  } catch (error) {
    console.error("API Download Proxy Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error while downloading file" },
      { status: 502 },
    );
  }
}

function respondWithFile(res: Response, buffer: ArrayBuffer): Response {
  let filename = "resume.pdf";

  // Google Drive / Cloudinary response-এ আসল filename দেওয়া থাকলে সেটা ব্যবহার করি
  const disposition = res.headers.get("content-disposition") || "";
  const nameMatch = disposition.match(/filename\*?=(?:UTF-8''|")?([^";]+)/i);
  if (nameMatch) {
    filename = decodeURIComponent(nameMatch[1].replace(/^"|"$/g, ""));
  }

  const contentType =
    res.headers.get("content-type")?.split(";")[0] || "application/pdf";

  return new Response(buffer, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}