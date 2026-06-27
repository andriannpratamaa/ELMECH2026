import { notFound } from "next/navigation";
import CmsPage from "@/components/cms/CmsPage";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

async function getPageFromAPI(slug: string) {
  try {
    const apiUrl = `${API_URL}/pages/${slug}`;
    const res = await fetch(apiUrl, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data || null;
  } catch (error) {
    console.error("[SSR] Error fetching page:", error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await getPageFromAPI(slug);
  if (!page) return { title: "Halaman Tidak Ditemukan" };
  return { title: page.title, description: `${page.title} - PPNS` };
}

export default async function DynamicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await getPageFromAPI(slug);
  if (!page) notFound();
  return <CmsPage slug={slug} initialData={{ content: page.content }} />;
}
