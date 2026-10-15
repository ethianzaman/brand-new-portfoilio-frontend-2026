"use client";
import { useState, useRef } from "react";
import { X, Loader2, Save, ImageIcon, Upload, ChevronDown } from "lucide-react";
import { Skill, SkillCategory, SkillFormData } from "@/lib/types/skill";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface Props {
  skill?: Skill | null;
  categoryId: string;
  categories: SkillCategory[];

  onSave: (
    categoryId: string,
    data: SkillFormData,
    oldName?: string,
  ) => Promise<void>;

  onCancel: () => void;
}
const inputCls = cn(
  "w-full px-4 py-2.5 rounded-xl text-sm",
  "bg-zinc-50 dark:bg-zinc-800",
  "border border-zinc-200 dark:border-zinc-700",
  "text-zinc-900 dark:text-white",
  "placeholder:text-zinc-400",
  "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent",
  "transition-colors",
);

const labelCls =
  "text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wide";

export function SkillFormModal({
  skill,
  categoryId,
  categories,
  onSave,
  onCancel,
}: Props) {
  const isEdit = !!skill;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(skill?.name ?? "");
  const [icon, setIcon] = useState(skill?.icon ?? "");
  // const [selCatId, setSelCatId] = useState(categoryId);
  const [selCatId, setSelCatId] = useState(categoryId || "");
  const [iconError, setIconError] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  // New State: Toggle between 'url' and 'upload'
  const [uploadMode, setUploadMode] = useState<"url" | "upload">(
    skill?.icon?.startsWith("data:") ? "upload" : "url",
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];

    if (!selected) return;

    setFile(selected);

    // preview
    setIcon(URL.createObjectURL(selected));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    console.log("categoryId prop =", categoryId);
    console.log("selCatId =", selCatId);
    console.log("isEdit =", isEdit);
    if (!name.trim() || !icon.trim()) return;
    setLoading(true);
    await onSave(
      categoryId, // original category
      {
        name: name.trim(),
        icon: uploadMode === "url" ? icon.trim() : undefined,
        file,
        targetCategoryId: selCatId,
      },
      isEdit ? skill?.name : undefined,
    );
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-md my-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden">
        {/* Header - Keep same as original */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-white">
              {isEdit ? "Edit Skill" : "Add New Skill"}
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Category *</label>

              <div className="relative">
                <select
                  value={selCatId}
                  onChange={(e) => setSelCatId(e.target.value)}
                  className={cn(inputCls, "appearance-none pr-12")}
                  required
                >
                  <option value="">Select Category</option>

                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2
                 h-4 w-4 text-zinc-500"
                />
              </div>
            </div>

            {/* Category & Name */}
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Skill Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputCls}
                required
              />
            </div>

            {/* Hybrid Icon Section */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <label className={labelCls}>Skill Icon *</label>
                <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setUploadMode("url")}
                    className={cn(
                      "px-2 py-1 text-[10px] font-bold rounded-md transition-all",
                      uploadMode === "url"
                        ? "bg-white dark:bg-zinc-700 shadow-sm text-indigo-600"
                        : "text-zinc-500",
                    )}
                  >
                    URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadMode("upload")}
                    className={cn(
                      "px-2 py-1 text-[10px] font-bold rounded-md transition-all",
                      uploadMode === "upload"
                        ? "bg-white dark:bg-zinc-700 shadow-sm text-indigo-600"
                        : "text-zinc-500",
                    )}
                  >
                    UPLOAD
                  </button>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <div className="flex-1">
                  {uploadMode === "url" ? (
                    <input
                      type="text"
                      placeholder="https://cdn.jsdelivr.net/..."
                      value={icon}
                      onChange={(e) => {
                        setIcon(e.target.value);
                        setIconError(false);
                      }}
                      className={inputCls}
                    />
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="group cursor-pointer w-full px-4 py-2 border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-xl flex items-center justify-center gap-2 hover:border-indigo-500 transition-colors bg-zinc-50 dark:bg-zinc-800/50"
                    >
                      <Upload className="w-4 h-4 text-zinc-400 group-hover:text-indigo-500" />
                      <span className="text-xs text-zinc-500 group-hover:text-indigo-500 font-medium">
                        Choose Local Image
                      </span>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                      />
                    </div>
                  )}
                </div>

                {/* Preview Box */}
                <div className="w-12 h-12 rounded-xl shrink-0 border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden relative">
                  {icon && !iconError ? (
                    <Image
                      src={icon}
                      alt={name}
                      fill // This makes it fill the container
                      className="object-contain p-2"
                      onError={() => setIconError(true)}
                      unoptimized // Important: Since icons are small SVGs/Base64, we don't need Next.js to resize them
                    />
                  ) : (
                    <ImageIcon className="w-5 h-5 text-zinc-400" />
                  )}
                </div>
              </div>

              {uploadMode === "url" && (
                <p className="text-[10px] text-zinc-400">
                  Recommended: Use SVG links for better quality.
                </p>
              )}
            </div>
          </div>

          {/* Footer - Keep same as your original */}
          <div className="flex gap-3 p-6 pt-0">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 text-white"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isEdit ? "Update" : "Add Skill"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
