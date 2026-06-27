import type { Metadata } from "next";
import CmsPage from "@/components/cms/CmsPage";
import Hero from "@/components/Hero";
import About from "@/components/About";
import BerandaProgram from "@/components/BerandaProgram";
import BerandaNews from "@/components/BerandaNews";
import BerandaGallery from "@/components/BerandaGallery";
import BerandaKontak from "@/components/BerandaKontak";
import Partners from "@/components/Partners";
import { fetchCmsPage } from "@/lib/cms";

const slug = "root";

export async function generateMetadata(): Promise<Metadata> {
  const page = await fetchCmsPage(slug);
  return {
    title: page?.title ?? "PPNS - Pendidikan Maritim Indonesia",
    description:
      page?.title ??
      "Situs resmi PPNS dengan informasi program, berita, galeri, dan kontak.",
  };
}

export default async function HomePage() {
  const page = await fetchCmsPage(slug);
  const cmsContent =
    page && page.published
      ? Array.isArray(page.content)
        ? page.content
        : []
      : undefined;

  return (
    <>
      <Hero />
      <About />
      <BerandaProgram />
      <BerandaNews />
      <BerandaGallery />
      <BerandaKontak />
      <Partners />
      {cmsContent ? (
        <CmsPage slug={slug} initialData={{ content: cmsContent }} />
      ) : null}
    </>
  );
}
