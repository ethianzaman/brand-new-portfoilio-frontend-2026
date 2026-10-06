import "server-only";

import { publicFetch, requireEnvelope } from "@/lib/api/core";
import { TAGS } from "@/lib/api/tags";
import { DEMO_CONTACT } from "@/lib/data/contact.demo";
import type { ContactData, ContactInfo, FAQ } from "@/lib/types/contact";

/**
 * The API returns Mongo `_id`s (`ContactApiFAQ`), but `DEMO_CONTACT` uses `id`.
 * Both are optional here so the build fallback and live data share one
 * normalizer instead of the fallback needing a special case.
 */
type ApiFaq = {
  _id?: string;
  id?: string;
  question: string;
  answer: string;
  order: number;
};

type ApiContact = {
  info: ContactInfo;
  faqs?: ApiFaq[];
};

type ContactApiResponse = { contact?: ApiContact };

function normalizeContact(contact: ApiContact): ContactData {
  return {
    info: contact.info,
    faqs: (contact.faqs ?? []).map(
      (faq): FAQ => ({
        id: faq._id ?? faq.id ?? "",
        question: faq.question,
        answer: faq.answer,
        order: faq.order,
      }),
    ),
  };
}

/**
 * PUBLIC contact data — contact info + FAQ accordion.
 *
 * Backend envelope: `{ contact: { info, faqs } }`.
 *
 * An FAQ-less contact is valid, so this deliberately keeps `publicFetch`'s
 * empty-payload guard active for the envelope itself — a 200 that omits
 * `contact` entirely is still an outage.
 */
export async function getContact(): Promise<ContactData> {
  const data = await publicFetch<ContactApiResponse>("/contact", {
    tag: TAGS.contact,
    fallback: { contact: DEMO_CONTACT },
  });
  return normalizeContact(
    requireEnvelope<"contact", ApiContact>(data, "contact"),
  );
}