"use client";

import { motion } from "framer-motion";
import type { Partner } from "@/types";

interface PartnersProps {
  partners?: Partner[];
}

const makeLogoGrid = (partners: Partner[]) => [
  ...partners,
  ...partners,
  ...partners,
];

export default function Partners({ partners }: PartnersProps) {
  const partnersData = partners ?? [];
  const LOGOS = makeLogoGrid(partnersData);
  return (
    <section
      className="relative py-16 sm:py-20 lg:py-28 overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #0F4C81 0%, #1a3a6b 50%, #0d3b6e 100%)",
      }}
    >
      <div className="absolute inset-0 opacity-[0.04]">
        <svg className="w-full h-full" viewBox="0 0 1440 400">
          <circle cx="200" cy="150" r="200" fill="#3B82F6" />
          <circle cx="1200" cy="250" r="180" fill="#F97316" />
          <circle cx="700" cy="50" r="120" fill="#FBBF24" />
        </svg>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-center max-w-3xl mx-auto mb-12 sm:mb-16"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-medium mb-5 border border-white/10">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FBBF24]" />
            Mitra Strategis
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4 sm:mb-6 font-[family-name:var(--font-display)]">
            Mitra &{" "}
            <span className="bg-gradient-to-r from-blue-300 to-blue-100 bg-clip-text text-transparent">
              Kolaborasi
            </span>
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-blue-100/70 leading-relaxed max-w-2xl mx-auto">
            Bersama mitra strategis dari berbagai sektor, kami mewujudkan kampus
            hijau yang berkelanjutan dan berdaya saing global.
          </p>
        </motion.div>
      </div>

      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-20 sm:w-32 z-10 bg-gradient-to-r from-[#0F4C81] to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-20 sm:w-32 z-10 bg-gradient-to-l from-[#0F4C81] to-transparent pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="marquee-container overflow-hidden py-4"
        >
          <div className="marquee-track flex gap-5 sm:gap-6 items-center w-max">
            {LOGOS.map((partner, i) => (
              <div
                key={`${partner.name}-${i}`}
                className="w-[140px] sm:w-[170px] md:w-[190px] flex-shrink-0"
              >
                <div className="h-[80px] sm:h-[92px] rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center p-5 sm:p-6 hover:bg-white/15 hover:scale-105 hover:shadow-xl hover:border-white/20 transition-all duration-500 group">
                  <img
                    src={partner.image}
                    alt={partner.name}
                    className="max-w-full max-h-full object-contain opacity-70 group-hover:opacity-100 transition-opacity duration-500 grayscale group-hover:grayscale-0"
                    loading="lazy"
                  />
                </div>
                <p className="text-center text-[10px] sm:text-xs text-blue-200/50 mt-2 font-medium truncate">
                  {partner.name}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
