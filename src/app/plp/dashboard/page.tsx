"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Package, ClipboardCheck, CheckSquare, Building2, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { getUser, getToken } from "@/services/auth";
import { getProfile } from "@/services/profile";
import { getMyItems } from "@/services/items";
import { getMyPendingInspections } from "@/services/inspections";
import { getMyCriteria } from "@/services/criteria";
import StatCard from "@/components/admin/StatCard";
import LoadingSkeleton from "@/components/admin/LoadingSkeleton";
import type { Profile } from "@/types/admin";

export default function PlpDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<Profile | null>(null);
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    items: "—", pendingInspections: "—", criteria: "—", labs: "—",
  });

  useEffect(() => {
    const token = getToken();
    const u = getUser();
    if (!token || !u || u.role !== "plp") {
      router.replace("/admin");
    } else {
      setUser(u);
      setChecked(true);
      getProfile().then((p) => { if (p) setUser(p); });
    }
  }, [router]);

  useEffect(() => {
    if (!checked) return;
    const fetchStats = async () => {
      try {
        const [items, pendingInspections, criteria] = await Promise.all([
          getMyItems(),
          getMyPendingInspections(),
          getMyCriteria(),
        ]);
        setStats({
          items: items.length.toString(),
          pendingInspections: pendingInspections.length.toString(),
          criteria: criteria.length.toString(),
          labs: user?.lab_name ? "1" : "—",
        });
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Gagal memuat data dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [checked, user]);

  if (!checked) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const cards = [
    { icon: Building2, label: "Laboratorium Saya", value: user?.lab_name || "—" },
    { icon: Package, label: "Total Alat Saya", value: stats.items },
    { icon: ClipboardCheck, label: "Inspeksi Pending", value: stats.pendingInspections },
    { icon: CheckSquare, label: "Kriteria Saya", value: stats.criteria },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-br from-blue-600/40 to-[#0F172A] border border-white/10 p-6 sm:p-8">
        <p className="text-white/50 text-sm">Selamat Datang,</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-white font-[family-name:var(--font-display)] mt-1">
          {user?.name || "Pengguna"}
        </h1>
        <div className="flex items-center gap-3 mt-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider">
            <CheckCircle2 className="w-3 h-3" />
            {user?.role || "-"}
          </span>
          {user?.lab_name && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-white/40 text-xs">
              <Building2 className="w-3 h-3" />
              {user.lab_name}
            </span>
          )}
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton rows={2} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card) => (
            <StatCard key={card.label} icon={card.icon} label={card.label} value={card.value} />
          ))}
        </div>
      )}

      {!loading && Number(stats.pendingInspections) > 0 && (
        <div className="rounded-2xl bg-amber-500/5 border border-amber-500/20 p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
          <p className="text-sm text-amber-200/80">
            Kamu memiliki <span className="font-semibold text-amber-200">{stats.pendingInspections} inspeksi</span> yang perlu direview atau menunggu persetujuan.
          </p>
        </div>
      )}
    </div>
  );
}
