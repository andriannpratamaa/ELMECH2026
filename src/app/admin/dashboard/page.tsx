"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getUser } from "@/services/auth";
import { Settings, FileText, Image } from "lucide-react";
import type { Profile } from "@/types/cms";

export default function DashboardPage() {
  const [user, setUser] = useState<Profile | null>(null);

  useEffect(() => {
    setUser(getUser());
  }, []);

  const quickAccess = [
    { icon: FileText, label: "Konten", href: "/admin/pages", description: "Kelola halaman dan navbar" },
    { icon: Image, label: "Media", href: "/admin/media", description: "Kelola gambar dan file" },
    { icon: Settings, label: "Settings", href: "#", description: "Pengaturan lainnya" },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-br from-[#1E3A8A]/40 to-[#0F172A] border border-white/10 p-6 sm:p-8">
        <p className="text-white/50 text-sm">Selamat Datang,</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-white font-[family-name:var(--font-display)] mt-1">
          {user?.name || "Pengguna"}
        </h1>
        <span className="inline-block mt-2 px-3 py-1 rounded-lg bg-[#FBBF24]/10 border border-[#FBBF24]/20 text-[#FBBF24] text-xs font-semibold uppercase tracking-wider">
          CMS Admin
        </span>
      </div>

      {/* Quick Access */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickAccess.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className="rounded-2xl bg-white/5 border border-white/10 hover:border-[#FBBF24]/40 hover:bg-white/10 p-6 transition-all group"
            >
              <Icon className="w-8 h-8 text-[#FBBF24] mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-white">{item.label}</h3>
              <p className="text-xs text-white/40 mt-1">{item.description}</p>
            </Link>
          );
        })}
      </div>

      <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-8 text-center">
        <p className="text-white/40 text-sm">
          Gunakan menu di atas untuk mengelola konten website Anda.
        </p>
      </div>
    </div>
  );
}
