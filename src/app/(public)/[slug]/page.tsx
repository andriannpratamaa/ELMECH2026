import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import CmsPage from "@/components/cms/CmsPage";
import { fetchCmsPage } from "@/lib/cms";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (slug === "root" || slug === "beranda") redirect("/");
  const page = await fetchCmsPage(slug);
  if (!page) return { title: "Halaman Tidak Ditemukan" };
  return { title: page.title, description: `${page.title} - PPNS` };
}

export default async function DynamicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (slug === "root" || slug === "beranda") redirect("/");
  const page = await fetchCmsPage(slug);
  if (!page || !page.published) notFound();
  const content = Array.isArray(page.content) ? page.content : [];
  return <CmsPage slug={slug} initialData={{ content }} />;
}
