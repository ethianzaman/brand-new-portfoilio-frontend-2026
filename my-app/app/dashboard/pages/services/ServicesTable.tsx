"use client";
import { useMemo, useState } from "react";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCurrentUser } from "@/app/components/dashboard/useCurrentUser";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Star,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  Sparkles,
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
  Check,
  AlertCircle,
  RotateCcw,
  X,
} from "lucide-react";
import { Service } from "@/lib/types/services";
import { ServiceFormModal } from "./ServiceFormModal";
import { ServiceDeleteModal } from "./ServiceDeleteModal";
import { ServiceDrawer } from "./ServiceDrawer";
import {
  dashboardCreateService,
  dashboardUpdateService,
  dashboardDeleteService,
  dashboardGetServices,
  dashboardGetServiceStats,
  type ServiceStats,
} from "@/lib/services/service.services";
import { cn } from "@/lib/utils";
import { Pagination } from "@/app/components/dashboard/Pagination";
import {
  DASHBOARD_PAGE_SIZE,
  DASHBOARD_PAGE_SIZES,
} from "@/lib/constants/pagination";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";

// ── Icon map ──────────────────────────────────────────────────
const ICON_MAP: Record<string, React.ElementType> = {
  Plus,
  Pencil,
  Trash2,
  Search,
  Star,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  Sparkles,
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

// ── Stats card ────────────────────────────────────────────────
function StatCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: number;
  sub?: string;
  color: string;
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
        <Layers className="w-4 h-4" style={{ color }} />
      </div>
      <div>
        <p className="text-2xl font-bold text-zinc-900 dark:text-white">
          {value}
        </p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
          {label}
        </p>
        {sub && (
          <p className="text-xs text-zinc-400 dark:text-zinc-500">{sub}</p>
        )}
      </div>
    </div>
  );
}

// ── Service row card ──────────────────────────────────────────
function ServiceRow({
  service,
  onOpen,
  onEdit,
  onDelete,
  canDelete,
}: {
  service: Service;
  onOpen: (s: Service) => void;
  onEdit: (s: Service) => void;
  onDelete: (s: Service) => void;
  canDelete: boolean;
}) {
  const Icon = ICON_MAP[service.icon] ?? Code2;

  return (
    <div
      className={cn(
        "bg-white dark:bg-zinc-900",
        "border border-zinc-200 dark:border-zinc-800",
        "rounded-2xl overflow-hidden",
        "transition-all duration-200",
        "hover:border-zinc-300 dark:hover:border-zinc-700",
      )}
    >
      {/* ── Row header ── */}
      <div
        onClick={() => onOpen(service)}
        className="flex items-center gap-4 px-5 py-4 cursor-pointer
                   hover:bg-zinc-50 dark:hover:bg-zinc-800/40
                   transition-colors duration-150 group"
      >
        {/* Icon */}
        <div
          className="w-10 h-10 rounded-xl shrink-0
                        flex items-center justify-center"
          style={{ backgroundColor: `${service.color}18` }}
        >
          <Icon className="w-5 h-5" style={{ color: service.color }} />
        </div>

        {/* Title + badges */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-bold text-zinc-900 dark:text-white truncate">
              {service.title}
            </p>
            {service.popular && (
              <span
                className="flex items-center gap-1 px-2 py-0.5 rounded-full
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
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
            {service.description?.slice(0, 80) ?? 'No description available.'}
          </p>
        </div>

        {/* Tags — desktop only */}
        <div className="hidden md:flex items-center gap-1.5 shrink-0">
          {service.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded-md text-xs
                         bg-zinc-100 dark:bg-zinc-800
                         text-zinc-500 dark:text-zinc-400"
            >
              {tag}
            </span>
          ))}
          {service.tags.length > 3 && (
            <span className="text-xs text-zinc-400">
              +{service.tags.length - 3}
            </span>
          )}
        </div>

        {/* Features count */}
        <div className="hidden sm:flex items-center gap-1.5 shrink-0">
          <span className="text-xs text-zinc-400">
            {service.features.length} features
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            title="Edit service"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(service);
            }}
            className="p-2 rounded-lg text-zinc-500 dark:text-zinc-400
                       hover:text-amber-600 dark:hover:text-amber-400
                       hover:bg-amber-50 dark:hover:bg-amber-950
                       transition-all"
          >
            <Pencil className="w-4 h-4" />
          </button>
          {canDelete && (
            <button
              title="Delete service"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(service);
              }}
              className="p-2 rounded-lg text-zinc-500 dark:text-zinc-400
                         hover:text-red-600 dark:hover:text-red-400
                         hover:bg-red-50 dark:hover:bg-red-950
                         transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────
const EMPTY_STATS: ServiceStats = { total: 0, popular: 0, features: 0 };

export function ServicesTable() {
  const { canDelete } = useCurrentUser();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DASHBOARD_PAGE_SIZE);

  const [showForm, setShowForm] = useState(false);
  const [editService, setEditService] = useState<Service | null>(null);
  const [deleteService, setDeleteService] = useState<Service | null>(null);
  const [drawerService, setDrawerService] = useState<Service | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // The search box stays instant; the (server-side) query waits for a pause.
  const debouncedSearch = useDebouncedValue(search);

  // ── Toast ─────────────────────────────────────────────────
  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  // ── Data ──────────────────────────────────────────────────
  // The first page + the stats are prefetched on the server and hydrated
  // into the cache by <HydrationBoundary>, so this query resolves instantly
  // on the first render. Later pages/searches hit the API.
  const listParams = useMemo(
    () => ({ page, pageSize, q: debouncedSearch }),
    [page, pageSize, debouncedSearch],
  );

  const listQuery = useQuery({
    queryKey: ["services", "list", listParams],
    queryFn: () => dashboardGetServices(listParams),
    placeholderData: keepPreviousData,
  });

  const statsQuery = useQuery({
    queryKey: ["services", "stats"],
    queryFn: dashboardGetServiceStats,
  });

  const services = listQuery.data?.services ?? [];
  const total = listQuery.data?.total ?? 0;
  const stats = statsQuery.data ?? EMPTY_STATS;

  // ── Handlers ──────────────────────────────────────────────
  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handlePageSizeChange(value: number) {
    setPageSize(value);
    setPage(1);
  }

  async function handleSave(data: Omit<Service, "id">) {
    try {
      if (editService) {
        // ── UPDATE ──
        const updated = await dashboardUpdateService(editService.id, data);
        if (updated) {
          showToast("Service updated successfully");
          queryClient.invalidateQueries({ queryKey: ["services"] });
        }
      } else {
        // ── CREATE ──
        const created = await dashboardCreateService(data);
        if (created) {
          showToast("Service created successfully");
          queryClient.invalidateQueries({ queryKey: ["services"] });
        }
      }
    } catch (err) {
      console.error("handleSave error:", err);
      showToast("Something went wrong. Please try again.");
    } finally {
      setShowForm(false);
      setEditService(null);
    }
  }

  async function handleDelete() {
    if (!deleteService) return;

    const ok = await dashboardDeleteService(deleteService.id);

    if (ok) {
      showToast("Deleted");
      queryClient.invalidateQueries({ queryKey: ["services"] });
    }
    setDeleteService(null);
  }

  // ── Open drawer ───────────────────────────────────────────
  function openDrawer(service: Service) {
    setDrawerService(service);
  }

  // ── Open edit from drawer ─────────────────────────────────
  function handleDrawerEdit(service: Service) {
    setDrawerService(null);
    setEditService(service);
    setShowForm(true);
  }

  // ── Open delete from drawer ───────────────────────────────
  function handleDrawerDelete(service: Service) {
    setDrawerService(null);
    setDeleteService(service);
  }

  const isEmpty = services.length === 0;
  const isPending = listQuery.isPending;

  return (
    <>
      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard
          label="Total Services"
          value={stats.total}
          color="#6366f1"
        />
        <StatCard
          label="Popular"
          value={stats.popular}
          sub="marked as popular"
          color="#f59e0b"
        />
        <StatCard
          label="Total Features"
          value={stats.features}
          sub="across all services"
          color="#10b981"
        />
        <StatCard
          label="Avg Features"
          value={Math.round(stats.features / Math.max(stats.total, 1))}
          sub="per service"
          color="#8b5cf6"
        />
      </div>

      {/* ── Toolbar ── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2
                             w-4 h-4 text-zinc-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search services, tags, descriptions..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm
                       bg-white dark:bg-zinc-900
                       border border-zinc-200 dark:border-zinc-700
                       text-zinc-900 dark:text-white placeholder:text-zinc-400
                       focus:outline-none focus:ring-2 focus:ring-indigo-500
                       transition-colors"
          />
          {search && (
            <button
              type="button"
              onClick={() => handleSearchChange("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2
                         p-1 rounded-md text-zinc-400 hover:text-zinc-700
                         hover:bg-zinc-100 dark:hover:bg-zinc-800
                         dark:hover:text-zinc-200 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Add service */}
        <button
          onClick={() => {
            setEditService(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl
                     bg-indigo-600 hover:bg-indigo-700
                     text-white text-sm font-medium
                     transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Service
        </button>
      </div>

      {/* ── Service rows ── */}
      {isPending ? (
        <div className="flex flex-col gap-3" aria-busy="true">
          {Array.from({ length: pageSize }).map((_, index) => (
            <div
              key={index}
              className="h-[78px] rounded-2xl bg-zinc-100 dark:bg-zinc-800/60
                         animate-pulse"
            />
          ))}
        </div>
      ) : listQuery.isError ? (
        <div
          className="flex flex-col items-center justify-center
                        gap-3 py-20 text-zinc-400
                        bg-white dark:bg-zinc-900
                        border border-zinc-200 dark:border-zinc-800
                        rounded-2xl"
        >
          <AlertCircle className="w-10 h-10 opacity-30 text-red-500" />
          <div className="text-center">
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
              Could not load services
            </p>
            <p className="text-xs text-zinc-400 mt-1">
              The server did not respond. Please try again.
            </p>
          </div>
          <button
            type="button"
            onClick={() => listQuery.refetch()}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg
                       text-xs font-semibold bg-indigo-600 text-white
                       hover:bg-indigo-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      ) : isEmpty && !listQuery.isFetching ? (
        <div
          className="flex flex-col items-center justify-center
                        gap-3 py-20 text-zinc-400
                        bg-white dark:bg-zinc-900
                        border border-zinc-200 dark:border-zinc-800
                        rounded-2xl"
        >
          <Search className="w-10 h-10 opacity-20" />
          <div className="text-center">
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              No services found
            </p>
            <p className="text-xs text-zinc-400 mt-1">
              Try adjusting your search
            </p>
          </div>
        </div>
      ) : (
        <div
          className={cn(
            "flex flex-col gap-3 transition-opacity",
            listQuery.isFetching && "opacity-60",
          )}
        >
          {services.map((service) => (
              <ServiceRow
                key={service.id}
                service={service}
                onOpen={openDrawer}
                onEdit={(s) => {
                  setEditService(s);
                  setShowForm(true);
                }}
                onDelete={(s) => setDeleteService(s)}
                canDelete={canDelete}
              />
          ))}
        </div>
      )}

      {/* ── Pagination ── */}
      <Pagination
        page={page}
        pageSize={pageSize}
        total={total}
        itemLabel="services"
        pageSizeOptions={DASHBOARD_PAGE_SIZES}
        onPageChange={setPage}
        onPageSizeChange={handlePageSizeChange}
        busy={listQuery.isFetching}
      />


      {/* ── Toast ── */}
      {toast && (
        <div
          className="fixed top-6 left-1/2 -translate-x-1/2 z-100
               flex items-center gap-3 px-5 py-3 rounded-2xl
               bg-zinc-900 dark:bg-white
               text-white dark:text-zinc-900
               text-sm font-semibold shadow-2xl
               animate-in fade-in slide-in-from-top-4 duration-300
               max-w-[calc(100vw-2rem)] text-center border border-white/10 dark:border-zinc-200"
        >
          {/* The Tick Icon */}
          <div className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-500">
            <Check className="w-3.5 h-3.5 stroke-[3px]" />
          </div>

          <span>{toast}</span>
        </div>
      )}

      {/* ── Service detail drawer ── */}
      <ServiceDrawer
        service={drawerService}
        onClose={() => setDrawerService(null)}
        onEdit={handleDrawerEdit}
        onDelete={handleDrawerDelete}
      />

      {/* ── Form modal ── */}
      {showForm && (
        <ServiceFormModal
          key={editService?.id ?? "new-service"}
          service={editService}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditService(null);
          }}
        />
      )}

      {/* ── Delete modal ── */}
      {deleteService && (
        <ServiceDeleteModal
          service={deleteService}
          onConfirm={handleDelete}
          onCancel={() => setDeleteService(null)}
        />
      )}
    </>
  );
}
