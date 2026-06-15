"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, LayoutGrid, Table2, FlaskConical, User, Package, Eye } from "lucide-react";
import { toast } from "sonner";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { CustomSelect } from "@/components/admin/CustomSelect";
import StatusBadge from "@/components/admin/StatusBadge";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { getLabs, createLab, updateLab, deleteLab } from "@/services/labs";
import { getUsers } from "@/services/users";
import { getItems } from "@/services/items";
import type { Lab, User as UserType, Item } from "@/types/admin";

export default function LabsPage() {
  const router = useRouter();
  const [labs, setLabs] = useState<Lab[]>([]);
  const [allUsers, setAllUsers] = useState<UserType[]>([]);
  const [kalabUsers, setKalabUsers] = useState<UserType[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"grid" | "table">("grid");
  const [showForm, setShowForm] = useState(false);
  const [editLab, setEditLab] = useState<Lab | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [form, setForm] = useState({ nama_lab: "", lokasi: "", kalab_id: "", item_ids: [] as number[] });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const usersMap = new Map<number, UserType>();
  allUsers.forEach((u) => usersMap.set(u.id, u));

  const getKalabName = (lab: Lab) => {
    if (lab.kalab_name) return lab.kalab_name;
    if (lab.kalab_id) return usersMap.get(lab.kalab_id)?.name || null;
    return null;
  };

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const [labData, userData, itemData] = await Promise.all([
        getLabs(),
        getUsers(),
        getItems(),
      ]);
      setLabs(labData);
      setAllUsers(userData);
      setKalabUsers(userData.filter((u) => u.role === "kalab"));
      setItems(itemData);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  useEffect(() => {
    labs.forEach((lab) => {
      console.log("Lab:", lab);
      console.log("Item count:", lab.items?.length ?? 0);
    });
  }, [labs]);

  const openCreate = () => {
    setEditLab(null);
    setForm({ nama_lab: "", lokasi: "", kalab_id: "", item_ids: [] });
    setErrors({});
    setShowForm(true);
  };

  const openEdit = (l: Lab) => {
    setEditLab(l);
    setForm({
      nama_lab: l.nama_lab,
      lokasi: l.lokasi || "",
      kalab_id: l.kalab_id?.toString() || "",
      item_ids: l.item_ids ? l.item_ids.split(",").map(Number) : [],
    });
    setErrors({});
    setShowForm(true);
  };

  const openDetail = (lab: Lab) => {
    router.push(`/admin/labs/${lab.id}`);
  };

  const toggleItem = (id: number) => {
    setForm((prev) => ({
      ...prev,
      item_ids: prev.item_ids.includes(id)
        ? prev.item_ids.filter((i) => i !== id)
        : [...prev.item_ids, id],
    }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.nama_lab.trim()) errs.nama_lab = "Nama lab wajib diisi";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    const payload = {
      nama_lab: form.nama_lab.trim(),
      lokasi: form.lokasi.trim(),
      kalab_id: form.kalab_id ? Number(form.kalab_id) : undefined,
      item_ids: form.item_ids.join(","),
    };
    try {
      if (editLab) {
        await updateLab(editLab.id, payload);
        toast.success("Lab berhasil diperbarui");
      } else {
        await createLab(payload);
        toast.success("Lab berhasil disimpan");
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
      toast.error(err.response?.data?.message || "Gagal menyimpan lab");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await deleteLab(deleteId);
      toast.success("Lab berhasil dihapus");
      setDeleteId(null);
      fetch();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal menghapus lab");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div>
      <AdminPageHeader title="Laboratories" description="Manajemen laboratorium">
        <button onClick={() => setView(view === "grid" ? "table" : "grid")} className="p-2 rounded-xl hover:bg-white/5 text-white/50 hover:text-white transition-colors">
          {view === "grid" ? <Table2 className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}
        </button>
        <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FBBF24] text-[#0F172A] text-sm font-semibold hover:bg-[#FCD34D] transition-all hover:scale-[1.02] shadow-lg shadow-[#FBBF24]/20">
          + Tambah Lab
        </button>
      </AdminPageHeader>

      {loading ? (
        <div className="space-y-3 animate-pulse">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 rounded-2xl bg-white/5" />)}</div>
      ) : labs.length === 0 ? (
        <div className="p-10 text-center text-white/30 text-sm rounded-2xl bg-white/5 border border-white/10">Belum ada laboratorium</div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {labs.map((lab) => (
            <div
              key={lab.id}
              onClick={() => openDetail(lab)}
              className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-5 hover:bg-white/10 hover:scale-[1.02] hover:border-[#FBBF24]/40 transition-all duration-200 cursor-pointer group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FBBF24]/10 flex items-center justify-center">
                    <FlaskConical className="w-5 h-5 text-[#FBBF24]" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-white truncate">{lab.nama_lab}</h3>
                    {lab.lokasi && <p className="text-xs text-white/40 truncate mt-0.5">{lab.lokasi}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                  <button onClick={(e) => { e.stopPropagation(); openEdit(lab); }} className="p-1.5 rounded-lg hover:bg-white/5 text-white/50 hover:text-[#FBBF24] transition-colors" title="Edit">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); setDeleteId(lab.id); }} className="p-1.5 rounded-lg hover:bg-white/5 text-white/50 hover:text-red-400 transition-colors" title="Hapus">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="mt-3 space-y-1.5">
                <p className="text-xs text-white/30 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
                  {getKalabName(lab) || <span className="text-white/20 italic">Belum ada Kalab</span>}
                </p>
                <div className="flex items-center gap-1.5 text-xs text-white/40">
                  <Package className="w-3.5 h-3.5" strokeWidth={1.5} />
                  {lab.items?.length ?? 0} Item
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-xs font-semibold text-white/40 uppercase tracking-wider py-3 px-4">Nama Lab</th>
                <th className="text-left text-xs font-semibold text-white/40 uppercase tracking-wider py-3 px-4">Lokasi</th>
                <th className="text-left text-xs font-semibold text-white/40 uppercase tracking-wider py-3 px-4">Kalab</th>
                <th className="text-left text-xs font-semibold text-white/40 uppercase tracking-wider py-3 px-4">Jumlah Item</th>
                <th className="text-left text-xs font-semibold text-white/40 uppercase tracking-wider py-3 px-4">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {labs.map((lab) => (
                <tr key={lab.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                  <td className="py-3 px-4"><span className="text-white font-medium">{lab.nama_lab}</span></td>
                  <td className="py-3 px-4"><span className="text-white/50">{lab.lokasi || "—"}</span></td>
                  <td className="py-3 px-4"><span className="text-white/50">{getKalabName(lab) || "—"}</span></td>
                  <td className="py-3 px-4"><span className="text-white/50">{lab.items?.length ?? 0}</span></td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => router.push(`/admin/labs/${lab.id}`)} className="p-1.5 rounded-lg hover:bg-white/5 text-white/50 hover:text-blue-400 transition-colors" title="Detail">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => openEdit(lab)} className="p-1.5 rounded-lg hover:bg-white/5 text-white/50 hover:text-[#FBBF24] transition-colors"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteId(lab.id)} className="p-1.5 rounded-lg hover:bg-white/5 text-white/50 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[8vh] sm:pt-[12vh] p-4 bg-black/60 backdrop-blur-sm overflow-y-auto modal-scroll" onClick={() => { if (!saving) { setShowForm(false); setErrors({}); } }}>
          <div className="w-full max-w-lg rounded-2xl bg-[#1E293B] border border-white/10 p-6 shadow-2xl my-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-white mb-4">{editLab ? "Edit Lab" : "Tambah Lab"}</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-white/60 mb-1">Nama Lab</label>
                <input value={form.nama_lab} onChange={(e) => { setForm({ ...form, nama_lab: e.target.value }); if (errors.nama_lab) setErrors((prev) => { const n = { ...prev }; delete n.nama_lab; return n; }); }} placeholder="Contoh: PENGOLAHAN LIMBAH" className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#FBBF24]/40" />
                {errors.nama_lab && <p className="text-xs text-red-400 mt-1">{errors.nama_lab}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-white/60 mb-1">Lokasi</label>
                <input value={form.lokasi} onChange={(e) => setForm({ ...form, lokasi: e.target.value })} placeholder="Contoh: Gedung E Lantai 4 Ruang 2" className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#FBBF24]/40" />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/60 mb-1">Kepala Laboratorium</label>
                <CustomSelect
                  value={form.kalab_id}
                  onChange={(v) => setForm({ ...form, kalab_id: v })}
                  options={[
                    { value: "", label: "Pilih Kalab" },
                    ...kalabUsers.map((u) => ({ value: String(u.id), label: u.name })),
                  ]}
                  placeholder="Pilih Kalab"
                  showSearch={kalabUsers.length > 5}
                  searchPlaceholder="Cari kalab..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/60 mb-1">Daftar Item</label>
                {items.length === 0 ? (
                  <p className="text-xs text-white/30 py-3 text-center">Tidak ada item tersedia</p>
                ) : (
                  <div className="max-h-48 overflow-y-auto content-scroll rounded-xl border border-white/10">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/5">
                          <th className="w-10 py-2.5 px-3"></th>
                          <th className="text-left text-xs font-semibold text-white/40 uppercase tracking-wider py-2.5 px-3">Nama Barang</th>
                          <th className="text-left text-xs font-semibold text-white/40 uppercase tracking-wider py-2.5 px-3">Kode</th>
                          <th className="text-left text-xs font-semibold text-white/40 uppercase tracking-wider py-2.5 px-3">Kondisi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item) => (
                          <tr key={item.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] cursor-pointer" onClick={() => toggleItem(item.id)}>
                            <td className="py-2.5 px-3">
                              <input
                                type="checkbox"
                                checked={form.item_ids.includes(item.id)}
                                onChange={() => toggleItem(item.id)}
                                className="w-4 h-4 rounded border-white/20 bg-white/5 text-[#FBBF24] focus:ring-[#FBBF24]/40 focus:ring-offset-0"
                              />
                            </td>
                            <td className="py-2.5 px-3 text-white">{item.nama_barang}</td>
                            <td className="py-2.5 px-3 text-white/50">{item.kode_barang || "—"}</td>
                            <td className="py-2.5 px-3"><span className="text-white/50">{item.kondisi || "—"}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
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
        title="Hapus Lab"
        description="Apakah Anda yakin ingin menghapus laboratorium ini?"
        loading={deleteLoading}
      />
    </div>
  );
}
