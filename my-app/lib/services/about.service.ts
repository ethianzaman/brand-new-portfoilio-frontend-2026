
import { dashboardApiUrl } from "@/lib/api/config";
import { AboutData, Experience, Education, Value } from "@/lib/types/about";

const API_BASE_URL = dashboardApiUrl();

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
  return data.about;
}

// ── HERO (image upload, FormData) ─────────────────────────────────

export async function dashboardUpdateHero(formData: FormData) {
  const res = await fetch(`${API_BASE_URL}/about/hero`, {
    method: "PUT",
    // No Content-Type: the browser sets it, with the multipart boundary.
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Server responded with status ${res.status}`,
    );
  }

  const data = await res.json();
  return data.hero;
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

  const result = await res.json();

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
  return result.education;
}

export async function dashboardUpdateEducation(
  _id: string,
  data: Partial<Omit<Education, "_id">>,
): Promise<Education | null> {
  const res = await fetch(`${API_BASE_URL}/about/educations/${_id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result = await res.json();
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
