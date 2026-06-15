"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Download, Building2, Calendar, User } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { getInspectionDetail, exportInspection } from "@/services/inspections";
import type { InspectionDetail, InspectionItem } from "@/types/admin";

function formatDateTime(dateStr?: string) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function itemCondition(item: InspectionItem): string {
  return (item.condition || item.status || "").toUpperCase();
}

export default function KalabInspectionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const [detail, setDetail] = useState<InspectionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const fetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const d = await getInspectionDetail(id);
      setDetail(d);
    } catch {
      toast.error("Gagal memuat detail inspeksi");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetch(); }, [fetch]);

  const monthlyGroups = useMemo(() => {
    if (!detail?.items || !(detail as any).monthly_results) return [];
    const mr = (detail as any).monthly_results as any[];
    if (!Array.isArray(mr)) return [];
    return mr.map((m: any) => {
      const items: InspectionItem[] = [];
      const cats = m.categories || [];
      for (const cat of cats) {
        const subItems = cat.items || cat.sub_items || [];
        for (const si of subItems) {
          items.push({
            id: si.id,
            result_id: si.result_id ?? si.id,
            item_id: si.subitem_id,
            item_name: si.nama_subitem,
            condition: si.status ?? "",
            status: si.status ?? "",
            category_name: cat.nama_kategori,
            category_id: cat.category_id,
            notes: si.keterangan,
          });
        }
      }
      return { bulan_ke: m.bulan_ke, items, review: m.review || {}, statistics: m.statistics || {} };
    });
  }, [detail]);

  const itemsList = detail?.items || [];

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await exportInspection(id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const fileName = `inspeksi-${(detail?.item_name || `inspection-${id}`).replace(/[\\/:*?"<>|]/g, "").trim()}.xlsx`;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Gagal mengekspor file");
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-48 rounded-xl bg-white/5" />
        <div className="h-32 rounded-2xl bg-white/5" />
        <div className="h-64 rounded-2xl bg-white/5" />
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="p-10 text-center text-white/30 text-sm rounded-2xl bg-white/5 border border-white/10">
        Data inspeksi tidak ditemukan
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link href="/kalab/inspections" className="p-2 rounded-xl hover:bg-white/5 text-white/50 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white font-[family-name:var(--font-display)]">Detail Inspeksi</h1>
            <p className="text-sm text-white/40 mt-1">{detail.lab_name || "—"} — {detail.item_name || "—"}</p>
          </div>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 text-white/50 text-sm font-medium hover:text-white hover:bg-white/10 border border-white/10 transition-all disabled:opacity-50"
        >
          <Download className="w-4 h-4" /> {exporting ? "Mengekspor..." : "Export"}
        </button>
      </div>

      <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          <div>
            <p className="text-xs text-white/40 mb-1">Laboratorium</p>
            <p className="text-sm font-medium text-white">{detail.lab_name || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-white/40 mb-1">Alat</p>
            <p className="text-sm font-medium text-white">{detail.item_name || "—"}{detail.item_code ? ` (${detail.item_code})` : ""}</p>
          </div>
          <div>
            <p className="text-xs text-white/40 mb-1">Tanggal</p>
            <p className="text-sm font-medium text-white">{formatDateTime(detail.tanggal_inspeksi || detail.created_at)}</p>
          </div>
          <div>
            <p className="text-xs text-white/40 mb-1">Inspector</p>
            <p className="text-sm font-medium text-white">{detail.inspector_name || "—"}</p>
          </div>
        </div>
        {detail.catatan && (
          <div className="mt-4 px-4 py-3 rounded-xl bg-blue-500/5 border border-blue-500/10">
            <p className="text-xs text-blue-300/80"><span className="font-semibold text-blue-400">Catatan: </span>{detail.catatan}</p>
          </div>
        )}
      </div>

      {monthlyGroups.length > 0 ? monthlyGroups.map((group) => {
        const { bulan_ke, items, review } = group;
        const rs = (review.review_status || "PENDING").toUpperCase();
        const isApproved = rs === "APPROVED";
        const isRejected = rs === "REJECTED";

        return (
          <div key={bulan_ke} className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden">
            <div className="px-5 py-4 bg-gradient-to-r from-blue-500/5 to-transparent border-b border-white/10">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <h2 className="text-sm font-bold text-white font-[family-name:var(--font-display)]">Bulan ke-{bulan_ke}</h2>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                    isApproved ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                    isRejected ? "bg-red-500/10 text-red-400 border-red-500/20" :
                    "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                  }`}>{rs}</span>
                </div>
              </div>
            </div>

            {items.length === 0 ? (
              <div className="p-6 text-center text-sm text-white/30">Tidak ada item</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="text-left text-xs font-semibold text-white/40 uppercase tracking-wider py-3 px-4">Kategori</th>
                      <th className="text-left text-xs font-semibold text-white/40 uppercase tracking-wider py-3 px-4">Sub Item</th>
                      <th className="text-center text-xs font-semibold text-white/40 uppercase tracking-wider py-3 px-4 w-16">Status</th>
                      <th className="text-left text-xs font-semibold text-white/40 uppercase tracking-wider py-3 px-4">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => {
                      const ic = itemCondition(item);
                      const isB = ic === "B";
                      return (
                        <tr key={item.result_id ?? item.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                          <td className="py-3 px-4 text-xs text-white/40">{item.category_name || "—"}</td>
                          <td className="py-3 px-4 text-sm text-white">{item.item_name || "—"}</td>
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold ${
                              isB ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"
                            }`}>{isB ? "B" : ic === "K" ? "K" : ic || "—"}</span>
                          </td>
                          <td className="py-3 px-4 text-xs text-white/40">{item.notes || "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {review.alasan_penolakan && (
              <div className="px-5 py-3 bg-red-500/5 border-t border-red-500/10">
                <p className="text-xs text-red-300/80">
                  <span className="font-semibold text-red-400">Alasan penolakan: </span>
                  {review.alasan_penolakan}
                </p>
              </div>
            )}
          </div>
        );
      }) : (
        <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden">
          <div className="px-5 py-4 bg-gradient-to-r from-blue-500/5 to-transparent border-b border-white/10">
            <h2 className="text-sm font-bold text-white font-[family-name:var(--font-display)]">Hasil Inspeksi</h2>
          </div>
          {itemsList.length === 0 ? (
            <div className="p-6 text-center text-sm text-white/30">Tidak ada item</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left text-xs font-semibold text-white/40 uppercase tracking-wider py-3 px-4">Kategori</th>
                    <th className="text-left text-xs font-semibold text-white/40 uppercase tracking-wider py-3 px-4">Sub Item</th>
                    <th className="text-center text-xs font-semibold text-white/40 uppercase tracking-wider py-3 px-4 w-16">Status</th>
                    <th className="text-left text-xs font-semibold text-white/40 uppercase tracking-wider py-3 px-4">Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  {itemsList.map((item) => {
                    const ic = itemCondition(item);
                    const isB = ic === "B";
                    return (
                      <tr key={item.result_id ?? item.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                        <td className="py-3 px-4 text-xs text-white/40">{item.category_name || "—"}</td>
                        <td className="py-3 px-4 text-sm text-white">{item.item_name || "—"}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold ${
                            isB ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"
                          }`}>{isB ? "B" : ic === "K" ? "K" : ic || "—"}</span>
                        </td>
                        <td className="py-3 px-4 text-xs text-white/40">{item.notes || "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
