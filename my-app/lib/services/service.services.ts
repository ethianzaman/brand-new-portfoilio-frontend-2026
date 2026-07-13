import { Service } from "@/lib/types/services";
import { DEMO_SERVICES } from "@/lib/data/services.demo";

const API_BASE_URL = "http://localhost:5000/api/services"; // 👈 ব্যাকএন্ড এপিআই ইউআরএল

const store: Service[] = JSON.parse(JSON.stringify(DEMO_SERVICES));

type ApiService = Service & { _id?: string };

export async function dashboardGetServices(): Promise<Service[]> {
  try {
    console.log("🚀 API CALL START");

    const res = await fetch(`${API_BASE_URL}`);

    if (!res.ok) {
      console.warn("⚠️ API failed → using demo data");
      return store;
    }

    const data = await res.json();

    const services: ApiService[] = Array.isArray(data?.services)
      ? data.services
      : [];

    if (services.length === 0) {
      console.warn("⚠️ API EMPTY → using demo data");
      return store;
    }

    console.log("✅ API DATA USED");

    return services.map((s) => ({
      ...s,
      id: s._id ?? s.id ?? crypto.randomUUID(), // fallback safe id
    }));
  } catch (error) {
    console.error("❌ API ERROR → using demo data", error);
    return store;
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
