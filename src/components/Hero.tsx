"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  ChevronDown,
  GraduationCap,
  Award,
  MapPin,
  TrendingUp,
  BookOpen,
  Building2,
  Users,
  Star,
} from "lucide-react";
import RichTextRenderer from "@/components/cms/RichTextRenderer";

interface HeroProps {
  badge?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  buttonLink?: string;
  buttonText?: string;
  statsBadge?: string;
  stats?: { value: string; label: string }[];
  statsFooter?: string;
  statsCardTitle?: string;
  statsCardDescription?: string;
  image?: string;
}

const DEFAULT_HERO_STATS = [
  { value: "25+", label: "Program Studi" },
  { value: "Unggul", label: "Akreditasi" },
  { value: "10rb+", label: "Mahasiswa Aktif" },
  { value: "Surabaya", label: "Kampus Utama" },
];

export default function Hero({
  badge = "Politeknik Perkapalan Negeri Surabaya",
  title = "PPNS Smart",
  subtitle = "Maritime Campus",
  description = "Portal informasi akademik, inovasi teknologi, berita kampus, dan kolaborasi industri maritim modern.",
  buttonLink = "#program",
  buttonText = "Lihat Informasi",
  statsBadge = "Sorotan Kampus",
  stats = DEFAULT_HERO_STATS,
  statsFooter = "Penerimaan Mahasiswa Baru 2026/2027 dibuka",
  statsCardTitle = "PPNS Raih Akreditasi Unggul 2025",
  statsCardDescription = "Peringkat akreditasi institusi meningkat ke status Unggul dari BAN-PT.",
  image = "https://images.unsplash.com/photo-1562774053-701939374585?w=1920&q=80",
}: HeroProps) {
  const scrollTo = (href: string) => {
    document
      .querySelector(href)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section
      id="hero"
      className="relative lg:min-h-[85vh] flex items-center overflow-hidden bg-[#0F172A] pt-[120px] pb-20 lg:pt-0 lg:pb-0"
    >
      <motion.div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url("${image}")`,
        }}
        animate={{ scale: [1, 1.08] }}
        transition={{
          duration: 25,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: [
            "radial-gradient(ellipse 70% 55% at 25% 25%, rgba(30, 58, 138, 0.30) 0%, transparent 60%)",
            "radial-gradient(ellipse 50% 40% at 75% 75%, rgba(251, 191, 36, 0.05) 0%, transparent 50%)",
            "linear-gradient(180deg, rgba(15, 23, 42, 0.75) 0%, rgba(15, 23, 42, 0.50) 40%, rgba(15, 23, 42, 0.70) 70%, rgba(15, 23, 42, 0.90) 100%)",
          ].join(", "),
        }}
      />

      <motion.div
        animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
        transition={{ duration: 10, ease: "easeInOut", repeat: Infinity }}
        className="absolute top-20 right-20 w-[400px] h-[400px] rounded-full bg-[#1E3A8A]/8 blur-[120px] pointer-events-none"
      />
      <motion.div
        animate={{ x: [0, -30, 0], y: [0, 20, 0] }}
        transition={{ duration: 12, ease: "easeInOut", repeat: Infinity }}
        className="absolute bottom-20 left-10 w-60 h-60 rounded-full bg-[#FBBF24]/4 blur-[100px] pointer-events-none"
      />

      <div className="relative z-20 max-w-7xl mx-auto w-full px-4 md:px-8 lg:px-12 py-0 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 space-y-6 lg:space-y-8 text-center lg:text-left flex flex-col items-center lg:items-start"
          >
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white/80 text-xs sm:text-sm font-medium"
            >
              <GraduationCap
                className="w-3.5 h-3.5 text-[#FBBF24]"
                strokeWidth={1.5}
              />
              {badge}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.25,
                duration: 0.8,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="font-[family-name:var(--font-display)] leading-[1.1] tracking-tight"
            >
              <span className="text-[clamp(32px,8vw,48px)] md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white block">
                {title}
              </span>
              <span className="text-[clamp(24px,6vw,36px)] md:text-4xl lg:text-5xl xl:text-6xl font-bold bg-gradient-to-r from-[#FBBF24] via-[#FCD34D] to-[#FDE68A] bg-clip-text text-transparent block mt-1.5">
                {subtitle}
              </span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.7 }}
              className="max-w-[500px] mx-auto lg:mx-0 mb-2 lg:mb-0 [&_.cms-rich-text]:text-sm [&_.cms-rich-text]:sm:text-base [&_.cms-rich-text]:text-blue-100/70 [&_.cms-rich-text_p]:text-sm [&_.cms-rich-text_p]:sm:text-base [&_.cms-rich-text_p]:text-blue-100/70 [&_.cms-rich-text_p]:leading-relaxed [&_.cms-rich-text_p]:mb-0"
            >
              <RichTextRenderer html={description} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.7 }}
              className="flex flex-col sm:flex-row gap-3 pt-1 items-center lg:items-start w-full"
            >
              <a
                href={buttonLink}
                className="group inline-flex items-center justify-center gap-2 w-full sm:w-auto max-w-[280px] sm:max-w-none px-6 sm:px-8 py-3 sm:py-3.5 rounded-2xl text-sm sm:text-base font-semibold text-[#0F172A] bg-[#FBBF24] hover:bg-[#FCD34D] hover:scale-[1.02] shadow-2xl shadow-[#FBBF24]/25 transition-all duration-300"
              >
                {buttonText}
                <ArrowRight className="w-4 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <button className="inline-flex items-center justify-center gap-2 w-full sm:w-auto max-w-[280px] sm:max-w-none px-6 sm:px-8 py-3 sm:py-3.5 rounded-2xl text-sm sm:text-base font-semibold text-white/90 border border-white/20 hover:bg-white/10 hover:border-white/30 backdrop-blur-sm transition-all duration-300">
                Pelajari Lebih Lanjut
              </button>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 relative"
          >
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 6, ease: "easeInOut", repeat: Infinity }}
              className="relative z-10 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/15 border border-white/40 p-5 lg:p-7 space-y-4 lg:space-y-5 hover:shadow-3xl hover:-translate-y-1 transition-all duration-500"
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FBBF24]/10 text-[#0F172A] text-xs font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FBBF24]" />
                  {statsBadge}
                </span>
                <TrendingUp
                  className="w-4 h-4 text-gray-300"
                  strokeWidth={1.5}
                />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-base lg:text-lg font-bold text-[#0F172A] leading-snug font-[family-name:var(--font-display)]">
                  {statsCardTitle}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                  {statsCardDescription}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
                {stats.map((stat, index) => {
                  const Icon = [BookOpen, Award, Users, MapPin][index % 4];
                  return (
                    <div
                      key={`${stat.label}-${index}`}
                      className="text-center p-1.5"
                    >
                      <Icon
                        className="w-4 h-4 text-[#FBBF24] mx-auto mb-1"
                        strokeWidth={1.5}
                      />
                      <div className="text-base sm:text-lg font-black text-[#0F172A]">
                        {stat.value}
                      </div>
                      <div className="text-[10px] sm:text-[11px] text-gray-500 font-medium">
                        {stat.label}
                      </div>
                    </div>
                  );
                })}
              </div>

              {statsFooter && (
                <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-gradient-to-r from-[#0F172A]/5 to-transparent border border-gray-100/80">
                  <Star
                    className="w-4 h-4 text-[#FBBF24] flex-shrink-0"
                    strokeWidth={1.5}
                  />
                  <span className="text-[11px] sm:text-xs text-gray-500">
                    {statsFooter}
                  </span>
                </div>
              )}
            </motion.div>

            <motion.div
              animate={{ x: [0, 20, 0], y: [0, -15, 0] }}
              transition={{ duration: 7, ease: "easeInOut", repeat: Infinity }}
              className="hidden lg:block absolute -top-4 -right-4 w-24 h-24 bg-[#FBBF24]/10 rounded-full blur-3xl pointer-events-none"
            />
            <motion.div
              animate={{ x: [0, -15, 0], y: [0, 20, 0] }}
              transition={{ duration: 8, ease: "easeInOut", repeat: Infinity }}
              className="hidden lg:block absolute -bottom-4 -left-4 w-32 h-32 bg-[#1E3A8A]/10 rounded-full blur-3xl pointer-events-none"
            />
          </motion.div>
        </div>
      </div>

      <motion.button
        onClick={() => scrollTo("#statistik")}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 text-white/30 hover:text-white/60 transition-colors hidden sm:block"
      >
        <ChevronDown className="w-5 h-5 animate-bounce" />
      </motion.button>

      <div className="absolute bottom-0 left-0 w-full z-10 leading-none">
        <svg viewBox="0 0 1440 100" fill="none" className="w-full h-auto">
          <path
            d="M0 40C240 80 480 20 720 50C960 80 1200 30 1440 60V100H0V40Z"
            fill="#F8FAFC"
            opacity="0.97"
          />
          <path
            d="M0 70C240 90 480 60 720 80C960 100 1200 70 1440 85V100H0V70Z"
            fill="#F8FAFC"
          />
        </svg>
      </div>
    </section>
  );
}
