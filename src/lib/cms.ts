import type { Page } from "@/types/cms";

const rawApiBase =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";
const normalizedBase = rawApiBase.replace(/\/+$|\/+$/g, "");
const API_BASE = normalizedBase.endsWith("/api")
  ? normalizedBase
  : `${normalizedBase}/api`;

export function normalizeCmsSlug(slug: string): string {
  if (slug === "" || slug === "/" || slug === "root") {
    return "root";
  }
  return slug;
}

export async function fetchCmsPage(slug: string): Promise<Page | null> {
  const normalizedSlug = normalizeCmsSlug(slug);
  const apiUrl = `${API_BASE}/pages/${encodeURIComponent(normalizedSlug)}`;

  try {
    const res = await fetch(apiUrl, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return data?.data || null;
  } catch (error) {
    console.error("[CMS] fetchCmsPage error:", error);
    return null;
  }
}
