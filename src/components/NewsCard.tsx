'use client';

import { motion } from 'framer-motion';
import { Calendar, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { NewsItem } from '@/types';

const tagColors: Record<string, string> = {
  Energi: 'bg-blue-100 text-blue-700',
  Prestasi: 'bg-amber-100 text-amber-700',
  Kerjasama: 'bg-emerald-100 text-emerald-700',
  Inovasi: 'bg-purple-100 text-purple-700',
};

interface NewsCardProps {
  item: NewsItem;
  index?: number;
  featured?: boolean;
}

export default function NewsCard({ item, index = 0, featured }: NewsCardProps) {
  if (featured) {
    return (
      <Link href={`/berita/${item.slug}`}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="group relative h-[350px] sm:h-[450px] rounded-3xl overflow-hidden shadow-xl"
        >
          <img src={item.image} alt={item.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-20 mix-blend-multiply`} />
          <div className="absolute top-6 left-6">
            <span className={`inline-block px-3 py-1.5 rounded-xl text-xs font-semibold ${tagColors[item.tag] || 'bg-gray-100 text-gray-700'}`}>
              {item.tag}
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
            <div className="flex items-center gap-2 text-xs text-white/60 mb-3">
              <Calendar className="w-3.5 h-3.5" />
              {item.date}
            </div>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 font-[family-name:var(--font-display)] max-w-3xl">
              {item.title}
            </h3>
            <p className="text-sm sm:text-base text-white/70 max-w-2xl line-clamp-2">{item.excerpt}</p>
            <div className="flex items-center gap-2 text-sm font-medium text-[#FBBF24] mt-4 group-hover:gap-3 transition-all">
              <span>Baca Selengkapnya</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </motion.div>
      </Link>
    );
  }

  return (
    <Link href={`/berita/${item.slug}`}>
      <motion.article
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false }}
        transition={{ duration: 0.5, delay: index * 0.05 }}
        className="news-card group cursor-pointer h-full"
      >
        <div className="relative overflow-hidden h-48">
          <img src={item.image} alt={item.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute top-4 left-4">
            <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-semibold ${tagColors[item.tag] || 'bg-gray-100 text-gray-700'}`}>
              {item.tag}
            </span>
          </div>
        </div>
        <div className="p-5">
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
            <Calendar className="w-3.5 h-3.5" />
            {item.date}
          </div>
          <h3 className="font-bold text-[#0F172A] leading-snug group-hover:text-[#1E3A8A] transition-colors text-sm sm:text-base line-clamp-2">{item.title}</h3>
          <p className="text-xs sm:text-sm text-gray-500 mt-2 leading-relaxed line-clamp-2">{item.excerpt}</p>
          <div className="flex items-center gap-1.5 text-sm font-medium text-[#FBBF24] mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span>Baca</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </motion.article>
    </Link>
  );
}
