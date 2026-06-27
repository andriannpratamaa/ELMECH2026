import type { Metadata } from "next";
import CmsPage from "@/components/cms/CmsPage";
import { motion } from "framer-motion";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Building2,
  Camera,
  Award,
} from "lucide-react";
import PageHero from "@/components/PageHero";
import SectionTitle from "@/components/SectionTitle";
import GalleryCard from "@/components/GalleryCard";
import CTASection from "@/components/CTASection";
import { getGalleryItems, getGalleryCategories } from "@/services/api";
import { fetchCmsPage } from "@/lib/cms";

const GALLERY_ITEMS = getGalleryItems();
const GALLERY_CATEGORIES = getGalleryCategories();
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
  const cmsContent =
    page && page.published
      ? Array.isArray(page.content)
        ? page.content
        : []
      : undefined;

  return (
    <>
      <PageHero
        bgImage="https://images.unsplash.com/photo-1562774053-701939374585?w=1440&q=80"
        title="Galeri Kampus"
        subtitle="Jelajahi momen dan fasilitas terbaik PPNS melalui lensa"
        breadcrumbs={[{ label: "Beranda", href: "/" }, { label: "Galeri" }]}
      />

      <section className="relative pt-8 sm:pt-12 pb-16 sm:pb-20 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { icon: ImageIcon, value: "200+", label: "Foto Tersedia" },
              { icon: Building2, value: "12", label: "Fasilitas Terekam" },
              { icon: Award, value: "9", label: "Kategori Galeri" },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-[#F8FAFC] border border-gray-100 text-center group hover:shadow-md transition-all"
              >
                <item.icon
                  className="w-8 h-8 text-[#FBBF24] mx-auto mb-3 group-hover:scale-110 transition-transform"
                  strokeWidth={1.5}
                />
                <div className="text-3xl font-black text-[#0F172A] font-[family-name:var(--font-display)]">
                  {item.value}
                </div>
                <div className="text-sm text-gray-400 mt-1">{item.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative pb-20 sm:pb-28 bg-white overflow-hidden">
        <div
          className="absolute w-[400px] h-[400px] rounded-full blur-[120px] opacity-[0.03] pointer-events-none"
          style={{ background: "#FBBF24", bottom: "10%", right: -50 }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle
            badge="Dokumentasi"
            title="Jelajahi"
            highlight="Kampus"
            align="left"
          />

          <div className="flex gap-2 flex-wrap mb-10">
            {GALLERY_CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`px-4 py-2 rounded-xl text-xs font-medium transition-all bg-[#F8FAFC] text-gray-600 hover:bg-gray-200 border border-gray-100`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {GALLERY_ITEMS.map((item, i) => (
              <GalleryCard
                key={item.title}
                item={item}
                index={i}
                onClick={() => {}}
              />
            ))}
          </div>
        </div>
      </section>

      {cmsContent ? (
        <CmsPage slug={slug} initialData={{ content: cmsContent }} />
      ) : null}

      <CTASection
        title="Kunjungi Kampus Kami"
        description="Lihat langsung fasilitas modern dan lingkungan kampus yang inspiratif."
        buttons={[
          { label: "Jadwalkan Kunjungan", href: "#", variant: "primary" },
        ]}
        bgImage="https://images.unsplash.com/photo-1562774053-701939374585?w=1920&q=80"
      />
    </>
  );
}
