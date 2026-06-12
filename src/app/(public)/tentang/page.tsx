'use client';

import { motion } from 'framer-motion';
import { Award, Calendar, Users, Quote, Eye, Target, Building2, BookOpen } from 'lucide-react';
import PageHero from '@/components/PageHero';
import TentangDetail from '@/components/TentangDetail';
import SectionTitle from '@/components/SectionTitle';
import StatCard from '@/components/StatCard';
import CTASection from '@/components/CTASection';
import { getStatistics, getTimeline, getAchievements } from '@/services/api';

const STATISTICS = getStatistics();
const TIMELINE = getTimeline();
const ACHIEVEMENTS = getAchievements();

export default function TentangPage() {
  return (
    <>
      <PageHero
        bgImage="https://images.unsplash.com/photo-1562774053-701939374585?w=1440&q=80"
        title="Tentang PPNS"
        subtitle="Membangun Generasi Maritim Indonesia yang Unggul"
        breadcrumbs={[{ label: 'Beranda', href: '/' }, { label: 'Tentang' }]}
      />

      <section className="relative pt-8 sm:pt-12 pb-16 sm:pb-20 bg-[#F8FAFC] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle
            badge="Angka & Fakta"
            title="Kampus"
            highlight="dalam Angka"
            align="left"
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {STATISTICS.map((stat, i) => (
              <StatCard key={stat.label} value={`${stat.value}${stat.suffix}`} label={stat.label} desc={stat.desc} index={i} />
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-0 pb-16 sm:pb-20 bg-[#F8FAFC] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-2xl bg-gradient-to-br from-[#0F172A] to-[#1E3A8A] p-8 sm:p-12 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-15"
              style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1562774053-701939374585?w=1920&q=80")' }}
            />
            <div className="absolute top-0 right-0 w-60 h-60 rounded-full bg-[#FBBF24]/5 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full bg-[#FBBF24]/5 blur-3xl" />
            <div className="relative z-10 grid sm:grid-cols-3 gap-6 text-center sm:text-left">
              {[
                { icon: Award, value: 'A+', label: 'Peringkat Akreditasi' },
                { icon: Calendar, value: '1996', label: 'Tahun Berdiri' },
                { icon: Users, value: '15+', label: 'Negara Mitra' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="sm:border-r sm:border-white/10 sm:last:border-r-0 sm:px-6 first:sm:pl-0 last:sm:pr-0">
                    <Icon className="w-7 h-7 text-[#FBBF24] mb-3 mx-auto sm:mx-0" strokeWidth={1.5} />
                    <div className="text-3xl sm:text-4xl font-black text-[#FBBF24] font-[family-name:var(--font-display)]">{item.value}</div>
                    <div className="text-xs text-blue-200/70 font-medium mt-1">{item.label}</div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="relative py-16 sm:py-20 bg-white overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle
            badge="Perjalanan"
            title="Timeline"
            highlight="PPNS"
            align="left"
          />
          <div className="relative">
            <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#FBBF24] via-[#1E3A8A] to-[#FBBF24] opacity-30 hidden sm:block" />
            <div className="space-y-8">
              {TIMELINE.map((item, i) => (
                <motion.div
                  key={item.year}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: false }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="flex items-start gap-5 sm:gap-6"
                >
                  <div className="w-10 h-10 rounded-full bg-[#0F172A] flex items-center justify-center flex-shrink-0 shadow-md z-10">
                    <span className="text-xs font-bold text-[#FBBF24] font-[family-name:var(--font-display)]">{item.year}</span>
                  </div>
                  <div className="flex-1 pt-1.5">
                    <h3 className="text-sm font-bold text-[#0F172A]">{item.title}</h3>
                    <p className="text-xs text-gray-500 mt-1 max-w-xl">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-16 sm:py-20 bg-[#F8FAFC] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle
            badge="Prestasi"
            title="Capaian"
            highlight="Terbaru"
            align="left"
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {ACHIEVEMENTS.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500"
              >
                <div className="relative h-40 overflow-hidden">
                  <img src={item.image} alt={item.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-50 mix-blend-multiply`} />
                  <div className="absolute top-3 left-3">
                    <span className="px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-sm text-white text-[10px] font-semibold">{item.year}</span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-bold text-[#0F172A]">{item.title}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <TentangDetail />

      <CTASection
        title="Jelajahi Program Studi PPNS"
        description="Temukan program studi yang sesuai dengan minat dan bakat Anda di bidang maritim."
        buttons={[
          { label: 'Lihat Program', href: '/program', variant: 'primary' },
          { label: 'Hubungi Kami', href: '/kontak', variant: 'secondary' },
        ]}
        bgImage="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1920&q=80"
      />
    </>
  );
}
