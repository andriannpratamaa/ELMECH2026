"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AdminWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const raw = localStorage.getItem("user");
    let user: any = null;
    try { user = raw ? JSON.parse(raw) : null; } catch {}
    if (!token || !user || user.role !== "admin") {
      router.replace("/admin");
    } else {
      setChecked(true);
    }
  }, [router]);

  if (!checked) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[#FBBF24] animate-spin mx-auto" />
          <p className="text-white/50 text-sm mt-3">Memverifikasi akses...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
