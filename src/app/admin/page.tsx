"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { GraduationCap, ArrowLeft, Mail, Lock, Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { login } from "@/services/auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Silakan isi email dan password");
      return;
    }
    setError("");
    setLoading(true);

    const result = await login({ email, password });

    if (result.success && result.token) {
      setSuccess(true);
      setTimeout(() => router.push("/admin/dashboard"), 1500);
    } else {
      setError(result.message || "Login gagal. Periksa email dan password.");
      setLoading(false);
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0F172A]">
      <motion.div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1562774053-701939374585?w=1920&q=80")' }}
        animate={{ scale: [1, 1.06] }}
        transition={{ duration: 20, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
      />
      <div className="absolute inset-0" style={{ background: ["radial-gradient(ellipse 70% 55% at 25% 25%, rgba(30, 58, 138, 0.45) 0%, transparent 60%)", "radial-gradient(ellipse 50% 40% at 75% 75%, rgba(251, 191, 36, 0.06) 0%, transparent 50%)", "linear-gradient(180deg, rgba(15, 23, 42, 0.85) 0%, rgba(15, 23, 42, 0.60) 50%, rgba(15, 23, 42, 0.90) 100%)"].join(", ") }} />
      <motion.div animate={{ x: [0, 30, 0], y: [0, -20, 0] }} transition={{ duration: 10, ease: "easeInOut", repeat: Infinity }} className="absolute top-20 right-20 w-[300px] h-[300px] rounded-full bg-[#1E3A8A]/15 blur-[100px] pointer-events-none" />
      <motion.div animate={{ x: [0, -20, 0], y: [0, 15, 0] }} transition={{ duration: 12, ease: "easeInOut", repeat: Infinity }} className="absolute bottom-20 left-10 w-48 h-48 rounded-full bg-[#FBBF24]/8 blur-[80px] pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FBBF24]/20 to-transparent" />

      <div className="relative z-10 w-full px-4">
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="mx-auto" style={{ maxWidth: "420px" }}>
          <div className="rounded-3xl bg-white/10 backdrop-blur-2xl border border-white/10 shadow-2xl p-8 sm:p-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }} className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FBBF24] to-[#FCD34D] flex items-center justify-center mx-auto mb-5 shadow-lg">
                <GraduationCap className="w-8 h-8 text-[#0F172A]" strokeWidth={1.5} />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white font-[family-name:var(--font-display)]">Login Portal</h1>
              <p className="text-sm text-white/50 mt-2">Masuk untuk mengelola inspeksi laboratorium</p>
            </motion.div>

            {success ? (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }} className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </motion.div>
                <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-white font-semibold text-lg">Login Berhasil</motion.p>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-white/40 text-sm mt-1">Mengalihkan...</motion.p>
              </motion.div>
            ) : (
              <>
                {error && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs text-center">
                    {error}
                  </motion.div>
                )}
                <form onSubmit={handleSubmit} className="space-y-5">
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}>
                    <label className="block text-xs font-medium text-white/60 mb-1.5">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(""); }} placeholder="admin@ppns.ac.id" className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#FBBF24]/50 focus:border-[#FBBF24]/50 transition-all backdrop-blur-md" />
                    </div>
                  </motion.div>
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.6 }}>
                    <label className="block text-xs font-medium text-white/60 mb-1.5">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => { setPassword(e.target.value); setError(""); }} placeholder="••••••••" className="w-full pl-10 pr-10 py-3 rounded-xl bg-white/10 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#FBBF24]/50 focus:border-[#FBBF24]/50 transition-all backdrop-blur-md" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </motion.div>
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.6 }}>
                    <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-[#FBBF24] text-[#0F172A] font-semibold text-sm hover:bg-[#FCD34D] transition-all duration-300 hover:scale-[1.02] shadow-lg mt-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2">
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      {loading ? "Memproses..." : "Masuk"}
                    </button>
                  </motion.div>
                </form>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
