import type { Metadata } from "next";
import CmsPage from "@/components/cms/CmsPage";
import { motion } from "framer-motion";
import {
  FileText,
  Download,
  Search,
  FileSpreadsheet,
  Shield,
  FileCheck,
} from "lucide-react";
import PageHero from "@/components/PageHero";
import SectionTitle from "@/components/SectionTitle";
import CTASection from "@/components/CTASection";
import { fetchCmsPage } from "@/lib/cms";

const REPORTS = getReports();
const slug = "laporan";

export async function generateMetadata(): Promise<Metadata> {
  const page = await fetchCmsPage(slug);
  return {
    title: page?.title ?? "Laporan Keberlanjutan",
    description: page?.title
      ? `${page.title} - PPNS`
      : "Dokumen transparansi dan akuntabilitas program Green Campus PPNS.",
  };
}

export default async function LaporanPage() {
  const page = await fetchCmsPage(slug);
  const cmsContent =
    page && page.published
      ? Array.isArray(page.content)
        ? page.content
        : []
      : undefined;
  const formats = [...new Set(REPORTS.map((r) => r.format))];
  const filtered = REPORTS;

  return (
    <>
      <PageHero
        bgImage="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1440&q=80"
        title="Laporan Keberlanjutan"
        subtitle="Dokumen transparansi dan akuntabilitas program Green Campus PPNS"
        breadcrumbs={[{ label: "Beranda", href: "/" }, { label: "Laporan" }]}
      />

      <section className="relative pt-8 sm:pt-12 pb-16 sm:pb-20 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { icon: FileText, value: "6", label: "Total Dokumen" },
              { icon: Shield, value: "100%", label: "Transparan" },
              { icon: FileCheck, value: "2025", label: "Tahun Terbaru" },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-[#F8FAFC] border border-gray-100 text-center group hover:shadow-md transition-all"
              >
                <item.icon
                  className="w-8 h-8 text-[#FBBF24] mx-auto mb-3 group-hover:scale-110 transition-transform"
                  strokeWidth={1.5}
                />
                <div className="text-3xl font-black text-[#0F172A] font-[family-name:var(--font-display)]">
                  {item.value}
                </div>
                <div className="text-sm text-gray-400 mt-1">{item.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative pb-20 sm:pb-28 bg-white overflow-hidden">
        <div
          className="absolute w-[400px] h-[400px] rounded-full blur-[120px] opacity-[0.03] pointer-events-none"
          style={{ background: "#1E3A8A", top: "20%", left: -50 }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle
            badge="Download Center"
            title="Dokumen"
            highlight="Tersedia"
            align="left"
          />

          <div className="flex flex-col sm:flex-row gap-4 p-5 rounded-2xl bg-[#F8FAFC] border border-gray-100 mb-12">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari dokumen..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FBBF24]/50 focus:border-[#FBBF24] transition-all"
                disabled
              />
            </div>
            <div className="flex gap-2">
              <button
                disabled
                className="px-3 py-2 rounded-xl text-xs font-medium bg-white text-gray-600 border border-gray-200"
              >
                Semua Format
              </button>
              {formats.map((fmt) => (
                <button
                  key={fmt}
                  disabled
                  className="px-3 py-2 rounded-xl text-xs font-medium bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.length === 0 ? (
              <div className="sm:col-span-2 lg:col-span-3">
                <div className="rounded-3xl bg-[#F8FAFC] p-12 text-center text-gray-500">
                  Tidak ada dokumen ditemukan
                </div>
              </div>
            ) : (
              REPORTS.map((report, i) => (
                <motion.div
                  key={report.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, margin: "-80px" }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="group p-6 sm:p-8 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-orange-50/50 to-transparent rounded-bl-full -z-10" />
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                    {report.format === "XLSX" ? (
                      <FileSpreadsheet
                        className="w-7 h-7 text-emerald-600"
                        strokeWidth={1.5}
                      />
                    ) : (
                      <FileText
                        className="w-7 h-7 text-[#F97316]"
                        strokeWidth={1.5}
                      />
                    )}
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-2 font-[family-name:var(--font-display)]">
                    {report.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-5">
                    {report.desc}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-xs text-gray-400">
                      {report.format} • {report.fileSize}
                    </span>
                    <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0F4C81]/10 text-[#0F4C81] text-xs font-semibold hover:bg-[#0F4C81] hover:text-white transition-all duration-300">
                      <Download className="w-3.5 h-3.5" />
                      Unduh
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {cmsContent ? (
        <CmsPage slug={slug} initialData={{ content: cmsContent }} />
      ) : null}

      <CTASection
        title="Butuh Dokumen Lain?"
        description="Hubungi kami untuk permintaan dokumen atau informasi lebih lanjut."
        buttons={[
          { label: "Hubungi Kami", href: "/kontak", variant: "primary" },
        ]}
        bgImage="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1920&q=80"
      />
    </>
  );
}
