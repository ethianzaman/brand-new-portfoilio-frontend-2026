import { dashboardApiUrl } from "@/lib/api/config";
import {
  ContactApiData,
  ContactData,
  ContactInfo,
  FAQ,
} from "@/lib/types/contact";

const API_BASE_URL = `${dashboardApiUrl()}/contact`;

type FAQApiResponse = {
  id?: string;
  _id?: string;
  question: string;
  answer: string;
  order: number;
};

function normalizeFAQ(faq: FAQApiResponse): FAQ {
  const id = faq.id ?? faq._id;

  if (!id) {
    throw new Error("FAQ response is missing its ID.");
  }

  return {
    id: String(id),
    question: faq.question,
    answer: faq.answer,
    order: faq.order,
  };
}

function normalizeContact(contact: ContactApiData): ContactData {
  return {
    info: contact.info,
    faqs: contact.faqs.map(normalizeFAQ),
  };
}

async function getErrorMessage(
  response: Response,
  fallback: string,
): Promise<string> {
  const error = await response.json().catch(() => null);
  return error?.message ?? fallback;
}

export async function dashboardGetContact(): Promise<ContactData> {
  const response = await fetch(API_BASE_URL, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Failed to fetch contact information."),
    );
  }

  const json = await response.json();

  return normalizeContact(json.contact);
}

export async function dashboardUpdateInfo(
  data: Partial<ContactInfo>,
): Promise<ContactInfo> {
  const response = await fetch(`${API_BASE_URL}/info`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Unable to update contact information."),
    );
  }

  const json = await response.json();

  return json.info;
}

export async function dashboardCreateFAQ(
  data: Omit<FAQ, "id" | "order">,
): Promise<FAQ> {
  const response = await fetch(`${API_BASE_URL}/faq`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Failed to create FAQ."),
    );
  }

  const json = await response.json();

  return normalizeFAQ(json.faq);
}

export async function dashboardUpdateFAQ(
  id: string,
  data: Partial<Omit<FAQ, "id">>,
): Promise<FAQ> {
  const response = await fetch(`${API_BASE_URL}/faq/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Unable to update FAQ."),
    );
  }

  const json = await response.json();

  return normalizeFAQ(json.faq);
}

export async function dashboardDeleteFAQ(id: string): Promise<boolean> {
  const response = await fetch(`${API_BASE_URL}/faq/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Failed to delete FAQ."),
    );
  }

  return true;
}
