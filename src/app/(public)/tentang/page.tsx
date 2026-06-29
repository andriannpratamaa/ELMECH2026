import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import TentangDetail from "@/components/TentangDetail";
import SectionTitle from "@/components/SectionTitle";
import StatCard from "@/components/StatCard";
import CTASection from "@/components/CTASection";
import { Award, Calendar, Users, Building2, BookOpen } from "lucide-react";
import { fetchCmsPage, buildCmsSections } from "@/lib/cms";

const slug = "tentang";

export async function generateMetadata(): Promise<Metadata> {
  const page = await fetchCmsPage(slug);
  return {
    title: page?.title ?? "Tentang PPNS",
    description: page?.title
      ? `${page.title} - PPNS`
      : "Membangun Generasi Maritim Indonesia yang Unggul.",
  };
}

export default async function TentangPage() {
  const page = await fetchCmsPage(slug);
  const sections = buildCmsSections(page);

  const statisticsCards = Array.isArray(sections.statistics?.cards)
    ? sections.statistics.cards
    : [];
  const highlightsItems = Array.isArray(sections.highlights?.items)
    ? sections.highlights.items
    : [];
  const timelineItems = Array.isArray(sections.timeline?.items)
    ? sections.timeline.items
    : [];
  const achievementsItems = Array.isArray(sections.achievements?.items)
    ? sections.achievements.items
    : [];
  const aboutData = sections.aboutdetail || null;
  const ctaData = sections.cta || null;

  return (
    <>
      <PageHero
        bgImage={sections.pagehero?.bgImage || "https://images.unsplash.com/photo-1562774053-701939374585?w=1440&q=80"}
        title={sections.pagehero?.title || "Tentang PPNS"}
        subtitle={sections.pagehero?.subtitle || "Membangun Generasi Maritim Indonesia yang Unggul"}
        breadcrumbs={[{ label: "Beranda", href: "/" }, { label: "Tentang" }]}
      />

      {statisticsCards.length > 0 && (
        <section className="relative pt-8 sm:pt-12 pb-16 sm:pb-20 bg-[#F8FAFC] overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionTitle
              badge="Angka & Fakta"
              title="Kampus"
              highlight="dalam Angka"
              align="left"
            />
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {statisticsCards.map((stat: any, i: number) => (
                <StatCard
                  key={stat.label}
                  value={`${stat.value}${stat.suffix || ""}`}
                  label={stat.label}
                  desc={stat.desc}
                  index={i}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {highlightsItems.length > 0 && (
        <section className="relative py-0 pb-16 sm:pb-20 bg-[#F8FAFC] overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl bg-gradient-to-br from-[#0F172A] to-[#1E3A8A] p-8 sm:p-12 relative overflow-hidden">
              <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-15" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1562774053-701939374585?w=1920&q=80")' }} />
              <div className="absolute top-0 right-0 w-60 h-60 rounded-full bg-[#FBBF24]/5 blur-3xl" />
              <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full bg-[#FBBF24]/5 blur-3xl" />
              <div className="relative z-10 grid sm:grid-cols-3 gap-6 text-center sm:text-left">
                {highlightsItems.map((item: any, i: number) => (
                  <div key={item.label} className="sm:border-r sm:border-white/10 sm:last:border-r-0 sm:px-6 first:sm:pl-0 last:sm:pr-0">
                    <div className="text-3xl sm:text-4xl font-black text-[#FBBF24] font-[family-name:var(--font-display)]">
                      {item.value}
                    </div>
                    <div className="text-xs text-blue-200/70 font-medium mt-1">
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {timelineItems.length > 0 && (
        <section className="relative py-16 sm:py-20 bg-white overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionTitle badge="Perjalanan" title="Timeline" highlight="PPNS" align="left" />
            <div className="relative">
              <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#FBBF24] via-[#1E3A8A] to-[#FBBF24] opacity-30 hidden sm:block" />
              <div className="space-y-8">
                {timelineItems.map((item: any, i: number) => (
                  <div key={item.year} className="flex items-start gap-5 sm:gap-6">
                    <div className="w-10 h-10 rounded-full bg-[#0F172A] flex items-center justify-center flex-shrink-0 shadow-md z-10">
                      <span className="text-xs font-bold text-[#FBBF24] font-[family-name:var(--font-display)]">
                        {item.year}
                      </span>
                    </div>
                    <div className="flex-1 pt-1.5">
                      <h3 className="text-sm font-bold text-[#0F172A]">{item.title}</h3>
                      <p className="text-xs text-gray-500 mt-1 max-w-xl">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {achievementsItems.length > 0 && (
        <section className="relative py-16 sm:py-20 bg-[#F8FAFC] overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionTitle badge="Prestasi" title="Capaian" highlight="Terbaru" align="left" />
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {achievementsItems.map((item: any, i: number) => (
                <div key={item.title} className="group rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500">
                  <div className="relative h-40 overflow-hidden mb-4">
                    <img src={item.image} alt={item.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-50 mix-blend-multiply`} />
                    <div className="absolute top-3 left-3">
                      <span className="px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-sm text-white text-[10px] font-semibold">{item.year}</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-bold text-[#0F172A]">{item.title}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <TentangDetail aboutData={aboutData || undefined} />

      {ctaData ? (
        <CTASection
          title={ctaData.title}
          description={ctaData.description || ctaData.subtitle}
          buttons={(ctaData.buttons || []).map((b: any) => ({ label: b.label, href: b.link || b.href, variant: b.variant || "primary" }))}
          bgImage={ctaData.bgImage}
        />
      ) : (
        <CTASection
          title="Jelajahi Program Studi PPNS"
          description="Temukan program studi yang sesuai dengan minat dan bakat Anda di bidang maritim."
          buttons={[
            { label: "Lihat Program", href: "/program", variant: "primary" },
            { label: "Hubungi Kami", href: "/kontak", variant: "secondary" },
          ]}
          bgImage="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1920&q=80"
        />
      )}
    </>
  );
}
