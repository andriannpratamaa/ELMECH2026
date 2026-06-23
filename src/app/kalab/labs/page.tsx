"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FlaskConical, MapPin, User, Package, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import LoadingSkeleton from "@/components/admin/LoadingSkeleton";
import { getLabs } from "@/services/labs";
import { getUser } from "@/services/auth";
import { getMyCriteria } from "@/services/criteria";
import { getMyPendingInspections, getInspectionByItemId } from "@/services/inspections";
import type { Lab, Profile } from "@/types/admin";

export default function KalabLabsPage() {
  const router = useRouter();
  const [labs, setLabs] = useState<Lab[]>([]);
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingCounts, setPendingCounts] = useState<Record<number, number>>({});

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const u = getUser();
      setUser(u);
      const [labsData, myCriteria, pendingInsps] = await Promise.all([
        getLabs(),
        getMyCriteria(),
        getMyPendingInspections(),
      ]);
      const filtered = u?.id ? labsData.filter((l) => l.kalab_id === u.id) : [];
      setLabs(filtered);

      const itemToLab: Record<number, number> = {};
      for (const lab of labsData) {
        for (const item of lab.items ?? []) {
          itemToLab[item.id] = lab.id;
        }
      }

      const counts: Record<number, number> = {};
      for (const cat of myCriteria) {
        if (cat.status === 'REJECTED' && cat.item_id) {
          const labId = itemToLab[cat.item_id];
          if (labId) counts[labId] = (counts[labId] || 0) + 1;
        }
      }
      for (const insp of pendingInsps) {
        if (insp.review_status === 'REJECTED' && insp.laboratory_id) {
          counts[insp.laboratory_id] = (counts[insp.laboratory_id] || 0) + 1;
        }
      }

      const itemsToCheck = filtered.flatMap((l) => (l.items || []).map((i) => ({ labId: l.id, itemId: i.id })));
      if (itemsToCheck.length > 0) {
        const inspResults = await Promise.all(itemsToCheck.map(({ itemId }) => getInspectionByItemId(itemId)));
        for (let i = 0; i < inspResults.length; i++) {
          const { labId } = itemsToCheck[i];
          const insp = inspResults[i];
          if (insp.exists && insp.filled_months < 6 && insp.review_status === 'APPROVED') {
            counts[labId] = (counts[labId] || 0) + 1;
          }
        }
      }
      setPendingCounts(counts);
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
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <FlaskConical className="w-6 h-6 text-blue-400" strokeWidth={1.5} />
                  </div>
                  {pendingCounts[lab.id] > 0 && (
                    <div className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-lg shadow-red-500/30">
                      {pendingCounts[lab.id]}
                    </div>
                  )}
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
                      <span>{lab.items?.length ?? lab.items_count ?? 0} Peralatan</span>
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
