"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Save, ClipboardCheck, PackageSearch, Upload, ThumbsUp } from "lucide-react";
import { toast } from "sonner";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { CustomSelect } from "@/components/admin/CustomSelect";
import InspectionApprovalDashboard from "@/components/admin/InspectionApproval";
import { getLabs } from "@/services/labs";
import { getItemsByLab } from "@/services/items";
import { getCriteriaByItemId } from "@/services/criteria";
import { createInspectionMultipart } from "@/services/inspections";
import type { Lab, Item, CriteriaCategory } from "@/types/admin";

type PageTab = "form" | "approval";

const TABS: { key: PageTab; label: string; icon: typeof ClipboardCheck }[] = [
  { key: "form", label: "Buat Inspeksi", icon: ClipboardCheck },
  { key: "approval", label: "Approval", icon: ThumbsUp },
];

export default function InspectionsPage() {
  const router = useRouter();
  const [pageTab, setPageTab] = useState<PageTab>("form");

  // Form state
  const [labs, setLabs] = useState<Lab[]>([]);
  const [selectedLabId, setSelectedLabId] = useState<number | "">("");
  const [labItems, setLabItems] = useState<Item[]>([]);
  const [selectedAlatId, setSelectedAlatId] = useState<number | "">("");
  const [categories, setCategories] = useState<CriteriaCategory[]>([]);
  const [catatan, setCatatan] = useState("");
  const [foto, setFoto] = useState<File | null>(null);
  const [selections, setSelections] = useState<Record<number, "B" | "K">>({});
  const [loadingLabs, setLoadingLabs] = useState(true);
  const [loadingItems, setLoadingItems] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadLabs = useCallback(async () => {
    setLoadingLabs(true);
    try {
      setLabs(await getLabs());
    } catch {
      toast.error("Gagal memuat laboratorium");
    } finally {
      setLoadingLabs(false);
    }
  }, []);

  useEffect(() => { loadLabs(); }, [loadLabs]);

  useEffect(() => {
    if (!selectedLabId) {
      setLabItems([]);
      setSelectedAlatId("");
      setCategories([]);
      setSelections({});
      setCatatan("");
      setFoto(null);
      return;
    }
    setLoadingItems(true);
    getItemsByLab(Number(selectedLabId))
      .then(setLabItems)
      .catch(() => toast.error("Gagal memuat alat"))
      .finally(() => setLoadingItems(false));
    setSelectedAlatId("");
    setCategories([]);
    setSelections({});
    setCatatan("");
    setFoto(null);
  }, [selectedLabId]);

  const handleItemChange = async (itemId: number | "") => {
    setSelectedAlatId(itemId);
    setSelections({});

    if (!itemId) {
      setCategories([]);
      return;
    }

    setLoadingCategories(true);
    try {
      const response = await getCriteriaByItemId(Number(itemId));
      setCategories(response.data || []);
    } catch {
      toast.error("Gagal memuat kategori inspeksi");
    } finally {
      setLoadingCategories(false);
    }
  };

  const selectedItem = labItems.find((i) => i.id === Number(selectedAlatId));

  const allSubItems = categories.flatMap((c) => c.subitems ?? c.sub_items ?? []);
  const allSelected = allSubItems.every((si) => selections[si.id]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  const handleSave = async () => {
    if (!selectedLabId || !selectedAlatId) {
      toast.error("Pilih laboratorium dan alat terlebih dahulu");
      return;
    }
    if (allSubItems.length === 0) {
      toast.error("Tidak ada sub item untuk diperiksa");
      return;
    }
    if (!allSelected) {
      toast.error("Semua sub item wajib dipilih (B atau K)");
      return;
    }

    setSaving(true);
    try {
      const checklistResults = allSubItems.map((si) => ({
        subitem_id: si.id,
        status: selections[si.id],
        keterangan: selections[si.id] === "B" ? "Baik" : "Kurang",
      }));

      const formData = new FormData();
      formData.append("laboratory_id", String(selectedLabId));
      formData.append("item_id", String(selectedAlatId));
      formData.append("checklist_results", JSON.stringify(checklistResults));
      formData.append("catatan", catatan);
      if (foto) formData.append("foto", foto);

      await createInspectionMultipart(formData);
      toast.success("Inspeksi berhasil disimpan");
      setSelections({});
      setSelectedAlatId("");
      setCategories([]);
      setCatatan("");
      setFoto(null);
    } catch (err: any) {
      const errData = err.response?.data;
      const msg = errData?.message || "";
      const existingId = errData?.data?.id || errData?.data?.inspection_id || errData?.inspection_id;
      console.log("[handleSave] error response:", errData);
      if (existingId) {
        toast.info("Inspeksi sudah ada. Mengalihkan ke halaman detail...");
        router.push(`/admin/inspections/detail/${existingId}`);
      } else if (msg.includes("sudah ada") || msg.toLowerCase().includes("already exists")) {
        toast.info("Inspeksi untuk item ini sudah ada. Pergi ke tab Approval untuk melihat daftar.");
        setPageTab("approval");
      } else {
        toast.error(msg || "Gagal menyimpan inspeksi");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <AdminPageHeader title="Inspeksi" description="Pemeriksaan alat laboratorium" />

      {/* Page Tabs */}
      <div className="flex gap-1 rounded-2xl bg-white/5 border border-white/10 p-1 mb-6 overflow-x-auto">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setPageTab(key)}
            className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              pageTab === key
                ? "bg-[#FBBF24]/10 text-[#FBBF24] shadow-sm"
                : "text-white/50 hover:text-white/80 hover:bg-white/5"
            }`}
          >
            <Icon className="w-4 h-4" strokeWidth={1.5} />
            {label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={pageTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.2 }}
        >
          {pageTab === "form" ? (
            <div className="space-y-6">
              {/* Step 1: Lab */}
              <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-5 overflow-visible">
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-6 h-6 rounded-full bg-[#FBBF24]/20 text-[#FBBF24] text-xs font-bold flex items-center justify-center shrink-0">1</span>
                  <h3 className="text-sm font-semibold text-white">Pilih Laboratorium</h3>
                </div>
                <CustomSelect
                  value={String(selectedLabId)}
                  onChange={(v) => setSelectedLabId(v ? Number(v) : "")}
                  options={labs.map((lab) => ({ value: String(lab.id), label: lab.nama_lab }))}
                  placeholder={loadingLabs ? "Memuat..." : "— Pilih Laboratorium —"}
                  disabled={loadingLabs}
                  className="max-w-sm"
                  showSearch={labs.length > 5}
                  searchPlaceholder="Cari laboratorium..."
                />
              </div>

              {/* Step 2: Alat */}
              {selectedLabId && (
                <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-5 overflow-visible">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-6 h-6 rounded-full bg-[#FBBF24]/20 text-[#FBBF24] text-xs font-bold flex items-center justify-center shrink-0">2</span>
                    <h3 className="text-sm font-semibold text-white">Pilih Nama Alat</h3>
                  </div>
                  <CustomSelect
                    value={String(selectedAlatId)}
                    onChange={(v) => handleItemChange(v ? Number(v) : "")}
                    options={labItems.map((item) => ({ value: String(item.id), label: `${item.nama_barang}${item.kode_barang ? ` (${item.kode_barang})` : ""}` }))}
                    placeholder={loadingItems ? "Memuat..." : "— Pilih Alat —"}
                    disabled={loadingItems}
                    className="max-w-sm"
                    showSearch={labItems.length > 5}
                    searchPlaceholder="Cari alat..."
                  />
                  {!loadingItems && labItems.length === 0 && (
                    <p className="text-sm text-white/30 mt-2">Tidak ada alat untuk laboratorium ini</p>
                  )}
                </div>
              )}

              {/* Step 3: Hasil Pemeriksaan */}
              {selectedAlatId && (
                <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="w-6 h-6 rounded-full bg-[#FBBF24]/20 text-[#FBBF24] text-xs font-bold flex items-center justify-center shrink-0">3</span>
                    <h3 className="text-sm font-semibold text-white">Hasil Pemeriksaan</h3>
                  </div>

                  {loadingCategories ? (
                    <div className="space-y-4 animate-pulse">
                      {[1, 2].map((i) => (
                        <div key={i} className="rounded-2xl bg-white/5 border border-white/10 p-4 space-y-3">
                          <div className="h-4 w-40 rounded bg-white/10" />
                          <div className="h-3 w-full rounded bg-white/5" />
                          <div className="h-3 w-full rounded bg-white/5" />
                        </div>
                      ))}
                    </div>
                  ) : categories.length === 0 ? (
                    <div className="p-6 text-center text-white/30 text-sm">
                      <PackageSearch className="w-8 h-8 mx-auto mb-2 text-white/20" strokeWidth={1.5} />
                      Belum ada kategori inspeksi untuk alat ini
                    </div>
                  ) : (
                    <>
                      {/* Item Info */}
                      {selectedItem && (
                        <div className="mb-6 rounded-xl bg-gradient-to-br from-[#FBBF24]/5 to-transparent border border-[#FBBF24]/10 overflow-hidden">
                          <div className="px-5 py-4 border-b border-[#FBBF24]/10">
                            <h4 className="text-sm font-bold text-white font-[family-name:var(--font-display)]">
                              {selectedItem.nama_barang}{selectedItem.kode_barang ? ` (${selectedItem.kode_barang})` : ""}
                            </h4>
                          </div>
                          <div className="px-5 py-3 grid grid-cols-2 gap-3 text-xs">
                            <div>
                              <span className="text-white/30">Pembuat Alat</span>
                              <p className="text-white/80 mt-0.5">{selectedItem.pembuat_alat || "-"}</p>
                            </div>
                            <div>
                              <span className="text-white/30">Tanggal Pembelian</span>
                              <p className="text-white/80 mt-0.5">{formatDate(selectedItem.tanggal_pembelian)}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Categories */}
                      <div className="space-y-5">
                        {categories.map((cat) => {
                          const subItems = cat.subitems ?? cat.sub_items ?? [];
                          return (
                            <div key={cat.id} className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
                              {/* Category Header */}
                              <div className="px-5 py-4 bg-gradient-to-r from-[#FBBF24]/5 to-transparent border-b border-white/5">
                                <h4 className="text-sm font-bold text-white font-[family-name:var(--font-display)]">
                                  {cat.nama_kategori}
                                </h4>
                                {cat.deskripsi && (
                                  <p className="text-xs text-white/30 mt-1 leading-relaxed">{cat.deskripsi}</p>
                                )}
                              </div>

                              {/* Sub Items */}
                              {subItems.length === 0 ? (
                                <div className="px-5 py-4 text-sm text-white/30 italic">
                                  Tidak ada sub item untuk kategori ini
                                </div>
                              ) : (
                                <div className="divide-y divide-white/5">
                                  {subItems.map((si) => {
                                    const sel = selections[si.id] || "";
                                    return (
                                      <div key={si.id} className="px-5 py-3 flex items-center gap-4">
                                        <div className="flex items-center gap-1 shrink-0">
                                          <label
                                            className={`inline-flex items-center justify-center w-9 h-9 rounded-lg cursor-pointer transition-all text-sm font-bold border-2 ${
                                              sel === "B"
                                                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-[0_0_10px_rgba(52,211,153,0.15)]"
                                                : "bg-white/5 text-white/30 border-white/10 hover:border-emerald-500/30 hover:text-emerald-400"
                                            }`}
                                          >
                                            <input
                                              type="radio"
                                              name={`si-${si.id}`}
                                              value="B"
                                              checked={sel === "B"}
                                              onChange={() => setSelections((p) => ({ ...p, [si.id]: "B" }))}
                                              className="sr-only"
                                            />
                                            B
                                          </label>
                                          <label
                                            className={`inline-flex items-center justify-center w-9 h-9 rounded-lg cursor-pointer transition-all text-sm font-bold border-2 ${
                                              sel === "K"
                                                ? "bg-red-500/20 text-red-400 border-red-500/50 shadow-[0_0_10px_rgba(248,113,113,0.15)]"
                                                : "bg-white/5 text-white/30 border-white/10 hover:border-red-500/30 hover:text-red-400"
                                            }`}
                                          >
                                            <input
                                              type="radio"
                                              name={`si-${si.id}`}
                                              value="K"
                                              checked={sel === "K"}
                                              onChange={() => setSelections((p) => ({ ...p, [si.id]: "K" }))}
                                              className="sr-only"
                                            />
                                            K
                                          </label>
                                        </div>
                                        <span className={`text-sm ${sel ? "text-white font-medium" : "text-white/60"}`}>
                                          {si.nama_subitem}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Legend */}
                      <div className="mt-4 px-5 py-3 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] text-white/30 flex items-center gap-6">
                        <span><span className="text-emerald-400 font-semibold">B</span> = Baik</span>
                        <span><span className="text-red-400 font-semibold">K</span> = Kurang</span>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Step 4: Catatan */}
              {selectedAlatId && categories.length > 0 && (
                <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-6 h-6 rounded-full bg-[#FBBF24]/20 text-[#FBBF24] text-xs font-bold flex items-center justify-center shrink-0">4</span>
                    <h3 className="text-sm font-semibold text-white">Catatan Inspeksi</h3>
                  </div>
                  <textarea
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                    placeholder="Tambahkan catatan pemeriksaan..."
                    rows={3}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm resize-none placeholder:text-white/30 focus:outline-none focus:border-[#FBBF24]/40 transition-colors"
                  />
                </div>
              )}

              {/* Step 5: Foto */}
              {selectedAlatId && categories.length > 0 && (
                <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-6 h-6 rounded-full bg-[#FBBF24]/20 text-[#FBBF24] text-xs font-bold flex items-center justify-center shrink-0">5</span>
                    <h3 className="text-sm font-semibold text-white">Upload Foto</h3>
                  </div>
                  <label className="flex items-center gap-3 px-4 py-4 rounded-xl bg-white/5 border border-dashed border-white/10 cursor-pointer hover:border-[#FBBF24]/40 hover:bg-white/[0.03] transition-all group">
                    <Upload className="w-5 h-5 text-white/30 group-hover:text-[#FBBF24] transition-colors" strokeWidth={1.5} />
                    <span className="text-sm text-white/30 group-hover:text-white/60 transition-colors">
                      {foto ? foto.name : "Klik untuk upload foto"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setFoto(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    {foto && (
                      <button
                        onClick={(e) => { e.preventDefault(); setFoto(null); }}
                        className="ml-auto text-xs text-red-400 hover:text-red-300"
                      >
                        Hapus
                      </button>
                    )}
                  </label>
                </div>
              )}

              {/* Save */}
              {selectedAlatId && categories.length > 0 && (
                <div className="flex justify-end">
                  <button
                    onClick={handleSave}
                    disabled={saving || !allSelected}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#FBBF24] text-[#0F172A] text-sm font-bold hover:bg-[#FCD34D] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-[#FBBF24]/15"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? "Menyimpan..." : "Simpan Inspeksi"}
                  </button>
                </div>
              )}

              {/* Empty state */}
              {!selectedLabId && (
                <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-12 text-center">
                  <ClipboardCheck className="w-10 h-10 text-white/20 mx-auto mb-3" strokeWidth={1.5} />
                  <p className="text-sm text-white/30">Pilih laboratorium untuk memulai inspeksi</p>
                </div>
              )}
            </div>
          ) : (
            <InspectionApprovalDashboard />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
