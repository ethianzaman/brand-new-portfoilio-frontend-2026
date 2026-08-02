export interface Skill {
  name: string;
  icon: string; // image path or url
}

export interface SkillCategory {
  id: string;
  label: string;
  skills: Skill[];
}

export interface SkillFormData {
  name: string;
  icon?: string;
  file?: File | null;
  targetCategoryId?: string;
}
