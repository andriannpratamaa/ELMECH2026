"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Bell, Menu, ChevronRight } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { getUser, removeToken } from "@/services/auth";

const PATH_LABELS: Record<string, string> = {
  "/admin/dashboard": "Dashboard",
  "/admin/users": "Users",
  "/admin/labs": "Laboratories",
  "/admin/items": "Peralatan",
  "/admin/schedules": "Schedules",
  "/admin/inspections": "Inspections",
  "/admin/criteria": "Criteria",
  "/admin/profile": "Profile",
};

export default function AdminTopbar({ onMenuClick }: { onMenuClick: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = getUser();
  const [showMenu, setShowMenu] = useState(false);

  const currentLabel = PATH_LABELS[pathname] || "Dashboard";
  const initial = user?.name?.charAt(0)?.toUpperCase() || "A";

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-60 h-16 bg-white/5 backdrop-blur-xl border-b border-white/10 z-30">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <button onClick={onMenuClick} className="lg:hidden p-2 rounded-lg hover:bg-white/5 text-white/50 hover:text-white transition-colors">
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-1.5 text-xs text-white/30">
            <span>Admin</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white/70 font-medium">{currentLabel}</span>
          </div>

          <div className="relative hidden sm:block ml-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              placeholder="Cari..."
              className="w-56 lg:w-72 pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#FBBF24]/40 focus:border-[#FBBF24]/40 transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="relative p-2 rounded-lg hover:bg-white/5 text-white/50 hover:text-white transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-[#0F172A]" />
          </button>

          <div className="relative">
            <button onClick={() => setShowMenu(!showMenu)} className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-white/5 transition-colors">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FBBF24] to-[#FCD34D] flex items-center justify-center text-xs font-bold text-[#0F172A]">
                {initial}
              </div>
              <span className="hidden sm:block text-sm text-white/70">{user?.name || "Admin"}</span>
            </button>

            {showMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-[#1E293B] border border-white/10 shadow-2xl z-50 py-1.5"
                >
                  <button onClick={() => { setShowMenu(false); router.push("/admin/profile"); }} className="w-full text-left px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors">
                    Profile
                  </button>
                  <div className="border-t border-white/5 my-1" />
                  <button onClick={() => { removeToken(); router.push("/admin"); }} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                    Logout
                  </button>
                </motion.div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
