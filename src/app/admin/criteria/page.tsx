"use client";

import { useEffect, useState, useCallback } from "react";
import { CheckCircle, XCircle, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { CustomSelect } from "@/components/admin/CustomSelect";
import StatusBadge from "@/components/admin/StatusBadge";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import {
  getPendingCategories, getPendingSubItems, getApprovedCriteria,
  createCategoryWithSubItems,
  rejectCategory, approveSubItem, rejectSubItem, bulkApproveCategories,
  deleteCategory, deleteSubItem,
} from "@/services/criteria";
import type { CriteriaCategory, CriteriaSubItem, Item, Lab } from "@/types/admin";
import { getLabs } from "@/services/labs";
import { getItemsByLab } from "@/services/items";

type Tab = "categories" | "pending" | "approved";

const TABS: { key: Tab; label: string }[] = [
  { key: "categories", label: "Categories" },
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
];

export default function CriteriaPage() {
  const [tab, setTab] = useState<Tab>("categories");
  const [pendingCategories, setPendingCategories] = useState<CriteriaCategory[]>([]);
  const [pendingSubItems, setPendingSubItems] = useState<CriteriaSubItem[]>([]);
  const [approvedCriteria, setApprovedCriteria] = useState<CriteriaCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteCategoryId, setDeleteCategoryId] = useState<number | null>(null);
  const [deletingCategory, setDeletingCategory] = useState(false);
  const [deleteSubItemId, setDeleteSubItemId] = useState<number | null>(null);
  const [deletingSubItem, setDeletingSubItem] = useState(false);
  const [rejectCategoryId, setRejectCategoryId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejecting, setRejecting] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [pc, ps, ac] = await Promise.all([
        getPendingCategories(),
        getPendingSubItems(),
        getApprovedCriteria(),
      ]);
      setPendingCategories(pc);
      setPendingSubItems(ps);
      setApprovedCriteria(ac);
    } catch {
      toast.error("Gagal memuat data kriteria");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleApproveCategory = async (id: number) => {
    try {
      await bulkApproveCategories({ ids: [id] });
      toast.success("Kategori dan sub item berhasil disetujui");
      fetchAll();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal menyetujui kategori");
    }
  };

  const handleRejectCategory = async () => {
    if (!rejectCategoryId) return;
    setRejecting(true);
    try {
      await rejectCategory(rejectCategoryId, rejectReason || undefined);
      toast.success("Kategori berhasil ditolak");
      setRejectCategoryId(null);
      setRejectReason("");
      fetchAll();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal menolak kategori");
    } finally {
      setRejecting(false);
    }
  };

  const handleApproveSubItem = async (id: number) => {
    try {
      await approveSubItem(id);
      toast.success("Sub item berhasil disetujui");
      fetchAll();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal menyetujui sub item");
    }
  };

  const handleRejectSubItem = async (id: number) => {
    try {
      await rejectSubItem(id);
      toast.success("Sub item berhasil ditolak");
      fetchAll();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal menolak sub item");
    }
  };

  const handleDeleteCategory = async () => {
    if (!deleteCategoryId) return;
    setDeletingCategory(true);
    try {
      await deleteCategory(deleteCategoryId);
      toast.success("Kategori beserta sub item berhasil dihapus");
      setDeleteCategoryId(null);
      fetchAll();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal menghapus kategori");
    } finally {
      setDeletingCategory(false);
    }
  };

  const handleDeleteSubItem = async () => {
    if (!deleteSubItemId) return;
    setDeletingSubItem(true);
    try {
      await deleteSubItem(deleteSubItemId);
      toast.success("Sub item berhasil dihapus");
      setDeleteSubItemId(null);
      fetchAll();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal menghapus sub item");
    } finally {
      setDeletingSubItem(false);
    }
  };

  return (
    <div>
      <AdminPageHeader title="Criteria" description="Manajemen kriteria inspeksi" />

      <div className="flex items-center gap-1 mb-6 p-1 rounded-2xl bg-white/5 border border-white/10 w-fit">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              tab === t.key ? "bg-[#FBBF24] text-[#0F172A]" : "text-white/50 hover:text-white hover:bg-white/5"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="p-4 space-y-3 animate-pulse">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-white/5" />
          ))}
        </div>
      ) : (
        <>
          {tab === "categories" && (
            <CategoriesTab
              approvedCriteria={approvedCriteria}
              onSuccess={fetchAll}
              onDeleteCategory={setDeleteCategoryId}
            />
          )}
          {tab === "pending" && (
            <PendingTab
              pendingCategories={pendingCategories}
              pendingSubItems={pendingSubItems}
              onApproveCategory={handleApproveCategory}
              onRejectCategory={(id) => { setRejectCategoryId(id); setRejectReason(""); }}
              onApproveSubItem={handleApproveSubItem}
              onRejectSubItem={handleRejectSubItem}
            />
          )}
          {tab === "approved" && (
            <ApprovedTab
              data={approvedCriteria}
              onDeleteCategory={setDeleteCategoryId}
            />
          )}
        </>
      )}

      {rejectCategoryId !== null && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[8vh] sm:pt-[12vh] p-4 bg-black/60 backdrop-blur-sm overflow-y-auto" onClick={() => !rejecting && setRejectCategoryId(null)}>
          <div className="w-full max-w-md rounded-2xl bg-[#1E293B] border border-white/10 p-6 shadow-2xl my-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-white mb-2">Tolak Kategori</h2>
            <p className="text-sm text-white/50 mb-4">Berikan alasan penolakan agar kalab bisa memperbaiki.</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Alasan penolakan..."
              rows={3}
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 resize-none focus:outline-none focus:ring-2 focus:ring-red-400/40"
            />
            <div className="flex items-center justify-end gap-3 mt-4">
              <button onClick={() => setRejectCategoryId(null)} disabled={rejecting} className="px-4 py-2 rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 transition-colors">Batal</button>
              <button onClick={handleRejectCategory} disabled={rejecting} className="px-4 py-2 rounded-xl text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-all disabled:opacity-50">
                {rejecting ? "Menolak..." : rejectReason.trim() ? "Tolak dengan Alasan" : "Tolak (tanpa alasan)"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteCategoryId}
        onOpenChange={(o) => !o && setDeleteCategoryId(null)}
        onConfirm={handleDeleteCategory}
        title="Hapus Kategori"
        description="Hapus kategori ini beserta seluruh sub item di dalamnya?"
        loading={deletingCategory}
      />

      <ConfirmDialog
        open={!!deleteSubItemId}
        onOpenChange={(o) => !o && setDeleteSubItemId(null)}
        onConfirm={handleDeleteSubItem}
        title="Hapus Sub Item"
        description="Hapus sub item ini?"
        loading={deletingSubItem}
      />
    </div>
  );
}

function CategoriesTab({
  approvedCriteria,
  onSuccess,
  onDeleteCategory,
}: {
  approvedCriteria: CriteriaCategory[];
  onSuccess: () => void;
  onDeleteCategory: (id: number) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [laboratoryId, setLaboratoryId] = useState("");
  const [labItems, setLabItems] = useState<Item[]>([]);
  const [selectedAlatId, setSelectedAlatId] = useState<number | "">("");
  const [loadingItems, setLoadingItems] = useState(false);
  const [namaKategori, setNamaKategori] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [subItems, setSubItems] = useState<string[]>([""]);
  const [saving, setSaving] = useState(false);
  const [labs, setLabs] = useState<Lab[]>([]);

  useEffect(() => {
    getLabs()
      .then(setLabs)
      .catch(() => toast.error("Gagal memuat data laboratorium"));
  }, []);

  useEffect(() => {
    if (!laboratoryId) {
      setLabItems([]);
      setSelectedAlatId("");
      return;
    }
    setLoadingItems(true);
    getItemsByLab(Number(laboratoryId))
      .then((data) => {
        setLabItems(data);
        setSelectedAlatId("");
      })
      .catch(() => toast.error("Gagal memuat alat laboratorium"))
      .finally(() => setLoadingItems(false));
  }, [laboratoryId]);

  const addSubItem = () => setSubItems([...subItems, ""]);
  const updateSubItem = (idx: number, val: string) => {
    const next = [...subItems];
    next[idx] = val;
    setSubItems(next);
  };
  const removeSubItem = (idx: number) => {
    if (subItems.length <= 1) return;
    setSubItems(subItems.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    if (!laboratoryId) { toast.error("Pilih laboratorium terlebih dahulu"); return; }
    if (!selectedAlatId) { toast.error("Pilih nama alat terlebih dahulu"); return; }
    if (!namaKategori.trim()) { toast.error("Nama kategori wajib diisi"); return; }
    const filteredSubItems = subItems.map((s) => s.trim()).filter(Boolean);
    if (filteredSubItems.length === 0) { toast.error("Minimal 1 sub item wajib diisi"); return; }

    setSaving(true);
    try {
      const payload = {
        laboratory_id: Number(laboratoryId),
        item_id: Number(selectedAlatId),
        categories: [{
          nama_kategori: namaKategori.trim(),
          deskripsi: deskripsi.trim(),
          urutan: 1,
          subitems: filteredSubItems.map((s, i) => ({
            nama_subitem: s,
            urutan: i + 1,
          })),
        }],
      };
      await createCategoryWithSubItems(payload);
      toast.success("Kategori berhasil dibuat");
      setShowForm(false);
      setLaboratoryId("");
      setSelectedAlatId("");
      setNamaKategori("");
      setDeskripsi("");
      setSubItems([""]);
      onSuccess();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal membuat kategori");
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setLaboratoryId("");
    setSelectedAlatId("");
    setNamaKategori("");
    setDeskripsi("");
    setSubItems([""]);
  };

  return (
    <div>
      <button
        onClick={() => setShowForm(true)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FBBF24] text-[#0F172A] text-sm font-semibold hover:bg-[#FCD34D] transition-all hover:scale-[1.02] shadow-lg shadow-[#FBBF24]/20 mb-6"
      >
        <Plus className="w-4 h-4" /> Tambah Kategori
      </button>

      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-[8vh] sm:pt-[12vh] p-4 bg-black/60 backdrop-blur-sm overflow-y-auto modal-scroll"
          onClick={() => !saving && resetForm()}
        >
          <div
            className="w-full max-w-2xl rounded-2xl bg-[#1E293B] border border-white/10 p-6 shadow-2xl my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-white mb-4">Tambah Kategori Inspeksi</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-white/60 mb-1">Laboratorium</label>
                <CustomSelect
                  value={laboratoryId}
                  onChange={(v) => { setLaboratoryId(v); setSelectedAlatId(""); setSubItems([""]); }}
                  options={labs.map((l) => ({ value: String(l.id), label: l.nama_lab }))}
                  placeholder="Pilih Laboratorium"
                  showSearch={labs.length > 5}
                  searchPlaceholder="Cari laboratorium..."
                />
              </div>

              {laboratoryId && (
                <div>
                  <label className="block text-xs font-medium text-white/60 mb-1">Nama Alat</label>
                  <CustomSelect
                    value={String(selectedAlatId)}
                    onChange={(v) => setSelectedAlatId(v ? Number(v) : "")}
                    options={labItems.map((item) => ({ value: String(item.id), label: `${item.nama_barang}${item.kode_barang ? ` (${item.kode_barang})` : ""}` }))}
                    placeholder={loadingItems ? "Memuat..." : "— Pilih Alat —"}
                    disabled={loadingItems}
                    showSearch={labItems.length > 5}
                    searchPlaceholder="Cari alat..."
                  />
                  {!loadingItems && labItems.length === 0 && (
                    <p className="text-xs text-white/30 mt-1">Tidak ada alat untuk laboratorium ini</p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-white/60 mb-1">Nama Kategori</label>
                <input
                  value={namaKategori}
                  onChange={(e) => setNamaKategori(e.target.value)}
                  placeholder="Contoh: Pemeriksaan Fisik dan Umum"
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/60 mb-1">Deskripsi</label>
                <textarea
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  placeholder="Deskripsi kategori (opsional)"
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm resize-none placeholder:text-white/30"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/60 mb-2">Sub Item</label>
                <div className="space-y-2">
                  {subItems.map((s, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        value={s}
                        onChange={(e) => updateSubItem(idx, e.target.value)}
                        placeholder="Nama Sub Item"
                        className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30"
                      />
                      <button
                        onClick={() => removeSubItem(idx)}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/50 hover:text-red-400 transition-colors text-xs shrink-0"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={addSubItem}
                  className="mt-2 text-xs text-[#FBBF24] hover:text-[#FCD34D] transition-colors"
                >
                  + Tambah Sub Item
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={resetForm}
                disabled={saving}
                className="px-4 py-2 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/5"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 rounded-xl text-sm bg-[#FBBF24] text-[#0F172A] font-semibold hover:bg-[#FCD34D] disabled:opacity-50"
              >
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}

      <h3 className="text-sm font-semibold text-white mb-3">Approved Categories</h3>
      {approvedCriteria.length === 0 ? (
        <div className="p-6 text-center text-white/30 text-sm rounded-2xl bg-white/5 border border-white/10">
          Belum ada kategori inspeksi
        </div>
      ) : (
        <div className="space-y-3">
          {approvedCriteria.map((cat) => {
            const subItemsArr = cat.subitems ?? cat.sub_items ?? [];
            const firstItem = cat.items?.[0];
            return (
              <div
                key={cat.id}
                className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex flex-col gap-0.5">
                    {cat.laboratory?.nama_lab && (
                      <span className="text-[11px] font-semibold tracking-wider text-white/50 uppercase">
                        {cat.laboratory.nama_lab}
                      </span>
                    )}
                    {firstItem && (
                      <span className="text-[11px] font-semibold tracking-wider text-white/50 uppercase">
                        {firstItem.nama_barang}{firstItem.kode_barang ? ` (${firstItem.kode_barang})` : ""}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onDeleteCategory(cat.id)}
                      className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/50 hover:text-red-400 transition-colors"
                      title="Hapus kategori"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <StatusBadge status={cat.status || "approved"} />
                  </div>
                </div>
                <h4 className="text-sm font-semibold text-white">{cat.nama_kategori}</h4>
                {cat.deskripsi && (
                  <p className="text-xs text-white/40 mt-1">{cat.deskripsi}</p>
                )}
                <span className="inline-block mt-2 text-xs text-white/40">{subItemsArr.length} Sub Item</span>
                {subItemsArr.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {subItemsArr.map((si) => (
                      <span
                        key={si.id}
                        className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-white/70 text-xs"
                      >
                        {si.nama_subitem}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function PendingTab({
  pendingCategories,
  pendingSubItems,
  onApproveCategory,
  onRejectCategory,
  onApproveSubItem,
  onRejectSubItem,
}: {
  pendingCategories: CriteriaCategory[];
  pendingSubItems: CriteriaSubItem[];
  onApproveCategory: (id: number) => void;
  onRejectCategory: (id: number) => void;
  onApproveSubItem: (id: number) => void;
  onRejectSubItem: (id: number) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-white mb-3">Pending Categories</h3>
        {pendingCategories.length === 0 ? (
          <div className="p-6 text-center text-white/30 text-sm rounded-2xl bg-white/5 border border-white/10">
            Tidak ada kategori pending
          </div>
        ) : (
          <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left text-xs font-semibold text-white/40 uppercase tracking-wider py-3 px-4">Nama</th>
                  <th className="text-left text-xs font-semibold text-white/40 uppercase tracking-wider py-3 px-4">Status</th>
                  <th className="text-left text-xs font-semibold text-white/40 uppercase tracking-wider py-3 px-4">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {pendingCategories.map((item) => (
                  <tr key={item.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                    <td className="py-3 px-4"><span className="text-white font-medium">{item.nama_kategori || "—"}</span></td>
                    <td className="py-3 px-4"><StatusBadge status={item.status || "—"} /></td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => onApproveCategory(item.id)} className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-white/50 hover:text-emerald-400 transition-colors">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button onClick={() => onRejectCategory(item.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/50 hover:text-red-400 transition-colors">
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-sm font-semibold text-white mb-3">Pending Sub Items</h3>
        {pendingSubItems.length === 0 ? (
          <div className="p-6 text-center text-white/30 text-sm rounded-2xl bg-white/5 border border-white/10">
            Tidak ada sub item pending
          </div>
        ) : (
          <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left text-xs font-semibold text-white/40 uppercase tracking-wider py-3 px-4">Nama</th>
                  <th className="text-left text-xs font-semibold text-white/40 uppercase tracking-wider py-3 px-4">Kategori</th>
                  <th className="text-left text-xs font-semibold text-white/40 uppercase tracking-wider py-3 px-4">Status</th>
                  <th className="text-left text-xs font-semibold text-white/40 uppercase tracking-wider py-3 px-4">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {pendingSubItems.map((item) => (
                  <tr key={item.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                    <td className="py-3 px-4"><span className="text-white font-medium">{item.nama_subitem || "—"}</span></td>
                    <td className="py-3 px-4"><span className="text-white/50">{item.category_name || "—"}</span></td>
                    <td className="py-3 px-4"><StatusBadge status={item.status || "—"} /></td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => onApproveSubItem(item.id)} className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-white/50 hover:text-emerald-400 transition-colors">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button onClick={() => onRejectSubItem(item.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/50 hover:text-red-400 transition-colors">
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function ApprovedTab({ data, onDeleteCategory }: { data: CriteriaCategory[]; onDeleteCategory: (id: number) => void }) {
  if (data.length === 0) {
    return (
      <div className="p-6 text-center text-white/30 text-sm rounded-2xl bg-white/5 border border-white/10">
        Belum ada kategori inspeksi
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {data.map((cat) => {
        const subItemsArr = cat.subitems ?? cat.sub_items ?? [];
        const firstItem = cat.items?.[0];
        return (
          <div key={cat.id} className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex flex-col gap-0.5">
                {cat.laboratory?.nama_lab && (
                  <span className="text-[11px] font-semibold tracking-wider text-white/50 uppercase">
                    {cat.laboratory.nama_lab}
                  </span>
                )}
                {firstItem && (
                  <span className="text-[11px] font-semibold tracking-wider text-white/50 uppercase">
                    {firstItem.nama_barang}{firstItem.kode_barang ? ` (${firstItem.kode_barang})` : ""}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => onDeleteCategory(cat.id)}
                  className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/50 hover:text-red-400 transition-colors"
                  title="Hapus kategori"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <StatusBadge status={cat.status || "approved"} />
              </div>
            </div>
            <h3 className="text-sm font-semibold text-white">{cat.nama_kategori}</h3>
            {cat.deskripsi && (
              <p className="text-xs text-white/40 mt-1">{cat.deskripsi}</p>
            )}
            <span className="inline-block mt-2 text-xs text-white/40">{subItemsArr.length} Sub Item</span>
            {subItemsArr.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {subItemsArr.map((si) => (
                  <span
                    key={si.id}
                    className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-white/70 text-xs"
                  >
                    {si.nama_subitem}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
