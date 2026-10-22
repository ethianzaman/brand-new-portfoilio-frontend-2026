import { dashboardApiUrl } from "@/lib/api/config";
import { buildQuery } from "@/lib/services/pagination";
import { Service } from "@/lib/types/services";
// import { DEMO_SERVICES } from "@/lib/data/services.demo";

const API_BASE_URL = `${dashboardApiUrl()}/services`; // 👈 ব্যাকএন্ড এপিআই ইউআরএল

// const store: Service[] = JSON.parse(JSON.stringify(DEMO_SERVICES));

type ApiService = Service & { _id?: string };

// ─────────────────────────────────────────────────────────────────────────
//  DASHBOARD LIST — paginated + searchable, resolved in the database.
//
//  GET /services?page&pageSize&q
//    → { success, count, services, total, hasMore, page, pageSize }
// ─────────────────────────────────────────────────────────────────────────

export interface ServiceListQuery {
  page: number;
  pageSize: number;
  q?: string;
}

export interface ServiceListResult {
  services: Service[];
  total: number;
  hasMore: boolean;
  page: number;
  pageSize: number;
}

export interface ServiceStats {
  total: number;
  popular: number;
  features: number;
}

// export async function dashboardGetServices(): Promise<Service[]> {
//   try {

//     const res = await fetch(`${API_BASE_URL}`);

//     if (!res.ok) {
//       return store;
//     }

//     const data = await res.json();

//     const services: ApiService[] = Array.isArray(data?.services)
//       ? data.services
//       : [];

//     if (services.length === 0) {
//       return store;
//     }

//     return services.map((s) => ({
//       ...s,
//       id: s._id ?? s.id ?? crypto.randomUUID(), // fallback safe id
//     }));
//   } catch (error) {
//     return store;
//   }
// }

export async function dashboardGetServices(
  params: ServiceListQuery,
): Promise<ServiceListResult> {
  const page = params.page;
  const pageSize = params.pageSize;

  try {
    const query = buildQuery({
      page,
      pageSize,
      q: params.q?.trim(),
    });

    const response = await fetch(`${API_BASE_URL}?${query}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Services API failed: ${response.status}`);
    }

    const data = await response.json();

    const services: ApiService[] = Array.isArray(data?.services)
      ? data.services
      : [];

    return {
      services: services.map((service) => ({
        ...service,
        id: service._id ?? service.id,
      })),
      total: data?.total ?? services.length,
      hasMore: data?.hasMore ?? false,
      page: data?.page ?? page,
      pageSize: data?.pageSize ?? pageSize,
    };
  } catch (error) {
    console.error("Failed to fetch services:", error);

    return {
      services: [],
      total: 0,
      hasMore: false,
      page,
      pageSize,
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────
//  DASHBOARD STATS — the numbers on the stat cards.
// ─────────────────────────────────────────────────────────────────────────

export async function dashboardGetServiceStats(): Promise<ServiceStats> {
  try {
    const response = await fetch(`${API_BASE_URL}/stats`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Service stats API failed: ${response.status}`);
    }

    const data = await response.json();

    return {
      total: data?.stats?.total ?? 0,
      popular: data?.stats?.popular ?? 0,
      features: data?.stats?.features ?? 0,
    };
  } catch (error) {
    console.error("Failed to fetch service stats:", error);

    return { total: 0, popular: 0, features: 0 };
  }
}
export async function dashboardCreateService(
  data: Omit<Service, "id">,
): Promise<Service> {
  const res = await fetch(`${API_BASE_URL}/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  console.log("🚀 API CALL: CREATE SERVICE", data);
  if (!res.ok) {
    const errorData = await res.json();

    console.error("BACKEND ERROR:", errorData);

    throw new Error(
      errorData.message || `Failed to create service: ${res.status}`,
    );
  }

  const result = await res.json();

  return result.service as Service; // ✅ backend transform এ id already আছে
}

export async function dashboardDeleteService(id: string): Promise<boolean> {
  console.log("===== DELETE SERVICE API =====");

  const url = `${API_BASE_URL}/${id}`;

  console.log(url);

  try {
    const response = await fetch(url, {
      method: "DELETE",
    });

    console.log("Status =", response.status);

    const body = await response.text();

    console.log(body);

    return response.ok;
  } catch (err) {
    console.error(err);

    return false;
  }
}

export async function dashboardUpdateService(
  id: string,
  updatedData: Partial<Omit<Service, "id">>,
): Promise<Service | null> {
  console.log("===== dashboardUpdateService =====");
  console.log("ID:", id);
  console.log("Updated Data:", updatedData);
  try {
    console.log("Request URL:", API_BASE_URL);
    console.log("Request Body:", updatedData);
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedData),
    });

    const data = await response.json();

    console.log("Update Response:", data);

    if (!response.ok) {
      return null;
    }
    return data.service as Service;
  } catch (error) {
    console.error(error);
    return null;
  }
}
