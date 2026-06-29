"use client";

import { motion } from "framer-motion";
import { Quote, Target, Eye, Users, Building2, BookOpen } from "lucide-react";
import { getAboutData } from "@/services/api";
import type { SejarahData } from "@/types";

const DEFAULT_ABOUT_DATA = getAboutData();

interface TentangDetailProps {
  aboutData?: SejarahData;
}

export default function TentangDetail({ aboutData }: TentangDetailProps) {
  const data = aboutData ?? DEFAULT_ABOUT_DATA;

  return (
    <section className="relative pt-0 pb-16 sm:pb-20 bg-white overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
      <div
        className="absolute w-[500px] h-[500px] rounded-full blur-[120px] opacity-[0.03] pointer-events-none"
        style={{ background: "#1E3A8A", top: "5%", left: -100 }}
      />
      <div
        className="absolute w-[400px] h-[400px] rounded-full blur-[100px] opacity-[0.02] pointer-events-none"
        style={{ background: "#FBBF24", bottom: "20%", right: -80 }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0F172A]/5 text-[#0F172A] text-xs font-medium mb-6 border border-[#0F172A]/10">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FBBF24]" />
              Sejarah
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0F172A] leading-[1.1] mb-6 font-[family-name:var(--font-display)]">
              Perjalanan{" "}
              <span className="bg-gradient-to-r from-[#0F172A] to-[#1E3A8A] bg-clip-text text-transparent">
                PPNS
              </span>
            </h2>
            <div className="space-y-4">
              {data.sejarah.map((p, i) => (
                <p
                  key={i}
                  className="text-sm sm:text-base text-gray-600 leading-relaxed"
                >
                  {p}
                </p>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <div className="relative h-[400px] sm:h-[500px] rounded-3xl overflow-hidden shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1562774053-701939374585?w=800&q=80"
                alt="Gedung PPNS"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-[#0F172A]/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-8">
                <div className="flex items-center gap-3">
                  <Building2 className="w-5 h-5 text-[#FBBF24]" />
                  <span className="text-white font-semibold text-lg font-[family-name:var(--font-display)]">
                    Politeknik Perkapalan Negeri Surabaya
                  </span>
                </div>
                <p className="text-white/60 text-sm mt-1">Berdiri sejak 1996</p>
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-2xl bg-[#FBBF24]/10 border border-[#FBBF24]/20 flex items-center justify-center backdrop-blur-md">
              <span className="text-2xl font-black text-[#FBBF24] font-[family-name:var(--font-display)]">
                28+
              </span>
            </div>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 mt-28 sm:mt-36">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <div className="relative h-[350px] sm:h-[420px] rounded-3xl overflow-hidden shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1581092335391-9583eb1c0f6a?w=800&q=80"
                alt="Laboratorium PPNS"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-[#0F172A]/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-8">
                <div className="flex items-center gap-3">
                  <Target className="w-5 h-5 text-[#FBBF24]" />
                  <span className="text-white font-semibold text-lg font-[family-name:var(--font-display)]">
                    Visi & Misi
                  </span>
                </div>
                <p className="text-white/60 text-sm mt-1">
                  Arah dan tujuan institusi
                </p>
              </div>
            </div>
            <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-2xl bg-[#1E3A8A]/10 border border-[#1E3A8A]/20 flex items-center justify-center backdrop-blur-md">
              <Eye className="w-8 h-8 text-[#1E3A8A]" strokeWidth={1.5} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col justify-center"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0F172A]/5 text-[#0F172A] text-xs font-medium mb-6 border border-[#0F172A]/10 w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FBBF24]" />
              Visi
            </span>
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#0F172A] to-[#1E3A8A] relative overflow-hidden mb-8">
              <Quote className="absolute top-4 right-4 w-12 h-12 text-white/5" />
              <blockquote className="text-lg sm:text-xl font-semibold text-white leading-relaxed italic font-[family-name:var(--font-display)] relative z-10">
                &ldquo;{data.visi}&rdquo;
              </blockquote>
            </div>

            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0F172A]/5 text-[#0F172A] text-xs font-medium mb-6 border border-[#0F172A]/10 w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FBBF24]" />
              Misi
            </span>
            <ul className="space-y-4">
              {data.misi.map((m, i) => (
                <li key={i} className="flex items-start gap-3 group">
                  <span className="w-7 h-7 rounded-full bg-[#FBBF24]/20 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-[#FBBF24]/30 transition-colors">
                    <span className="text-xs font-bold text-[#FBBF24]">
                      {i + 1}
                    </span>
                  </span>
                  <span className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    {m}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mt-28 sm:mt-36"
        >
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0F172A]/5 text-[#0F172A] text-xs font-medium mb-6 border border-[#0F172A]/10">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FBBF24]" />
              Pimpinan
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0F172A] leading-[1.1] font-[family-name:var(--font-display)]">
              Struktur{" "}
              <span className="bg-gradient-to-r from-[#0F172A] to-[#1E3A8A] bg-clip-text text-transparent">
                Kepemimpinan
              </span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {data.pimpinan.map((p, i) => (
              <motion.div
                key={p.nama}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, margin: "-80px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 text-center group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-[#FBBF24]/10 to-transparent rounded-bl-full" />
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#0F172A] to-[#1E3A8A] flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:shadow-xl transition-all duration-300">
                  <Users className="w-8 h-8 text-white" strokeWidth={1.5} />
                </div>
                <h3 className="text-sm font-semibold text-[#0F172A] mb-1">
                  {p.nama}
                </h3>
                <p className="text-xs text-gray-400">{p.jabatan}</p>
                <div className="w-0 h-0.5 bg-gradient-to-r from-[#FBBF24] to-[#FCD34D] group-hover:w-full transition-all duration-500 mx-auto mt-4" />
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-80px" }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="mt-20 sm:mt-28"
        >
          <div className="rounded-3xl bg-gradient-to-br from-[#0F172A] to-[#1E3A8A] p-10 sm:p-14 relative overflow-hidden">
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10"
              style={{
                backgroundImage:
                  'url("https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1920&q=80")',
              }}
            />
            <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#FBBF24]/5 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full bg-[#FBBF24]/5 blur-3xl" />
            <div className="relative z-10 grid sm:grid-cols-3 gap-8 text-center sm:text-left">
              {[
                { icon: Building2, value: "4", label: "Fakultas" },
                { icon: BookOpen, value: "25+", label: "Program Studi" },
                { icon: Users, value: "10.000+", label: "Mahasiswa Aktif" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="sm:border-r sm:border-white/10 sm:last:border-r-0 sm:px-8 first:sm:pl-0 last:sm:pr-0"
                  >
                    <Icon
                      className="w-8 h-8 text-[#FBBF24] mb-4 sm:mx-0 mx-auto"
                      strokeWidth={1.5}
                    />
                    <div className="text-4xl sm:text-5xl font-black text-[#FBBF24] font-[family-name:var(--font-display)]">
                      {item.value}
                    </div>
                    <div className="text-sm text-blue-200/70 font-medium mt-2">
                      {item.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
