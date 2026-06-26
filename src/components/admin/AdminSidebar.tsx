"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard, Users, FlaskConical, Package, CalendarClock,
  ClipboardCheck, CheckSquare, UserCircle, LogOut, X, GraduationCap,
} from "lucide-react";
import { removeToken } from "@/services/auth";
import { useEffect, useState } from "react";
import { getAdminNotifications } from "@/services/notifications";
import { useAdminNotification } from "@/contexts/AdminNotificationContext";
const MENU = [
  {
    section: null, items: [
      { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    ]
  },
  {
    section: "Master Data", items: [
      { href: "/admin/users", icon: Users, label: "Users" },
      { href: "/admin/labs", icon: FlaskConical, label: "Labs" },
      { href: "/admin/items", icon: Package, label: "Alat" },
    ]
  },
  {
    section: "Account", items: [
      { href: "/admin/profile", icon: UserCircle, label: "Profile" },
    ]
  },
];

export default function AdminSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const handleLogout = () => {
    removeToken();
    router.push("/admin");
  };
  const { pendingLabCount } = useAdminNotification();

  const isActive = (href: string) => {
    if (href === '/admin/dashboard') return pathname === href;
    return pathname.startsWith(href);
  };

  const sidebar = (
    <aside className="h-full flex flex-col bg-[#0F172A] border-r border-white/5">
      <div className="flex items-center justify-between h-16 px-5 border-b border-white/5">
        <Link href="/admin/dashboard" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FBBF24] to-[#FCD34D] flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-[#0F172A]" strokeWidth={2} />
          </div>
          <span className="text-sm font-bold text-white font-[family-name:var(--font-display)]">PPNS Admin</span>
        </Link>
        <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg hover:bg-white/5 text-white/50 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 py-4 px-3 sidebar-scroll">
        {MENU.map((group) => (
          <div key={group.section || 'main'} className="mb-4">
            {group.section && (
              <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-white/30">
                {group.section}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${active
                        ? "bg-[#FBBF24]/10 text-[#FBBF24]"
                        : "text-white/50 hover:text-white hover:bg-white/5"
                      }`}
                  >
                    <div className="flex items-center w-full">
                      <Icon className="w-4.5 h-4.5 flex-shrink-0" strokeWidth={1.5} />

                      <span className="ml-3 flex-1">
                        {item.label}
                      </span>

                      {item.href === "/admin/labs" && pendingLabCount > 0 && (
                        <span className="min-w-[18px] h-[18px] px-1 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-lg shadow-red-500/30">
                          {pendingLabCount}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-white/5">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
        >
          <LogOut className="w-4.5 h-4.5 flex-shrink-0" strokeWidth={1.5} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );

  return (
    <>
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-60 lg:flex-col">{sidebar}</div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden" onClick={onClose}
          >
            <motion.div
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="absolute inset-y-0 left-0 w-60 bg-[#0F172A] shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {sidebar}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}