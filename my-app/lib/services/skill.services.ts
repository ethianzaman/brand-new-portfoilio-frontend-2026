import { apiUrl } from "@/lib/api/config";
import { DEMO_SKILLS } from "../data/skills.demo";
import { Skill, SkillCategory, SkillFormData } from "../types/skill";

const API_BASE_URL = `${apiUrl()}/skills`;

function normalizeSkills(data: {
  categories: Array<{
    id?: string;
    _id?: string;
    label: string;
    skills: Skill[];
  }>;
}): SkillCategory[] {
  return data.categories.map((category) => ({
    id: category.id ?? category._id ?? "",
    label: category.label,
    skills: category.skills,
  }));
}

let store: SkillCategory[] = JSON.parse(JSON.stringify(DEMO_SKILLS));

// ── GET all categories ─────────────────────────────────────
// export async function dashboardGetSkills(): Promise<SkillCategory[]> {
//   try {
//     const response = await fetch(API_BASE_URL);

//     if (!response.ok) {
//       throw new Error();
//     }

//     const json = await response.json();

//     const normalizedSkills = normalizeSkills(json);

//     return JSON.parse(JSON.stringify(normalizedSkills));
//   } catch {
//     return JSON.parse(JSON.stringify(store));
//   }
// }

export async function dashboardGetSkills(): Promise<SkillCategory[]> {
  try {
    const response = await fetch(API_BASE_URL, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Skills API failed: ${response.status}`);
    }

    const json = await response.json();

    const normalizedSkills = normalizeSkills(json);

    return normalizedSkills;
  } catch (error) {
    console.error("Failed to fetch skills:", error);

    return [];
  }
}

// ── CREATE category ────────────────────────────────────────
export async function dashboardCreateCategory(
  data: Omit<SkillCategory, "skills">,
): Promise<SkillCategory> {
  const response = await fetch(`${API_BASE_URL}/categories`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      label: data.label,
    }),
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.message || "Failed to create category");
  }

  const created: SkillCategory = {
    id: json.category.id ?? json.category._id,
    label: json.category.label,
    skills: json.category.skills ?? [],
  };

  store.push(created);

  return created;
}

// ── UPDATE category ────────────────────────────────────────
export async function dashboardUpdateCategory(
  id: string,
  data: Partial<Omit<SkillCategory, "skills">>,
): Promise<SkillCategory | null> {
  const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to update.");
  }

  const json = await response.json();

  const updated: SkillCategory = {
    id: json.category.id ?? json.category._id,
    label: json.category.label,
    skills: json.category.skills,
  };

  store = store.map((c) => (c.id === id ? updated : c));

  return updated;
}

// ── DELETE category ────────────────────────────────────────
export async function dashboardDeleteCategory(id: string): Promise<boolean> {
  const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Delete failed.");
  }

  store = store.filter((c) => c.id !== id);

  return true;
}

// ── CREATE skill inside category ───────────────────────────
// export async function dashboardCreateSkill(
//   categoryId: string,
//   data: {
//     name: string;
//     icon?: string;
//     file?: File;
//   },
// ): Promise<SkillCategory | null> {
//   const formData = new FormData();

//   formData.append("name", data.name);

//   if (data.file) {
//     formData.append("icon", data.file);
//   } else if (data.icon) {
//     formData.append("icon", data.icon);
//   }

//   const response = await fetch(
//     `${API_BASE_URL}/categories/${categoryId}/skills`,
//     {
//       method: "POST",
//       body: formData,
//     },
//   );

//   if (!response.ok) {
//     throw new Error("Create failed.");
//   }

//   const json = await response.json();

//   const updated: SkillCategory = {
//     id: json.category.id ?? json.category._id,
//     label: json.category.label,
//     skills: json.category.skills,
//   };

//   store = store.map((c) => (c.id === categoryId ? updated : c));

//   return updated;
// }
export async function dashboardCreateSkill(
  categoryId: string,
  data: SkillFormData,
): Promise<SkillCategory | null> {
  const formData = new FormData();

  formData.append("name", data.name);

  if (data.file) {
    formData.append("icon", data.file);
  } else if (data.icon) {
    formData.append("icon", data.icon);
  }

  const response = await fetch(
    `${API_BASE_URL}/categories/${categoryId}/skills`,
    {
      method: "POST",
      body: formData,
    },
  );

  if (!response.ok) {
    throw new Error("Create failed.");
  }

  const json = await response.json();

  const updated: SkillCategory = {
    id: json.category.id ?? json.category._id,
    label: json.category.label,
    skills: json.category.skills,
  };

  store = store.map((c) => (c.id === categoryId ? updated : c));

  return updated;
}
// ── UPDATE skill inside category ───────────────────────────
export async function dashboardUpdateSkill(
  categoryId: string,
  skillName: string,
  data: SkillFormData,
): Promise<{
  source: SkillCategory;
  destination: SkillCategory;
} | null> {
  const formData = new FormData();

  formData.append("name", data.name);
  if (data.targetCategoryId) {
    formData.append("targetCategoryId", data.targetCategoryId);
  }

  if (data.file) {
    formData.append("icon", data.file);
  } else if (data.icon) {
    formData.append("icon", data.icon);
  }

  const response = await fetch(
    `${API_BASE_URL}/categories/${categoryId}/skills/${encodeURIComponent(skillName)}`,
    {
      method: "PUT",
      body: formData,
    },
  );

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.message || "Update failed.");
  }

  // Move হয়েছে
  if (json.sourceCategory && json.destinationCategory) {
    const source: SkillCategory = {
      id: json.sourceCategory.id ?? json.sourceCategory._id,
      label: json.sourceCategory.label,
      skills: json.sourceCategory.skills,
    };

    const destination: SkillCategory = {
      id: json.destinationCategory.id ?? json.destinationCategory._id,
      label: json.destinationCategory.label,
      skills: json.destinationCategory.skills,
    };

    store = store.map((c) => {
      if (c.id === source.id) return source;
      if (c.id === destination.id) return destination;
      return c;
    });

    return {
      source,
      destination,
    };
  }

  // Same category update
  const category: SkillCategory = {
    id: json.category.id ?? json.category._id,
    label: json.category.label,
    skills: json.category.skills,
  };

  store = store.map((c) => (c.id === category.id ? category : c));

  return {
    source: category,
    destination: category,
  };
}

// ── DELETE skill inside category ───────────────────────────
export async function dashboardDeleteSkill(
  categoryId: string,
  skillName: string,
): Promise<boolean> {
  const response = await fetch(
    `${API_BASE_URL}/categories/${categoryId}/skills/${encodeURIComponent(skillName)}`,
    {
      method: "DELETE",
    },
  );

  if (!response.ok) {
    throw new Error("Delete failed.");
  }

  store = store.map((category) => {
    if (category.id !== categoryId) {
      return category;
    }

    return {
      ...category,
      skills: category.skills.filter((skill) => skill.name !== skillName),
    };
  });

  return true;
}
