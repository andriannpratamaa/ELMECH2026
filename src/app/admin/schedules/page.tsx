"use client";

import { useEffect, useState, useCallback } from "react";
import { Eye, Pencil, Trash2, Calendar, FlaskConical } from "lucide-react";
import { toast } from "sonner";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { CustomSelect } from "@/components/admin/CustomSelect";
import DataTable from "@/components/admin/DataTable";
import StatusBadge from "@/components/admin/StatusBadge";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { getSchedules, createSchedule, updateSchedule, deleteSchedule } from "@/services/schedules";
import { getLabs } from "@/services/labs";
import type { Schedule, Lab } from "@/types/admin";

function formatDate(dateStr?: string) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" });
}

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [labs, setLabs] = useState<Lab[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editSched, setEditSched] = useState<Schedule | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [form, setForm] = useState({ laboratory_id: "", tanggal: "", keterangan: "" });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [detailSched, setDetailSched] = useState<Schedule | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const [d, l] = await Promise.all([getSchedules(), getLabs()]);
      setSchedules(d);
      setLabs(l);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal memuat data jadwal");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const openCreate = () => {
    setEditSched(null);
    setForm({ laboratory_id: "", tanggal: "", keterangan: "" });
    setErrors({});
    setShowForm(true);
  };

  const openEdit = (s: Schedule) => {
    setEditSched(s);
    setForm({
      laboratory_id: s.laboratory_id?.toString() || "",
      tanggal: s.tanggal || "",
      keterangan: s.keterangan || "",
    });
    setErrors({});
    setShowForm(true);
  };

  const openDetail = (s: Schedule) => {
    setDetailSched(s);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.laboratory_id) errs.laboratory_id = "Laboratorium wajib dipilih";
    if (!form.tanggal) errs.tanggal = "Tanggal wajib diisi";
    if (!form.keterangan.trim()) errs.keterangan = "Keterangan wajib diisi";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    const payload = {
      laboratory_id: Number(form.laboratory_id),
      tanggal: form.tanggal,
      keterangan: form.keterangan.trim(),
    };
    try {
      if (editSched) {
        await updateSchedule(editSched.id, payload);
        toast.success("Jadwal berhasil diperbarui");
      } else {
        await createSchedule(payload);
        toast.success("Jadwal berhasil disimpan");
      }
      setShowForm(false);
      fetch();
    } catch (err: any) {
      const serverErrors = err.response?.data?.errors;
      if (serverErrors) {
        const mapped: Record<string, string> = {};
        for (const [key, msgs] of Object.entries(serverErrors))
          mapped[key] = (msgs as string[])[0];
        setErrors(mapped);
      }
      toast.error(err.response?.data?.message || "Gagal menyimpan jadwal");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await deleteSchedule(deleteId);
      toast.success("Jadwal berhasil dihapus");
      setDeleteId(null);
      fetch();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal menghapus jadwal");
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns = [
    { key: "lab_name", header: "Nama Lab", render: (s: Schedule) => <span className="text-white font-medium">{s.lab_name || "—"}</span> },
    { key: "tanggal", header: "Tanggal", render: (s: Schedule) => (
      <span className="text-white/50 flex items-center gap-1.5">
        <Calendar className="w-3.5 h-3.5 text-[#FBBF24]/60" strokeWidth={1.5} />
        {formatDate(s.tanggal)}
      </span>
    )},
    { key: "keterangan", header: "Keterangan", render: (s: Schedule) => (
      <span className="text-white/50 max-w-[200px] truncate block">{s.keterangan || "—"}</span>
    )},
    { key: "items_count", header: "Jml Item", render: (s: Schedule) => (
      <span className="text-white/50">{s.items_count ?? "—"}</span>
    )},
    { key: "status", header: "Status", render: (s: Schedule) => <StatusBadge status={s.status || "—"} /> },
    {
      key: "actions", header: "Aksi",
      render: (s: Schedule) => (
        <div className="flex items-center gap-2">
          <button onClick={() => openDetail(s)} className="p-1.5 rounded-lg hover:bg-white/5 text-white/50 hover:text-blue-400 transition-colors" title="Detail">
            <Eye className="w-4 h-4" />
          </button>
          <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg hover:bg-white/5 text-white/50 hover:text-[#FBBF24] transition-colors" title="Edit">
            <Pencil className="w-4 h-4" />
          </button>
          <button onClick={() => setDeleteId(s.id)} className="p-1.5 rounded-lg hover:bg-white/5 text-white/50 hover:text-red-400 transition-colors" title="Hapus">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <AdminPageHeader title="Schedules" description="Manajemen jadwal inspeksi">
        <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FBBF24] text-[#0F172A] text-sm font-semibold hover:bg-[#FCD34D] transition-all hover:scale-[1.02] shadow-lg shadow-[#FBBF24]/20">
          + Tambah Jadwal
        </button>
      </AdminPageHeader>

      <DataTable
        columns={columns}
        data={schedules}
        searchKey="keterangan"
        searchPlaceholder="Cari jadwal..."
        isLoading={loading}
        emptyMessage="Belum ada jadwal"
      />

      {detailSched && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[8vh] sm:pt-[12vh] p-4 bg-black/60 backdrop-blur-sm overflow-y-auto modal-scroll" onClick={() => setDetailSched(null)}>
          <div className="w-full max-w-md rounded-2xl bg-[#1E293B] border border-white/10 p-6 shadow-2xl my-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Detail Jadwal</h2>
              <button onClick={() => setDetailSched(null)} className="text-white/50 hover:text-white text-xl leading-none">&times;</button>
            </div>
            <div className="space-y-2">
              <div className="flex gap-2"><span className="text-xs text-white/40 w-24 shrink-0">Laboratorium</span><span className="text-sm text-white">{detailSched.lab_name || "—"}</span></div>
              <div className="flex gap-2"><span className="text-xs text-white/40 w-24 shrink-0">Tanggal</span><span className="text-sm text-white">{formatDate(detailSched.tanggal)}</span></div>
              <div className="flex gap-2"><span className="text-xs text-white/40 w-24 shrink-0">Keterangan</span><span className="text-sm text-white">{detailSched.keterangan || "—"}</span></div>
              <div className="flex gap-2"><span className="text-xs text-white/40 w-24 shrink-0">Status</span><StatusBadge status={detailSched.status || "—"} /></div>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[8vh] sm:pt-[12vh] p-4 bg-black/60 backdrop-blur-sm overflow-y-auto modal-scroll" onClick={() => { if (!saving) { setShowForm(false); setErrors({}); } }}>
          <div className="w-full max-w-lg rounded-2xl bg-[#1E293B] border border-white/10 p-6 shadow-2xl my-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-white mb-4">{editSched ? "Edit Jadwal" : "Tambah Jadwal"}</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-white/60 mb-1">Laboratorium</label>
                <CustomSelect
                  value={form.laboratory_id}
                  onChange={(v) => { setForm({ ...form, laboratory_id: v }); if (errors.laboratory_id) setErrors((prev) => { const n = { ...prev }; delete n.laboratory_id; return n; }); }}
                  options={[
                    { value: "", label: "Pilih Lab" },
                    ...labs.map((l) => ({ value: String(l.id), label: l.nama_lab })),
                  ]}
                  placeholder="Pilih Lab"
                  showSearch={labs.length > 5}
                  searchPlaceholder="Cari lab..."
                  error={errors.laboratory_id}
                />
                {errors.laboratory_id && <p className="text-xs text-red-400 mt-1">{errors.laboratory_id}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-white/60 mb-1">Tanggal</label>
                <input type="date" value={form.tanggal} onChange={(e) => { setForm({ ...form, tanggal: e.target.value }); if (errors.tanggal) setErrors((prev) => { const n = { ...prev }; delete n.tanggal; return n; }); }} className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FBBF24]/40" />
                {errors.tanggal && <p className="text-xs text-red-400 mt-1">{errors.tanggal}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-white/60 mb-1">Keterangan</label>
                <textarea value={form.keterangan} onChange={(e) => { setForm({ ...form, keterangan: e.target.value }); if (errors.keterangan) setErrors((prev) => { const n = { ...prev }; delete n.keterangan; return n; }); }} rows={3} placeholder="Contoh: Inspeksi berkala laboratorium kimia" className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#FBBF24]/40 resize-none" />
                {errors.keterangan && <p className="text-xs text-red-400 mt-1">{errors.keterangan}</p>}
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
        title="Hapus Jadwal"
        description="Yakin ingin menghapus jadwal ini?"
        loading={deleteLoading}
      />
    </div>
  );
}
