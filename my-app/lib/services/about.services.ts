
import { dashboardApiUrl } from "@/lib/api/config";
import { AboutData, Experience, Education, Value } from "@/lib/types/about";

const API_BASE_URL = dashboardApiUrl(); // 👈 আপনার ব্যাকএন্ড এপিআই ইউআরএল

// ── GET ALL ABOUT DATA ───────────────────────────────────────────
export async function dashboardGetAbout(): Promise<AboutData> {
  const res = await fetch(`${API_BASE_URL}/about`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    // Without this, Next 16 caches the fetch and prerenders the CMS at build
    // time — the About screen would show build-time data and never reflect an
    // edit. Every other dashboard read carries this flag; this one did not.
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch about data");
  const data = await res.json();
  return data.about; // আপনার ব্যাকএন্ড রেসপন্স স্ট্রাকচার অনুযায়ী (যেমন: res.json({ about }))
}

// ── HERO (উইথ ইমেজ আপলোড - FormData) ──────────────────────────────

export async function dashboardUpdateHero(formData: FormData) {
  // আপনার সঠিক ব্যাকএন্ড ইউআরএলটি এখানে বসানো হলো
  const res = await fetch(`${API_BASE_URL}/about/hero`, {
    method: "PUT", // ব্যাকএন্ডের router.put এর সাথে মিল রেখে PUT করা হলো
    body: formData, // এখানে ফ্রন্টএন্ডের FormData (যার ভেতর image ও bio আছে) পাঠানো হচ্ছে
    // নোট: FormData পাঠানোর সময় 'Content-Type' হেডার দেওয়ার প্রয়োজন নেই, ব্রাউজার নিজে থেকেই তা সেট করে নেয়।
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Server responded with status ${res.status}`,
    );
  }

  const data = await res.json();
  return data.hero; // ব্যাকএন্ড থেকে আসা আপডেটেড hero অবজেক্ট রিটার্ন করবে
}

// ── EXPERIENCE ──────────────────────────────────────────
export async function dashboardCreateExperience(
  data: Omit<Experience, "_id">,
): Promise<Experience> {
  const res = await fetch(`${API_BASE_URL}/about/experiences`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  console.log("Response status:", res.status);

  const result = await res.json();

  console.log("Backend response:", result);

  if (!res.ok) {
    throw new Error(result.message || "Failed to create experience");
  }

  return result.experience;
}

export async function dashboardUpdateExperience(
  id: string,
  data: Partial<Omit<Experience, "id">>,
): Promise<Experience | null> {
  const res = await fetch(`${API_BASE_URL}/about/experiences/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) return null;
  const result = await res.json();
  return result.experience;
}

export async function dashboardDeleteExperience(id: string): Promise<boolean> {
  const res = await fetch(`${API_BASE_URL}/about/experiences/${id}`, {
    method: "DELETE",
  });
  return res.ok;
}

export async function dashboardCreateEducation(
  data: Omit<Education, "_id">,
): Promise<Education> {
  const res = await fetch(`${API_BASE_URL}/about/educations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create education");
  const result = await res.json();
  console.log("CREATE EDU RESULT:", result); // ← add
  return result.education;
}

export async function dashboardUpdateEducation(
  _id: string,
  data: Partial<Omit<Education, "_id">>,
): Promise<Education | null> {
  console.log("SERVICE CALLED WITH ID:", _id); // ← add
  const res = await fetch(`${API_BASE_URL}/about/educations/${_id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result = await res.json();
  console.log("SERVICE RESULT:", result); // ← add
  if (!res.ok) return null;
  return result.education;
}
export async function dashboardDeleteEducation(_id: string): Promise<boolean> {
  const res = await fetch(`${API_BASE_URL}/about/educations/${_id}`, {
    method: "DELETE",
  });
  return res.ok;
}

// ── VALUES ──────────────────────────────────────────────
export async function dashboardCreateValue(
  data: Omit<Value, "_id">,
): Promise<Value> {
  const res = await fetch(`${API_BASE_URL}/about/values`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create value");
  const result = await res.json();
  return result.value;
}

export async function dashboardUpdateValue(
  _id: string,
  data: Partial<Omit<Value, "_id">>,
): Promise<Value | null> {
  const res = await fetch(`${API_BASE_URL}/about/values/${_id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) return null;
  const result = await res.json();
  return result.value;
}

export async function dashboardDeleteValue(_id: string): Promise<boolean> {
  const res = await fetch(`${API_BASE_URL}/about/values/${_id}`, {
    method: "DELETE",
  });
  return res.ok;
}
