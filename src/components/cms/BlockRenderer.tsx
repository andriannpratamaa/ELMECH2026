"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowRight, GraduationCap, BookOpen, Award, Users, MapPin, Star, ExternalLink } from "lucide-react";
import type { ContentBlock } from "@/types/cms";

function processCMSContent(html: string): string {
  let result = html;

  // 1. Wrap tables in responsive container for mobile overflow
  result = result.replace(/<table\b[^>]*>/gi, (match) => `<div class="table-responsive">${match}`);
  result = result.replace(/<\/table>/gi, "</table></div>");

  // 2. Convert YouTube anchor links → responsive iframe embeds
  result = result.replace(
    /<a[^>]+href="(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]+)(?:[^"]*)"[^>]*>.*?<\/a>/gi,
    (_, id) =>
      `<div class="cms-video"><iframe src="https://www.youtube.com/embed/${id}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe></div>`,
  );

  // 3. Convert Vimeo anchor links → responsive iframe embeds
  result = result.replace(
    /<a[^>]+href="(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(\d+)"[^>]*>.*?<\/a>/gi,
    (_, id) =>
      `<div class="cms-video"><iframe src="https://player.vimeo.com/video/${id}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe></div>`,
  );

  return result;
}

function HeroBlock({ data }: { data: Record<string, any> }) {
  return (
    <section className="relative lg:min-h-[85vh] flex items-center overflow-hidden bg-[#0F172A] pt-[120px] pb-20 lg:pt-0 lg:pb-0">
      <motion.div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url("${data.image || 'https://images.unsplash.com/photo-1562774053-701939374585?w=1920&q=80'}")` }}
        animate={{ scale: [1, 1.08] }}
        transition={{ duration: 25, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
      />
      <div className="absolute inset-0" style={{ background: ["radial-gradient(ellipse 70% 55% at 25% 25%, rgba(30, 58, 138, 0.30) 0%, transparent 60%)", "radial-gradient(ellipse 50% 40% at 75% 75%, rgba(251, 191, 36, 0.05) 0%, transparent 50%)", "linear-gradient(180deg, rgba(15, 23, 42, 0.75) 0%, rgba(15, 23, 42, 0.50) 40%, rgba(15, 23, 42, 0.70) 70%, rgba(15, 23, 42, 0.90) 100%)"].join(", ") }} />
      <motion.div animate={{ x: [0, 40, 0], y: [0, -30, 0] }} transition={{ duration: 10, ease: "easeInOut", repeat: Infinity }} className="absolute top-20 right-20 w-[400px] h-[400px] rounded-full bg-[#1E3A8A]/8 blur-[120px] pointer-events-none" />
      <motion.div animate={{ x: [0, -30, 0], y: [0, 20, 0] }} transition={{ duration: 12, ease: "easeInOut", repeat: Infinity }} className="absolute bottom-20 left-10 w-60 h-60 rounded-full bg-[#FBBF24]/4 blur-[100px] pointer-events-none" />
      <div className="relative z-20 max-w-7xl mx-auto w-full px-4 md:px-8 lg:px-12 py-0 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          <motion.div initial={{ opacity: 0, x: -60 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }} className="lg:col-span-7 space-y-6 lg:space-y-8 text-center lg:text-left flex flex-col items-center lg:items-start">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.6 }} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white/80 text-xs sm:text-sm font-medium">
              <GraduationCap className="w-3.5 h-3.5 text-[#FBBF24]" strokeWidth={1.5} />
              {data.badge || "Green Campus"}
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="font-[family-name:var(--font-display)] leading-[1.1] tracking-tight">
              <span className="text-[clamp(32px,8vw,48px)] md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white block">
                {data.title || "Welcome"}
              </span>
              <span className="text-[clamp(24px,6vw,36px)] md:text-4xl lg:text-5xl xl:text-6xl font-bold bg-gradient-to-r from-[#FBBF24] via-[#FCD34D] to-[#FDE68A] bg-clip-text text-transparent block mt-1.5">
                {data.subtitle || ""}
              </span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.7 }} className="text-sm sm:text-base md:text-base lg:text-lg text-blue-100/70 leading-relaxed max-w-[500px] mx-auto lg:mx-0 mb-2 lg:mb-0">
              {data.description || ""}
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55, duration: 0.7 }} className="flex flex-col sm:flex-row gap-3 pt-1 items-center lg:items-start w-full">
              <a href={data.button_link || "#program"} className="group inline-flex items-center justify-center gap-2 w-full sm:w-auto max-w-[280px] sm:max-w-none px-6 sm:px-8 py-3 sm:py-3.5 rounded-2xl text-sm sm:text-base font-semibold text-[#0F172A] bg-[#FBBF24] hover:bg-[#FCD34D] hover:scale-[1.02] shadow-2xl shadow-[#FBBF24]/25 transition-all duration-300">
                {data.button_text || "Lihat Informasi"}
                <ArrowRight className="w-4 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
            </motion.div>
          </motion.div>
          {data.stats && data.stats.length > 0 && (
            <motion.div initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7, duration: 1, ease: [0.16, 1, 0.3, 1] }} className="lg:col-span-5 relative">
              <motion.div animate={{ y: [0, -15, 0] }} transition={{ duration: 6, ease: "easeInOut", repeat: Infinity }} className="relative z-10 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/15 border border-white/40 p-5 lg:p-7 space-y-4 lg:space-y-5 hover:shadow-3xl hover:-translate-y-1 transition-all duration-500">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FBBF24]/10 text-[#0F172A] text-xs font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FBBF24]" />
                    {data.stats_badge || "Sorotan Kampus"}
                  </span>
                  <Star className="w-4 h-4 text-gray-300" strokeWidth={1.5} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {data.stats.map((stat: any, i: number) => {
                    const Icon = [BookOpen, Award, Users, MapPin][i % 4];
                    return (
                      <div key={i} className="text-center p-1.5">
                        <Icon className="w-4 h-4 text-[#FBBF24] mx-auto mb-1" strokeWidth={1.5} />
                        <div className="text-base sm:text-lg font-black text-[#0F172A]">{stat.value}</div>
                        <div className="text-[10px] sm:text-[11px] text-gray-500 font-medium">{stat.label}</div>
                      </div>
                    );
                  })}
                </div>
                {data.stats_footer && (
                  <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-gradient-to-r from-[#0F172A]/5 to-transparent border border-gray-100/80">
                    <Star className="w-4 h-4 text-[#FBBF24] flex-shrink-0" strokeWidth={1.5} />
                    <span className="text-[11px] sm:text-xs text-gray-500">{data.stats_footer}</span>
                  </div>
                )}
              </motion.div>
              <motion.div animate={{ x: [0, 20, 0], y: [0, -15, 0] }} transition={{ duration: 7, ease: "easeInOut", repeat: Infinity }} className="hidden lg:block absolute -top-4 -right-4 w-24 h-24 bg-[#FBBF24]/10 rounded-full blur-3xl pointer-events-none" />
              <motion.div animate={{ x: [0, -15, 0], y: [0, 20, 0] }} transition={{ duration: 8, ease: "easeInOut", repeat: Infinity }} className="hidden lg:block absolute -bottom-4 -left-4 w-32 h-32 bg-[#1E3A8A]/10 rounded-full blur-3xl pointer-events-none" />
            </motion.div>
          )}
        </div>
      </div>
      <div className="absolute bottom-0 left-0 w-full z-10 leading-none">
        <svg viewBox="0 0 1440 100" fill="none" className="w-full h-auto">
          <path d="M0 40C240 80 480 20 720 50C960 80 1200 30 1440 60V100H0V40Z" fill="#F8FAFC" opacity="0.97" />
          <path d="M0 70C240 90 480 60 720 80C960 100 1200 70 1440 85V100H0V70Z" fill="#F8FAFC" />
        </svg>
      </div>
    </section>
  );
}

function TextBlock({ data }: { data: Record<string, any> }) {
  const bodyHtml = useMemo(() => data.body ? processCMSContent(data.body) : "", [data.body]);
  return (
    <section className="py-20 bg-[#F8FAFC]">
      <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-12">
        {data.badge && (
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-3 py-1 rounded-full bg-[#FBBF24]/10 text-[#FBBF24] text-xs font-semibold mb-4"
          >
            {data.badge}
          </motion.span>
        )}
        {data.title && (
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-bold text-[#0F172A] font-[family-name:var(--font-display)] mb-4"
          >
            {data.title}
            {data.highlight && <span className="text-[#FBBF24]"> {data.highlight}</span>}
          </motion.h2>
        )}
        {data.description && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-600 leading-relaxed text-base md:text-lg"
          >
            {data.description}
          </motion.p>
        )}
        {bodyHtml && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="prose prose-gray max-w-none mt-6"
            dangerouslySetInnerHTML={{ __html: bodyHtml }}
          />
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
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-3 py-1 rounded-full bg-[#FBBF24]/10 text-[#FBBF24] text-xs font-semibold mb-4"
          >
            {data.badge}
          </motion.span>
        )}
        {data.title && (
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-[#0F172A] font-[family-name:var(--font-display)] mb-2"
          >
            {data.title}
          </motion.h2>
        )}
        {data.description && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-gray-500 mt-2 mb-10 max-w-2xl"
          >
            {data.description}
          </motion.p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item: any, i: number) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group rounded-2xl bg-white border border-gray-100 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              {item.icon && (
                <div className="w-12 h-12 rounded-xl bg-[#FBBF24]/10 flex items-center justify-center mb-4 group-hover:bg-[#FBBF24]/20 transition-colors">
                  <span className="text-2xl">{item.icon}</span>
                </div>
              )}
              <h3 className="text-lg font-bold text-[#0F172A] mb-2">{item.title}</h3>
              {item.description && <p className="text-sm text-gray-500 leading-relaxed">{item.description}</p>}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatsBlock({ data }: { data: Record<string, any> }) {
  const items: any[] = data.items || [];
  return (
    <section className="py-20 bg-[#0F172A]">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
        {data.badge && (
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-3 py-1 rounded-full bg-[#FBBF24]/10 text-[#FBBF24] text-xs font-semibold mb-4"
          >
            {data.badge}
          </motion.span>
        )}
        {data.title && (
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-white font-[family-name:var(--font-display)] mb-2"
          >
            {data.title}
          </motion.h2>
        )}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10">
          {items.map((item: any, i: number) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="text-3xl md:text-4xl font-black text-[#FBBF24]">{item.value}</div>
              <div className="text-sm text-white/60 mt-1">{item.label}</div>
              {item.description && <div className="text-xs text-white/30 mt-1">{item.description}</div>}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function GalleryBlock({ data }: { data: Record<string, any> }) {
  const images: any[] = data.images || [];
  return (
    <section className="py-20 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
        {data.title && (
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-[#0F172A] font-[family-name:var(--font-display)] text-center mb-10"
          >
            {data.title}
          </motion.h2>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((img: any, i: number) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative aspect-[4/3] rounded-2xl overflow-hidden"
            >
              <img src={img.image || img} alt={img.title || ""} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              {img.title && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <div>
                    <h3 className="text-white font-bold text-sm">{img.title}</h3>
                    {img.description && <p className="text-white/60 text-xs mt-1">{img.description}</p>}
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

function CTABlock({ data }: { data: Record<string, any> }) {
  return (
    <section className="py-20 bg-[#0F172A]">
      <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white font-[family-name:var(--font-display)] mb-4">
            {data.title || "Siap Bergabung?"}
          </h2>
          {data.subtitle && (
            <p className="text-white/60 text-base md:text-lg max-w-2xl mx-auto mb-8">{data.subtitle}</p>
          )}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {data.buttons?.map((btn: any, i: number) => (
              <a
                key={i}
                href={btn.link || "#"}
                className={`inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-300 ${
                  btn.variant === "secondary"
                    ? "border border-white/20 text-white/90 hover:bg-white/10"
                    : "bg-[#FBBF24] text-[#0F172A] hover:bg-[#FCD34D] hover:scale-[1.02] shadow-2xl shadow-[#FBBF24]/25"
                }`}
              >
                {btn.label || "Tombol"}
                <ExternalLink className="w-4 h-4" />
              </a>
            ))}
            {data.button_text && (
              <a
                href={data.button_link || "#"}
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl text-sm font-semibold bg-[#FBBF24] text-[#0F172A] hover:bg-[#FCD34D] hover:scale-[1.02] shadow-2xl shadow-[#FBBF24]/25 transition-all duration-300"
              >
                {data.button_text}
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </motion.div>
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
            return <HeroBlock key={i} data={block.data} />;
          case "text":
            return <TextBlock key={i} data={block.data} />;
          case "features":
            return <FeaturesBlock key={i} data={block.data} />;
          case "stats":
            return <StatsBlock key={i} data={block.data} />;
          case "gallery":
            return <GalleryBlock key={i} data={block.data} />;
          case "cta":
            return <CTABlock key={i} data={block.data} />;
          default:
            return null;
        }
      })}
    </>
  );
}
