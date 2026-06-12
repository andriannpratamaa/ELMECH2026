import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Share2, ArrowLeft, ArrowRight } from 'lucide-react';
import CTASection from '@/components/CTASection';
import { getNewsBySlug, getNewsSlugs, getNews } from '@/services/api';

export function generateStaticParams() {
  return getNewsSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const item = getNewsBySlug(slug);
  if (!item) return {};
  return {
    title: item.title,
    description: item.excerpt,
    openGraph: { title: item.title, description: item.excerpt, images: [item.image] },
  };
}

export default async function BeritaDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = getNewsBySlug(slug);
  if (!item) notFound();

  const allNews = getNews();
  const currentIndex = allNews.findIndex((n) => n.slug === slug);
  const prev = currentIndex > 0 ? allNews[currentIndex - 1] : null;
  const next = currentIndex < allNews.length - 1 ? allNews[currentIndex + 1] : null;

  const related = allNews.filter((n) => n.slug !== slug).slice(0, 3);

  return (
    <>
      <section className="relative min-h-[50vh] flex items-center overflow-hidden bg-[#0F172A]">
        <div className="absolute inset-0">
          <img src={item.image} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{
            background: [
              'radial-gradient(ellipse 70% 55% at 25% 25%, rgba(30, 58, 138, 0.35) 0%, transparent 60%)',
              'radial-gradient(ellipse 50% 40% at 75% 75%, rgba(251, 191, 36, 0.06) 0%, transparent 50%)',
              'linear-gradient(180deg, rgba(15, 23, 42, 0.80) 0%, rgba(15, 23, 42, 0.50) 40%, rgba(15, 23, 42, 0.60) 60%, rgba(15, 23, 42, 0.85) 100%)',
            ].join(', '),
          }} />
        </div>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FBBF24]/30 to-transparent" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-24 sm:py-32">
          <nav className="flex items-center gap-2 text-sm text-white/50 mb-6">
            <Link href="/" className="hover:text-white/80 transition-colors">Beranda</Link>
            <span className="text-white/30">/</span>
            <Link href="/berita" className="hover:text-white/80 transition-colors">Berita</Link>
            <span className="text-white/30">/</span>
            <span className="text-white/80 font-medium truncate">{item.title}</span>
          </nav>
          <span className={`inline-block px-3 py-1.5 rounded-xl text-xs font-semibold ${
            item.tag === 'Energi' ? 'bg-blue-100 text-blue-700' :
            item.tag === 'Prestasi' ? 'bg-amber-100 text-amber-700' :
            item.tag === 'Kerjasama' ? 'bg-emerald-100 text-emerald-700' :
            'bg-purple-100 text-purple-700'
          } mb-4`}>{item.tag}</span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-[1.15] font-[family-name:var(--font-display)] max-w-3xl">
            {item.title}
          </h1>
          <div className="flex items-center gap-3 text-sm text-white/50 mt-4">
            <Calendar className="w-4 h-4" />
            {item.date}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full z-10 leading-none">
          <svg viewBox="0 0 1440 80" fill="none" className="w-full h-auto">
            <path d="M0 30C240 65 480 10 720 40C960 70 1200 25 1440 50V80H0V30Z" fill="#F8FAFC" opacity="0.97" />
            <path d="M0 55C240 75 480 50 720 65C960 80 1200 55 1440 70V80H0V55Z" fill="#F8FAFC" />
          </svg>
        </div>
      </section>

      <article className="relative py-16 sm:py-24 bg-white overflow-hidden">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-sm sm:prose-base max-w-none text-gray-600 leading-relaxed space-y-5">
            {item.content.split('\n\n').map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>

          <div className="flex items-center justify-between pt-8 mt-12 border-t border-gray-100">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Share2 className="w-4 h-4" />
              <span>Bagikan artikel ini</span>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mt-12 pt-8 border-t border-gray-100">
            {prev && (
              <Link href={`/berita/${prev.slug}`} className="flex items-center gap-3 p-4 rounded-2xl hover:bg-[#F8FAFC] transition-colors group">
                <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-[#FBBF24] transition-colors flex-shrink-0" />
                <div className="min-w-0">
                  <span className="text-xs text-gray-400">Sebelumnya</span>
                  <p className="text-sm font-semibold text-[#0F172A] truncate">{prev.title}</p>
                </div>
              </Link>
            )}
            {next && (
              <Link href={`/berita/${next.slug}`} className="flex items-center gap-3 p-4 rounded-2xl hover:bg-[#F8FAFC] transition-colors group sm:text-right sm:flex-row-reverse">
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-[#FBBF24] transition-colors flex-shrink-0" />
                <div className="min-w-0">
                  <span className="text-xs text-gray-400">Selanjutnya</span>
                  <p className="text-sm font-semibold text-[#0F172A] truncate">{next.title}</p>
                </div>
              </Link>
            )}
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="relative py-16 sm:py-20 bg-[#F8FAFC] overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A] mb-10 font-[family-name:var(--font-display)]">Berita Terkait</h2>
            <div className="grid sm:grid-cols-3 gap-6">
              {related.map((r, i) => (
                <Link key={r.slug} href={`/berita/${r.slug}`}>
                  <div className="group rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500">
                    <div className="relative h-44 overflow-hidden">
                      <img src={r.image} alt={r.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <span className={`absolute top-3 left-3 px-2 py-1 rounded-lg text-xs font-semibold ${
                        r.tag === 'Energi' ? 'bg-blue-100 text-blue-700' :
                        r.tag === 'Prestasi' ? 'bg-amber-100 text-amber-700' :
                        r.tag === 'Kerjasama' ? 'bg-emerald-100 text-emerald-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>{r.tag}</span>
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                        <Calendar className="w-3.5 h-3.5" />
                        {r.date}
                      </div>
                      <h3 className="font-bold text-sm text-[#0F172A] group-hover:text-[#1E3A8A] transition-colors line-clamp-2">{r.title}</h3>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <CTASection
        title="Dapatkan Informasi Lebih Lanjut"
        description="Hubungi tim kami untuk informasi lebih detail tentang program dan kegiatan PPNS."
        buttons={[{ label: 'Hubungi Kami', href: '/kontak', variant: 'primary' }]}
        bgImage="https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1920&q=80"
      />
    </>
  );
}
