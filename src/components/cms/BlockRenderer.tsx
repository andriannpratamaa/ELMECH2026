"use client";

import { motion } from "framer-motion";
import { Star, ExternalLink } from "lucide-react";
import type { ContentBlock } from "@/types/cms";
import Hero from "@/components/Hero";
import BerandaProgram from "@/components/BerandaProgram";
import BerandaNews from "@/components/BerandaNews";
import BerandaGallery from "@/components/BerandaGallery";
import BerandaKontak from "@/components/BerandaKontak";
import Partners from "@/components/Partners";
import CTASection from "@/components/CTASection";
import RichTextRenderer from "@/components/cms/RichTextRenderer";

const DEFAULT_HERO_STATS = [
  { value: "25+", label: "Program Studi" },
  { value: "Unggul", label: "Akreditasi" },
  { value: "10rb+", label: "Mahasiswa Aktif" },
  { value: "Surabaya", label: "Kampus Utama" },
];

function normalizeHeroData(data: Record<string, any>) {
  return {
    badge: data.badge,
    title: data.title,
    subtitle: data.subtitle,
    description: data.description,
    image: data.image,
    buttonLink: data.button_link || data.buttonLink,
    buttonText: data.button_text || data.buttonText,
    statsBadge: data.stats_badge || data.statsBadge,
    stats: Array.isArray(data.stats) && data.stats.length > 0 ? data.stats : DEFAULT_HERO_STATS,
    statsFooter: data.stats_footer || data.statsFooter,
    statsCardTitle: data.stats_card_title || data.statsCardTitle,
    statsCardDescription: data.stats_card_description || data.statsCardDescription,
  };
}

function normalizeCTA(data: Record<string, any>) {
  return {
    title: data.title,
    description: data.description || data.subtitle,
    buttons: (data.buttons || [])
      .map((b: any) => {
        const label = b.label || b.buttonText || "";
        const href = b.link || b.href || b.buttonUrl || "";
        return { label, href, variant: b.variant || "primary" };
      })
      .filter((b: any) => b.label && b.href),
    bgImage: data.bgImage || data.image,
  };
}

function TextBlock({ data }: { data: Record<string, any> }) {
  return (
    <section className="py-20 bg-[#F8FAFC]">
      <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-12">
        {data.badge && (
          <motion.span initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="inline-block px-3 py-1 rounded-full bg-[#FBBF24]/10 text-[#FBBF24] text-xs font-semibold mb-4">
            {data.badge}
          </motion.span>
        )}
        {data.title && (
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="text-3xl md:text-4xl font-bold text-[#0F172A] font-[family-name:var(--font-display)] mb-4">
            {data.title}{data.highlight && <span className="text-[#FBBF24]"> {data.highlight}</span>}
          </motion.h2>
        )}
        {data.description && (
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
            <RichTextRenderer html={data.description} />
          </motion.div>
        )}
        {data.body && (
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}>
            <RichTextRenderer html={data.body} />
          </motion.div>
        )}
      </div>
    </section>
  );
}

function FeaturesBlock({ data }: { data: Record<string, any> }) {
  const items: any[] = data.items || [];
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
        {data.badge && (
          <motion.span initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="inline-block px-3 py-1 rounded-full bg-[#FBBF24]/10 text-[#FBBF24] text-xs font-semibold mb-4">
            {data.badge}
          </motion.span>
        )}
        {data.title && (
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-3xl md:text-4xl font-bold text-[#0F172A] font-[family-name:var(--font-display)] mb-2">
            {data.title}{data.highlight && <span className="text-[#FBBF24]"> {data.highlight}</span>}
          </motion.h2>
        )}
        {data.description && (
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="mt-2 mb-10 max-w-3xl">
            <RichTextRenderer html={data.description} />
          </motion.div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item: any, i: number) => (
            <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="group rounded-2xl bg-white border border-gray-100 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              {item.icon && (
                <div className="w-12 h-12 rounded-xl bg-[#FBBF24]/10 flex items-center justify-center mb-4 group-hover:bg-[#FBBF24]/20 transition-colors">
                  <span className="text-2xl">{item.icon}</span>
                </div>
              )}
              <h3 className="text-lg font-bold text-[#0F172A] mb-2">{item.title}</h3>
              {item.description && <RichTextRenderer html={item.description} className="cms-text-sm" />}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function GalleryBlock({ data }: { data: Record<string, any> }) {
  const images: any[] = data.images || data.items || [];
  return (
    <section className="py-20 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
        {data.title && (
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-3xl md:text-4xl font-bold text-[#0F172A] font-[family-name:var(--font-display)] text-center mb-10">
            {data.title}
          </motion.h2>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((img: any, i: number) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="group relative aspect-[4/3] rounded-2xl overflow-hidden">
              <img src={img.image || img} alt={img.title || ""} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              {img.title && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <div>
                    <h3 className="text-white font-bold text-sm">{img.title}</h3>
                    {img.description && <RichTextRenderer html={img.description} className="cms-text-xs" />}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PageHeroBlock({ data }: { data: Record<string, any> }) {
  return (
    <section
      className="relative pt-28 pb-20 sm:pt-36 sm:pb-28 bg-[#0F172A] overflow-hidden"
      style={data.bgImage ? { backgroundImage: `url("${data.bgImage}")`, backgroundSize: "cover", backgroundPosition: "center" } : {}}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#0F172A]/90 via-[#0F172A]/70 to-[#1E3A8A]/80" />
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white font-[family-name:var(--font-display)] mb-4">{data.title}</h1>
        {data.subtitle && <p className="text-lg sm:text-xl text-blue-100/70 max-w-2xl mx-auto">{data.subtitle}</p>}
      </div>
    </section>
  );
}

export default function BlockRenderer({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <>
      {blocks.map((block, i) => {
        switch (block.type) {
          case "hero":
            return <Hero key={i} {...normalizeHeroData(block.data)} />;
          case "text":
            return <TextBlock key={i} data={block.data} />;
          case "features":
            return <FeaturesBlock key={i} data={block.data} />;
          case "gallery":
            return <GalleryBlock key={i} data={block.data} />;
          case "cta":
            return <CTASection key={i} {...normalizeCTA(block.data)} />;
          case "contact":
            return <BerandaKontak key={i} contactInfo={block.data as any} />;
          case "partners":
            return <Partners key={i} partners={Array.isArray(block.data?.items) ? block.data.items : undefined} />;
          case "pagehero":
            return <PageHeroBlock key={i} data={block.data} />;
          default:
            return null;
        }
      })}
    </>
  );
}
