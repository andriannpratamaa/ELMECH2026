'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageHeroProps {
  bgImage: string;
  title: string;
  subtitle?: string;
  breadcrumbs: Breadcrumb[];
}

export default function PageHero({ bgImage, title, subtitle, breadcrumbs }: PageHeroProps) {
  return (
    <section className="relative min-h-[45vh] sm:min-h-[50vh] flex items-center overflow-hidden bg-[#0F172A] pt-[120px] lg:pt-0">
      <motion.div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url("${bgImage}")` }}
        animate={{ scale: [1, 1.06] }}
        transition={{ duration: 20, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse' }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: [
            'radial-gradient(ellipse 70% 55% at 25% 25%, rgba(30, 58, 138, 0.35) 0%, transparent 60%)',
            'radial-gradient(ellipse 50% 40% at 75% 75%, rgba(251, 191, 36, 0.06) 0%, transparent 50%)',
            'linear-gradient(180deg, rgba(15, 23, 42, 0.80) 0%, rgba(15, 23, 42, 0.50) 40%, rgba(15, 23, 42, 0.60) 60%, rgba(15, 23, 42, 0.85) 100%)',
          ].join(', '),
        }}
      />

      <motion.div
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 10, ease: 'easeInOut', repeat: Infinity }}
        className="absolute top-20 right-20 w-[300px] h-[300px] rounded-full bg-[#1E3A8A]/10 blur-[100px] pointer-events-none"
      />
      <motion.div
        animate={{ x: [0, -20, 0], y: [0, 15, 0] }}
        transition={{ duration: 12, ease: 'easeInOut', repeat: Infinity }}
        className="absolute bottom-20 left-10 w-48 h-48 rounded-full bg-[#FBBF24]/5 blur-[80px] pointer-events-none"
      />

      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FBBF24]/30 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white/70 text-xs font-medium mb-5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#FBBF24]" />
            {breadcrumbs.map((crumb, i) => (
              <span key={crumb.label} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight className="w-3 h-3 text-white/30" />}
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:text-white transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-white/90 font-medium">{crumb.label}</span>
                )}
              </span>
            ))}
          </motion.div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.1] font-[family-name:var(--font-display)] max-w-3xl">
            {title}
          </h1>

          {subtitle && (
            <p className="text-base sm:text-lg text-white/60 leading-relaxed mt-4 sm:mt-5 max-w-xl">
              {subtitle}
            </p>
          )}
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 w-full z-10 leading-none">
        <svg viewBox="0 0 1440 80" fill="none" className="w-full h-auto">
          <path d="M0 30C240 65 480 10 720 40C960 70 1200 25 1440 50V80H0V30Z" fill="#F8FAFC" opacity="0.97" />
          <path d="M0 55C240 75 480 50 720 65C960 80 1200 55 1440 70V80H0V55Z" fill="#F8FAFC" />
        </svg>
      </div>
    </section>
  );
}
