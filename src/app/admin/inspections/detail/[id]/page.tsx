"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Download, Trash2, CheckCircle, XCircle,
  Loader2, Building2, Calendar, User, Hash, ListChecks,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { getInspectionDetail, approveResult, rejectResult, approveMonth, rejectMonth, exportInspection, deleteInspection, bulkApproveResults, bulkRejectResults } from "@/services/inspections";
import { fotoUrl } from "@/lib/api";
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

function countByCondition(items: InspectionItem[], cond: "B" | "K"): number {
  return items.filter((i) => itemCondition(i) === cond).length;
}

function uniqueCategories(items: InspectionItem[]): number {
  return new Set(items.map((i) => i.category_name || "")).size;
}

export default function InspectionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const [detail, setDetail] = useState<InspectionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [approvingMonth, setApprovingMonth] = useState<number | null>(null);
  const [rejectingMonth, setRejectingMonth] = useState<number | null>(null);
  const [rejectMonthReason, setRejectMonthReason] = useState("");
  const [rejectMonthTarget, setRejectMonthTarget] = useState<number | null>(null);
  const [approvingItem, setApprovingItem] = useState<number | null>(null);
  const [rejectingItem, setRejectingItem] = useState<number | null>(null);
  const [rejectItemReason, setRejectItemReason] = useState("");
  const [rejectItemTarget, setRejectItemTarget] = useState<number | null>(null);
  const [approvingCategory, setApprovingCategory] = useState<string | null>(null);
  const [rejectCategoryTarget, setRejectCategoryTarget] = useState<{ bulan: number; name: string; ids: number[] } | null>(null);
  const [rejectCategoryReason, setRejectCategoryReason] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

  // Group items by bulan_ke from monthly_results
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
      return {
        bulan_ke: m.bulan_ke,
        items,
        review: m.review || {},
        statistics: m.statistics || {},
      };
    });
  }, [detail]);

  // Fallback: all items in a single group
  const itemsList = detail?.items || [];

  const handleApproveItem = async (resultId: number) => {
    setApprovingItem(resultId);
    try {
      await approveResult(resultId);
      toast.success("Item berhasil disetujui");
      fetch();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal menyetujui item");
    } finally {
      setApprovingItem(null);
    }
  };

  const handleRejectItem = async () => {
    if (rejectItemTarget == null || !rejectItemReason.trim()) return;
    setRejectingItem(rejectItemTarget);
    try {
      await rejectResult(rejectItemTarget, rejectItemReason.trim());
      toast.success("Item berhasil ditolak");
      setRejectItemTarget(null);
      setRejectItemReason("");
      fetch();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal menolak item");
    } finally {
      setRejectingItem(null);
    }
  };

  const handleApproveCategory = async (bulan: number, catName: string, ids: number[]) => {
    setApprovingCategory(catName);
    try {
      await bulkApproveResults({ ids });
      toast.success(`Pemeriksaan "${catName}" berhasil disetujui`);
      fetch();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal menyetujui pemeriksaan");
    } finally {
      setApprovingCategory(null);
    }
  };

  const handleRejectCategory = async () => {
    if (!rejectCategoryTarget) return;
    try {
      await bulkRejectResults({ ids: rejectCategoryTarget.ids, alasan_penolakan: rejectCategoryReason });
      toast.success(`Pemeriksaan "${rejectCategoryTarget.name}" berhasil ditolak`);
      setRejectCategoryTarget(null);
      setRejectCategoryReason("");
      fetch();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal menolak pemeriksaan");
    }
  };

  const handleApproveMonth = async (bulan_ke: number) => {
    setApprovingMonth(bulan_ke);
    try {
      await approveMonth(id, bulan_ke);
      toast.success(`Bulan ke-${bulan_ke} berhasil disetujui`);
      fetch();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal menyetujui bulan");
    } finally {
      setApprovingMonth(null);
    }
  };

  const handleRejectMonth = async () => {
    if (rejectMonthTarget == null || !rejectMonthReason.trim()) return;
    setRejectingMonth(rejectMonthTarget);
    try {
      await rejectMonth(id, rejectMonthTarget, rejectMonthReason.trim());
      toast.success(`Bulan ke-${rejectMonthTarget} berhasil ditolak`);
      setRejectMonthTarget(null);
      setRejectMonthReason("");
      fetch();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal menolak bulan");
    } finally {
      setRejectingMonth(null);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteInspection(id);
      toast.success("Inspeksi berhasil dihapus");
      router.push("/admin/inspections");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal menghapus inspeksi");
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

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

  const as = detail.approval_status?.toUpperCase() || "PENDING";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link href="/admin/inspections" className="p-2 rounded-xl hover:bg-white/5 text-white/50 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white font-[family-name:var(--font-display)]">Detail Inspeksi</h1>
            <p className="text-sm text-white/40 mt-1">{detail.lab_name || "—"} — {detail.item_name || "—"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExport}
            disabled={exporting}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 text-white/50 text-sm font-medium hover:text-white hover:bg-white/10 border border-white/10 transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4" /> {exporting ? "Mengekspor..." : "Export"}
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={deleting}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 text-red-400 text-sm font-medium hover:bg-red-500/20 border border-red-500/20 transition-all disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" /> Hapus
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-6">
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
          <div>
            <p className="text-xs text-white/40 mb-1">Periode</p>
            <p className="text-sm font-medium text-white">{detail.tahun ? `${detail.tahun} ${detail.semester === 'GANJIL' ? 'Ganjil' : 'Genap'}` : "—"}</p>
          </div>
        </div>
        {detail.catatan && (
          <div className="mt-4 px-4 py-3 rounded-xl bg-[#FBBF24]/5 border border-[#FBBF24]/10">
            <p className="text-xs text-[#FBBF24]/80"><span className="font-semibold text-[#FBBF24]">Catatan: </span>{detail.catatan}</p>
          </div>
        )}
        {(() => {
          const fUrl = fotoUrl(detail.foto_url);
          return fUrl ? (
            <div className="mt-4">
              <img src={fUrl} alt="Foto inspeksi" className="max-w-xs max-h-48 rounded-xl border border-white/10 object-cover" />
            </div>
          ) : null;
        })()}
      </div>

      {/* Monthly Results */}
      {monthlyGroups.length > 0 ? monthlyGroups.map((group) => {
        const { bulan_ke, items, review } = group;
        const bCount = countByCondition(items, "B");
        const kCount = countByCondition(items, "K");
        const catCount = uniqueCategories(items);
        const rs = (review.review_status || "PENDING").toUpperCase();
        const isApproved = rs === "APPROVED";
        const isRejected = rs === "REJECTED";
        const approving = approvingMonth === bulan_ke;

        return (
          <div key={bulan_ke} className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden">
            {/* Month Header */}
            <div className="px-5 py-4 bg-gradient-to-r from-[#FBBF24]/5 to-transparent border-b border-white/10">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <h2 className="text-sm font-bold text-white font-[family-name:var(--font-display)]">Bulan ke-{bulan_ke}</h2>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                    isApproved ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                    isRejected ? "bg-red-500/10 text-red-400 border-red-500/20" :
                    "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                  }`}>
                    {isApproved && <CheckCircle className="w-3 h-3" />}
                    {isRejected && <XCircle className="w-3 h-3" />}
                    {rs}
                  </span>
                  <div className="flex items-center gap-3 text-[11px] text-white/40">
                    <span><span className="text-emerald-400">{bCount}</span> B</span>
                    <span><span className="text-red-400">{kCount}</span> K</span>
                    <span>{catCount} Pemeriksaan</span>
                    <span>{items.length} Sub Pemeriksaan</span>
                  </div>
                </div>
                {!isApproved && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApproveMonth(bulan_ke)}
                      disabled={approving || rejectingMonth != null}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20 transition-all disabled:opacity-40"
                    >
                      {approving ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                      {approving ? "Menyetujui..." : "Setujui Bulan"}
                    </button>
                    <button
                      onClick={() => { setRejectMonthTarget(bulan_ke); setRejectMonthReason(""); }}
                      disabled={approving || rejectingMonth != null}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-xs font-semibold hover:bg-red-500/20 transition-all disabled:opacity-40"
                    >
                      <XCircle className="w-3 h-3" /> Tolak Bulan
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Category Groups */}
            {items.length === 0 ? (
              <div className="p-6 text-center text-sm text-white/30">Tidak ada item</div>
            ) : (
              <div className="divide-y divide-white/5">
                {(() => {
                  const groups: Record<string, InspectionItem[]> = {};
                  for (const item of items) {
                    const key = item.category_name || "Tanpa Kategori";
                    if (!groups[key]) groups[key] = [];
                    groups[key].push(item);
                  }
                  return Object.entries(groups).map(([catName, catItems]) => {
                    const catResultIds = catItems.map((i) => i.result_id ?? i.id);
                    const isCatApproving = approvingCategory === catName;
                    const bCount = countByCondition(catItems, "B");
                    const kCount = countByCondition(catItems, "K");
                    return (
                      <div key={catName}>
                        {/* Category Header */}
                        <div className="px-4 py-2.5 bg-white/[0.02] border-b border-white/5 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold text-white">{catName}</span>
                            <span className="text-[11px] text-white/30">{bCount}B / {kCount}K</span>
                          </div>
                          {!isApproved && (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleApproveCategory(bulan_ke, catName, catResultIds)}
                                disabled={isCatApproving}
                                className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-white/40 hover:text-emerald-400 transition-all disabled:opacity-40"
                                title="Setujui pemeriksaan"
                              >
                                {isCatApproving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                              </button>
                              <button
                                onClick={() => setRejectCategoryTarget({ bulan: bulan_ke, name: catName, ids: catResultIds })}
                                className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-all"
                                title="Tolak pemeriksaan"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                        {/* Category Items */}
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-white/5">
                                <th className="text-left text-xs font-semibold text-white/40 uppercase tracking-wider py-2 px-4">Sub Pemeriksaan</th>
                                <th className="text-center text-xs font-semibold text-white/40 uppercase tracking-wider py-2 px-4 w-16">Status</th>
                                <th className="text-center text-xs font-semibold text-white/40 uppercase tracking-wider py-2 px-4 w-28">Review</th>
                              </tr>
                            </thead>
                            <tbody>
                              {catItems.map((item) => {
                                const rid = item.result_id ?? item.id;
                                const ic = itemCondition(item);
                                const isB = ic === "B";
                                const isItemApproving = approvingItem === rid;
                                const isItemRejecting = rejectingItem === rid;
                                return (
                                  <tr key={rid} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                                    <td className="py-2 px-4 text-sm text-white">{item.item_name || "—"}</td>
                                    <td className="py-2 px-4 text-center">
                                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold ${
                                        isB ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"
                                      }`}>
                                        {isB ? "B" : ic === "K" ? "K" : ic || "—"}
                                      </span>
                                    </td>
                                    <td className="py-2 px-4 text-center">
                                      {!isApproved && (
                                        <div className="flex items-center justify-center gap-1">
                                          <button
                                            onClick={() => handleApproveItem(rid)}
                                            disabled={isItemApproving || isItemRejecting}
                                            className="p-1 rounded-lg hover:bg-emerald-500/10 text-white/40 hover:text-emerald-400 transition-all disabled:opacity-40"
                                            title="Setujui item"
                                          >
                                            {isItemApproving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                                          </button>
                                          <button
                                            onClick={() => { setRejectItemTarget(rid); setRejectItemReason(""); }}
                                            disabled={isItemApproving || isItemRejecting}
                                            className="p-1 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-all disabled:opacity-40"
                                            title="Tolak item"
                                          >
                                            <XCircle className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            )}

            {/* Rejection reason */}
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
        /* Fallback: flat items display */
        <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden">
          <div className="px-5 py-4 bg-gradient-to-r from-[#FBBF24]/5 to-transparent border-b border-white/10">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-bold text-white font-[family-name:var(--font-display)]">Hasil Inspeksi</h2>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                as === "APPROVED" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                as === "REJECTED" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
              }`}>
                {as}
              </span>
            </div>
          </div>
          {itemsList.length === 0 ? (
            <div className="p-6 text-center text-sm text-white/30">Tidak ada item</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left text-xs font-semibold text-white/40 uppercase tracking-wider py-3 px-4">Pemeriksaan</th>
                    <th className="text-left text-xs font-semibold text-white/40 uppercase tracking-wider py-3 px-4">Sub Pemeriksaan</th>
                    <th className="text-center text-xs font-semibold text-white/40 uppercase tracking-wider py-3 px-4 w-16">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {itemsList.map((item) => {
                    const rid = item.result_id ?? item.id;
                    const ic = itemCondition(item);
                    const isB = ic === "B";
                    return (
                      <tr key={rid} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                        <td className="py-3 px-4 text-xs text-white/40">{item.category_name || "—"}</td>
                        <td className="py-3 px-4 text-sm text-white">{item.item_name || "—"}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold ${
                            isB ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"
                          }`}>
                            {isB ? "B" : ic === "K" ? "K" : ic || "—"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ───────── Reject Month Modal ───────── */}
      {rejectMonthTarget != null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => { setRejectMonthTarget(null); setRejectMonthReason(""); }}>
          <div className="w-full max-w-sm rounded-2xl bg-[#1E293B] border border-white/10 p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-white mb-2">Tolak Bulan ke-{rejectMonthTarget}</h3>
            <p className="text-sm text-white/50 mb-4">Berikan alasan penolakan untuk seluruh item di bulan ini.</p>
            <textarea
              value={rejectMonthReason}
              onChange={(e) => setRejectMonthReason(e.target.value)}
              placeholder="Alasan penolakan..."
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm resize-none placeholder:text-white/30 focus:outline-none focus:border-[#FBBF24]/40 transition-colors"
            />
            <div className="flex items-center justify-end gap-3 mt-4">
              <button
                onClick={() => { setRejectMonthTarget(null); setRejectMonthReason(""); }}
                className="px-4 py-2 rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 transition-all"
              >Batal</button>
              <button
                onClick={handleRejectMonth}
                disabled={rejectingMonth != null || !rejectMonthReason.trim()}
                className="px-5 py-2 rounded-xl text-sm font-bold bg-red-500 text-white hover:bg-red-600 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {rejectingMonth != null && <Loader2 className="w-4 h-4 animate-spin" />}
                {rejectingMonth != null ? "Menolak..." : "Tolak"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ───────── Reject Item Modal ───────── */}
      {rejectItemTarget != null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => { setRejectItemTarget(null); setRejectItemReason(""); }}>
          <div className="w-full max-w-sm rounded-2xl bg-[#1E293B] border border-white/10 p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-white mb-2">Tolak Peralatan</h3>
            <p className="text-sm text-white/50 mb-4">Alasan penolakan untuk peralatan ini.</p>
            <textarea
              value={rejectItemReason}
              onChange={(e) => setRejectItemReason(e.target.value)}
              placeholder="Alasan penolakan..."
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm resize-none placeholder:text-white/30 focus:outline-none focus:border-[#FBBF24]/40 transition-colors"
            />
            <div className="flex items-center justify-end gap-3 mt-4">
              <button
                onClick={() => { setRejectItemTarget(null); setRejectItemReason(""); }}
                className="px-4 py-2 rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 transition-all"
              >Batal</button>
              <button
                onClick={handleRejectItem}
                disabled={rejectingItem != null || !rejectItemReason.trim()}
                className="px-5 py-2 rounded-xl text-sm font-bold bg-red-500 text-white hover:bg-red-600 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {rejectingItem != null && <Loader2 className="w-4 h-4 animate-spin" />}
                {rejectingItem != null ? "Menolak..." : "Tolak"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ───────── Reject Category Modal ───────── */}
      {rejectCategoryTarget != null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => { setRejectCategoryTarget(null); setRejectCategoryReason(""); }}>
          <div className="w-full max-w-sm rounded-2xl bg-[#1E293B] border border-white/10 p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-white mb-2">Tolak Pemeriksaan</h3>
            <p className="text-sm text-white/50 mb-4">
              Tolak semua item di pemeriksaan <span className="font-semibold text-white">{rejectCategoryTarget.name}</span>?
            </p>
            <textarea
              value={rejectCategoryReason}
              onChange={(e) => setRejectCategoryReason(e.target.value)}
              placeholder="Alasan penolakan..."
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm resize-none placeholder:text-white/30 focus:outline-none focus:border-[#FBBF24]/40 transition-colors"
            />
            <div className="flex items-center justify-end gap-3 mt-4">
              <button
                onClick={() => { setRejectCategoryTarget(null); setRejectCategoryReason(""); }}
                className="px-4 py-2 rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 transition-all"
              >Batal</button>
              <button
                onClick={handleRejectCategory}
                className="px-5 py-2 rounded-xl text-sm font-bold bg-red-500 text-white hover:bg-red-600 transition-all flex items-center gap-2"
              >
                Tolak
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ───────── Delete Confirm Modal ───────── */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)}>
          <div className="w-full max-w-sm rounded-2xl bg-[#1E293B] border border-white/10 p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Hapus Inspeksi</h3>
                <p className="text-sm text-white/50">Tindakan ini tidak dapat dibatalkan.</p>
              </div>
            </div>
            <p className="text-sm text-white/70 mb-6">
              Yakin ingin menghapus inspeksi <span className="font-semibold text-white">{detail.item_name || "ini"}</span>?
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="px-4 py-2 rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 transition-all"
              >Batal</button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-5 py-2 rounded-xl text-sm font-bold bg-red-500 text-white hover:bg-red-600 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                {deleting ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
