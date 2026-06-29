import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import SectionTitle from "@/components/SectionTitle";
import ProgramCard from "@/components/ProgramCard";
import CTASection from "@/components/CTASection";
import {
  Factory,
  FlaskConical,
  Monitor,
  Cpu,
  Globe,
  CheckCircle,
} from "lucide-react";
import { fetchCmsPage, buildCmsSections } from "@/lib/cms";

const slug = "program";

const bentoIconMap: Record<string, React.ComponentType<any>> = {
  Factory, FlaskConical, Monitor, Cpu, Globe,
};

const sizeClasses: Record<string, string> = {
  large: "lg:col-span-2 lg:row-span-2",
  wide: "lg:col-span-2 lg:row-span-1",
  tall: "lg:col-span-1 lg:row-span-2",
  small: "lg:col-span-1 lg:row-span-1",
};

const mobileSizeClasses: Record<string, string> = {
  large: "sm:col-span-2 row-span-1",
  wide: "sm:col-span-2 row-span-1",
  tall: "sm:col-span-1 row-span-1",
  small: "sm:col-span-1 row-span-1",
};

export async function generateMetadata(): Promise<Metadata> {
  const page = await fetchCmsPage(slug);
  return {
    title: page?.title ?? "Program Unggulan",
    description: page?.title
      ? `${page.title} - PPNS`
      : "Program pendidikan dan inovasi maritim modern.",
  };
}

export default async function ProgramPage() {
  const page = await fetchCmsPage(slug);
  const sections = buildCmsSections(page);

  const bentoItems = Array.isArray(sections.bento?.items) ? sections.bento.items : [];
  const programsItems = Array.isArray(sections.programs?.items) ? sections.programs.items : [];
  const facilitiesItems = Array.isArray(sections.facilities?.items) ? sections.facilities.items : [];
  const highlightsItems = Array.isArray(sections.highlights?.items) ? sections.highlights.items : [];
  const kerjasamaItems = Array.isArray(sections.kerjasama?.items) ? sections.kerjasama.items : [];
  const ctaData = sections.cta || null;

  return (
    <>
      <PageHero
        bgImage={sections.pagehero?.bgImage || "https://images.unsplash.com/photo-1581092335391-9583eb1c0f6a?w=1440&q=80"}
        title={sections.pagehero?.title || "Program Unggulan"}
        subtitle={sections.pagehero?.subtitle || "Program pendidikan dan inovasi maritim modern"}
        breadcrumbs={[{ label: "Beranda", href: "/" }, { label: "Program" }]}
      />

      {bentoItems.length > 0 && (
        <section className="relative pt-8 sm:pt-12 pb-16 sm:pb-20 bg-[#F8FAFC] overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionTitle badge={sections.bento?.badge || "Inovasi Unggulan"} title={sections.bento?.title || "Program"} highlight={sections.bento?.highlight || "Unggulan"} />
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[200px] lg:auto-rows-[240px]">
              {bentoItems.map((item: any, i: number) => {
                const Icon = bentoIconMap[item.icon];
                const sizeClass = sizeClasses[item.size] || "lg:col-span-1 lg:row-span-1";
                const mobileClass = mobileSizeClasses[item.size] || "sm:col-span-1 row-span-1";
                return (
                  <div key={item.title} className={`bento-card group relative overflow-hidden ${sizeClass} ${mobileClass}`}>
                    <div className="absolute inset-0">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                    <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-85`} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                    <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/5 blur-3xl group-hover:scale-150 transition-transform duration-700" />
                    <div className="relative z-10 h-full flex flex-col justify-between p-6 sm:p-8">
                      <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center group-hover:scale-110 group-hover:bg-white/25 transition-all duration-300">
                        {Icon && <Icon className="w-6 h-6 text-white" strokeWidth={1.5} />}
                      </div>
                      <div>
                        <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 font-[family-name:var(--font-display)]">{item.title}</h3>
                        <p className="text-sm text-white/70 leading-relaxed max-w-md">{item.desc}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {programsItems.length > 0 && (
        <section className="relative py-20 sm:py-28 bg-white overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
          <div className="absolute w-[500px] h-[500px] rounded-full blur-[120px] opacity-[0.03] pointer-events-none" style={{ background: "#1E3A8A", top: "10%", left: -100 }} />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionTitle badge={sections.programs?.badge || "Program Studi"} title={sections.programs?.title || "Semua"} highlight={sections.programs?.highlight || "Program"} description={sections.programs?.description} />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {programsItems.map((item: any, i: number) => (
                <ProgramCard key={item.title} item={item} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {facilitiesItems.length > 0 && (
        <section className="relative py-20 sm:py-28 bg-[#F8FAFC] overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
          <div className="absolute w-[400px] h-[400px] rounded-full blur-[120px] opacity-[0.03] pointer-events-none" style={{ background: "#FBBF24", bottom: "10%", right: -50 }} />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionTitle badge={sections.facilities?.badge || "Fasilitas"} title={sections.facilities?.title || "Fasilitas"} highlight={sections.facilities?.highlight || "Modern"} />
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {facilitiesItems.map((item: any, i: number) => (
                <div key={item.title} className="group">
                  <div className="relative h-52 rounded-3xl overflow-hidden mb-4 shadow-sm">
                    <img src={item.image} alt={item.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-50 mix-blend-multiply`} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-4 left-5">
                      <h3 className="text-white font-bold text-lg font-[family-name:var(--font-display)]">{item.title}</h3>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {highlightsItems.length > 0 && (
        <section className="relative py-20 sm:py-28 bg-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl bg-gradient-to-br from-[#0F172A] to-[#1E3A8A] p-10 sm:p-14 relative overflow-hidden">
              <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1920&q=80")' }} />
              <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#FBBF24]/5 blur-3xl" />
              <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full bg-[#FBBF24]/5 blur-3xl" />
              <div className="relative z-10 grid sm:grid-cols-3 gap-8 text-center">
                {highlightsItems.map((item: any, i: number) => (
                  <div key={item.label} className="sm:border-r sm:border-white/10 sm:last:border-r-0 sm:px-8">
                    <div className="text-4xl sm:text-5xl font-black text-[#FBBF24] font-[family-name:var(--font-display)]">{item.value}</div>
                    <div className="text-sm text-blue-200/70 font-medium mt-2">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {kerjasamaItems.length > 0 && (
        <section className="relative py-20 sm:py-28 bg-[#F8FAFC] overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
          <div className="absolute w-[500px] h-[500px] rounded-full blur-[120px] opacity-[0.03] pointer-events-none" style={{ background: "#1E3A8A", top: "10%", left: -100 }} />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionTitle badge={sections.kerjasama?.badge || "Kerjasama"} title={sections.kerjasama?.title || "Mitra"} highlight={sections.kerjasama?.highlight || "Industri"} />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {kerjasamaItems.map((item: any, i: number) => (
                <div key={item.name} className="relative p-5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:border-[#FBBF24]/20 transition-all duration-500 group overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-orange-50/50 to-transparent rounded-bl-full -z-10" />
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-[#F8FAFC] border border-gray-100 flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:shadow-md transition-all duration-500 overflow-hidden p-3">
                      <img src={item.image} alt={item.name} className="max-w-full max-h-full object-contain opacity-70 group-hover:opacity-100 transition-opacity duration-500 grayscale group-hover:grayscale-0" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-[#0F172A] truncate">{item.name}</h3>
                      <p className="text-xs text-gray-400 truncate">{item.bidang}</p>
                    </div>
                    <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" strokeWidth={2} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {ctaData ? (
        <CTASection
          title={ctaData.title}
          description={ctaData.description || ctaData.subtitle}
          buttons={(ctaData.buttons || []).map((b: any) => ({ label: b.label, href: b.link || b.href, variant: b.variant || "primary" }))}
          bgImage={ctaData.bgImage}
        />
      ) : (
        <CTASection
          title="Siap Bergabung dengan PPNS?"
          description="Mulai perjalanan Anda menuju karir di industri maritim global bersama PPNS."
          buttons={[
            { label: "Hubungi Kami", href: "/kontak", variant: "primary" },
            { label: "Lihat Berita Terkini", href: "/berita", variant: "secondary" },
          ]}
          bgImage="https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=1920&q=80"
        />
      )}
    </>
  );
}
