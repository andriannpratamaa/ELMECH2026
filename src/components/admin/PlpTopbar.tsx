"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Bell, Menu, ChevronRight } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { getUser, removeToken } from "@/services/auth";

const PATH_LABELS: Record<string, string> = {
  "/kalab/dashboard": "Dashboard",
  "/kalab/labs": "Lab Saya",
};

export default function KalabTopbar({ onMenuClick }: { onMenuClick: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = getUser();
  const [showMenu, setShowMenu] = useState(false);

  const currentLabel = PATH_LABELS[pathname] || pathname.split("/").filter(Boolean).slice(1).pop()?.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "Dashboard";
  const initial = user?.name?.charAt(0)?.toUpperCase() || "K";

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-60 h-16 bg-white/5 backdrop-blur-xl border-b border-white/10 z-30">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <button onClick={onMenuClick} className="lg:hidden p-2 rounded-lg hover:bg-white/5 text-white/50 hover:text-white transition-colors">
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-1.5 text-xs text-white/30">
            <span>PLP</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white/70 font-medium">{currentLabel}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <button onClick={() => setShowMenu(!showMenu)} className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-white/5 transition-colors">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center text-xs font-bold text-white">
                {initial}
              </div>
              <span className="hidden sm:block text-sm text-white/70">{user?.name || "PLP"}</span>
            </button>

            {showMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-[#1E293B] border border-white/10 shadow-2xl z-50 py-1.5"
                >
                  <button onClick={() => { setShowMenu(false); router.push("/plp/dashboard"); }} className="w-full text-left px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors">
                    Dashboard
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
