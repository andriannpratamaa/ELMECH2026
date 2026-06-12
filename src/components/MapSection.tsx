'use client';

import { motion } from 'framer-motion';
import { MapPin, Navigation } from 'lucide-react';

export default function MapSection() {
  return (
    <section className="relative py-16 sm:py-20 lg:py-32 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const }}
          className="text-center max-w-3xl mx-auto mb-12 sm:mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-blue-100 text-[#0F4C81] text-xs sm:text-sm font-medium mb-4">
            Peta Kampus
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 mb-4 sm:mb-6">
            Jelajahi{' '}
            <span className="bg-gradient-to-r from-[#0F4C81] to-[#3B82F6] bg-clip-text text-transparent">
              Area Kampus
            </span>
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 leading-relaxed">
            Temukan berbagai fasilitas hijau dan titik keberlanjutan di lingkungan kampus PPNS.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] as const }}
          className="relative rounded-3xl overflow-hidden shadow-2xl border border-gray-100"
        >
          <div className="aspect-[21/9] min-h-[300px] sm:min-h-[400px] bg-gradient-to-br from-blue-50 via-emerald-50 to-orange-50 relative">
            <div className="absolute inset-0 opacity-30">
              <svg className="w-full h-full" viewBox="0 0 1200 500" fill="none">
                <rect width="1200" height="500" fill="url(#grid)" />
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#3B82F6" strokeWidth="0.5" opacity="0.3" />
                  </pattern>
                </defs>
                <rect x="200" y="100" width="300" height="200" rx="20" fill="#3B82F6" opacity="0.15" />
                <rect x="600" y="150" width="250" height="180" rx="20" fill="#F97316" opacity="0.12" />
                <rect x="350" y="280" width="400" height="150" rx="20" fill="#0F4C81" opacity="0.1" />
                <circle cx="350" cy="200" r="60" fill="#22c55e" opacity="0.15" />
                <circle cx="750" cy="250" r="45" fill="#22c55e" opacity="0.12" />
                <circle cx="550" cy="350" r="80" fill="#22c55e" opacity="0.1" />
              </svg>
            </div>

            {[
              { top: '25%', left: '30%', label: 'Gedung Utama', color: '#3B82F6' },
              { top: '35%', left: '55%', label: 'Lab Energi', color: '#F97316' },
              { top: '55%', left: '42%', label: 'Taman Hijau', color: '#22c55e' },
              { top: '45%', left: '70%', label: 'Stasiun Charging', color: '#0F4C81' },
              { top: '65%', left: '25%', label: 'Bank Sampah', color: '#F97316' },
            ].map((marker) => (
              <div
                key={marker.label}
                className="absolute flex items-center gap-1.5 group cursor-pointer"
                style={{ top: marker.top, left: marker.left }}
              >
                <div className="relative">
                  <MapPin className="w-5 h-5 sm:w-6 sm:h-6 drop-shadow-lg" style={{ color: marker.color }} fill="white" strokeWidth={2} />
                  <span className="absolute w-2 h-2 rounded-full animate-ping" style={{ background: marker.color, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
                </div>
                <span className="hidden sm:block text-[10px] sm:text-xs font-semibold text-gray-700 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {marker.label}
                </span>
              </div>
            ))}

            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2 shadow-sm border border-gray-100 flex items-center gap-2">
              <Navigation className="w-3.5 h-3.5 text-[#3B82F6]" />
              <span className="text-[10px] sm:text-xs text-gray-600 font-medium">Kampus PPNS</span>
            </div>

            <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
              {[
                { label: 'Panel Surya', color: 'bg-[#3B82F6]' },
                { label: 'Area Hijau', color: 'bg-green-500' },
                { label: 'Eco Point', color: 'bg-[#F97316]' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-1.5 bg-white/80 backdrop-blur-sm rounded-lg px-2.5 py-1 shadow-sm">
                  <span className={`w-2 h-2 rounded-full ${item.color}`} />
                  <span className="text-[10px] text-gray-600">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
