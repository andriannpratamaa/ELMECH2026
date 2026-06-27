"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import AdminWrapper from "@/components/admin/AdminWrapper";
import CMSSidebar from "@/components/admin/CMSSidebar";
import CMSTopbar from "@/components/admin/CMSTopbar";

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (pathname === "/admin") {
    return <>{children}</>;
  }

  return (
    <AdminWrapper>
      <div className="min-h-screen bg-[#0F172A] text-white">
        <CMSSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <CMSTopbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="min-h-screen pt-20 lg:ml-60 px-4 sm:px-6 lg:px-8 pb-6">
          {children}
        </main>
      </div>
    </AdminWrapper>
  );
}
