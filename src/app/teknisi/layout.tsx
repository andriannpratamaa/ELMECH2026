"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import RoleGuard from "@/components/auth/RoleGuard";
import TeknisiSidebar from "@/components/admin/TeknisiSidebar";
import TeknisiTopbar from "@/components/admin/TeknisiTopbar";
import { TeknisiNotificationProvider } from "@/contexts/TeknisiNotificationContext";

function TeknisiWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const raw = localStorage.getItem("user");

    let user: any = null;

    try {
      user = raw ? JSON.parse(raw) : null;
    } catch {}

    if (!token || !user || user.role !== "teknisi") {
      router.replace("/admin");
    } else {
      setChecked(true);
    }
  }, [router]);

  if (!checked) {
    return (
      <div className="min-h-screen bg-green-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-green-400 animate-spin mx-auto" />
          <p className="text-green-200 text-sm mt-3">
            Memverifikasi akses teknisi...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default function TeknisiLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
    <RoleGuard roles={["teknisi"]}>
    <TeknisiNotificationProvider>
        <div className="min-h-screen bg-[#0F172A] text-white">

            <TeknisiSidebar
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <TeknisiTopbar
                onMenuClick={() => setSidebarOpen(true)}
            />

            <main className="min-h-screen pt-20 lg:ml-60 px-4 sm:px-6 lg:px-8 pb-6">
                {children}
            </main>

        </div>
    </TeknisiNotificationProvider>
    </RoleGuard>
        
    );
}