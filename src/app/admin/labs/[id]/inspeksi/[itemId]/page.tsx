"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, FlaskConical, Plus, Save, Upload, Package, ChevronDown, Download, Pencil } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { getLabs } from "@/services/labs";
import { getCriteriaByItemId, createCategoryWithSubItems, getApprovedCriteria, updateCategoryWithSubItems, approveCategory, rejectCategory } from "@/services/criteria";
import { createInspectionMultipart, getInspectionByItemId, getInspectionDetail, updateInspectionResult, exportInspection, approveMonth, rejectMonth } from "@/services/inspections";
import { getItemsByLab } from "@/services/items";
import type { Lab, Item, CriteriaCategory, MonthlyGroup } from "@/types/admin";

export default function ItemInspectionPage() {
  const params = useParams();
  const router = useRouter();
  const labId = Number(params.id);
  const itemId = Number(params.itemId);

  const [lab, setLab] = useState<Lab | null>(null);
  const [item, setItem] = useState<Item | null>(null);
  const [categories, setCategories] = useState<CriteriaCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Category form
  interface CategoryFormItem {
    nama_kategori: string;
    sub_items: string[];
  }
  const [categoryForms, setCategoryForms] = useState<CategoryFormItem[]>([
    { nama_kategori: "", sub_items: [""] },
  ]);
  const [savingCat, setSavingCat] = useState(false);
  const [editCategory, setEditCategory] = useState<CriteriaCategory | null>(null);
  const [rejectTarget, setRejectTarget] = useState<{ id: number; nama: string } | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // Inspection form
  const [existingInspection, setExistingInspection] = useState<{ id: number; review_status: string | null; alasan_penolakan: string | null; has_approved_month: boolean } | null>(null);
  const isRejected = existingInspection?.review_status === "REJECTED";
  const isApproved = existingInspection?.review_status === "APPROVED";
  const categoriesLocked = existingInspection !== null && (isApproved || existingInspection.has_approved_month);
  const [monthlyResults, setMonthlyResults] = useState<MonthlyGroup[]>([]);
  const [nextBulanKe, setNextBulanKe] = useState<number | null>(null);
  const [expandedMonth, setExpandedMonth] = useState<number | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selections, setSelections] = useState<Record<number, "B" | "K">>({});
  const [catatan, setCatatan] = useState("");
  const [foto, setFoto] = useState<File | null>(null);
  const [savingInsp, setSavingInsp] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [approvingMonth, setApprovingMonth] = useState<number | null>(null);
  const [rejectMonthTarget, setRejectMonthTarget] = useState<number | null>(null);
  const [rejectMonthReason, setRejectMonthReason] = useState("");

  const toggleMonth = (bulan: number) => {
    setExpandedMonth((prev) => (prev === bulan ? null : bulan));
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [labsData, itemsData, criteriaRes, existing] = await Promise.all([
        getLabs(),
        getItemsByLab(labId),
        getCriteriaByItemId(itemId),
        getInspectionByItemId(itemId),
      ]);
      const foundLab = labsData.find((l) => l.id === labId) || null;
      setLab(foundLab);
      const foundItem = itemsData.find((i) => i.id === itemId) || null;
      setItem(foundItem);
      setCategories(criteriaRes.data || []);
      setExistingInspection(existing.exists
        ? { id: existing.inspection_id!, review_status: existing.review_status, alasan_penolakan: existing.alasan_penolakan, has_approved_month: existing.has_approved_month }
        : null);
    } catch {
      toast.error("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }, [labId, itemId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Pre-fill form when rejected, or determine next bulan_ke when approved
  useEffect(() => {
    if (!existingInspection) {
      setNextBulanKe(null);
      setMonthlyResults([]);
      return;
    }
    if (!isRejected && !isApproved && !existingInspection.has_approved_month) {
      setNextBulanKe(null);
      setMonthlyResults([]);
      return;
    }
    (async () => {
      try {
        const detail = await getInspectionDetail(existingInspection.id);
        if (!detail) return;

        const months = detail.monthly_results ?? [];
        setMonthlyResults(months);

        if (isRejected) {
          // Pre-fill with previous data from the rejected month
          const rejectedMonth = months.find(
            (m) => m.review?.review_status === "REJECTED"
          ) ?? months[months.length - 1];
          const prefill: Record<number, "B" | "K"> = {};
          for (const cat of rejectedMonth?.categories ?? []) {
            for (const item of cat.items ?? []) {
              if (item.subitem_id && (item.status === "B" || item.status === "K")) {
                prefill[item.subitem_id] = item.status as "B" | "K";
              }
            }
          }
          setSelections(prefill);
          setCatatan(detail.catatan ?? "");
          setNextBulanKe(rejectedMonth?.bulan_ke ?? 1);
        }

        if (isApproved || existingInspection.has_approved_month) {
          // Find next bulan_ke
          const approvedMonths = months.filter(
            (m) => m.review?.review_status === "APPROVED"
          );
          const pendingMonth = months.find(
            (m) => m.review?.review_status === "PENDING"
          );
          if (pendingMonth) {
            setNextBulanKe(null);
          } else {
            const next = approvedMonths.length + 1;
            if (next <= 6) {
              setNextBulanKe(next);
              setSelections({});
              setCatatan("");
            } else {
              setNextBulanKe(null);
            }
          }
        }
      } catch {
        // silent
      }
    })();
  }, [isRejected, isApproved, existingInspection?.id, refreshKey]);

  const hasApprovedCategories = categories.some((c) => c.status === "APPROVED");
  const hasPendingCategories = categories.some((c) => c.status === "PENDING");
  const allSubItems = categories.flatMap((c) => c.subitems ?? c.sub_items ?? []);
  const allSelected = allSubItems.every((si) => selections[si.id]);
  const allMonthsComplete = categoriesLocked && monthlyResults.length === 6 && monthlyResults.every((m) => m.review?.review_status === "APPROVED");

  const addCategoryForm = () => {
    setCategoryForms([...categoryForms, { nama_kategori: "", sub_items: [""] }]);
  };

  const removeCategoryForm = (catIdx: number) => {
    if (categoryForms.length <= 1) return;
    setCategoryForms(categoryForms.filter((_, i) => i !== catIdx));
  };

  const updateCategoryName = (catIdx: number, val: string) => {
    const next = [...categoryForms];
    next[catIdx].nama_kategori = val;
    setCategoryForms(next);
  };

  const addSubItemField = (catIdx: number) => {
    const next = [...categoryForms];
    next[catIdx].sub_items = [...next[catIdx].sub_items, ""];
    setCategoryForms(next);
  };

  const updateSubItem = (catIdx: number, subIdx: number, val: string) => {
    const next = [...categoryForms];
    next[catIdx].sub_items[subIdx] = val;
    setCategoryForms(next);
  };

  const removeSubItem = (catIdx: number, subIdx: number) => {
    const next = [...categoryForms];
    if (next[catIdx].sub_items.length <= 1) return;
    next[catIdx].sub_items = next[catIdx].sub_items.filter((_, i) => i !== subIdx);
    setCategoryForms(next);
  };

  const handleApproveCategory = async (cat: CriteriaCategory) => {
    try {
      await approveCategory(cat.id);
      toast.success("Kategori berhasil disetujui");
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal menyetujui kategori");
    }
  };

  const handleRejectCategory = async () => {
    if (!rejectTarget) return;
    try {
      await rejectCategory(rejectTarget.id, rejectReason || undefined);
      toast.success("Kategori ditolak");
      setRejectTarget(null);
      setRejectReason("");
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal menolak kategori");
    }
  };

  const handleStartEdit = (cat: CriteriaCategory) => {
    setEditCategory(cat);
    const subItemsArr = cat.subitems ?? cat.sub_items ?? [];
    setCategoryForms([{
      nama_kategori: cat.nama_kategori,
      sub_items: subItemsArr.map((s) => s.nama_subitem),
    }]);
  };

  const handleCancelEdit = () => {
    setEditCategory(null);
    setCategoryForms([{ nama_kategori: "", sub_items: [""] }]);
  };

  const handleSaveCategory = async () => {
    const validCategories = categoryForms
      .map((cf) => ({
        nama_kategori: cf.nama_kategori.trim(),
        subitems: cf.sub_items.map((s) => s.trim()).filter(Boolean),
      }))
      .filter((c) => c.nama_kategori && c.subitems.length > 0);

    if (validCategories.length === 0) {
      toast.error("Minimal 1 kategori dengan sub item wajib diisi");
      return;
    }

    setSavingCat(true);
    try {
      if (editCategory) {
        const originalSubItems = editCategory.subitems ?? editCategory.sub_items ?? [];
        await updateCategoryWithSubItems(editCategory.id, {
          nama_kategori: validCategories[0].nama_kategori,
          urutan: editCategory.urutan || 1,
          deskripsi: editCategory.deskripsi,
          subitems: validCategories[0].subitems.map((s, j) => {
            const match = originalSubItems.find(
              (orig) => orig.nama_subitem.toLowerCase().trim() === s.toLowerCase().trim()
            );
            return {
              id: match?.id,
              nama_subitem: s,
              urutan: j + 1,
            };
          }),
        });
        toast.success("Kategori berhasil diperbarui");
        setEditCategory(null);
      } else {
        await createCategoryWithSubItems({
          laboratory_id: labId,
          item_id: itemId,
          categories: validCategories.map((c, i) => ({
            nama_kategori: c.nama_kategori,
            urutan: i + 1,
            subitems: c.subitems.map((s, j) => ({ nama_subitem: s, urutan: j + 1 })),
          })),
        });
        toast.success(`${validCategories.length} kategori berhasil dibuat`);
      }
      setCategoryForms([{ nama_kategori: "", sub_items: [""] }]);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal menyimpan kategori");
    } finally {
      setSavingCat(false);
    }
  };

  const handleSaveInspection = async () => {
    if (allSubItems.length === 0) { toast.error("Tidak ada sub item untuk diperiksa"); return; }
    if (!allSelected) { toast.error("Semua sub item wajib diisi (B/K)"); return; }

    const results = allSubItems.map((si) => ({
      subitem_id: si.id,
      status: selections[si.id],
      keterangan: selections[si.id] === "B" ? "Baik" : "Kurang",
    }));

    setSavingInsp(true);
    try {
      if (isRejected && existingInspection) {
        await updateInspectionResult(existingInspection.id, {
          bulan_ke: nextBulanKe ?? 1,
          results,
        });
        toast.success("Inspeksi berhasil diperbarui dan dikirim ulang");
      } else if (existingInspection && nextBulanKe) {
        await updateInspectionResult(existingInspection.id, {
          bulan_ke: nextBulanKe,
          results,
        });
        toast.success(`Inspeksi bulan ke-${nextBulanKe} berhasil disimpan`);
      } else {
        const formData = new FormData();
        formData.append("laboratory_id", String(labId));
        formData.append("item_id", String(itemId));
        formData.append("checklist_results", JSON.stringify(results));
        formData.append("catatan", catatan);
        if (foto) formData.append("foto", foto);

        await createInspectionMultipart(formData);
        toast.success("Inspeksi berhasil disimpan");
      }
      setSelections({});
      setCatatan("");
      setFoto(null);
      setRefreshKey((k) => k + 1);
      fetchData();
    } catch (err: any) {
      const errData = err.response?.data;
      const msg = errData?.message || "";
      const existingId = errData?.data?.id || errData?.data?.inspection_id;
      if (!isRejected && !isApproved && existingId) {
        toast.info("Inspeksi sudah ada. Mengalihkan ke detail...");
        router.push(`/admin/inspections/detail/${existingId}`);
      } else {
        toast.error(msg || "Gagal menyimpan inspeksi");
      }
    } finally {
      setSavingInsp(false);
    }
  };

  const handleApproveMonth = async (bulanKe: number) => {
    setApprovingMonth(bulanKe);
    try {
      await approveMonth(existingInspection!.id, bulanKe);
      toast.success(`Bulan ke-${bulanKe} berhasil disetujui`);
      setRefreshKey((k) => k + 1);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal menyetujui bulan");
    } finally {
      setApprovingMonth(null);
    }
  };

  const handleRejectMonthSubmit = async () => {
    if (rejectMonthTarget == null) return;
    try {
      await rejectMonth(existingInspection!.id, rejectMonthTarget, rejectMonthReason || undefined);
      toast.success(`Bulan ke-${rejectMonthTarget} berhasil ditolak`);
      setRejectMonthTarget(null);
      setRejectMonthReason("");
      setRefreshKey((k) => k + 1);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal menolak bulan");
    }
  };

  const handleExport = async () => {
    if (!existingInspection) return;
    setExporting(true);
    try {
      const blob = await exportInspection(existingInspection.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const fileName = `inspeksi-${(item?.nama_barang || `item-${itemId}`).replace(/[\\/:*?"<>|]/g, "").trim()}.xlsx`;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("File berhasil diexport");
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
        <div className="h-64 rounded-2xl bg-white/5" />
        <div className="h-64 rounded-2xl bg-white/5" />
      </div>
    );
  }

  if (!lab || !item) {
    return (
      <div className="p-10 text-center text-white/30 text-sm">Data tidak ditemukan</div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/admin/labs/${labId}`} className="p-2 rounded-xl hover:bg-white/5 text-white/50 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white font-[family-name:var(--font-display)]">Inspeksi Alat</h1>
          <p className="text-sm text-white/40 mt-1">{lab.nama_lab} — {item.nama_barang}{item.kode_barang ? ` (${item.kode_barang})` : ""}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ───────── Card 1: Isi Inspeksi ───────── */}
        <div className="rounded-2xl bg-gradient-to-br from-emerald-500/5 to-transparent border border-emerald-500/20 p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Package className="w-5 h-5 text-emerald-400" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-[family-name:var(--font-display)]">
                {categoriesLocked ? "Riwayat Inspeksi Bulanan" : isRejected ? "Kirim Ulang Inspeksi" : "Isi Inspeksi"}
              </h2>
              <p className="text-xs text-white/40">
                {categoriesLocked && nextBulanKe ? `Bulan ke-${nextBulanKe} dapat diisi` : categoriesLocked ? "Semua bulan selesai" : "Pilih B (Baik) atau K (Kurang)"}
              </p>
            </div>
          </div>

          {categoriesLocked ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }, (_, i) => i + 1).map((bulan) => {
                const monthData = monthlyResults.find((m) => m.bulan_ke === bulan);
                const reviewStatus = monthData?.review?.review_status;
                const isFormActive = nextBulanKe === bulan;
                const isOpen = expandedMonth === bulan || isFormActive;

                // Active form month — always expanded, shows B/K form
                if (isFormActive && categories.length > 0) {
                  const isRejectedMonth = monthData?.review?.review_status === "REJECTED";
                  return (
                    <div key={bulan} className={`rounded-xl border overflow-hidden ${isRejectedMonth ? "border-red-500/30 bg-red-500/[0.03]" : "border-emerald-500/30 bg-emerald-500/[0.03]"}`}>
                      <div
                        onClick={() => toggleMonth(bulan)}
                        className={`px-4 py-3 bg-gradient-to-r ${isRejectedMonth ? "from-red-500/10 to-transparent" : "from-emerald-500/10 to-transparent"} border-b border-white/5 flex items-center justify-between cursor-pointer select-none`}
                      >
                        <h3 className="text-sm font-bold text-white">Bulan ke-{bulan}</h3>
                        <div className="flex items-center gap-2">
                          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${isRejectedMonth ? "bg-red-500/20 text-red-400" : "bg-emerald-500/20 text-emerald-400"}`}>
                            {isRejectedMonth ? "Ditolak" : "Aktif"}
                          </span>
                          <ChevronDown className={`w-4 h-4 text-white/40 transition-transform ${isOpen ? "" : "-rotate-90"}`} strokeWidth={1.5} />
                        </div>
                      </div>
                      {isOpen && (
                        <div className="p-4 space-y-4">
                          {isRejectedMonth && monthData?.review?.alasan_penolakan && (
                            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400/80">
                              Alasan penolakan: {monthData.review.alasan_penolakan}
                            </div>
                          )}
                          {categories.map((cat) => {
                            const subItemsArr = cat.subitems ?? cat.sub_items ?? [];
                            return (
                              <div key={cat.id}>
                                <h4 className="text-xs font-semibold text-white/60 mb-2">{cat.nama_kategori}</h4>
                                <div className="space-y-1.5">
                                  {subItemsArr.map((si) => {
                                    const sel = selections[si.id] || "";
                                    return (
                                      <div key={si.id} className="flex items-center gap-3 py-1">
                                        <div className="flex items-center gap-1 shrink-0">
                                          <label className={`inline-flex items-center justify-center w-7 h-7 rounded-lg cursor-pointer transition-all text-xs font-bold border-2 ${
                                            sel === "B" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50" : "bg-white/5 text-white/30 border-white/10 hover:border-emerald-500/30 hover:text-emerald-400"
                                          }`}>
                                            <input type="radio" name={`b${bulan}-si-${si.id}`} value="B" checked={sel === "B"} onChange={() => setSelections((p) => ({ ...p, [si.id]: "B" }))} className="sr-only" /> B
                                          </label>
                                          <label className={`inline-flex items-center justify-center w-7 h-7 rounded-lg cursor-pointer transition-all text-xs font-bold border-2 ${
                                            sel === "K" ? "bg-red-500/20 text-red-400 border-red-500/50" : "bg-white/5 text-white/30 border-white/10 hover:border-red-500/30 hover:text-red-400"
                                          }`}>
                                            <input type="radio" name={`b${bulan}-si-${si.id}`} value="K" checked={sel === "K"} onChange={() => setSelections((p) => ({ ...p, [si.id]: "K" }))} className="sr-only" /> K
                                          </label>
                                        </div>
                                        <span className={`text-xs ${sel ? "text-white font-medium" : "text-white/50"}`}>{si.nama_subitem}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}

                          <div className="px-4 py-2 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] text-white/30 flex items-center gap-6">
                            <span><span className="text-emerald-400 font-semibold">B</span> = Baik</span>
                            <span><span className="text-red-400 font-semibold">K</span> = Kurang</span>
                          </div>

                          <button
                            onClick={handleSaveInspection}
                            disabled={savingInsp || !allSelected}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-600 transition-all disabled:opacity-40"
                          >
                            <Save className="w-4 h-4" />
                            {savingInsp ? "Menyimpan..." : isRejectedMonth ? "Kirim Ulang" : `Simpan Bulan ke-${bulan}`}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                }

                // Month with data — collapsible, read-only
                if (monthData) {
                  const revStatus = reviewStatus ?? "";
                  const baik = monthData.statistics?.baik ?? monthData.categories.reduce((s, c) => s + c.items.filter((it) => it.status === "B").length, 0);
                  const kurang = monthData.statistics?.kurang ?? monthData.categories.reduce((s, c) => s + c.items.filter((it) => it.status === "K").length, 0);
                  return (
                    <div key={bulan} className={`rounded-xl border overflow-hidden ${
                      revStatus === "APPROVED" ? "border-emerald-500/20 bg-emerald-500/5" :
                      revStatus === "REJECTED" ? "border-red-500/20 bg-red-500/5" :
                      "border-yellow-500/20 bg-yellow-500/5"
                    }`}>
                      <div
                        onClick={() => toggleMonth(bulan)}
                        className="px-4 py-3 flex items-center justify-between border-b border-white/5 cursor-pointer select-none"
                      >
                        <h3 className="text-sm font-bold text-white">Bulan ke-{bulan}</h3>
                        <div className="flex items-center gap-2">
                          {revStatus !== "APPROVED" && revStatus !== "REJECTED" && existingInspection && (
                            <>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleApproveMonth(bulan); }}
                                disabled={approvingMonth === bulan}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-[11px] font-semibold hover:bg-emerald-500/20 transition-all disabled:opacity-40"
                              >
                                {approvingMonth === bulan ? "..." : "Setujui"}
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); setRejectMonthTarget(bulan); setRejectMonthReason(""); }}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-500/10 text-red-400 text-[11px] font-semibold hover:bg-red-500/20 transition-all"
                              >
                                Tolak
                              </button>
                            </>
                          )}
                          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                            revStatus === "APPROVED" ? "bg-emerald-500/20 text-emerald-400" :
                            revStatus === "REJECTED" ? "bg-red-500/20 text-red-400" :
                            "bg-yellow-500/20 text-yellow-400"
                          }`}>
                            {revStatus === "APPROVED" ? "Disetujui" : revStatus === "REJECTED" ? "Ditolak" : "Menunggu Review"}
                          </span>
                          <ChevronDown className={`w-4 h-4 text-white/40 transition-transform ${isOpen ? "" : "-rotate-90"}`} strokeWidth={1.5} />
                        </div>
                      </div>
                      {isOpen && (
                        <div className="px-4 py-3 space-y-1.5">
                          {revStatus === "REJECTED" && monthData.review?.alasan_penolakan && (
                            <p className="text-xs text-red-400/70 mb-2">Alasan: {monthData.review.alasan_penolakan}</p>
                          )}
                          {monthData.categories.map((cat) => (
                            <div key={cat.category_id}>
                              <span className="text-xs text-white/40">{cat.nama_kategori}</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {cat.items.map((it) => (
                                  <span key={it.id} className={`text-[11px] px-2 py-0.5 rounded-full ${it.status === "B" ? "bg-emerald-500/15 text-emerald-400" : it.status === "K" ? "bg-red-500/15 text-red-400" : "bg-white/5 text-white/30"}`}>
                                    {it.nama_subitem}: {it.status ?? "-"}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                          <div className="flex gap-3 pt-1 text-xs text-white/30">
                            <span className="text-emerald-400">B: {baik}</span>
                            <span className="text-red-400">K: {kurang}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }

                // Not yet available — no expand
                return (
                  <div key={bulan} className="rounded-xl border border-white/5 bg-white/[0.01] overflow-hidden">
                    <div className="px-4 py-3 flex items-center justify-between">
                      <h3 className="text-sm font-bold text-white/30">Bulan ke-{bulan}</h3>
                      <span className="text-[11px] text-white/20">Belum tersedia</span>
                    </div>
                  </div>
                );
              })}
              {allMonthsComplete && (
                <button
                  onClick={handleExport}
                  disabled={exporting}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/15 text-emerald-400 text-sm font-bold hover:bg-emerald-500/25 border border-emerald-500/30 transition-all disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  {exporting ? "Mengekspor..." : "Export Excel"}
                </button>
              )}
            </div>
          ) : existingInspection && !isRejected && !isApproved ? (
            <div className="p-6 text-center border border-yellow-500/30 bg-yellow-500/5 rounded-xl space-y-3">
              <div className="text-yellow-400 text-lg font-bold">Inspeksi Sudah Dikirim</div>
              <p className="text-sm text-white/50">Inspeksi untuk alat ini sudah pernah dikirim dan menunggu review admin.</p>
              <a
                href={`/admin/inspections/detail/${existingInspection.id}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-yellow-500/20 text-yellow-400 text-sm font-semibold hover:bg-yellow-500/30 transition-all"
              >
                <Package className="w-4 h-4" /> Lihat Detail Inspeksi
              </a>
            </div>
          ) : isRejected && categories.length === 0 ? (
            <div className="p-6 text-center border border-red-500/30 bg-red-500/5 rounded-xl space-y-3">
              <div className="text-red-400 text-lg font-bold">Inspeksi Ditolak</div>
              {existingInspection?.alasan_penolakan && (
                <p className="text-sm text-white/50">Alasan: {existingInspection.alasan_penolakan}</p>
              )}
              <p className="text-xs text-white/30">Buat kategori terlebih dahulu untuk mengirim ulang.</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="p-6 text-center text-white/30 text-sm border border-dashed border-white/10 rounded-xl">
              Belum ada kategori. Buat kategori terlebih dahulu.
            </div>
          ) : (
            <div className="space-y-5">
              {isRejected && (
                <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/5 space-y-2">
                  <div className="text-red-400 text-sm font-bold">Inspeksi Ditolak — Kirim Ulang</div>
                  {existingInspection?.alasan_penolakan && (
                    <p className="text-sm text-white/50">Alasan penolakan: {existingInspection.alasan_penolakan}</p>
                  )}
                  <p className="text-xs text-white/30">Perbaiki hasil inspeksi di bawah, lalu kirim ulang.</p>
                </div>
              )}

              {hasPendingCategories && !hasApprovedCategories && (
                <div className="p-4 rounded-xl border border-yellow-500/30 bg-yellow-500/5 space-y-2 text-center">
                  <div className="text-yellow-400 text-sm font-bold">Kategori Menunggu Persetujuan</div>
                  <p className="text-xs text-white/50">Kategori yang sudah dibuat masih menunggu persetujuan admin. Setelah disetujui, Anda dapat mengisi inspeksi.</p>
                </div>
              )}

              {categories.map((cat) => {
                const isApprovedCat = cat.status === "APPROVED";
                const subItemsArr = cat.subitems ?? cat.sub_items ?? [];
                return (
                  <div key={cat.id} className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
                    <div className="px-4 py-3 bg-gradient-to-r from-emerald-500/5 to-transparent border-b border-white/5 flex items-center justify-between">
                      <h3 className="text-sm font-bold text-white">{cat.nama_kategori}</h3>
                      <div className="flex items-center gap-2">
                        {cat.status === "REJECTED" && !categoriesLocked && (
                          <>
                            <button
                              onClick={() => handleApproveCategory(cat)}
                              className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-white/50 hover:text-emerald-400 transition-colors"
                              title="Setujui kategori"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleStartEdit(cat)}
                              className="p-1.5 rounded-lg hover:bg-blue-500/10 text-white/50 hover:text-blue-400 transition-colors"
                              title="Edit kategori"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                        {cat.status === "PENDING" && !categoriesLocked && (
                          <>
                            <button
                              onClick={() => handleApproveCategory(cat)}
                              className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-white/50 hover:text-emerald-400 transition-colors"
                              title="Setujui kategori"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                            <button
                              onClick={() => { setRejectTarget({ id: cat.id, nama: cat.nama_kategori }); setRejectReason(cat.alasan_penolakan || ""); }}
                              className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/50 hover:text-red-400 transition-colors"
                              title="Tolak kategori"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </>
                        )}
                        {cat.status === "APPROVED" && (
                          <button
                            onClick={() => { setRejectTarget({ id: cat.id, nama: cat.nama_kategori }); setRejectReason(cat.alasan_penolakan || ""); }}
                            className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/50 hover:text-red-400 transition-colors"
                            title="Tolak kategori"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                        {cat.status && (
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            cat.status === "APPROVED"
                              ? "bg-emerald-500/20 text-emerald-400"
                              : cat.status === "PENDING"
                              ? "bg-yellow-500/20 text-yellow-400"
                              : "bg-red-500/20 text-red-400"
                          }`}>
                            {cat.status === "APPROVED" ? "Disetujui" : cat.status === "PENDING" ? "Menunggu" : "Ditolak"}
                          </span>
                        )}
                      </div>
                    </div>
                    {cat.status === "REJECTED" && cat.alasan_penolakan && (
                      <div className="px-4 py-2 bg-red-500/5 border-b border-red-500/10 text-xs text-red-400/80">
                        Alasan: {cat.alasan_penolakan}
                      </div>
                    )}
                    {subItemsArr.length === 0 ? (
                      <div className="px-4 py-3 text-xs text-white/30 italic">Tidak ada sub item</div>
                    ) : (
                      <div className="divide-y divide-white/5">
                        {subItemsArr.map((si) => {
                          const sel = selections[si.id] || "";
                          return (
                            <div key={si.id} className="px-4 py-2.5 flex items-center gap-3">
                              {isApprovedCat ? (
                                <>
                                  <div className="flex items-center gap-1 shrink-0">
                                    <label className={`inline-flex items-center justify-center w-8 h-8 rounded-lg cursor-pointer transition-all text-sm font-bold border-2 ${
                                      sel === "B"
                                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50"
                                        : "bg-white/5 text-white/30 border-white/10 hover:border-emerald-500/30 hover:text-emerald-400"
                                    }`}>
                                      <input type="radio" name={`si-${si.id}`} value="B" checked={sel === "B"} onChange={() => setSelections((p) => ({ ...p, [si.id]: "B" }))} className="sr-only" /> B
                                    </label>
                                    <label className={`inline-flex items-center justify-center w-8 h-8 rounded-lg cursor-pointer transition-all text-sm font-bold border-2 ${
                                      sel === "K"
                                        ? "bg-red-500/20 text-red-400 border-red-500/50"
                                        : "bg-white/5 text-white/30 border-white/10 hover:border-red-500/30 hover:text-red-400"
                                    }`}>
                                      <input type="radio" name={`si-${si.id}`} value="K" checked={sel === "K"} onChange={() => setSelections((p) => ({ ...p, [si.id]: "K" }))} className="sr-only" /> K
                                    </label>
                                  </div>
                                  <span className={`text-sm ${sel ? "text-white font-medium" : "text-white/60"}`}>{si.nama_subitem}</span>
                                </>
                              ) : (
                                <span className="text-sm text-white/40 italic">{si.nama_subitem}</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="px-4 py-2 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] text-white/30 flex items-center gap-6">
                <span><span className="text-emerald-400 font-semibold">B</span> = Baik</span>
                <span><span className="text-red-400 font-semibold">K</span> = Kurang</span>
              </div>

              {(!isApproved || !nextBulanKe) && hasApprovedCategories && (
                <div>
                  <label className="block text-xs font-medium text-white/60 mb-1">Catatan</label>
                  <textarea
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                    placeholder="Catatan inspeksi..."
                    rows={2}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm resize-none placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
                  />
                </div>
              )}

              {(!isApproved || !nextBulanKe) && hasApprovedCategories && (
                <div>
                  <label className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-dashed border-white/10 cursor-pointer hover:border-emerald-400/40 transition-all group">
                    <Upload className="w-5 h-5 text-white/30 group-hover:text-emerald-400 transition-colors" strokeWidth={1.5} />
                    <span className="text-sm text-white/30 group-hover:text-white/60 transition-colors">{foto ? foto.name : "Upload foto"}</span>
                    <input type="file" accept="image/*" onChange={(e) => setFoto(e.target.files?.[0] || null)} className="hidden" />
                    {foto && <button onClick={(e) => { e.preventDefault(); setFoto(null); }} className="ml-auto text-xs text-red-400 hover:text-red-300">Hapus</button>}
                  </label>
                </div>
              )}

              {hasApprovedCategories && (
                <button
                  onClick={handleSaveInspection}
                  disabled={savingInsp || !allSelected}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-600 transition-all disabled:opacity-40"
                >
                  <Save className="w-4 h-4" />
                  {savingInsp ? "Menyimpan..." : isRejected ? "Kirim Ulang Inspeksi" : nextBulanKe ? `Simpan Bulan ke-${nextBulanKe}` : "Simpan Inspeksi"}
                </button>
              )}
            </div>
          )}
        </div>

        {/* ───────── Card 2: Tambah/Edit Kategori ───────── */}
        <div className={`rounded-2xl p-6 ${categoriesLocked && !editCategory ? "bg-white/5 border border-white/10" : "bg-gradient-to-br from-blue-500/5 to-transparent border border-blue-500/20"}`}>
          <div className="flex items-center gap-3 mb-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${categoriesLocked && !editCategory ? "bg-white/5" : "bg-blue-500/10"}`}>
              <Plus className={`w-5 h-5 ${categoriesLocked && !editCategory ? "text-white/20" : "text-blue-400"}`} strokeWidth={1.5} />
            </div>
            <div>
              <h2 className={`text-lg font-bold font-[family-name:var(--font-display)] ${categoriesLocked && !editCategory ? "text-white/30" : "text-white"}`}>
                {editCategory ? "Edit Kategori" : "Tambah Kategori"}
              </h2>
              <p className="text-xs text-white/40">
                {editCategory ? "Perbarui kategori yang ditolak" : "Buat kategori dan sub item inspeksi"}
              </p>
            </div>
          </div>

          {categoriesLocked && !editCategory ? (
            <div className="p-6 text-center border border-dashed border-white/10 rounded-xl space-y-2">
              <p className="text-sm text-white/40 font-medium">Kategori Terkunci</p>
              <p className="text-xs text-white/30">Kategori tidak dapat diubah karena inspeksi sudah berjalan.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {categoryForms.map((cf, catIdx) => (
                <div key={catIdx} className="rounded-xl bg-white/5 border border-white/10 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">Kategori {catIdx + 1}</span>
                    {categoryForms.length > 1 && !editCategory && (
                      <button onClick={() => removeCategoryForm(catIdx)} className="text-xs text-red-400 hover:text-red-300 transition-colors">Hapus</button>
                    )}
                  </div>

                  <input
                    value={cf.nama_kategori}
                    onChange={(e) => updateCategoryName(catIdx, e.target.value)}
                    placeholder="Nama kategori"
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400/40 mb-3"
                  />

                  <label className="block text-xs font-medium text-white/60 mb-2">Sub Item</label>
                  <div className="space-y-2">
                    {cf.sub_items.map((s, subIdx) => (
                      <div key={subIdx} className="flex items-center gap-2">
                        <input
                          value={s}
                          onChange={(e) => updateSubItem(catIdx, subIdx, e.target.value)}
                          placeholder="Nama sub item"
                          className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400/40"
                        />
                        <button onClick={() => removeSubItem(catIdx, subIdx)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/50 hover:text-red-400 transition-colors text-xs shrink-0">✕</button>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => addSubItemField(catIdx)} className="mt-2 text-xs text-blue-400 hover:text-blue-300 transition-colors">+ Tambah Sub Item</button>
                </div>
              ))}

              {!editCategory && (
                <button
                  onClick={addCategoryForm}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-white/10 text-white/50 text-sm font-medium hover:border-blue-400/40 hover:text-blue-400 transition-all"
                >
                  <Plus className="w-4 h-4" /> Tambah Kategori Lagi
                </button>
              )}

              <div className="flex items-center gap-2">
                {editCategory && (
                  <button
                    onClick={handleCancelEdit}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 text-white/70 text-sm font-medium hover:bg-white/5 transition-all"
                  >
                    Batal Edit
                  </button>
                )}
                <button
                  onClick={handleSaveCategory}
                  disabled={savingCat}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition-all disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {savingCat ? "Menyimpan..." : editCategory ? "Update Kategori" : "Simpan Semua Kategori"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ───────── Reject Month Modal ───────── */}
      {rejectMonthTarget != null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">Tolak Bulan ke-{rejectMonthTarget}</h3>
            <p className="text-sm text-white/50 mb-4">
              Yakin ingin menolak seluruh item di bulan ke-{rejectMonthTarget}?
            </p>
            <textarea
              value={rejectMonthReason}
              onChange={(e) => setRejectMonthReason(e.target.value)}
              placeholder="Alasan penolakan (opsional)..."
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 resize-none focus:outline-none focus:ring-2 focus:ring-red-400/40 mb-4"
            />
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setRejectMonthTarget(null); setRejectMonthReason(""); }}
                className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-white/70 text-sm font-medium hover:bg-white/5 transition-all"
              >
                Batal
              </button>
              <button
                onClick={handleRejectMonthSubmit}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-all"
              >
                Tolak
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ───────── Reject Kategori Modal ───────── */}
      {rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">Tolak Kategori</h3>
            <p className="text-sm text-white/50 mb-4">
              Yakin ingin menolak kategori <span className="text-white font-semibold">{rejectTarget.nama}</span>?
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Alasan penolakan (opsional)..."
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 resize-none focus:outline-none focus:ring-2 focus:ring-red-400/40 mb-4"
            />
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setRejectTarget(null); setRejectReason(""); }}
                className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-white/70 text-sm font-medium hover:bg-white/5 transition-all"
              >
                Batal
              </button>
              <button
                onClick={handleRejectCategory}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-all"
              >
                Tolak
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
