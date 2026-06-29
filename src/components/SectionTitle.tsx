'use client';

import { motion } from 'framer-motion';
import type { SectionTitleProps } from '@/types';
import RichTextRenderer from '@/components/cms/RichTextRenderer';

export default function SectionTitle({ badge, title, highlight, description, align = 'center' }: SectionTitleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, margin: '-100px' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={`max-w-3xl ${align === 'center' ? 'mx-auto text-center' : ''} mb-12 sm:mb-16`}
    >
      {badge && (
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0F172A]/5 text-[#0F172A] text-xs font-medium mb-5 border border-[#0F172A]/10">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FBBF24]" />
          {badge}
        </span>
      )}
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0F172A] leading-[1.1] font-[family-name:var(--font-display)]">
        {title}{' '}
        {highlight && (
          <span className="bg-gradient-to-r from-[#0F172A] to-[#1E3A8A] bg-clip-text text-transparent">
            {highlight}
          </span>
        )}
      </h2>
      {description && (
        <div className="mt-4 sm:mt-6 max-w-2xl mx-auto [&_.cms-rich-text_p]:text-base [&_.cms-rich-text_p]:sm:text-lg [&_.cms-rich-text_p]:text-gray-500 [&_.cms-rich-text_p]:leading-relaxed [&_.cms-rich-text_p]:mb-0">
          <RichTextRenderer html={description} />
        </div>
      )}
    </motion.div>
  );
}
