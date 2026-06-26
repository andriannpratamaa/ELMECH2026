"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import AdminWrapper from "@/components/admin/AdminWrapper";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";
import { AdminNotificationProvider } from "@/contexts/AdminNotificationContext";

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (pathname === "/admin") {
    return <>{children}</>;
  }

  return (
    <AdminWrapper>
      <AdminNotificationProvider>
        <div className="min-h-screen bg-[#0F172A] text-white">
          <AdminSidebar
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />

          <AdminTopbar
            onMenuClick={() => setSidebarOpen(true)}
          />

          <main className="min-h-screen pt-20 lg:ml-60 px-4 sm:px-6 lg:px-8 pb-6">
            {children}
          </main>
        </div>
      </AdminNotificationProvider>
    </AdminWrapper>
  );
}