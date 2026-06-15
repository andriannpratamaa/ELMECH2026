"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardCheck, Search, X, Loader2, CheckCircle2,
  XCircle, ThumbsUp, ThumbsDown,
  Building2, Calendar, User, ListChecks, Hash,
  FileText, ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { CustomSelect } from "@/components/admin/CustomSelect";
import { getLabs } from "@/services/labs";
import {
  getInspectionResultsByStatus,
  bulkApproveResults,
  bulkRejectResults,
  getInspectionDetail,
} from "@/services/inspections";
import { fotoUrl } from "@/lib/api";
import type { Inspection, InspectionDetail, InspectionItem, Lab } from "@/types/admin";

type TabType = "pending" | "approved" | "rejected";

const MONTHS = [
  { value: "", label: "Semua Bulan" },
  { value: "1", label: "Januari" },
  { value: "2", label: "Februari" },
  { value: "3", label: "Maret" },
  { value: "4", label: "April" },
  { value: "5", label: "Mei" },
  { value: "6", label: "Juni" },
  { value: "7", label: "Juli" },
  { value: "8", label: "Agustus" },
  { value: "9", label: "September" },
  { value: "10", label: "Oktober" },
  { value: "11", label: "November" },
  { value: "12", label: "Desember" },
];

function getCalendarMonth(d: InspectionDetail): number | null {
  const dateStr = d.tanggal_inspeksi || d.created_at;
  if (!dateStr) return null;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return null;
  return date.getMonth() + 1; // 1-12
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
}

function formatDateTime(dateStr?: string) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function uniqueCategories(items?: InspectionItem[]): number {
  if (!items) return 0;
  const cats = new Set(items.map((i) => i.category_name || "Lainnya"));
  return cats.size;
}

function itemCondition(item: InspectionItem): string {
  return (item.condition || item.status || "").toUpperCase();
}

function countByCondition(items: InspectionItem[], cond: "B" | "K"): number {
  if (!items) return 0;
  return items.filter((i) => itemCondition(i) === cond).length;
}

export default function InspectionApprovalDashboard() {
  const [tab, setTab] = useState<TabType>("pending");

  const [labs, setLabs] = useState<Lab[]>([]);

  // Data — InspectionDetail[] fetched directly from detail endpoint
  const [pendingDetails, setPendingDetails] = useState<InspectionDetail[]>([]);
  const [approvedDetails, setApprovedDetails] = useState<InspectionDetail[]>([]);
  const [rejectedDetails, setRejectedDetails] = useState<InspectionDetail[]>([]);

  const [loadingPending, setLoadingPending] = useState(true);
  const [loadingApproved, setLoadingApproved] = useState(true);
  const [loadingRejected, setLoadingRejected] = useState(true);

  // Filters
  const [filterLab, setFilterLab] = useState<string>("");
  const [filterItemName, setFilterItemName] = useState<string>("");
  const [filterBulan, setFilterBulan] = useState<string>("");
  const [search, setSearch] = useState("");

  // Detail modal
  const [detailData, setDetailData] = useState<InspectionDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);

  // Approve
  const [approveTarget, setApproveTarget] = useState<InspectionDetail | null>(null);
  const [approving, setApproving] = useState(false);

  // Reject
  const [rejectTarget, setRejectTarget] = useState<InspectionDetail | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectError, setRejectError] = useState("");
  const [rejecting, setRejecting] = useState(false);

  // ───────── fetch list → optional detail ─────────

  const fetchDetailsForList = useCallback(async (
    list: any[],
  ): Promise<InspectionDetail[]> => {
    if (list.length === 0) return [];
    const results = await Promise.allSettled(
      list.map((item) => {
        const detailId = item.inspection_id ?? item.id;
        return getInspectionDetail(detailId);
      }),
    );
    const details: InspectionDetail[] = [];
    for (let idx = 0; idx < results.length; idx++) {
      const r = results[idx];
      const li = list[idx];
      if (r.status === "fulfilled" && r.value) {
        details.push({
          ...r.value,
          approval_status: (li.approval_status || r.value.approval_status || "PENDING").toUpperCase(),
        });
      } else {
        console.warn("[fetchDetails] detail gagal:", li?.id, r.status === "rejected" ? r.reason : "null");
        details.push({
          id: li.id,
          inspection_id: li.inspection_id ?? li.id,
          laboratory_id: li.laboratory_id,
          lab_name: li.lab_name,
          month: li.month,
          year: li.year,
          approval_status: (li.approval_status || "PENDING").toUpperCase(),
          created_at: li.created_at,
          tanggal_inspeksi: li.tanggal_inspeksi,
          inspector_name: li.inspector_name,
          item_name: li.item_name,
          item_code: li.item_code,
          foto_url: li.foto_url,
          alasan_penolakan: li.alasan_penolakan,
          catatan: li.catatan,
          items: [],
        });
      }
    }
    return details;
  }, []);

  const loadByStatus = useCallback(async (
    status: "PENDING" | "APPROVED" | "REJECTED",
    setter: (d: InspectionDetail[]) => void,
    setLoading: (v: boolean) => void,
  ) => {
    setLoading(true);
    try {
      const raw = await getInspectionResultsByStatus(status);
      const list = (raw?.data || []).map((item: any) => ({
        ...item,
        approval_status: item.approval_status || status,
      }));
      if (list.length > 0) {
        console.log("ITEM (forced approval_status):", list[0]);
        console.log("APPROVAL STATUS:", list[0]?.approval_status);
      }
      if (list.length === 0) {
        setter([]);
        return;
      }
      const details = await fetchDetailsForList(list);
      const seen = new Set<number>();
      setter(details.filter((d) => {
        if (seen.has(d.id)) return false;
        seen.add(d.id);
        return true;
      }));
    } catch (err: any) {
      console.error(`[loadByStatus/${status}] error:`, err);
      setter([]);
    } finally {
      setLoading(false);
    }
  }, [fetchDetailsForList]);

  const loadPending = useCallback(async () => {
    await loadByStatus("PENDING", setPendingDetails, setLoadingPending);
  }, [loadByStatus]);

  const loadApproved = useCallback(async () => {
    await loadByStatus("APPROVED", setApprovedDetails, setLoadingApproved);
  }, [loadByStatus]);

  const loadRejected = useCallback(async () => {
    await loadByStatus("REJECTED", setRejectedDetails, setLoadingRejected);
  }, [loadByStatus]);

  const loadLabs = useCallback(async () => {
    try { setLabs(await getLabs()); } catch { /* ignore */ }
  }, []);

  useEffect(() => { loadLabs(); }, [loadLabs]);
  useEffect(() => { loadPending(); }, [loadPending]);
  useEffect(() => { if (tab === "approved") loadApproved(); }, [tab, loadApproved]);
  useEffect(() => { if (tab === "rejected") loadRejected(); }, [tab, loadRejected]);

  const refreshAllTabs = useCallback(async () => {
    await Promise.all([
      loadPending(),
      loadApproved(),
      loadRejected(),
    ]);
  }, [loadPending, loadApproved, loadRejected]);

  const allData: Record<TabType, InspectionDetail[]> = {
    pending: pendingDetails,
    approved: approvedDetails,
    rejected: rejectedDetails,
  };

  // ───────── filtering ─────────

  const filtered = useMemo(() => {
    const data = allData[tab] || [];
    return data.filter((d) => {
      const labId = d.laboratory_id != null ? String(d.laboratory_id) : "";
      if (filterLab && labId !== filterLab) return false;
      const itemName = (d.item_name || "").toLowerCase();
      if (filterItemName && !itemName.includes(filterItemName.toLowerCase())) return false;
      const calMonth = getCalendarMonth(d);
      if (filterBulan && calMonth !== Number(filterBulan)) return false;
      if (search) {
        const q = search.toLowerCase();
        const lab = (d.lab_name || "").toLowerCase().includes(q);
        const item = itemName.includes(q);
        if (!lab && !item) return false;
      }
      return true;
    });
  }, [tab, pendingDetails, approvedDetails, rejectedDetails, filterLab, filterItemName, filterBulan, search]);

  // ───────── detail modal ─────────

  const handleOpenDetail = async (d: InspectionDetail) => {
    if (d.items && d.items.length > 0) {
      setDetailData(d);
      setDetailOpen(true);
      return;
    }
    setDetailLoading(true);
    setDetailOpen(true);
    try {
      const detail = await getInspectionDetail(d.id);
      if (detail) {
        detail.approval_status = d.approval_status || detail.approval_status || "PENDING";
      }
      setDetailData(detail);
    } catch {
      toast.error("Gagal memuat detail inspeksi");
      setDetailData(null);
    } finally {
      setDetailLoading(false);
    }
  };

  // ───────── approve / reject ─────────

  const handleApprove = async () => {
    if (!approveTarget) return;
    const resultIds = (approveTarget.items || [])
      .map((item) => item.result_id)
      .filter((id): id is number => id != null);
    if (resultIds.length === 0) {
      toast.error("Tidak ada hasil inspeksi untuk disetujui");
      setApproveTarget(null);
      return;
    }
    setApproving(true);
    try {
      await bulkApproveResults({ ids: resultIds });
      toast.success("Inspeksi berhasil disetujui");
      setApproveTarget(null);
      await refreshAllTabs();
      setTab("approved");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal menyetujui inspeksi");
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    if (!rejectReason.trim()) {
      setRejectError("Alasan penolakan wajib diisi");
      return;
    }
    const resultIds = (rejectTarget.items || [])
      .map((item) => item.result_id)
      .filter((id): id is number => id != null);
    if (resultIds.length === 0) {
      toast.error("Tidak ada hasil inspeksi untuk ditolak");
      setRejectTarget(null);
      setRejectReason("");
      setRejectError("");
      return;
    }
    setRejecting(true);
    try {
      await bulkRejectResults({
        ids: resultIds,
        alasan_penolakan: rejectReason.trim(),
      });
      toast.success("Inspeksi berhasil ditolak");
      setApproveTarget(null);
      setRejectReason("");
      setRejectError("");
      await refreshAllTabs();
      setTab("rejected");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal menolak inspeksi");
    } finally {
      setRejecting(false);
    }
  };

  // ───────── detail grouping ─────────

  const groupedItems = useMemo(() => {
    if (!detailData?.items) return [];
    const map = new Map<string, InspectionItem[]>();
    for (const item of detailData.items) {
      const cat = item.category_name || "Lainnya";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(item);
    }
    return Array.from(map.entries());
  }, [detailData]);

  // ───────── render ─────────

  const loading = tab === "pending" ? loadingPending : tab === "approved" ? loadingApproved : loadingRejected;

  return (
    <div className="space-y-6">
      {/* Filter & Search */}
      <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-5 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-white/50 min-w-[140px]">
            <Search className="w-4 h-4" />
            <span>Filter & Cari</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <CustomSelect
              value={filterLab}
              onChange={(v) => setFilterLab(v || "")}
              options={[
                { value: "", label: "Semua Lab" },
                ...labs.map((l) => ({ value: String(l.id), label: l.nama_lab })),
              ]}
              placeholder="Semua Lab"
              className="min-w-[160px]"
              showSearch
              searchPlaceholder="Cari lab..."
            />
            <input
              value={filterItemName}
              onChange={(e) => setFilterItemName(e.target.value)}
              placeholder="Nama Alat..."
              className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#FBBF24]/40 transition-colors min-w-[140px] max-w-[200px]"
            />
            <CustomSelect
              value={filterBulan}
              onChange={(v) => setFilterBulan(v || "")}
              options={MONTHS}
              placeholder="Semua Bulan"
              className="min-w-[130px]"
            />
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari alat / laboratorium..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#FBBF24]/40 transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-2xl bg-white/5 border border-white/10 p-1 overflow-x-auto">
        {[
          { key: "pending" as TabType, label: "Pending Approval", icon: ClipboardCheck },
          { key: "approved" as TabType, label: "Approved", icon: CheckCircle2 },
          { key: "rejected" as TabType, label: "Rejected", icon: XCircle },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              tab === key
                ? "bg-[#FBBF24]/10 text-[#FBBF24] shadow-sm"
                : "text-white/50 hover:text-white/80 hover:bg-white/5"
            }`}
          >
            <Icon className="w-4 h-4" strokeWidth={1.5} />
            {label}
            {allData[key].length > 0 && (
              <span className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold ${
                key === "pending"
                  ? "bg-yellow-500/20 text-yellow-400"
                  : key === "approved"
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-red-500/20 text-red-400"
              }`}>
                {allData[key].length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Cards — sourced entirely from detail endpoint */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.2 }}
          className="space-y-4"
        >
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-2xl bg-white/5 border border-white/10 p-5 animate-pulse space-y-3">
                  <div className="h-5 w-48 rounded bg-white/10" />
                  <div className="h-3 w-32 rounded bg-white/5" />
                  <div className="h-3 w-64 rounded bg-white/5" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-12 text-center">
              <ClipboardCheck className="w-10 h-10 text-white/20 mx-auto mb-3" strokeWidth={1.5} />
              <p className="text-sm text-white/30">Tidak ada hasil inspeksi</p>
            </div>
          ) : (
            filtered.map((d) => {
              const totalItems = d.items?.length ?? 0;
              const totalCats = uniqueCategories(d.items);
              const bCount = countByCondition(d.items ?? [], "B");
              const kCount = countByCondition(d.items ?? [], "K");
              return (
                <motion.div
                  key={d.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden hover:bg-white/[0.06] transition-colors"
                >
                  <div className="p-5">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-bold text-white font-[family-name:var(--font-display)]">
                            {d.item_name || "—"}
                          </h3>
                          {d.item_code && (
                            <span className="text-[11px] text-white/30 font-mono">({d.item_code})</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-white/40 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {d.lab_name || "—"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(d.created_at)}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {d.inspector_name || "—"}
                          </span>
                        </div>
                      </div>
                      {(() => {
                        console.log("BADGE STATUS", d.approval_status);
                        const as = d.approval_status?.toUpperCase() || "PENDING";
                        const isPending = as === "PENDING";
                        const isApproved = as === "APPROVED";
                        const isRejected = as === "REJECTED";
                        return (
                          <span className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border ${
                            isPending
                              ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                              : isApproved
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : "bg-red-500/10 text-red-400 border-red-500/20"
                          }`}>
                            {isPending && <Loader2 className="w-3 h-3 animate-spin" />}
                            {isApproved && <CheckCircle2 className="w-3 h-3" />}
                            {isRejected && <XCircle className="w-3 h-3" />}
                            {isPending ? "PENDING" : isApproved ? "APPROVED" : "REJECTED"}
                          </span>
                        );
                      })()}
                    </div>

                    {/* Catatan */}
                    {d.catatan && (
                      <div className="mb-3 px-3 py-2 rounded-xl bg-[#FBBF24]/5 border border-[#FBBF24]/10">
                        <p className="text-xs text-[#FBBF24]/80">
                          <span className="font-semibold text-[#FBBF24]">Catatan: </span>
                          {d.catatan}
                        </p>
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex flex-wrap items-center gap-4 text-xs mb-3">
                      <span className="flex items-center gap-1.5 text-white/50">
                        <ListChecks className="w-3.5 h-3.5" />
                        Kategori: {totalCats}
                      </span>
                      <span className="flex items-center gap-1.5 text-white/50">
                        <Hash className="w-3.5 h-3.5" />
                        Sub Item: {totalItems}
                      </span>
                      {bCount > 0 && (
                        <span className="flex items-center gap-1.5 text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          B: {bCount}
                        </span>
                      )}
                      {kCount > 0 && (
                        <span className="flex items-center gap-1.5 text-red-400">
                          <XCircle className="w-3.5 h-3.5" />
                          K: {kCount}
                        </span>
                      )}
                    </div>

                    {/* Alasan penolakan */}
                    {tab === "rejected" && d.alasan_penolakan && (
                      <div className="mb-3 px-3 py-2 rounded-xl bg-red-500/5 border border-red-500/10">
                        <p className="text-xs text-red-300/80">
                          <span className="font-semibold text-red-400">Alasan: </span>
                          {d.alasan_penolakan}
                        </p>
                      </div>
                    )}

                    {/* Foto */}
                    {(() => {
                      const fUrl = fotoUrl(d.foto_url);
                      return fUrl ? (
                        <div className="mb-3">
                          <img src={fUrl} alt="Foto inspeksi" className="w-32 h-24 object-cover rounded-xl border border-white/10" />
                        </div>
                      ) : null;
                    })()}

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                      {tab === "pending" && (
                        <>
                          <button
                            onClick={() => setApproveTarget(d)}
                            disabled={approving || rejecting}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20 transition-all disabled:opacity-40"
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                            Approve
                          </button>
                          <button
                            onClick={() => { setRejectTarget(d); setRejectReason(""); setRejectError(""); }}
                            disabled={approving || rejecting}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-xs font-semibold hover:bg-red-500/20 transition-all disabled:opacity-40"
                          >
                            <ThumbsDown className="w-3.5 h-3.5" />
                            Reject
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleOpenDetail(d)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-white/60 text-xs font-semibold hover:bg-white/10 hover:text-white/80 transition-all"
                      >
                        <ClipboardCheck className="w-3.5 h-3.5" />
                        Detail
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </motion.div>
      </AnimatePresence>

      {/* ───────── Detail Modal ───────── */}
      <AnimatePresence>
        {detailOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
            onClick={() => setDetailOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl rounded-2xl bg-[#1E293B] border border-white/10 shadow-2xl my-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                <h3 className="text-base font-bold text-white font-[family-name:var(--font-display)]">
                  Detail Inspeksi
                </h3>
                <button
                  onClick={() => setDetailOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-white/5 text-white/50 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="px-6 py-5 max-h-[70vh] overflow-y-auto space-y-5">
                {detailLoading ? (
                  <div className="space-y-4 animate-pulse">
                    <div className="h-5 w-40 rounded bg-white/10" />
                    <div className="h-3 w-full rounded bg-white/5" />
                    <div className="h-3 w-full rounded bg-white/5" />
                  </div>
                ) : detailData ? (
                  <>
                    {/* Header info */}
                    <div>
                      <h4 className="text-sm font-bold text-white font-[family-name:var(--font-display)]">
                        {detailData.item_name || "—"}
                        {detailData.item_code && (
                          <span className="text-white/30 font-mono font-normal ml-1">
                            ({detailData.item_code})
                          </span>
                        )}
                      </h4>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-white/40">
                        <span>{detailData.lab_name}</span>
                        <span>{formatDateTime(detailData.created_at)}</span>
                        <span>Inspector: {detailData.inspector_name || "—"}</span>
                      </div>
                    </div>

                    {/* Catatan */}
                    {detailData.catatan && (
                      <div>
                        <h5 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5" />
                          Catatan
                        </h5>
                        <p className="text-sm text-white/70 bg-white/5 rounded-xl px-4 py-3 border border-white/5">
                          {detailData.catatan}
                        </p>
                      </div>
                    )}

                    {/* Summary */}
                    {detailData.items && detailData.items.length > 0 && (
                      <div className="flex items-center gap-4 text-xs px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                        <span className="text-white/50">
                          <span className="text-white/70 font-semibold">{uniqueCategories(detailData.items)}</span> Kategori
                        </span>
                        <span className="text-white/50">
                          <span className="text-white/70 font-semibold">{detailData.items.length}</span> Sub Item
                        </span>
                        <span className="text-emerald-400">
                          B: {countByCondition(detailData.items, "B")}
                        </span>
                        <span className="text-red-400">
                          K: {countByCondition(detailData.items, "K")}
                        </span>
                      </div>
                    )}

                    {/* Checklist by category */}
                    {groupedItems.length > 0 ? (
                      <div className="space-y-4">
                        {groupedItems.map(([catName, items]) => (
                          <div key={catName} className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
                            <div className="px-4 py-3 bg-gradient-to-r from-[#FBBF24]/5 to-transparent border-b border-white/5">
                              <h5 className="text-sm font-bold text-white font-[family-name:var(--font-display)]">
                                {catName}
                              </h5>
                            </div>
                            <div className="divide-y divide-white/5">
                              {items.map((item) => {
                                const ic = itemCondition(item);
                                const isB = ic === "B";
                                return (
                                <div key={item.id} className="px-4 py-2.5 flex items-center justify-between">
                                  {void console.log("SUBITEM", { item, ic })}
                                  <div className="flex items-center gap-2 min-w-0">
                                    {isB ? (
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                    ) : (
                                      <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                                    )}
                                    <span className="text-sm text-white/80 truncate">{item.item_name}</span>
                                  </div>
                                  <span className={`shrink-0 ml-3 text-xs font-bold px-2.5 py-0.5 rounded-md ${
                                    isB
                                      ? "bg-emerald-500/15 text-emerald-400"
                                      : "bg-red-500/15 text-red-400"
                                  }`}>
                                    {isB ? "B" : "K"}
                                  </span>
                                </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-white/30 text-center py-6">
                        Tidak ada hasil pemeriksaan
                      </div>
                    )}

                    {/* Foto */}
                    {(() => {
                      const fUrl = fotoUrl(detailData.foto_url);
                      return fUrl ? (
                        <div>
                          <h5 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <ImageIcon className="w-3.5 h-3.5" />
                            Foto
                          </h5>
                          <img src={fUrl} alt="Foto inspeksi" className="max-w-full max-h-80 rounded-xl border border-white/10 object-cover" />
                        </div>
                      ) : null;
                    })()}

                    {/* Alasan Penolakan */}
                    {detailData.alasan_penolakan && (
                      <div>
                        <h5 className="text-xs font-semibold text-red-400/70 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <XCircle className="w-3.5 h-3.5" />
                          Alasan Penolakan
                        </h5>
                        <p className="text-sm text-red-300/80 bg-red-500/5 rounded-xl px-4 py-3 border border-red-500/10">
                          {detailData.alasan_penolakan}
                        </p>
                      </div>
                    )}

                    {/* Status */}
                    <div className="flex items-center gap-2 pt-2">
                      <span className="text-xs text-white/30">Status:</span>
                      {(() => {
                        const as = detailData.approval_status?.toUpperCase() || "PENDING";
                        return (
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border ${
                            as === "PENDING"
                              ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                              : as === "APPROVED"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : "bg-red-500/10 text-red-400 border-red-500/20"
                          }`}>
                            {as}
                          </span>
                        );
                      })()}
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-white/30 text-center py-6">
                    Gagal memuat detail inspeksi
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end px-6 py-4 border-t border-white/5">
                <button
                  onClick={() => setDetailOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 transition-all"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ───────── Approve Modal ───────── */}
      <AnimatePresence>
        {approveTarget && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => !approving && setApproveTarget(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm rounded-2xl bg-[#1E293B] border border-white/10 p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <ThumbsUp className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Setujui Inspeksi</h3>
                </div>
                <button
                  onClick={() => !approving && setApproveTarget(null)}
                  className="p-1 rounded-lg hover:bg-white/5 text-white/50 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-white/50 mb-6">
                Yakin ingin menyetujui hasil inspeksi ini?
              </p>
              <div className="mb-6 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-xs space-y-1">
                <p className="text-white/70"><span className="text-white/40">Alat:</span> {approveTarget.item_name || "—"}</p>
                <p className="text-white/70"><span className="text-white/40">Lab:</span> {approveTarget.lab_name || "—"}</p>
                <p className="text-white/70"><span className="text-white/40">Tanggal:</span> {formatDate(approveTarget.created_at)}</p>
              </div>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setApproveTarget(null)}
                  disabled={approving}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 transition-all disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  onClick={handleApprove}
                  disabled={approving}
                  className="px-5 py-2 rounded-xl text-sm font-bold bg-emerald-500 text-white hover:bg-emerald-600 transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-emerald-500/15"
                >
                  {approving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {approving ? "Menyetujui..." : "Ya, Approve"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ───────── Reject Modal ───────── */}
      <AnimatePresence>
        {rejectTarget && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => !rejecting && setRejectTarget(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm rounded-2xl bg-[#1E293B] border border-white/10 p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                    <ThumbsDown className="w-5 h-5 text-red-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Tolak Inspeksi</h3>
                </div>
                <button
                  onClick={() => !rejecting && setRejectTarget(null)}
                  className="p-1 rounded-lg hover:bg-white/5 text-white/50 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-white/50 mb-4">
                Berikan alasan penolakan hasil inspeksi ini.
              </p>
              <div className="mb-4 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-xs space-y-1">
                <p className="text-white/70"><span className="text-white/40">Alat:</span> {rejectTarget.item_name || "—"}</p>
                <p className="text-white/70"><span className="text-white/40">Lab:</span> {rejectTarget.lab_name || "—"}</p>
                <p className="text-white/70"><span className="text-white/40">Tanggal:</span> {formatDate(rejectTarget.created_at)}</p>
              </div>
              <div className="mb-2">
                <label className="block text-xs font-medium text-white/50 mb-1.5">
                  Alasan Penolakan <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => { setRejectReason(e.target.value); setRejectError(""); }}
                  placeholder="Contoh: Foto tidak jelas, Data tidak lengkap, Checklist tidak sesuai..."
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm resize-none placeholder:text-white/30 focus:outline-none focus:border-[#FBBF24]/40 transition-colors"
                />
                {rejectError && (
                  <p className="text-xs text-red-400 mt-1">{rejectError}</p>
                )}
              </div>
              <div className="flex items-center justify-end gap-3 mt-4">
                <button
                  onClick={() => { setRejectTarget(null); setRejectReason(""); setRejectError(""); }}
                  disabled={rejecting}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 transition-all disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  onClick={handleReject}
                  disabled={rejecting || !rejectReason.trim()}
                  className="px-5 py-2 rounded-xl text-sm font-bold bg-red-500 text-white hover:bg-red-600 transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-red-500/15"
                >
                  {rejecting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {rejecting ? "Menolak..." : "Tolak"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
