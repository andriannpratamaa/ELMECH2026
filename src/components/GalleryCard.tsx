'use client';

import { motion } from 'framer-motion';
import type { GalleryItem } from '@/types';

interface GalleryCardProps {
  item: GalleryItem;
  index: number;
  onClick: () => void;
}

export default function GalleryCard({ item, index, onClick }: GalleryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: false, margin: '-80px' }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="group relative cursor-pointer rounded-[20px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500"
      onClick={onClick}
    >
      <div className="aspect-[4/3] relative overflow-hidden">
        <img src={item.image} alt={item.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-40 mix-blend-multiply group-hover:opacity-60 transition-opacity duration-300`} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
          <h3 className="text-white font-bold text-lg font-[family-name:var(--font-display)]">{item.title}</h3>
          <p className="text-white/70 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">{item.desc}</p>
        </div>
      </div>
    </motion.div>
  );
}
