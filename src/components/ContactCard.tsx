'use client';

import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface ContactCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  index?: number;
}

export default function ContactCard({ icon: Icon, label, value, index = 0 }: ContactCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: false }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="flex items-start gap-4 group p-4 rounded-2xl hover:bg-[#F8FAFC] transition-colors"
    >
      <div className="w-12 h-12 rounded-2xl bg-[#F8FAFC] flex items-center justify-center flex-shrink-0 group-hover:bg-[#FBBF24]/10 group-hover:scale-110 transition-all duration-300">
        <Icon className="w-5 h-5 text-[#0F172A]" strokeWidth={1.5} />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-[#0F172A] mb-1">{label}</h3>
        <p className="text-sm text-gray-500 leading-relaxed">{value}</p>
      </div>
    </motion.div>
  );
}
