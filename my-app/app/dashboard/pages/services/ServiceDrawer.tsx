"use client";
import { useEffect } from "react";
import { useCurrentUser } from "@/app/components/dashboard/useCurrentUser";
import {
  X,
  Star,
  Sparkles,
  Tag,
  Palette,
  Layers,
  ListChecks,
  Code2,
  Monitor,
  Server,
  Database,
  Webhook,
  Globe,
  Smartphone,
  Shield,
  Zap,
  Cloud,
  Lock,
} from "lucide-react";
import { Service } from "@/lib/types/services";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, React.ElementType> = {
  Monitor,
  Server,
  Layers,
  Database,
  Webhook,
  Code2,
  Globe,
  Smartphone,
  Shield,
  Zap,
  Cloud,
  Lock,
};

interface Props {
  service: Service | null;
  onClose: () => void;
  onEdit: (service: Service) => void;
  onDelete: (service: Service) => void;
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

export function ServiceDrawer({ service, onClose, onEdit, onDelete }: Props) {
  const { canDelete } = useCurrentUser();
  const isOpen = !!service;
  const Icon = ICON_MAP[service?.icon ?? ""] ?? Code2;

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
        {!service ? null : (
          <>
            {/* ── Header / icon banner ── */}
            <div
              className="relative w-full h-40 shrink-0
                            flex items-center justify-center overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${service.color}20, ${service.color}05)`,
              }}
            >
              <div
                className="w-20 h-20 rounded-3xl flex items-center justify-center"
                style={{ backgroundColor: `${service.color}25` }}
              >
                <Icon className="w-10 h-10" style={{ color: service.color }} />
              </div>

              {/* Color accent bar */}
              <div
                className="absolute bottom-0 left-0 right-0 h-1"
                style={{ backgroundColor: service.color }}
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

              {/* Popular badge */}
              {service.popular && (
                <div
                  className="absolute top-3 left-3
                                flex items-center gap-1.5 px-3 py-1
                                rounded-full bg-indigo-600 text-white
                                text-xs font-semibold shadow-sm"
                >
                  <Sparkles className="w-3 h-3" />
                  Popular
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
                    style={{ backgroundColor: service.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <h2
                      className="text-xl font-bold
                                   text-zinc-900 dark:text-white
                                   leading-snug mb-2"
                    >
                      {service.title}
                    </h2>
                    {service.popular && (
                      <span
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg
                                       text-xs font-semibold
                                       bg-indigo-50 dark:bg-indigo-950
                                       text-indigo-600 dark:text-indigo-400
                                       border border-indigo-200 dark:border-indigo-800"
                      >
                        <Sparkles className="w-3 h-3" />
                        Popular
                      </span>
                    )}
                  </div>
                </div>

                <p
                  className="mt-4 text-sm text-zinc-500 dark:text-zinc-400
                               leading-relaxed"
                >
                  {service.description}
                </p>
              </div>

              {/* Details */}
              <div className="px-6 py-2">
                <DetailRow icon={ListChecks} label={`Features (${service.features.length})`}>
                  {service.features.length === 0 ? (
                    <span className="text-zinc-400">No features listed</span>
                  ) : (
                    <ul className="flex flex-col gap-1.5 mt-1">
                      {service.features.map((f, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2
                                     text-zinc-600 dark:text-zinc-400"
                        >
                          <span
                            className="w-4 h-4 rounded-full shrink-0 mt-0.5
                                           flex items-center justify-center"
                            style={{ backgroundColor: `${service.color}20` }}
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: service.color }}
                            />
                          </span>
                          {f.text}
                        </li>
                      ))}
                    </ul>
                  )}
                </DetailRow>

                <DetailRow icon={Tag} label="Tags">
                  {service.tags.length === 0 ? (
                    <span className="text-zinc-400">No tags</span>
                  ) : (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {service.tags.map((tag) => (
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

                <DetailRow icon={Code2} label="Icon">
                  <span className="flex items-center gap-2">
                    <Icon className="w-4 h-4" style={{ color: service.color }} />
                    {service.icon}
                  </span>
                </DetailRow>

                <DetailRow icon={Palette} label="Accent Color">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-5 h-5 rounded-full border border-zinc-200
                                    dark:border-zinc-700"
                      style={{ backgroundColor: service.color }}
                    />
                    <span className="font-mono text-xs text-zinc-500">
                      {service.color}
                    </span>
                  </div>
                </DetailRow>

                <DetailRow icon={Star} label="Popular">
                  <span
                    className={
                      service.popular
                        ? "text-indigo-600 dark:text-indigo-400 font-medium"
                        : "text-zinc-400"
                    }
                  >
                    {service.popular
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
                  onClick={() => onDelete(service)}
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
                onClick={() => onEdit(service)}
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
