"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, GraduationCap, Shield } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getNavbarItems } from "@/services/cms";
import type { NavbarItem } from "@/services/cms";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [navItems, setNavItems] = useState<NavbarItem[]>([]);
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const load = async () => {
      try {
        const items = await getNavbarItems();
        setNavItems(items || []);
      } catch (e) {
        console.error("Failed to load navbar:", e);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) => {
    if (!href) return false;
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className={`fixed z-[100] left-3 right-3 sm:left-5 sm:right-5 lg:left-1/2 lg:right-auto lg:-translate-x-1/2 ${
          scrolled ? "top-3" : "top-6"
        }`}
      >
        <nav
          className={`mx-auto transition-all duration-300 w-full lg:w-[calc(100vw-2rem)] lg:max-w-6xl ${
            scrolled
              ? "glass-nav-scrolled rounded-2xl lg:rounded-full"
              : "glass-nav rounded-2xl"
          } ${scrolled ? "h-14" : "h-16 sm:h-[72px] lg:h-16"}`}
        >
          <div className="flex items-center justify-between h-full px-5 lg:px-8">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div
                className={`rounded-xl bg-gradient-to-br from-[#0F172A] to-[#1E3A8A] flex items-center justify-center shadow-lg transition-all duration-300 group-hover:shadow-xl group-hover:scale-105 ${
                  scrolled ? "w-9 h-9" : "w-[42px] h-[42px] lg:w-10 lg:h-10"
                }`}
              >
                <GraduationCap
                  className={`text-white transition-all duration-300 ${scrolled ? "w-4 h-4" : "w-5 h-5"}`}
                  strokeWidth={2}
                />
              </div>
              <span
                className={`font-bold tracking-tight font-[family-name:var(--font-display)] transition-all duration-300 ${scrolled ? "text-sm text-[#0F172A]" : "text-sm lg:text-lg text-white"}`}
              >
                PPNS
              </span>
            </Link>

            <div className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const hasChildren = item.children && item.children.length > 0;
                return (
                  <div
                    key={item.id}
                    className="relative"
                    onMouseEnter={() =>
                      hasChildren && setActiveDropdown(item.id)
                    }
                    onMouseLeave={() =>
                      hasChildren &&
                      setActiveDropdown((cur) => (cur === item.id ? null : cur))
                    }
                  >
                    <Link
                      href={item.href || "/"}
                      className={`nav-link px-3 lg:px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isActive(item.href || "/")
                          ? scrolled
                            ? "text-[#0F172A] bg-gray-100"
                            : "text-white bg-white/10"
                          : scrolled
                            ? "text-gray-600 hover:text-[#0F172A] hover:bg-gray-100"
                            : "text-white/80 hover:text-white hover:bg-white/10"
                      } ${hasChildren ? "underline decoration-white/90 decoration-2 underline-offset-6" : ""}`}
                    >
                      {item.label}
                    </Link>

                    {hasChildren && (
                      <div
                        className={`absolute left-0 mt-2 w-56 bg-slate-900/95 border border-white/10 rounded-lg shadow-2xl transform transition-all ${
                          activeDropdown === item.id
                            ? "opacity-100 translate-y-0 pointer-events-auto scale-100"
                            : "opacity-0 -translate-y-1 pointer-events-none scale-95"
                        }`}
                        style={{ zIndex: 120 }}
                      >
                        <div className="py-1">
                          {item.children!.map((c) => (
                            <Link
                              key={c.id}
                              href={c.href || "/"}
                              className={`block px-4 py-2 text-sm text-white/90 hover:text-white hover:bg-white/5 ${isActive(c.href || "/") ? "bg-white/10 text-white" : ""}`}
                            >
                              {c.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/admin"
                className="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#FBBF24] bg-[#FBBF24]/10 border border-[#FBBF24]/20 hover:bg-[#FBBF24]/20 transition-all duration-300"
              >
                <Shield className="w-3.5 h-3.5" />
                Admin
              </Link>
              <Link
                href="/program"
                className="hidden lg:inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-[#0F172A] bg-[#FBBF24] hover:bg-[#FCD34D] transition-all duration-300 hover:scale-105 shadow-lg shadow-[#FBBF24]/20"
              >
                Info Akademik
              </Link>
              <button
                onClick={() => setOpen(!open)}
                className={`lg:hidden p-2 rounded-lg transition-colors ${scrolled ? "hover:bg-gray-100" : "hover:bg-white/10"}`}
                aria-label="Toggle menu"
              >
                {open ? (
                  <X
                    className={`w-7 h-7 ${scrolled ? "text-[#0F172A]" : "text-white"}`}
                  />
                ) : (
                  <Menu
                    className={`w-7 h-7 ${scrolled ? "text-[#0F172A]" : "text-white"}`}
                  />
                )}
              </button>
            </div>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[105] bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 z-[110] w-[280px] bg-slate-950/95 backdrop-blur-xl lg:hidden shadow-2xl"
          >
            <div className="flex flex-col h-full pt-24 pb-8 px-6">
              <div className="space-y-1 flex-1">
                {navItems.map((item, i) => (
                  <div key={item.id}>
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05, duration: 0.3 }}
                    >
                      <Link
                        href={item.href || "/"}
                        onClick={() => setOpen(false)}
                        className={`block w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive(item.href || "/") ? "text-white bg-white/10" : "text-white/70 hover:text-white hover:bg-white/10"}`}
                      >
                        <span className="flex items-center justify-between">
                          <span>{item.label}</span>
                          {item.children && item.children.length > 0 && (
                            <span className="text-sm text-white/70">▾</span>
                          )}
                        </span>
                      </Link>
                    </motion.div>
                    {item.children && item.children.length > 0 && (
                      <div className="pl-6">
                        {item.children.map((c, ci) => (
                          <motion.div
                            key={c.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{
                              delay: (i + ci + 1) * 0.03,
                              duration: 0.2,
                            }}
                          >
                            <Link
                              href={c.href || "/"}
                              onClick={() => setOpen(false)}
                              className={`block w-full text-left px-4 py-2 rounded-md text-sm font-medium transition-all text-white/70 hover:text-white hover:bg-white/5 ${isActive(c.href || "/") ? "text-white bg-white/10" : ""}`}
                            >
                              {c.label}
                            </Link>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: navItems.length * 0.05 + 0.05,
                    duration: 0.3,
                  }}
                >
                  <Link
                    href="/admin"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-medium text-[#FBBF24] bg-[#FBBF24]/10 border border-[#FBBF24]/20"
                  >
                    <Shield className="w-4 h-4" />
                    Admin
                  </Link>
                </motion.div>
              </div>
              <div className="pt-6 border-t border-white/10">
                <Link
                  href="/program"
                  onClick={() => setOpen(false)}
                  className="block w-full px-4 py-3 rounded-xl text-sm font-semibold text-[#0F172A] bg-[#FBBF24] hover:bg-[#FCD34D] transition-all text-center"
                >
                  Info Akademik
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
