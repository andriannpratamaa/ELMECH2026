"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, ChevronRight, User, LogOut } from "lucide-react";
import { getUser, removeToken } from "@/services/auth";
import type { Profile } from "@/types/cms";

const breadcrumbs: Record<string, string> = {
  "/admin/dashboard": "Dashboard",
  "/admin/pages": "Beranda",
  "/admin/pages/list": "Pages",
  "/admin/media": "Media",
};

export default function CMSTopbar({ onMenuClick }: { onMenuClick: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<Profile | null>(null);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    setUser(getUser());
  }, []);

  const crumbs = Object.entries(breadcrumbs).filter(([key]) => pathname.startsWith(key));
  const isDetail = pathname.startsWith("/admin/pages/") && pathname !== "/admin/pages" && !pathname.startsWith("/admin/pages/list");

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-60 z-30 h-16 bg-[#0F172A]/80 backdrop-blur-xl border-b border-white/5">
      <div className="flex items-center justify-between h-full px-4 sm:px-6">
        <div className="flex items-center gap-2 text-sm">
          <button onClick={onMenuClick} className="lg:hidden p-1.5 rounded-lg hover:bg-white/5 text-white/50">
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-white/40">CMS</span>
          <ChevronRight className="w-3 h-3 text-white/20" />
          {crumbs.map(([, label]) => (
            <span key={label} className="text-white/70">{label}</span>
          ))}
          {isDetail && (
            <>
              <ChevronRight className="w-3 h-3 text-white/20" />
              <span className="text-white/70">Edit</span>
            </>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setMenu(!menu)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-white/5 transition-colors text-white/70 hover:text-white"
          >
            <User className="w-4 h-4" />
            <span className="text-sm hidden sm:block">{user?.name || "Admin"}</span>
          </button>

          {menu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenu(false)} />
              <div className="absolute right-0 top-full mt-1 z-20 w-48 rounded-xl bg-[#1E293B] border border-white/10 shadow-2xl py-1">
                <button
                  onClick={() => { setMenu(false); removeToken(); router.push("/admin"); }}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
