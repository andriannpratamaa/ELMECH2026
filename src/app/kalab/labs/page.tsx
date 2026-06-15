"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FlaskConical, MapPin, User, Package, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import LoadingSkeleton from "@/components/admin/LoadingSkeleton";
import { getLabs } from "@/services/labs";
import { getUser } from "@/services/auth";
import type { Lab, Profile } from "@/types/admin";

export default function KalabLabsPage() {
  const router = useRouter();
  const [labs, setLabs] = useState<Lab[]>([]);
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const u = getUser();
      setUser(u);
      const data = await getLabs();
      const filtered = u?.id ? data.filter((l) => l.kalab_id === u.id) : [];
      setLabs(filtered);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal memuat data laboratorium");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return (
    <div>
      <AdminPageHeader title="Laboratorium" description="Informasi laboratorium Anda" />

      {loading ? (
        <LoadingSkeleton rows={3} />
      ) : labs.length === 0 ? (
        <div className="p-10 text-center text-white/30 text-sm rounded-2xl bg-white/5 border border-white/10">
          Belum ada laboratorium
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {labs.map((lab) => (
            <div
              key={lab.id}
              onClick={() => router.push(`/kalab/labs/${lab.id}`)}
              className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 hover:bg-white/10 hover:border-blue-500/30 cursor-pointer transition-all duration-200 group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                  <FlaskConical className="w-6 h-6 text-blue-400" strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-lg font-bold text-white font-[family-name:var(--font-display)]">{lab.nama_lab}</h3>
                    <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-blue-400 transition-colors shrink-0" strokeWidth={1.5} />
                  </div>
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <MapPin className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                      <span>{lab.lokasi || "Lokasi tidak tersedia"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <User className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                      <span>{lab.kalab_name || user?.name || "—"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <Package className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                      <span>{lab.items?.length ?? lab.items_count ?? 0} Item</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
