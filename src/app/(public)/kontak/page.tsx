'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Mail, Phone, Clock, Send, GraduationCap, Users, Building2, Globe, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import PageHero from '@/components/PageHero';
import SectionTitle from '@/components/SectionTitle';
import ContactCard from '@/components/ContactCard';
import CTASection from '@/components/CTASection';
import { getContactInfo } from '@/services/api';

const CONTACT_INFO = getContactInfo();

export default function KontakPage() {
  const [submitted, setSubmitted] = useState(false);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <>
      <PageHero
        bgImage="https://images.unsplash.com/photo-1562774053-701939374585?w=1440&q=80"
        title="Hubungi Kami"
        subtitle="Kami siap membantu Anda. Hubungi tim PPNS melalui informasi di bawah."
        breadcrumbs={[{ label: 'Beranda', href: '/' }, { label: 'Kontak' }]}
      />

      <section className="relative pt-8 sm:pt-12 pb-16 sm:pb-20 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-4 gap-6">
            {[
              { icon: GraduationCap, value: '10.000+', label: 'Mahasiswa' },
              { icon: Users, value: '500+', label: 'Tenaga Pendidik' },
              { icon: Building2, value: '25+', label: 'Program Studi' },
              { icon: Globe, value: '15', label: 'Negara Mitra' },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-[#F8FAFC] border border-gray-100 text-center group hover:shadow-md transition-all"
              >
                <item.icon className="w-7 h-7 text-[#FBBF24] mx-auto mb-3 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
                <div className="text-2xl font-black text-[#0F172A] font-[family-name:var(--font-display)]">{item.value}</div>
                <div className="text-sm text-gray-400 mt-1">{item.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative pb-16 sm:pb-20 bg-white overflow-hidden">
        <div className="absolute w-[500px] h-[500px] rounded-full blur-[120px] opacity-[0.03] pointer-events-none" style={{ background: '#FBBF24', top: '30%', right: -100 }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle badge="Informasi Kontak" title="Hubungi" highlight="Kami" align="left" />

          <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
            <div className="lg:col-span-2 space-y-6">
              <ContactCard icon={MapPin} label="Alamat" value={CONTACT_INFO.address} index={0} />
              <ContactCard icon={Mail} label="Email" value={CONTACT_INFO.email} index={1} />
              <ContactCard icon={Phone} label="Telepon" value={CONTACT_INFO.phone} index={2} />
              <ContactCard icon={Clock} label="Jam Operasional" value={CONTACT_INFO.hours} index={3} />
            </div>

            <div className="lg:col-span-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="rounded-3xl overflow-hidden border border-gray-100 shadow-sm h-[360px]"
              >
                <iframe src={CONTACT_INFO.maps} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Lokasi PPNS" />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-16 sm:py-20 bg-[#F8FAFC] overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
        <div className="absolute w-[400px] h-[400px] rounded-full blur-[120px] opacity-[0.03] pointer-events-none" style={{ background: '#1E3A8A', bottom: '10%', left: -50 }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle badge="Kirim Pesan" title="Ada Pertanyaan?" highlight="Tulis Pesan" />

          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.6 }}
              className="relative h-[500px] rounded-3xl overflow-hidden shadow-xl order-2 lg:order-1"
            >
              <img
                src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&q=80"
                alt="Kampus PPNS"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-[#0F172A]/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-8">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-[#FBBF24]" />
                  <span className="text-white font-semibold text-lg">PPNS Smart Maritime Campus</span>
                </div>
                <p className="text-white/60 text-sm mt-1">Jl. Teknik Kimia, Keputih, Sukolilo, Surabaya</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="order-1 lg:order-2"
            >
              <div className="p-8 sm:p-10 rounded-3xl bg-white border border-gray-100 shadow-sm">
                {submitted ? (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-8 rounded-2xl bg-emerald-50 border border-emerald-100 text-center">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                      <Send className="w-7 h-7 text-emerald-600" />
                    </div>
                    <h3 className="font-bold text-emerald-800 text-lg mb-1">Pesan Terkirim!</h3>
                    <p className="text-sm text-emerald-600">Tim kami akan menghubungi Anda segera.</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">Nama Lengkap</label>
                        <input type="text" required placeholder="Nama Anda" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FBBF24]/50 focus:border-[#FBBF24] transition-all" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">Email</label>
                        <input type="email" required placeholder="email@example.com" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FBBF24]/50 focus:border-[#FBBF24] transition-all" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">Subjek</label>
                      <input type="text" required placeholder="Subjek pesan" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FBBF24]/50 focus:border-[#FBBF24] transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">Pesan</label>
                      <textarea required rows={5} placeholder="Tulis pesan Anda..." className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FBBF24]/50 focus:border-[#FBBF24] transition-all resize-none" />
                    </div>
                    <button type="submit" className="w-full py-3.5 rounded-xl bg-[#0F172A] text-white font-semibold text-sm hover:bg-[#1E3A8A] transition-all duration-300 hover:scale-[1.02] shadow-lg flex items-center justify-center gap-2">
                      <Send className="w-4 h-4" />
                      Kirim Pesan
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <CTASection
        title="Kunjungi Langsung Kampus PPNS"
        description="Dapatkan pengalaman langsung melihat fasilitas kampus dan bertemu dengan tim akademik kami."
        buttons={[{ label: 'Lihat Program Studi', href: '/program', variant: 'primary' }]}
        bgImage="https://images.unsplash.com/photo-1562774053-701939374585?w=1920&q=80"
      />
    </>
  );
}
