'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Ship, Zap, Cog, Wrench, Microscope, Cpu } from 'lucide-react';
import type { Program } from '@/types';

const iconMap: Record<string, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  Ship, Zap, Cog, Wrench, Microscope, Cpu,
};

interface ProgramCardProps {
  item: Program;
  index?: number;
}

export default function ProgramCard({ item, index = 0 }: ProgramCardProps) {
  const Icon = iconMap[item.icon];
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, margin: '-80px' }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className="group relative"
    >
      <div className="relative overflow-hidden rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500">
        <div className="relative h-48 overflow-hidden">
          <img src={item.image} alt={item.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-60 mix-blend-multiply`} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute bottom-4 left-5">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              {Icon && <Icon className="w-6 h-6 text-white" strokeWidth={1.5} />}
            </div>
          </div>
        </div>
        <div className="p-6">
          <h3 className="text-lg font-bold text-[#0F172A] mb-2 font-[family-name:var(--font-display)]">{item.title}</h3>
          <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
          <div className="flex items-center gap-1.5 text-sm font-medium text-[#FBBF24] mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span>Detail Program</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
