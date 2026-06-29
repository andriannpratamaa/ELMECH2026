import PageHero from "@/components/PageHero";
import BeritaPageClient from "@/components/BeritaPageClient";
import { fetchCmsPage, buildCmsSections } from "@/lib/cms";
import { notFound } from "next/navigation";

export default async function BeritaPage() {
  const page = await fetchCmsPage("berita");
  if (!page || !page.published) notFound();

  const sectionsMap = buildCmsSections(page);
  const news = sectionsMap.news;
  const items = Array.isArray(news?.items) ? news.items : [];
  const trending = Array.isArray(news?.featured)
    ? news.featured
    : items.slice(0, 3);
  const ph = sectionsMap.pagehero;

  return (
    <>
      <PageHero
        bgImage={ph?.bgImage || "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1440&q=80"}
        title={ph?.title || "Berita Kampus"}
        subtitle={ph?.subtitle || "Informasi terbaru seputar PPNS"}
        breadcrumbs={[{ label: "Beranda", href: "/" }, { label: "Berita" }]}
      />

      <BeritaPageClient items={items} trending={trending} />
    </>
  );
}
