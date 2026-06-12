'use client';

import { motion } from 'framer-motion';
import { getGalleryItems } from '@/services/api';
const GALLERY_ITEMS = getGalleryItems();

export default function Gallery() {
  return (
    <section id="galeri" className="relative py-28 sm:py-36 lg:py-44 bg-[#F8FAFC] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: '-100px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl mb-16 sm:mb-20"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0F172A]/5 text-[#0F172A] text-xs font-medium mb-6 border border-[#0F172A]/10">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FBBF24]" />
            Galeri
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#0F172A] leading-[1.1] font-[family-name:var(--font-display)]">
            Jelajahi{' '}
            <span className="bg-gradient-to-r from-[#0F172A] to-[#1E3A8A] bg-clip-text text-transparent">
              Kampus Kami
            </span>
          </h2>
        </motion.div>

        <div className="gallery-grid-premium">
          {GALLERY_ITEMS.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: false, margin: '-80px' }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="gallery-item"
            >
              <div className="w-full h-full min-h-[200px] sm:min-h-[240px] relative overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-40 mix-blend-multiply`} />
              </div>
              <div className="gallery-overlay">
                <div>
                  <h4 className="text-white font-bold text-lg">{item.title}</h4>
                  <p className="text-white/60 text-sm">{item.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
