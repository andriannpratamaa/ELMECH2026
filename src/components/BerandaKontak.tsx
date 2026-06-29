"use client";

import { motion } from "framer-motion";
import { MapPin, Mail, Phone, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ContactInfo } from "@/types";

interface BerandaKontakProps {
  contactInfo?: ContactInfo;
}

interface BerandaKontakProps {
  contactInfo?: ContactInfo;
}

export default function BerandaKontak({ contactInfo }: BerandaKontakProps) {
  const CONTACT_INFO = contactInfo ?? {
    address: "",
    phone: "",
    email: "",
  };
  return (
    <section className="relative py-20 sm:py-28 lg:py-36 bg-white overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl mb-16 sm:mb-20"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0F172A]/5 text-[#0F172A] text-xs font-medium mb-6 border border-[#0F172A]/10">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FBBF24]" />
            Kontak
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#0F172A] leading-[1.1] font-[family-name:var(--font-display)]">
            Hubungi{" "}
            <span className="bg-gradient-to-r from-[#0F172A] to-[#1E3A8A] bg-clip-text text-transparent">
              Kami
            </span>
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {[
            { icon: MapPin, title: "Alamat", detail: CONTACT_INFO.address },
            { icon: Mail, title: "Email", detail: CONTACT_INFO.email },
            { icon: Phone, title: "Telepon", detail: CONTACT_INFO.phone },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-80px" }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="text-center group"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#F8FAFC] flex items-center justify-center mx-auto mb-4 group-hover:bg-[#FBBF24]/10 group-hover:scale-110 transition-all duration-300">
                <item.icon
                  className="w-6 h-6 text-[#0F172A]"
                  strokeWidth={1.5}
                />
              </div>
              <h3 className="text-sm font-semibold text-[#0F172A] mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {item.detail}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mt-12"
        >
          <Link
            href="/kontak"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0F172A] text-white font-semibold text-sm hover:bg-[#1E3A8A] transition-all duration-300 hover:scale-105 shadow-lg"
          >
            Halaman Kontak Lengkap
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
