"use client";

import { toast } from "sonner";
import { useState } from "react";
import { User, Briefcase, GraduationCap, Heart } from "lucide-react";
import {
  AboutData,
  Experience,
  Education,
  Value,
  AboutHero,
} from "@/lib/types/about";
import { HeroModal } from "./HeroModal";
import { ExperienceModal } from "./ExperienceModal";
import { EducationModal } from "./EducationModal";
import { ValueModal } from "./ValueModal";
import { ConfirmDeleteModal } from "@/app/components/dashboard/ConfirmDeleteModal";
import { ExperienceDrawer } from "./ExperienceDrawer";
import { EducationDrawer } from "./EducationDrawer";
import { ValueDrawer } from "./ValueDrawer";
import { AboutHeroCard } from "./AboutHeroCard";
import { ExperienceTable } from "./ExperienceTable";
import { EducationTable } from "./EducationTable";
import { ValueTable } from "./ValueTable";
import {
  dashboardUpdateHero,
  dashboardCreateExperience,
  dashboardUpdateExperience,
  dashboardDeleteExperience,
  dashboardCreateEducation,
  dashboardUpdateEducation,
  dashboardDeleteEducation,
  dashboardCreateValue,
  dashboardUpdateValue,
  dashboardDeleteValue,
} from "@/lib/services/about.service";

// ── Stat card ─────────────────────────────────────────────────
function StatCard({
  label,
  value,
  color,
  icon: Icon,
}: {
  label: string;
  value: number | string;
  color: string;
  icon: React.ElementType;
}) {
  return (
    <div
      className="flex flex-col gap-3 p-4 rounded-2xl
                    bg-white dark:bg-zinc-900
                    border border-zinc-200 dark:border-zinc-800"
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: `${color}18` }}
      >
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <div>
        <p className="text-2xl font-bold text-zinc-900 dark:text-white">
          {value}
        </p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
          {label}
        </p>
      </div>
    </div>
  );
}

export function AboutCMS({ initial }: { initial: AboutData | null }) {
  const [hero, setHero] = useState<AboutHero>(
    initial?.hero ?? {
      name: "",
      title: "",
      subtitle: "",
      bio: [],
      image: null,
      resumeUrl: "",
      location: "",
      experience: "",
    },
  );
  const [experiences, setExperiences] = useState(initial?.experiences ?? []);
  const [educations, setEducations] = useState(initial?.educations ?? []);
  const [values, setValues] = useState(initial?.values ?? []);

  // ── Modal state ───────────────────────────────────────────
  const [showHeroModal, setShowHeroModal] = useState(false);
  const [showExpModal, setShowExpModal] = useState(false);
  const [showEduModal, setShowEduModal] = useState(false);
  const [showValModal, setShowValModal] = useState(false);
  const [editExp, setEditExp] = useState<Experience | null>(null);
  const [editEdu, setEditEdu] = useState<Education | null>(null);
  const [editVal, setEditVal] = useState<Value | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "exp" | "edu" | "val";
    id: string;
    label: string;
  } | null>(null);

  // ── Drawer state ──────────────────────────────────────────
  const [drawerExp, setDrawerExp] = useState<Experience | null>(null);
  const [drawerEdu, setDrawerEdu] = useState<Education | null>(null);
  const [drawerVal, setDrawerVal] = useState<Value | null>(null);

  // ── Hero ──────────────────────────────────────────────────


  const handleSaveHero = async (
    values: Partial<AboutHero> & {
      imageFile?: File | null;
      resumeFile?: File | null;
    },
  ) => {
    try {
      const formData = new FormData();

      if (values.name) formData.append("name", values.name);
      if (values.title) formData.append("title", values.title);
      if (values.subtitle) formData.append("subtitle", values.subtitle);
      if (values.location) formData.append("location", values.location);
      if (values.experience) formData.append("experience", values.experience);
      if (values.resumeFile) {
        formData.append("resume", values.resumeFile);
      } else if (values.resumeUrl) {
        formData.append("resumeUrl", values.resumeUrl);
      }
      if (values.bio) formData.append("bio", JSON.stringify(values.bio));

      if (values.imageFile) {
        formData.append("image", values.imageFile);
      } else if (values.image) {
        formData.append("image", values.image);
      }

      const updatedHero = await dashboardUpdateHero(formData);
      setHero(updatedHero);
      setShowHeroModal(false);
      toast.success("Hero section updated successfully");
    } catch (error: unknown) {
      const errMessage =
        error instanceof Error ? error.message : "Failed to update hero";
      console.error("Error updating hero:", error);
      toast.error(errMessage);
    }
  };
  // ── Experience CRUD ───────────────────────────────────────
  async function handleSaveExp(data: Omit<Experience, "_id">) {
    if (editExp) {
      const updated = await dashboardUpdateExperience(editExp._id, data);
      if (updated)
        setExperiences((prev) =>
          prev.map((e) => (e._id === editExp._id ? updated : e)),
        );
      toast.success("Experience updated");
    } else {
      const created = await dashboardCreateExperience(data);
      setExperiences((prev) => [created, ...prev]);
      toast.success("Experience added");
    }
    setShowExpModal(false);
    setEditExp(null);
  }

  // ── Education CRUD ────────────────────────────────────────
  async function handleSaveEdu(data: Omit<Education, "_id">) {
    if (editEdu) {
      const updated = await dashboardUpdateEducation(editEdu._id, data);
      if (updated)
        setEducations((prev) =>
          prev.map((e) => (e._id === editEdu._id ? updated : e)),
        );
      toast.success("Education updated");
    } else {
      const created = await dashboardCreateEducation(data);
      setEducations((prev) => [created, ...prev]);
      toast.success("Education added");
    }
    setShowEduModal(false);
    setEditEdu(null);
  }

  // ── Values CRUD ───────────────────────────────────────────
  async function handleSaveVal(data: Omit<Value, "_id">) {
    if (editVal) {
      const updated = await dashboardUpdateValue(editVal._id, data);
      if (updated)
        setValues((prev) =>
          prev.map((v) => (v._id === editVal._id ? updated : v)),
        );
      toast.success("Value updated");
    } else {
      const created = await dashboardCreateValue(data);
      setValues((prev) => [...prev, created]);
      toast.success("Value added");
    }
    setShowValModal(false);
    setEditVal(null);
  }

  // ── Delete ────────────────────────────────────────────────
  async function handleDelete() {
    if (!deleteTarget) return;
    if (deleteTarget.type === "exp") {
      await dashboardDeleteExperience(deleteTarget.id);
      setExperiences((prev) =>
        prev.filter((e) => e._id?.toString() !== deleteTarget.id),
      );
      toast.success("Experience deleted");
    } else if (deleteTarget.type === "edu") {
      await dashboardDeleteEducation(deleteTarget.id);
      setEducations(
        (prev) => prev.filter((e) => e._id?.toString() !== deleteTarget.id), // ✅ fixed
      );
      toast.success("Education deleted");
    } else {
      await dashboardDeleteValue(deleteTarget.id);
      setValues((prev) =>
        prev.filter((v) => v._id?.toString() !== deleteTarget.id),
      );
      toast.success("Value deleted");
    }
    setDeleteTarget(null);
  }

  // ── Drawer edit handlers ──────────────────────────────────
  function handleDrawerEditExp(exp: Experience) {
    setDrawerExp(null);
    setEditExp(exp);
    setShowExpModal(true);
  }

  function handleDrawerEditEdu(edu: Education) {
    setDrawerEdu(null);
    setEditEdu(edu);
    setShowEduModal(true);
  }

  function handleDrawerEditVal(val: Value) {
    setDrawerVal(null);
    setEditVal(val);
    setShowValModal(true);
  }

  // ── Drawer delete handlers ────────────────────────────────
  function handleDrawerDeleteExp(exp: Experience) {
    setDrawerExp(null);
    setDeleteTarget({
      type: "exp",
      id: exp._id?.toString(),
      label: exp.role,
    });
  }

  function handleDrawerDeleteEdu(edu: Education) {
    setDrawerEdu(null);
    setDeleteTarget({
      type: "edu",
      id: edu._id?.toString(),
      label: edu.degree,
    });
  }

  function handleDrawerDeleteVal(val: Value) {
    setDrawerVal(null);
    setDeleteTarget({
      type: "val",
      id: val._id?.toString(),
      label: val.title,
    });
  }

  return (
    <>
      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label="Experiences"
          value={experiences.length}
          color="#6366f1"
          icon={Briefcase}
        />
        <StatCard
          label="Education"
          value={educations.length}
          color="#10b981"
          icon={GraduationCap}
        />
        <StatCard
          label="Values"
          value={values.length}
          color="#f59e0b"
          icon={Heart}
        />
        <StatCard
          label="Profile"
          value={hero.image ? "✓ Set" : "No image"}
          color="#8b5cf6"
          icon={User}
        />
      </div>

      <AboutHeroCard hero={hero} onEdit={() => setShowHeroModal(true)} />

      <ExperienceTable
        items={experiences}
        onAdd={() => {
          setEditExp(null);
          setShowExpModal(true);
        }}
        onOpen={setDrawerExp}
        onEdit={(exp) => {
          setEditExp(exp);
          setShowExpModal(true);
        }}
        onDelete={(exp) =>
          setDeleteTarget({ type: "exp", id: exp._id?.toString(), label: exp.role })
        }
      />

      <EducationTable
        items={educations}
        onAdd={() => {
          setEditEdu(null);
          setShowEduModal(true);
        }}
        onOpen={setDrawerEdu}
        onEdit={(edu) => {
          setEditEdu(edu);
          setShowEduModal(true);
        }}
        onDelete={(edu) =>
          setDeleteTarget({ type: "edu", id: edu._id?.toString(), label: edu.degree })
        }
      />

      <ValueTable
        items={values}
        onAdd={() => {
          setEditVal(null);
          setShowValModal(true);
        }}
        onOpen={setDrawerVal}
        onEdit={(val) => {
          setEditVal(val);
          setShowValModal(true);
        }}
        onDelete={(val) =>
          setDeleteTarget({ type: "val", id: val._id?.toString(), label: val.title })
        }
      />

      {/* ── Detail drawers ── */}
      <ExperienceDrawer
        experience={drawerExp}
        onClose={() => setDrawerExp(null)}
        onEdit={handleDrawerEditExp}
        onDelete={handleDrawerDeleteExp}
      />

      <EducationDrawer
        education={drawerEdu}
        onClose={() => setDrawerEdu(null)}
        onEdit={handleDrawerEditEdu}
        onDelete={handleDrawerDeleteEdu}
      />

      <ValueDrawer
        value={drawerVal}
        onClose={() => setDrawerVal(null)}
        onEdit={handleDrawerEditVal}
        onDelete={handleDrawerDeleteVal}
      />

      {/* ── Modals ── */}
      {showHeroModal && (
        <HeroModal
          hero={hero}
          onSave={handleSaveHero}
          onCancel={() => setShowHeroModal(false)}
        />
      )}

      {showExpModal && (
        <ExperienceModal
          key={editExp?._id ?? "new-exp"}
          experience={editExp}
          onSave={handleSaveExp}
          onCancel={() => {
            setShowExpModal(false);
            setEditExp(null);
          }}
        />
      )}

      {showEduModal && (
        <EducationModal
          key={editEdu?._id ?? "new-edu"}
          education={editEdu}
          onSave={handleSaveEdu}
          onCancel={() => {
            setShowEduModal(false);
            setEditEdu(null);
          }}
        />
      )}

      {showValModal && (
        <ValueModal
          key={editVal?._id ?? "new-val"}
          value={editVal}
          onSave={handleSaveVal}
          onCancel={() => {
            setShowValModal(false);
            setEditVal(null);
          }}
        />
      )}

      {deleteTarget && (
        <ConfirmDeleteModal
          title={`Delete ${deleteTarget.type === "exp" ? "experience" : deleteTarget.type === "edu" ? "education" : "value"}?`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        >
          You are about to delete &quot;{deleteTarget.label}&quot;. This cannot be undone.
        </ConfirmDeleteModal>
      )}
    </>
  );
}
