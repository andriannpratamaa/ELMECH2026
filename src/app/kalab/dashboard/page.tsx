"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser, getToken } from "@/services/auth";
import type { Profile } from "@/types/admin";

export default function KalabDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<Profile | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const token = getToken();
    const u = getUser();

    if (!token || !u || u.role !== "kalab") {
      router.replace("/admin");
    } else {
      setUser(u);
      setChecked(true);
    }
  }, [router]);

  if (!checked) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#FBBF24] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold font-[family-name:var(--font-display)]">Dashboard Kalab</h1>
        <p className="text-white/50 mt-2">Selamat datang, {user?.name}</p>
      </div>
    </div>
  );
}
