import {
  ContactApiData,
  ContactData,
  ContactInfo,
  FAQ,
} from "@/lib/types/contact";
import { DEMO_CONTACT } from "@/lib/data/contact.demo";

const API_BASE_URL = "http://localhost:5000/api/contact";

function normalizeContact(contact: ContactApiData): ContactData {
  return {
    info: contact.info,
    faqs: contact.faqs.map((faq) => ({
      id: faq._id,
      question: faq.question,
      answer: faq.answer,
      order: faq.order,
    })),
  };
}

// const store: ContactData = JSON.parse(JSON.stringify(DEMO_CONTACT));

export async function dashboardGetContact(): Promise<ContactData> {
  try {
    const response = await fetch(`${API_BASE_URL}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch contact");
    }

    const json = await response.json();

    return normalizeContact(json.contact);
  } catch {
    return JSON.parse(JSON.stringify(DEMO_CONTACT));
  }
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
    const error = await response.json().catch(() => null);

    throw new Error(error?.message ?? "Unable to update contact information.");
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
    throw new Error("Failed to create FAQ");
  }

  const json = await response.json();

  return {
    id: json.faq.id ?? json.faq._id,
    question: json.faq.question,
    answer: json.faq.answer,
    order: json.faq.order,
  };
}

export async function dashboardUpdateFAQ(
  id: string,
  data: Partial<Omit<FAQ, "id">>,
): Promise<FAQ | null> {
  const response = await fetch(`${API_BASE_URL}/faq/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Unable to save changes. Please try again.");
  }

  const json = await response.json();

  return {
    id: json.faq.id ?? json.faq._id,
    question: json.faq.question,
    answer: json.faq.answer,
    order: json.faq.order,
  };
}

export async function dashboardDeleteFAQ(
  id: string
): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/faq/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete FAQ.");
    }

    return true;
  } catch {
    throw new Error(
      "Unable to connect to the server. Please try again."
    );
  }
}