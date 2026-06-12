'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, TrendingUp, Tag, Calendar, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import PageHero from '@/components/PageHero';
import SectionTitle from '@/components/SectionTitle';
import NewsCard from '@/components/NewsCard';
import CTASection from '@/components/CTASection';
import EmptyState from '@/components/EmptyState';
import { getNews, getTrendingNews } from '@/services/api';

const NEWS_ITEMS = getNews();
const TRENDING = getTrendingNews();
const tagColors: Record<string, string> = {
  Energi: 'bg-blue-100 text-blue-700',
  Prestasi: 'bg-amber-100 text-amber-700',
  Kerjasama: 'bg-emerald-100 text-emerald-700',
  Inovasi: 'bg-purple-100 text-purple-700',
};

const ITEMS_PER_PAGE = 6;

export default function BeritaPage() {
  const [search, setSearch] = useState('');
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const tags = [...new Set(NEWS_ITEMS.map((n) => n.tag))];
  const [headline, ...restItems] = NEWS_ITEMS;

  let filtered = restItems.filter((item) => {
    const matchSearch = !search || item.title.toLowerCase().includes(search.toLowerCase()) || item.excerpt.toLowerCase().includes(search.toLowerCase());
    const matchTag = !filterTag || item.tag === filterTag;
    return matchSearch && matchTag;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paged = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <>
      <PageHero
        bgImage="https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1440&q=80"
        title="Berita Kampus"
        subtitle="Informasi terbaru seputar PPNS"
        breadcrumbs={[{ label: 'Beranda', href: '/' }, { label: 'Berita' }]}
      />

      <section className="relative pt-8 sm:pt-12 pb-0 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <SectionTitle badge="Berita Utama" title="Headline" highlight="Terkini" align="left" />
          </div>
          <Link href={`/berita/${headline.slug}`}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="group relative h-[350px] sm:h-[450px] rounded-3xl overflow-hidden shadow-xl mb-16 sm:mb-20"
            >
              <img src={headline.image} alt={headline.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              <div className={`absolute inset-0 bg-gradient-to-br ${headline.color} opacity-20 mix-blend-multiply`} />
              <div className="absolute top-6 left-6">
                <span className={`inline-block px-3 py-1.5 rounded-xl text-xs font-semibold ${tagColors[headline.tag] || 'bg-gray-100 text-gray-700'}`}>
                  {headline.tag}
                </span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
                <div className="flex items-center gap-2 text-xs text-white/60 mb-3">
                  <Calendar className="w-3.5 h-3.5" />
                  {headline.date}
                </div>
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 font-[family-name:var(--font-display)] max-w-3xl">
                  {headline.title}
                </h3>
                <p className="text-sm sm:text-base text-white/70 max-w-2xl line-clamp-2">{headline.excerpt}</p>
                <div className="flex items-center gap-2 text-sm font-medium text-[#FBBF24] mt-4 group-hover:gap-3 transition-all">
                  <span>Baca Selengkapnya</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </motion.div>
          </Link>
        </div>
      </section>

      <section className="relative pb-0 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-4 gap-8 mb-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-1"
            >
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4 text-[#FBBF24]" />
                <span className="text-xs font-semibold text-[#0F172A] uppercase tracking-wider">Trending</span>
              </div>
              <div className="space-y-3">
                {TRENDING.map((item, i) => (
                  <Link key={item.slug} href={`/berita/${item.slug}`}>
                    <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-[#F8FAFC] transition-colors group cursor-pointer">
                      <span className="text-lg font-black text-[#FBBF24] font-[family-name:var(--font-display)] tabular-nums w-6">{String(i + 1).padStart(2, '0')}</span>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-semibold text-[#0F172A] group-hover:text-[#1E3A8A] transition-colors line-clamp-2">{item.title}</h4>
                        <span className="text-[10px] text-gray-400">{item.date}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-3"
            >
              <div className="flex flex-col sm:flex-row gap-4 p-5 rounded-2xl bg-[#F8FAFC] border border-gray-100">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text" placeholder="Cari berita..." value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FBBF24]/50 focus:border-[#FBBF24] transition-all"
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => { setFilterTag(null); setPage(1); }}
                    className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${!filterTag ? 'bg-[#0F172A] text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
                  >Semua</button>
                  {tags.map((tag) => (
                    <button key={tag} onClick={() => { setFilterTag(tag === filterTag ? null : tag); setPage(1); }}
                      className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${filterTag === tag ? 'bg-[#0F172A] text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
                    >
                      <Tag className="w-3 h-3 inline mr-1" />
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="relative py-12 sm:py-16 bg-white overflow-hidden">
        <div className="absolute w-[400px] h-[400px] rounded-full blur-[120px] opacity-[0.03] pointer-events-none" style={{ background: '#1E3A8A', top: '10%', left: -50 }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {paged.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {paged.map((item, i) => (
                <NewsCard key={item.slug} item={item} index={i} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.5 }}
              className="flex justify-center items-center gap-2 mt-12"
            >
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >Sebelumnya</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${p === page ? 'bg-[#0F172A] text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >{p}</button>
              ))}
              <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >Selanjutnya</button>
            </motion.div>
          )}
        </div>
      </section>

      <CTASection
        title="Ikuti Perkembangan PPNS"
        description="Dapatkan informasi terbaru seputar kegiatan dan prestasi kampus."
        buttons={[{ label: 'Hubungi Kami', href: '/kontak', variant: 'primary' }]}
        bgImage="https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1920&q=80"
      />
    </>
  );
}
