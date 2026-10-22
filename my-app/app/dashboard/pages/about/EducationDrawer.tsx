"use client";
import { useEffect } from "react";
import { useCurrentUser } from "@/app/components/dashboard/useCurrentUser";
import {
  X,
  GraduationCap,
  School,
  CalendarClock,
  Award,
  AlignLeft,
} from "lucide-react";
import { Education } from "@/lib/types/about";
import { cn } from "@/lib/utils";

const ACCENT = "#10b981";

interface Props {
  education: Education | null;
  onClose: () => void;
  onEdit: (education: Education) => void;
  onDelete: (education: Education) => void;
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

export function EducationDrawer({
  education,
  onClose,
  onEdit,
  onDelete,
}: Props) {
  const { canDelete } = useCurrentUser();
  const isOpen = !!education;

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
        {!education ? null : (
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
                <GraduationCap className="w-10 h-10" style={{ color: ACCENT }} />
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

              {/* Grade badge */}
              {education.grade && (
                <div
                  className="absolute top-3 left-3
                             flex items-center gap-1.5 px-3 py-1
                             rounded-full bg-emerald-600 text-white
                             text-xs font-semibold shadow-sm"
                >
                  <Award className="w-3 h-3" />
                  {education.grade}
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
                      {education.degree}
                    </h2>
                    <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                      {education.school}
                    </p>
                  </div>
                </div>

                {education.period && (
                  <span
                    className="mt-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg
                               text-xs font-medium
                               bg-zinc-100 dark:bg-zinc-800
                               text-zinc-600 dark:text-zinc-400"
                  >
                    <CalendarClock className="w-3 h-3" />
                    {education.period}
                  </span>
                )}
              </div>

              {/* Details */}
              <div className="px-6 py-2">
                <DetailRow icon={School} label="School / Platform">
                  {education.school}
                </DetailRow>

                <DetailRow icon={CalendarClock} label="Period">
                  {education.period || (
                    <span className="text-zinc-400">Not set</span>
                  )}
                </DetailRow>

                <DetailRow icon={Award} label="Grade / Result">
                  {education.grade || (
                    <span className="text-zinc-400">Not set</span>
                  )}
                </DetailRow>

                <DetailRow icon={AlignLeft} label="Description">
                  {education.description ? (
                    <span className="leading-relaxed whitespace-pre-line">
                      {education.description}
                    </span>
                  ) : (
                    <span className="text-zinc-400">No description</span>
                  )}
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
                  onClick={() => onDelete(education)}
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
              <button
                onClick={() => onEdit(education)}
                className="flex items-center justify-center gap-2
                           flex-1 py-2.5 rounded-xl text-sm font-medium
                           bg-indigo-600 hover:bg-indigo-700
                           text-white transition-colors"
              >
                Edit
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
