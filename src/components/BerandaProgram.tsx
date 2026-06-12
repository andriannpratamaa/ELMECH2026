'use client';

import { motion } from 'framer-motion';
import { Factory, FlaskConical, Monitor, Cpu, Globe, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { getBentoItems } from '@/services/api';
const BENTO_ITEMS = getBentoItems();

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  Factory,
  FlaskConical,
  Monitor,
  Cpu,
  Globe,
};

const sizeClasses: Record<string, string> = {
  large: 'lg:col-span-2 lg:row-span-2',
  wide: 'lg:col-span-2 lg:row-span-1',
  tall: 'lg:col-span-1 lg:row-span-2',
  small: 'lg:col-span-1 lg:row-span-1',
};

const mobileSizeClasses: Record<string, string> = {
  large: 'sm:col-span-2 row-span-1',
  wide: 'sm:col-span-2 row-span-1',
  tall: 'sm:col-span-1 row-span-1',
  small: 'sm:col-span-1 row-span-1',
};

export default function BerandaProgram() {
  const items = BENTO_ITEMS.slice(0, 3);
  return (
    <section className="relative py-28 sm:py-36 lg:py-44 bg-[#F8FAFC] overflow-hidden">
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
            Program Unggulan
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#0F172A] leading-[1.1] font-[family-name:var(--font-display)]">
            Inovasi untuk{' '}
            <span className="bg-gradient-to-r from-[#0F172A] to-[#1E3A8A] bg-clip-text text-transparent">
              Maritim Global
            </span>
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[200px] lg:auto-rows-[240px] mb-12">
          {items.map((item, i) => {
            const Icon = ICON_MAP[item.icon];
            const sizeClass = sizeClasses[item.size] || 'lg:col-span-1 lg:row-span-1';
            const mobileClass = mobileSizeClasses[item.size] || 'sm:col-span-1 row-span-1';

            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 40, scale: 0.98 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: false, margin: '-80px' }}
                transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                className={`bento-card group relative overflow-hidden ${sizeClass} ${mobileClass}`}
              >
                <div className="absolute inset-0">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-85`} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/5 blur-3xl group-hover:scale-150 transition-transform duration-700" />

                <div className="relative z-10 h-full flex flex-col justify-between p-6 sm:p-8">
                  <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center group-hover:scale-110 group-hover:bg-white/25 transition-all duration-300">
                    <Icon className="w-6 h-6 text-white" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 font-[family-name:var(--font-display)]">
                      {item.title}
                    </h3>
                    <p className="text-sm text-white/70 leading-relaxed max-w-md">{item.desc}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center"
        >
          <Link
            href="/program"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0F172A] text-white font-semibold text-sm hover:bg-[#1E3A8A] transition-all duration-300 hover:scale-105 shadow-lg"
          >
            Lihat Semua Program
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
