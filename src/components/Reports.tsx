'use client';

import { motion } from 'framer-motion';
import { FileText, Download } from 'lucide-react';
import { getReports } from '@/services/api';
const REPORTS = getReports();

export default function Reports() {
  return (
    <section id="laporan" className="relative py-16 sm:py-20 lg:py-32 bg-[#F8FAFC] overflow-hidden">
      <div className="absolute w-[350px] h-[350px] rounded-full blur-[100px] opacity-[0.05] pointer-events-none" style={{ background: '#F97316', top: '20%', left: -50 }} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const }}
          className="text-center max-w-3xl mx-auto mb-12 sm:mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-blue-100 text-[#0F4C81] text-xs sm:text-sm font-medium mb-4">
            Laporan
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 mb-4 sm:mb-6">
            Laporan{' '}
            <span className="bg-gradient-to-r from-[#0F4C81] to-[#3B82F6] bg-clip-text text-transparent">
              Keberlanjutan
            </span>
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 leading-relaxed">
            Unduh dokumen laporan dan pedoman terkait program Green Campus PPNS.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {REPORTS.map((report, i) => (
            <motion.div
              key={report.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: '-80px' }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] as const }}
              className="group p-5 sm:p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-400 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-orange-50/50 to-transparent rounded-bl-full -z-10" />
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center mb-4 sm:mb-5 group-hover:scale-110 transition-transform duration-300">
                <FileText className="w-6 h-6 sm:w-7 sm:h-7 text-[#F97316]" strokeWidth={1.5} />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-2">{report.title}</h3>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed mb-4">{report.desc}</p>
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <span className="text-[10px] sm:text-xs text-gray-400">
                  {report.format} &bull; {report.fileSize}
                </span>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0F4C81]/10 text-[#0F4C81] text-xs font-semibold hover:bg-[#0F4C81] hover:text-white transition-all duration-300">
                  <Download className="w-3.5 h-3.5" />
                  Unduh
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
