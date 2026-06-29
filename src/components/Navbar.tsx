"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Menu, X, GraduationCap, Shield, ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getNavbarItems } from "@/services/cms";
import type { NavbarItem } from "@/services/cms";

const dropdownVariants: Variants = {
  hidden: { opacity: 0, y: 8, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.2 },
  },
  exit: {
    opacity: 0,
    y: 4,
    scale: 0.98,
    transition: { duration: 0.15 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -12 },
  visible: {
    opacity: 1,
    x: 0,
  },
};

const stagger: Variants = {
  visible: { transition: { staggerChildren: 0.04, delayChildren: 0.05 } },
};

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [navItems, setNavItems] = useState<NavbarItem[]>([]);
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const [expandedMobile, setExpandedMobile] = useState<number | null>(null);
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
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    if (!open) setExpandedMobile(null);
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
        className={`fixed z-[100] left-3 right-3 sm:left-5 sm:right-5 lg:left-1/2 lg:right-auto lg:-translate-x-1/2 ${scrolled ? "top-3" : "top-6"}`}
      >
        <nav
          className={`mx-auto transition-all duration-300 w-full lg:w-[calc(100vw-2rem)] lg:max-w-6xl ${scrolled ? "glass-nav-scrolled rounded-2xl lg:rounded-full h-14" : "glass-nav rounded-2xl h-16 sm:h-[72px] lg:h-16"}`}
        >
          <div className="flex items-center justify-between h-full px-5 lg:px-8">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div
                className={`rounded-xl bg-gradient-to-br from-[#0F172A] to-[#1E3A8A] flex items-center justify-center shadow-lg transition-all duration-300 group-hover:shadow-xl group-hover:scale-105 ${scrolled ? "w-9 h-9" : "w-[42px] h-[42px] lg:w-10 lg:h-10"}`}
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
                const isOpen = activeDropdown === item.id;
                return (
                  <div
                    key={item.id}
                    className="relative"
                    onMouseEnter={() => hasChildren && setActiveDropdown(item.id)}
                    onMouseLeave={() =>
                      hasChildren && setActiveDropdown((cur) => (cur === item.id ? null : cur))
                    }
                  >
                    <Link
                      href={item.href || "/"}
                      className={`nav-link inline-flex items-center gap-1 px-3 lg:px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${isActive(item.href || "/") ? scrolled ? "text-[#0F172A] bg-gray-100" : "text-white bg-white/10" : scrolled ? "text-gray-600 hover:text-[#0F172A] hover:bg-gray-100" : "text-white/80 hover:text-white hover:bg-white/10"}`}
                    >
                      {item.label}
                      {hasChildren && (
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                          strokeWidth={2}
                        />
                      )}
                    </Link>

                    <AnimatePresence>
                      {hasChildren && isOpen && (
                        <motion.div
                          variants={dropdownVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          className="absolute left-0 mt-2 w-56 overflow-hidden"
                          style={{ zIndex: 120 }}
                        >
                          <div className="relative bg-slate-900 border border-white/10 rounded-xl shadow-2xl shadow-black/30 overflow-hidden">
                            <motion.div variants={stagger} initial="hidden" animate="visible" className="relative py-1.5">
                              {item.children!.map((c, ci) => (
                                <motion.div
                                                key={c.id}
                                                variants={itemVariants}
                                                transition={{ delay: ci * 0.04, duration: 0.25 }}
                                              >
                                  <Link
                                    href={c.href || "/"}
                                    className={`group relative flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-200 ${isActive(c.href || "/") ? "text-white bg-white/10" : "text-white/80 hover:text-white hover:bg-white/[0.06]"}`}
                                  >
                                    <span className={`w-0.5 h-4 rounded-full transition-all duration-200 ${isActive(c.href || "/") ? "bg-[#FBBF24] opacity-100" : "bg-white/20 opacity-0 group-hover:opacity-100"}`} />
                                    <span>{c.label}</span>
                                  </Link>
                                </motion.div>
                              ))}
                            </motion.div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
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
                  <X className={`w-7 h-7 ${scrolled ? "text-[#0F172A]" : "text-white"}`} />
                ) : (
                  <Menu className={`w-7 h-7 ${scrolled ? "text-[#0F172A]" : "text-white"}`} />
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
              <div className="space-y-1 flex-1 overflow-y-auto">
                {navItems.map((item, i) => {
                  const hasChildren = item.children && item.children.length > 0;
                  const isExpanded = expandedMobile === item.id;
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05, duration: 0.3 }}
                    >
                      {hasChildren ? (
                        <div>
                          <button
                            onClick={() => setExpandedMobile(isExpanded ? null : item.id)}
                            className="flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-medium transition-all text-white/70 hover:text-white hover:bg-white/10"
                          >
                            <span>{item.label}</span>
                            <ChevronDown
                              className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                              strokeWidth={2}
                            />
                          </button>
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                                className="overflow-hidden"
                              >
                                <div className="pl-4 pr-2 pb-2 space-y-0.5">
                                  {item.children!.map((c) => (
                                    <Link
                                      key={c.id}
                                      href={c.href || "/"}
                                      onClick={() => setOpen(false)}
                                      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all ${isActive(c.href || "/") ? "text-white bg-white/10" : "text-white/60 hover:text-white hover:bg-white/5"}`}
                                    >
                                      <span className="w-1 h-1 rounded-full bg-white/20" />
                                      {c.label}
                                    </Link>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ) : (
                        <Link
                          href={item.href || "/"}
                          onClick={() => setOpen(false)}
                          className={`block w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive(item.href || "/") ? "text-white bg-white/10" : "text-white/70 hover:text-white hover:bg-white/10"}`}
                        >
                          {item.label}
                        </Link>
                      )}
                    </motion.div>
                  );
                })}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: navItems.length * 0.05 + 0.05, duration: 0.3 }}
                >
                  <Link
                    href="/admin"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-medium text-[#FBBF24] bg-[#FBBF24]/10 border border-[#FBBF24]/20 mt-2"
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
