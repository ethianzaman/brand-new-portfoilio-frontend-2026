import { HomeData, HomeHero, HomeStat } from "@/lib/types/hero";

const API_BASE_URL = "http://localhost:5000/api"; // 👈 আপনার ব্যাকএন্ড এপিআই ইউআরএল

// ── PUBLIC (cached — সাইট যেন দ্রুত থাকে) ──────────────────
// প্রতিটি রিকোয়েস্টে ব্যাকএন্ড হিট হয় না; ৬০ সেকেন্ড পরপর
// রিফ্রেশ হয় এবং publish করার পর revalidateTag("home") দিয়ে
// সাথে সাথে আপডেট হয়।
export async function getHeroData(): Promise<HomeData> {
  const res = await fetch(`${API_BASE_URL}/home`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    next: { revalidate: 60, tags: ["home"] },
  });
  if (!res.ok) throw new Error("Failed to fetch home data");
  const data = await res.json();
  return data.home; // ব্যাকএন্ড রেসপন্স স্ট্রাকচার অনুযায়ী: res.json({ home })
}

// ── DASHBOARD (always fresh — no cache) ────────────────────
export async function dashboardGetHero(): Promise<HomeData> {
  const res = await fetch(`${API_BASE_URL}/home`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch home data");
  const data = await res.json();
  return data.home;
}

// ── HERO (উইথ ইমেজ ও রিজিউম আপলোড - FormData) ───────────────
// ব্যাকএন্ডে fields: name, title, bio, socials (JSON string),
// image (file অথবা URL string), resume (file), resumeUrl (string)
export async function dashboardUpdateHero(
  formData: FormData,
): Promise<HomeHero> {
  // দেখতে কী কী FormData যাচ্ছে
  console.log("📦 FormData:");

  for (const [key, value] of formData.entries()) {
    console.log(key, value);
  }

  const res = await fetch(`${API_BASE_URL}/home/hero`, {
    method: "PUT",
    body: formData,
    // FormData পাঠানোর সময় 'Content-Type' হেডার দেওয়ার প্রয়োজন নেই
    credentials: "include", // যদি ব্যাকএন্ডে session
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Server responded with status ${res.status}`,
    );
  }

  const data = await res.json();
  return data.hero; // ব্যাকএন্ড থেকে আসা আপডেটেড hero অবজেক্ট
}

// ── STATS (সবগুলো স্ট্যাট একসাথে রিপ্লেস হয়) ────────────────
export async function dashboardUpdateHeroStats(
  stats: HomeStat[],
): Promise<HomeStat[]> {
  const res = await fetch(`${API_BASE_URL}/home/stats`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ stats }),
  });
 console.log("📦 Updating stats:", stats);
  if (!res.ok) throw new Error("Failed to update stats");
  const data = await res.json();
  return data.stats;
}
