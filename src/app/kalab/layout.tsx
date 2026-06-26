"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useEffect, useState as useStateImport } from "react";
import { useRouter } from "next/navigation";
import KalabSidebar from "@/components/admin/KalabSidebar";
import KalabTopbar from "@/components/admin/KalabTopbar";
import { KalabNotificationProvider } from "@/contexts/KalabNotificationContext";

function KalabWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checked, setChecked] = useStateImport(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const raw = localStorage.getItem("user");
    let user: any = null;
    try { user = raw ? JSON.parse(raw) : null; } catch {}
    if (!token || !user || user.role !== "kalab") {
      router.replace("/admin");
    } else {
      setChecked(true);
    }
  }, [router]);

  if (!checked) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin mx-auto" />
          <p className="text-white/50 text-sm mt-3">Memverifikasi akses...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default function KalabRootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

return (
  <KalabWrapper>
    <KalabNotificationProvider>
      <div className="min-h-screen bg-[#0F172A] text-white">
        <KalabSidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <KalabTopbar
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="min-h-screen pt-20 lg:ml-60 px-4 sm:px-6 lg:px-8 pb-6">
          {children}
        </main>
      </div>
    </KalabNotificationProvider>
  </KalabWrapper>
);
}
