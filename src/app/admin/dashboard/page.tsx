"use client";

import { useEffect, useState } from "react";
import { Users, FlaskConical, Package, CalendarClock, ClipboardCheck, CheckSquare } from "lucide-react";
import { toast } from "sonner";
import { getUser } from "@/services/auth";
import StatCard from "@/components/admin/StatCard";
import LoadingSkeleton from "@/components/admin/LoadingSkeleton";
import { getUsers } from "@/services/users";
import { getLabs } from "@/services/labs";
import { getItems } from "@/services/items";
import { getSchedules } from "@/services/schedules";
import { getPendingReviews } from "@/services/inspections";
import { getPendingCategories } from "@/services/criteria";
import type { Profile } from "@/types/admin";

export default function DashboardPage() {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    users: "—", labs: "—", items: "—", schedules: "—", inspections: "—", criteria: "—"
  });

  useEffect(() => {
    setUser(getUser());
    const fetchStats = async () => {
      try {
        const [users, labs, items, schedules, inspections, criteria] = await Promise.all([
          getUsers(), getLabs(), getItems(), getSchedules(), getPendingReviews(), getPendingCategories()
        ]);
        setStats({
          users: users.length.toString(),
          labs: labs.length.toString(),
          items: items.length.toString(),
          schedules: schedules.length.toString(),
          inspections: inspections.length.toString(),
          criteria: criteria.length.toString(),
        });
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Gagal memuat data dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const cards = [
    { icon: Users, label: "Total Users", value: stats.users },
    { icon: FlaskConical, label: "Total Laboratories", value: stats.labs },
    { icon: Package, label: "Total Alat", value: stats.items },
    { icon: CalendarClock, label: "Total Schedules", value: stats.schedules },
    { icon: ClipboardCheck, label: "Pending Inspections", value: stats.inspections },
    { icon: CheckSquare, label: "Pending Criteria", value: stats.criteria },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-br from-[#1E3A8A]/40 to-[#0F172A] border border-white/10 p-6 sm:p-8">
        <p className="text-white/50 text-sm">Selamat Datang,</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-white font-[family-name:var(--font-display)] mt-1">
          {user?.name || "Pengguna"}
        </h1>
        <span className="inline-block mt-2 px-3 py-1 rounded-lg bg-[#FBBF24]/10 border border-[#FBBF24]/20 text-[#FBBF24] text-xs font-semibold uppercase tracking-wider">
          {user?.role || "-"}
        </span>
      </div>

      {loading ? (
        <LoadingSkeleton rows={3} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {cards.map((card) => (
            <StatCard key={card.label} icon={card.icon} label={card.label} value={card.value} />
          ))}
        </div>
      )}
    </div>
  );
}
