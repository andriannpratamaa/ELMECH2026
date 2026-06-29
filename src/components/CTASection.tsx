'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { CTASectionProps } from '@/types';
import RichTextRenderer from '@/components/cms/RichTextRenderer';

export default function CTASection({ title, description, buttons, bgImage }: CTASectionProps) {
  return (
    <section className="relative py-20 sm:py-28 bg-[#F8FAFC] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-3xl bg-gradient-to-br from-[#0F172A] to-[#1E3A8A] p-10 sm:p-14 relative overflow-hidden text-center"
        >
          {bgImage && (
            <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10" style={{ backgroundImage: `url("${bgImage}")` }} />
          )}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-[#FBBF24]/5 blur-3xl" />
          <div className="relative z-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 font-[family-name:var(--font-display)]">{title}</h2>
            <div className="max-w-xl mx-auto mb-6 sm:mb-8 [&_.cms-rich-text]:text-sm [&_.cms-rich-text]:sm:text-base [&_.cms-rich-text]:text-blue-200/70 [&_.cms-rich-text_p]:text-sm [&_.cms-rich-text_p]:sm:text-base [&_.cms-rich-text_p]:text-blue-200/70 [&_.cms-rich-text_p]:leading-relaxed [&_.cms-rich-text_p]:mb-0">
              <RichTextRenderer html={description || ""} />
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {buttons.map((btn) => (
                btn.variant === 'primary' ? (
                  <Link
                    key={btn.href}
                    href={btn.href}
                    className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-[#FBBF24] text-[#0F172A] font-semibold text-sm hover:bg-[#FCD34D] transition-all duration-300 hover:scale-105 shadow-lg"
                  >
                    {btn.label}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <Link
                    key={btn.href}
                    href={btn.href}
                    className="inline-flex items-center gap-2 px-7 py-3 rounded-xl border border-white/20 text-white font-semibold text-sm hover:bg-white/10 transition-all duration-300"
                  >
                    {btn.label}
                  </Link>
                )
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
