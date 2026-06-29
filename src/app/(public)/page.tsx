import Hero from "@/components/Hero";
import About from "@/components/About";
import BerandaProgram from "@/components/BerandaProgram";
import BerandaNews from "@/components/BerandaNews";
import BerandaGallery from "@/components/BerandaGallery";
import BerandaKontak from "@/components/BerandaKontak";
import Partners from "@/components/Partners";
import { fetchCmsPage, buildCmsSections } from "@/lib/cms";

export default async function Home() {
  const page = await fetchCmsPage("");
  const sections = buildCmsSections(page);

  return (
    <>
      <Hero {...sections.hero} />
      <About
        statistics={
          Array.isArray(sections.statistics?.cards)
            ? sections.statistics.cards
            : undefined
        }
      />
      <BerandaProgram
        programs={
          Array.isArray(sections.program?.programs)
            ? sections.program.programs
            : undefined
        }
        bentoItems={
          Array.isArray(sections.program?.bentoItems)
            ? sections.program.bentoItems
            : undefined
        }
        facilities={
          Array.isArray(sections.program?.facilities)
            ? sections.program.facilities
            : undefined
        }
        kerjasama={
          Array.isArray(sections.program?.kerjasama)
            ? sections.program.kerjasama
            : undefined
        }
      />
      <BerandaNews
        items={
          Array.isArray(sections.news?.items) ? sections.news.items : undefined
        }
        trending={
          Array.isArray(sections.news?.featured)
            ? sections.news.featured
            : undefined
        }
      />
      <BerandaGallery
        items={
          Array.isArray(sections.gallery?.images)
            ? sections.gallery.images
            : undefined
        }
      />
      <BerandaKontak contactInfo={sections.contact} />
      <Partners
        partners={
          Array.isArray(sections.partners?.items)
            ? sections.partners.items
            : undefined
        }
      />
    </>
  );
}
