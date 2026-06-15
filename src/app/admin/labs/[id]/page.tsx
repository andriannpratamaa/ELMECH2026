"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, FlaskConical, MapPin, User, Package, Pencil, Trash2, ClipboardCheck } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import DataTable from "@/components/admin/DataTable";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { getLabs } from "@/services/labs";
import { getItemsByLab, createItem, updateItem, deleteItem } from "@/services/items";
import type { Lab, Item } from "@/types/admin";

function formatDate(dateStr?: string) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" });
}

export default function LabDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const [lab, setLab] = useState<Lab | null>(null);
  const [labItems, setLabItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<Item | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [form, setForm] = useState({
    nama_barang: "",
    kode_barang: "",
    pembuat_alat: "",
    tanggal_pembelian: "",
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [labs, items] = await Promise.all([
        getLabs(),
        getItemsByLab(id),
      ]);
      const found = labs.find((l) => l.id === id);
      if (found) {
        setLab(found);
      } else {
        toast.error("Laboratorium tidak ditemukan");
        router.push("/admin/labs");
        return;
      }
      setLabItems(items);
    } catch {
      toast.error("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    setEditItem(null);
    setForm({ nama_barang: "", kode_barang: "", pembuat_alat: "", tanggal_pembelian: "" });
    setErrors({});
    setShowForm(true);
  };

  const openEdit = (item: Item) => {
    setEditItem(item);
    setForm({
      nama_barang: item.nama_barang,
      kode_barang: item.kode_barang || "",
      pembuat_alat: item.pembuat_alat || "",
      tanggal_pembelian: item.tanggal_pembelian || "",
    });
    setErrors({});
    setShowForm(true);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.nama_barang.trim()) errs.nama_barang = "Nama barang wajib diisi";
    if (!form.kode_barang.trim()) errs.kode_barang = "Kode barang wajib diisi";
    if (!form.pembuat_alat.trim()) errs.pembuat_alat = "Pembuat alat wajib diisi";
    if (!form.tanggal_pembelian.trim()) errs.tanggal_pembelian = "Tanggal pembelian wajib diisi";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    const payload = {
      nama_barang: form.nama_barang.trim(),
      kode_barang: form.kode_barang.trim(),
      pembuat_alat: form.pembuat_alat.trim(),
      tanggal_pembelian: form.tanggal_pembelian,
      laboratory_id: id,
    };
    try {
      if (editItem) {
        await updateItem(editItem.id, payload);
        toast.success("Item berhasil diperbarui");
      } else {
        await createItem(payload);
        toast.success("Item berhasil disimpan");
      }
      setShowForm(false);
      fetchData();
    } catch (err: any) {
      const serverErrors = err.response?.data?.errors;
      if (serverErrors) {
        const mapped: Record<string, string> = {};
        for (const [key, msgs] of Object.entries(serverErrors))
          mapped[key] = (msgs as string[])[0];
        setErrors(mapped);
      }
      toast.error(err.response?.data?.message || "Gagal menyimpan item");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await deleteItem(deleteId);
      toast.success("Item berhasil dihapus");
      setDeleteId(null);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal menghapus item");
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns = [
    { key: "nama_barang", header: "Nama Barang", render: (i: Item) => <span className="text-white font-medium">{i.nama_barang}</span> },
    { key: "kode_barang", header: "Kode Barang", render: (i: Item) => <span className="text-white/50">{i.kode_barang || "—"}</span> },
    { key: "pembuat_alat", header: "Pembuat Alat", render: (i: Item) => <span className="text-white/50">{i.pembuat_alat || "—"}</span> },
    { key: "tanggal_pembelian", header: "Tgl Pembelian", render: (i: Item) => <span className="text-white/50">{formatDate(i.tanggal_pembelian)}</span> },
    {
      key: "actions", header: "Aksi",
      render: (i: Item) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push(`/admin/labs/${id}/inspeksi/${i.id}`)}
            className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-white/50 hover:text-emerald-400 transition-colors"
            title="Inspeksi"
          >
            <ClipboardCheck className="w-4 h-4" />
          </button>
          <button onClick={() => openEdit(i)} className="p-1.5 rounded-lg hover:bg-white/5 text-white/50 hover:text-[#FBBF24] transition-colors"><Pencil className="w-4 h-4" /></button>
          <button onClick={() => setDeleteId(i.id)} className="p-1.5 rounded-lg hover:bg-white/5 text-white/50 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-48 rounded-xl bg-white/5" />
        <div className="h-32 rounded-2xl bg-white/5" />
        <div className="h-64 rounded-2xl bg-white/5" />
      </div>
    );
  }

  if (!lab) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/labs" className="p-2 rounded-xl hover:bg-white/5 text-white/50 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white font-[family-name:var(--font-display)]">{lab.nama_lab}</h1>
          <p className="text-sm text-white/40 mt-1">Detail laboratorium dan daftar alat</p>
        </div>
      </div>

      <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#FBBF24]/10 flex items-center justify-center shrink-0">
            <FlaskConical className="w-6 h-6 text-[#FBBF24]" strokeWidth={1.5} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-white/40 mb-1">Lokasi</p>
                <p className="text-sm font-medium text-white flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-white/30 shrink-0" strokeWidth={1.5} />
                  {lab.lokasi || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-white/40 mb-1">Kepala Lab</p>
                <p className="text-sm font-medium text-white flex items-center gap-1.5">
                  <User className="w-4 h-4 text-white/30 shrink-0" strokeWidth={1.5} />
                  {lab.kalab_name || (lab.kalab_id ? `User #${lab.kalab_id}` : "—")}
                </p>
              </div>
              <div>
                <p className="text-xs text-white/40 mb-1">Jumlah Item</p>
                <p className="text-sm font-medium text-white flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-white/30 shrink-0" strokeWidth={1.5} />
                  {labItems.length} Item
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-4">
          <p className="text-xs text-white/40 mb-1">Total Item</p>
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-[#FBBF24]" strokeWidth={1.5} />
            <span className="text-2xl font-bold text-white">{labItems.length}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FBBF24] text-[#0F172A] text-sm font-semibold hover:bg-[#FCD34D] transition-all hover:scale-[1.02] shadow-lg shadow-[#FBBF24]/20">
          + Tambah Item
        </button>
      </div>

      <DataTable
        columns={columns}
        data={labItems}
        searchKey="nama_barang"
        searchPlaceholder="Cari barang di lab ini..."
        isLoading={loading}
        emptyMessage="Belum ada item di laboratorium ini"
      />

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[8vh] sm:pt-[12vh] p-4 bg-black/60 backdrop-blur-sm overflow-y-auto modal-scroll" onClick={() => { if (!saving) { setShowForm(false); setErrors({}); } }}>
          <div className="w-full max-w-md rounded-2xl bg-[#1E293B] border border-white/10 p-6 shadow-2xl my-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-white mb-4">{editItem ? "Edit Item" : "Tambah Item"}</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-white/60 mb-1">Nama Barang</label>
                <input value={form.nama_barang} onChange={(e) => { setForm({ ...form, nama_barang: e.target.value }); if (errors.nama_barang) setErrors((prev) => { const n = { ...prev }; delete n.nama_barang; return n; }); }} placeholder="Contoh: MULTI GAS DETECTOR" className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#FBBF24]/40" />
                {errors.nama_barang && <p className="text-xs text-red-400 mt-1">{errors.nama_barang}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-white/60 mb-1">Kode Barang</label>
                <input value={form.kode_barang} onChange={(e) => { setForm({ ...form, kode_barang: e.target.value }); if (errors.kode_barang) setErrors((prev) => { const n = { ...prev }; delete n.kode_barang; return n; }); }} placeholder="Contoh: FIS-007" className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#FBBF24]/40" />
                {errors.kode_barang && <p className="text-xs text-red-400 mt-1">{errors.kode_barang}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-white/60 mb-1">Pembuat Alat</label>
                <input value={form.pembuat_alat} onChange={(e) => { setForm({ ...form, pembuat_alat: e.target.value }); if (errors.pembuat_alat) setErrors((prev) => { const n = { ...prev }; delete n.pembuat_alat; return n; }); }} placeholder="Contoh: zhafif" className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#FBBF24]/40" />
                {errors.pembuat_alat && <p className="text-xs text-red-400 mt-1">{errors.pembuat_alat}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-white/60 mb-1">Tanggal Pembelian</label>
                <input type="date" value={form.tanggal_pembelian} onChange={(e) => { setForm({ ...form, tanggal_pembelian: e.target.value }); if (errors.tanggal_pembelian) setErrors((prev) => { const n = { ...prev }; delete n.tanggal_pembelian; return n; }); }} className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FBBF24]/40" />
                {errors.tanggal_pembelian && <p className="text-xs text-red-400 mt-1">{errors.tanggal_pembelian}</p>}
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button onClick={() => { setShowForm(false); setErrors({}); }} disabled={saving} className="px-4 py-2 rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 transition-colors">Batal</button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-xl text-sm font-medium bg-[#FBBF24] text-[#0F172A] hover:bg-[#FCD34D] transition-all disabled:opacity-50">
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        onConfirm={handleDelete}
        title="Hapus Item"
        description="Yakin ingin menghapus item ini?"
        loading={deleteLoading}
      />
    </div>
  );
}
