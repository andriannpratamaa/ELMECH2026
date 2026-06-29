"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ImageIcon,
  Building2,
  Award,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import GalleryCard from "@/components/GalleryCard";
import CTASection from "@/components/CTASection";
import type { GalleryItem } from "@/types";

interface GalleryPageItem extends GalleryItem {
  category?: string;
  location?: string;
}

interface GaleriPageClientProps {
  items: GalleryPageItem[];
  categories: string[];
}

export default function GaleriPageClient({
  items,
  categories,
}: GaleriPageClientProps) {
  const [category, setCategory] = useState<string>("Semua");
  const [selected, setSelected] = useState<number | null>(null);

  const availableCategories = useMemo(
    () =>
      categories.length
        ? categories.filter((category): category is string => Boolean(category))
        : Array.from(
            new Set(
              items
                .map((item) => item.category)
                .filter((category): category is string => Boolean(category)),
            ),
          ),
    [categories, items],
  );

  const filteredItems = useMemo(
    () =>
      category === "Semua"
        ? items
        : items.filter((item) => item.category === category),
    [category, items],
  );

  const currentItems = filteredItems.length > 0 ? filteredItems : items;

  const prev = () => {
    if (selected === null) return;
    setSelected((current) => {
      if (current === null) return null;
      return current === 0 ? currentItems.length - 1 : current - 1;
    });
  };

  const next = () => {
    if (selected === null) return;
    setSelected((current) => {
      if (current === null) return null;
      return current === currentItems.length - 1 ? 0 : current + 1;
    });
  };

  return (
    <>
      <section className="relative pt-8 sm:pt-12 pb-16 sm:pb-20 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                icon: ImageIcon,
                value: `${items.length}+`,
                label: "Foto Tersedia",
              },
              { icon: Building2, value: "12", label: "Fasilitas Terekam" },
              {
                icon: Award,
                value: `${availableCategories.length}`,
                label: "Kategori Galeri",
              },
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
          <div className="flex gap-2 flex-wrap mb-10">
            {["Semua", ...availableCategories].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                  category === cat
                    ? "bg-[#0F172A] text-white shadow-sm"
                    : "bg-[#F8FAFC] text-gray-600 hover:bg-gray-200 border border-gray-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentItems.map((item, i) => (
              <GalleryCard
                key={`${item.title}-${i}`}
                item={item}
                index={i}
                onClick={() => setSelected(i)}
              />
            ))}
          </div>
        </div>
      </section>

      <CTASection
        title="Kunjungi Kampus Kami"
        description="Lihat langsung fasilitas modern dan lingkungan kampus yang inspiratif."
        buttons={[
          { label: "Jadwalkan Kunjungan", href: "#", variant: "primary" },
        ]}
        bgImage="https://images.unsplash.com/photo-1562774053-701939374585?w=1920&q=80"
      />

      <AnimatePresence>
        {selected !== null && currentItems[selected] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setSelected(null)}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelected(null);
              }}
              className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors z-10"
            >
              <X className="w-8 h-8" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              className="absolute left-6 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors z-10"
            >
              <ChevronLeft className="w-10 h-10" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              className="absolute right-6 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors z-10"
            >
              <ChevronRight className="w-10 h-10" />
            </button>
            <motion.div
              key={selected}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative max-w-5xl w-full max-h-[85vh] rounded-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentItems[selected].image}
                alt={currentItems[selected].title}
                className="w-full h-full object-contain"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                <h3 className="text-white font-bold text-xl font-[family-name:var(--font-display)]">
                  {currentItems[selected].title}
                </h3>
                <p className="text-white/70 text-sm">
                  {currentItems[selected].desc}
                </p>
              </div>
            </motion.div>
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {currentItems.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelected(i);
                  }}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === selected
                      ? "bg-white w-6"
                      : "bg-white/40 hover:bg-white/60"
                  }`}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
