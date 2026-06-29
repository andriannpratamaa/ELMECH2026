import type { Metadata } from "next";
import GaleriPageClient from "@/components/GaleriPageClient";
import PageHero from "@/components/PageHero";
import { fetchCmsPage, buildCmsSections } from "@/lib/cms";

const slug = "galeri";

export async function generateMetadata(): Promise<Metadata> {
  const page = await fetchCmsPage(slug);
  return {
    title: page?.title ?? "Galeri Kampus",
    description: page?.title
      ? `${page.title} - PPNS`
      : "Jelajahi momen dan fasilitas terbaik PPNS.",
  };
}

export default async function GaleriPage() {
  const page = await fetchCmsPage(slug);
  const sections = buildCmsSections(page);

  const galleryItems = Array.isArray(sections.gallery?.items) ? sections.gallery.items : [];
  const galleryCategories = Array.isArray(sections.gallery?.categories) ? sections.gallery.categories : [];

  return (
    <>
      <PageHero
        bgImage={sections.pagehero?.bgImage || "https://images.unsplash.com/photo-1562774053-701939374585?w=1440&q=80"}
        title={sections.pagehero?.title || "Galeri Kampus"}
        subtitle={sections.pagehero?.subtitle || "Jelajahi momen dan fasilitas terbaik PPNS melalui lensa"}
        breadcrumbs={[{ label: "Beranda", href: "/" }, { label: "Galeri" }]}
      />

      <GaleriPageClient
        items={galleryItems as any[]}
        categories={galleryCategories as string[]}
      />
    </>
  );
}
