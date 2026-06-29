"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { getStatistics } from "@/services/api";
import type { Statistic } from "@/types";

const STATISTICS = getStatistics();

function Counter({
  value,
  suffix,
}: {
  value: number | string;
  suffix?: string;
}) {
  const [count, setCount] = useState<number>(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: false, margin: "-100px" });

  useEffect(() => {
    if (!isInView || typeof value !== "number") return;
    let start = 0;
    const duration = 2000;
    const step = Math.max(1, Math.floor(value / 60));
    const timer = setInterval(() => {
      start += step;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, duration / 60);
    return () => clearInterval(timer);
  }, [isInView, value]);

  const displayValue =
    typeof value === "number" ? count.toLocaleString() : String(value);

  return (
    <span ref={ref} className="tabular-nums">
      {displayValue}
      {typeof value === "number" ? suffix : suffix ? ` ${suffix}` : ""}
    </span>
  );
}

interface AboutProps {
  statistics?: Statistic[];
}

export default function About({ statistics }: AboutProps) {
  const data = statistics ?? STATISTICS;

  return (
    <section
      id="statistik"
      className="relative py-28 sm:py-36 lg:py-44 bg-white overflow-hidden"
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl mb-20 sm:mb-28"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0F172A]/5 text-[#0F172A] text-xs font-medium mb-6 border border-[#0F172A]/10">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FBBF24]" />
            Angka & Fakta
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#0F172A] leading-[1.1] font-[family-name:var(--font-display)]">
            Membangun Ekosistem{" "}
            <span className="bg-gradient-to-r from-[#0F172A] to-[#1E3A8A] bg-clip-text text-transparent">
              Maritim Masa Depan
            </span>
          </h2>
          <p className="text-base sm:text-lg text-gray-500 leading-relaxed mt-6 max-w-2xl">
            Sebagai politeknik perkapalan terkemuka di Indonesia, PPNS
            berkomitmen mencetak talenta unggul yang siap memimpin transformasi
            industri maritim nasional.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {data.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-100px" }}
              transition={{
                duration: 0.6,
                delay: i * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="group relative"
            >
              <div className="p-8 rounded-3xl bg-white border border-gray-100 glow-premium hover:border-[#FBBF24]/20 transition-all duration-500">
                <div className="text-5xl sm:text-6xl font-black text-[#0F172A] mb-2 font-[family-name:var(--font-display)]">
                  <Counter value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-base font-semibold text-[#0F172A] mb-1">
                  {stat.label}
                </div>
                <div className="text-sm text-gray-400">{stat.desc}</div>
              </div>
              <div className="absolute -bottom-2 left-8 right-8 h-0.5 bg-gradient-to-r from-transparent via-[#FBBF24]/40 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-80px" }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mt-20 p-10 sm:p-14 rounded-3xl bg-gradient-to-br from-[#0F172A] to-[#1E3A8A] relative overflow-hidden"
        >
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
            style={{
              backgroundImage:
                'url("https://images.unsplash.com/photo-1562774053-701939374585?w=1920&q=80")',
            }}
          />
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#FBBF24]/5 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full bg-[#FBBF24]/5 blur-3xl" />
          <div className="relative z-10 grid sm:grid-cols-3 gap-8 text-center sm:text-left">
            {[
              { value: "A+", label: "Peringkat Akreditasi" },
              { value: "1996", label: "Tahun Berdiri" },
              { value: "15+", label: "Negara Mitra" },
            ].map((item) => (
              <div
                key={item.label}
                className="sm:border-r sm:border-white/10 sm:last:border-r-0 sm:px-8 first:sm:pl-0 last:sm:pr-0"
              >
                <div className="text-4xl sm:text-5xl font-black text-[#FBBF24] font-[family-name:var(--font-display)]">
                  {item.value}
                </div>
                <div className="text-sm text-blue-200/70 font-medium mt-2">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
