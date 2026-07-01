"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import RoleGuard from "@/components/auth/RoleGuard";
import TeknisiSidebar from "@/components/admin/TeknisiSidebar";
import TeknisiTopbar from "@/components/admin/TeknisiTopbar";

export default function TeknisiLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
    <RoleGuard roles={["teknisi"]}>
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
    </RoleGuard>
        
    );
}