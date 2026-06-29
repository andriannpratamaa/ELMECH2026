import type { Page } from "@/types/cms";

const rawApiBase =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";
const normalizedBase = rawApiBase.replace(/\/+$|\/+$/g, "");
const API_BASE = normalizedBase.endsWith("/api")
  ? normalizedBase
  : `${normalizedBase}/api`;

export function normalizeCmsSlug(slug: string): string {
  if (slug === "" || slug === "/" || slug === "root" || slug === "beranda") {
    return "root";
  }
  return slug;
}

export function findCmsBlock(page: Page | null, type: string) {
  return page?.content?.find((block) => block.type === type)?.data ?? null;
}

export function buildCmsSections(page: Page | null) {
  return (
    page?.content?.reduce(
      (sections, block) => {
        sections[block.type] = block.data;
        return sections;
      },
      {} as Record<string, any>,
    ) ?? {}
  );
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
