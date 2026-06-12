'use client';

import { motion } from 'framer-motion';
import type { StatCardProps } from '@/types';

interface StatCardExtendedProps extends StatCardProps {
  index?: number;
}

export default function StatCard({ icon: Icon, value, label, desc, index = 0 }: StatCardExtendedProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="p-6 rounded-2xl bg-[#F8FAFC] border border-gray-100 text-center group hover:shadow-md transition-all"
    >
      {Icon && (
        <Icon className="w-7 h-7 text-[#FBBF24] mx-auto mb-3 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
      )}
      <div className="text-2xl sm:text-3xl font-black text-[#0F172A] font-[family-name:var(--font-display)]">{value}</div>
      <div className="text-sm font-semibold text-[#0F172A] mt-0.5">{label}</div>
      {desc && <div className="text-xs text-gray-400 mt-0.5">{desc}</div>}
    </motion.div>
  );
}
