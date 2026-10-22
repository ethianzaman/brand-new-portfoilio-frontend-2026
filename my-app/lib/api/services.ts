import "server-only";

import { publicFetch, requireEnvelope } from "@/lib/api/core";
import { TAGS } from "@/lib/api/tags";
import { DEMO_SERVICES } from "@/lib/data/services.demo";
import type { Service } from "@/lib/types/services";

type ApiService = Service & { _id?: string };

type ServicesApiResponse = { services?: ApiService[] };

function normalizeServices(data: ServicesApiResponse): Service[] {
  // `[]` is a legitimate payload here — requireEnvelope only rejects a missing
  // or null `services` key, so an empty service list passes through.
  const services = requireEnvelope<"services", ApiService[]>(data, "services");

  return services.map((service) => ({
    ...service,
    id: service._id ?? service.id,
  }));
}

/**
 * PUBLIC services — the `/services` grid.
 *
 * Backend envelope: `{ services: Service[] }` with Mongo `_id`.
 *
 * The endpoint is paginated (the dashboard uses it too, one page at a time).
 * The public grid renders every service, so it asks for the maximum page size
 * the backend allows in one request instead of paging through them.
 *
 * `allowEmpty` matters here: "no services published yet" is a legitimate state
 * that the page renders as an `EmptyState`. Without it, `publicFetch`'s
 * empty-payload guard would treat it as an outage and serve stale demo content.
 */
export async function getServices(): Promise<Service[]> {
  const data = await publicFetch<ServicesApiResponse>(
    "/services?page=1&pageSize=100",
    {
      tag: TAGS.services,
      fallback: { services: DEMO_SERVICES },
      allowEmpty: true,
    },
  );
  return normalizeServices(data);
}