"use client";
import { useEffect } from "react";
import { useCurrentUser } from "@/app/components/dashboard/useCurrentUser";
import {
  X,
  Briefcase,
  Building2,
  Tags,
  AlignLeft,
  CalendarClock,
  Radio,
} from "lucide-react";
import { Experience } from "@/lib/types/about";
import { cn } from "@/lib/utils";

const ACCENT = "#6366f1";

interface Props {
  experience: Experience | null;
  onClose: () => void;
  onEdit: (experience: Experience) => void;
  onDelete: (experience: Experience) => void;
}

function DetailRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex items-start gap-3 py-3
                    border-b border-zinc-100 dark:border-zinc-800
                    last:border-0"
    >
      <div
        className="w-8 h-8 rounded-lg shrink-0
                      bg-zinc-100 dark:bg-zinc-800
                      flex items-center justify-center mt-0.5"
      >
        <Icon className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
      </div>
      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
        <span
          className="text-xs font-semibold uppercase tracking-wider
                         text-zinc-400 dark:text-zinc-500"
        >
          {label}
        </span>
        <div className="text-sm text-zinc-900 dark:text-white">{children}</div>
      </div>
    </div>
  );
}

export function ExperienceDrawer({
  experience,
  onClose,
  onEdit,
  onDelete,
}: Props) {
  const { can } = useCurrentUser();
  const canDelete = can("about.delete");
  const isOpen = !!experience;

  // ✅ Close on Escape key
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // ✅ Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-40 bg-zinc-950/40 backdrop-blur-sm",
          "transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
      />

      {/* ── Drawer panel ── */}
      <div
        className={cn(
          "fixed top-0 right-0 z-50 h-full w-full sm:w-lg",
          "bg-white dark:bg-zinc-900",
          "border-l border-zinc-200 dark:border-zinc-800",
          "shadow-2xl shadow-zinc-900/20",
          "flex flex-col",
          "transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        {!experience ? null : (
          <>
            {/* ── Header / icon banner ── */}
            <div
              className="relative w-full h-40 shrink-0
                         flex items-center justify-center overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${ACCENT}20, ${ACCENT}05)`,
              }}
            >
              <div
                className="w-20 h-20 rounded-3xl flex items-center justify-center"
                style={{ backgroundColor: `${ACCENT}25` }}
              >
                <Briefcase className="w-10 h-10" style={{ color: ACCENT }} />
              </div>

              {/* Color accent bar */}
              <div
                className="absolute bottom-0 left-0 right-0 h-1"
                style={{ backgroundColor: ACCENT }}
              />

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-3 right-3
                           w-8 h-8 rounded-full
                           bg-white/90 dark:bg-zinc-900/90
                           flex items-center justify-center
                           text-zinc-600 dark:text-zinc-400
                           hover:text-zinc-900 dark:hover:text-white
                           transition-colors shadow-sm"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Current badge */}
              {experience.current && (
                <div
                  className="absolute top-3 left-3
                             flex items-center gap-1.5 px-3 py-1
                             rounded-full bg-indigo-600 text-white
                             text-xs font-semibold shadow-sm"
                >
                  <Radio className="w-3 h-3" />
                  Current
                </div>
              )}
            </div>

            {/* ── Scrollable content ── */}
            <div className="flex-1 overflow-y-auto">
              {/* Header */}
              <div className="p-6 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-start gap-3">
                  <div
                    className="w-3 h-3 rounded-full mt-1.5 shrink-0"
                    style={{ backgroundColor: ACCENT }}
                  />
                  <div className="flex-1 min-w-0">
                    <h2
                      className="text-xl font-bold
                                 text-zinc-900 dark:text-white
                                 leading-snug mb-1"
                    >
                      {experience.role}
                    </h2>
                    <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">
                      {experience.company}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {experience.period && (
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg
                                 text-xs font-medium
                                 bg-zinc-100 dark:bg-zinc-800
                                 text-zinc-600 dark:text-zinc-400"
                    >
                      <CalendarClock className="w-3 h-3" />
                      {experience.period}
                    </span>
                  )}
                  {experience.type && (
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg
                                 text-xs font-medium
                                 bg-zinc-100 dark:bg-zinc-800
                                 text-zinc-600 dark:text-zinc-400"
                    >
                      {experience.type}
                    </span>
                  )}
                </div>
              </div>

              {/* Details */}
              <div className="px-6 py-2">
                <DetailRow icon={Building2} label="Company">
                  {experience.company}
                </DetailRow>

                <DetailRow icon={Briefcase} label="Type">
                  {experience.type || (
                    <span className="text-zinc-400">Not set</span>
                  )}
                </DetailRow>

                <DetailRow icon={CalendarClock} label="Period">
                  {experience.period || (
                    <span className="text-zinc-400">Not set</span>
                  )}
                </DetailRow>

                <DetailRow icon={AlignLeft} label="Description">
                  {experience.description ? (
                    <span className="leading-relaxed whitespace-pre-line">
                      {experience.description}
                    </span>
                  ) : (
                    <span className="text-zinc-400">No description</span>
                  )}
                </DetailRow>

                <DetailRow icon={Tags} label="Tags">
                  {experience.tags.length === 0 ? (
                    <span className="text-zinc-400">No tags</span>
                  ) : (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {experience.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium
                                     bg-zinc-100 dark:bg-zinc-800
                                     text-zinc-600 dark:text-zinc-400"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </DetailRow>

                <DetailRow icon={Radio} label="Current">
                  <span
                    className={
                      experience.current
                        ? "text-indigo-600 dark:text-indigo-400 font-medium"
                        : "text-zinc-400"
                    }
                  >
                    {experience.current
                      ? "Yes — shown on public page"
                      : "No"}
                  </span>
                </DetailRow>
              </div>
            </div>

            {/* ── Action footer ── */}
            <div
              className="shrink-0 p-4
                         border-t border-zinc-100 dark:border-zinc-800
                         bg-zinc-50 dark:bg-zinc-800/50
                         flex gap-3"
            >
              {canDelete && (
                <button
                  onClick={() => onDelete(experience)}
                  className="flex items-center justify-center gap-2
                             flex-1 py-2.5 rounded-xl text-sm font-medium
                             border border-red-200 dark:border-red-900
                             text-red-600 dark:text-red-400
                             hover:bg-red-50 dark:hover:bg-red-950
                             transition-colors"
                >
                  <X className="w-4 h-4" />
                  Delete
                </button>
              )}
              {can("about.edit") && (
              <button
                onClick={() => onEdit(experience)}
                className="flex items-center justify-center gap-2
                           flex-1 py-2.5 rounded-xl text-sm font-medium
                           bg-indigo-600 hover:bg-indigo-700
                           text-white transition-colors"
              >
                Edit
              </button>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
