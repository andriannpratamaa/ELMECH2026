"use client";

import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, FileText, Image, GraduationCap } from "lucide-react";
import Link from "next/link";

const navItems = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/pages/list", icon: FileText, label: "Konten" },
  { href: "/admin/media", icon: Image, label: "Media" },
];

export default function CMSSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) => {
    if (href === "/admin/dashboard") return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-60 bg-[#0F172A] border-r border-white/5 transform transition-transform duration-300 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-2.5 px-5 h-16 border-b border-white/5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#FBBF24] to-[#FCD34D] flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-[#0F172A]" strokeWidth={2} />
          </div>
          <span className="text-sm font-bold text-white font-[family-name:var(--font-display)]">CMS Green Campus</span>
        </div>

        <nav className="p-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive(item.href)
                  ? "bg-[#FBBF24]/10 text-[#FBBF24]"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              <item.icon className="w-4 h-4" strokeWidth={1.5} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-white/5">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/30 hover:text-white/60 hover:bg-white/5 transition-all"
          >
            <GraduationCap className="w-4 h-4" strokeWidth={1.5} />
            Lihat Website
          </Link>
        </div>
      </aside>
    </>
  );
}
