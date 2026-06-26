"use client";

import { useEffect, useState, useCallback } from "react";
import { Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { CustomSelect } from "@/components/admin/CustomSelect";
import DataTable from "@/components/admin/DataTable";
import StatusBadge from "@/components/admin/StatusBadge";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { getUsers, createUser, updateUser, deleteUser } from "@/services/users";
import { getLabs } from "@/services/labs";
import type { User, Lab } from "@/types/admin";

export default function UsersPage() {
  const [highlightCancel, setHighlightCancel] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [labs, setLabs] = useState<Lab[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", nip: "", role: "kalab", password: "", laboratory_id: "" });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const [u, l] = await Promise.all([getUsers(), getLabs()]);
      setUsers(u);
      setLabs(l);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal memuat data user");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const openCreate = () => {
    setEditUser(null);
    setForm({ name: "", email: "", nip: "", role: "kalab", password: "", laboratory_id: "" });
    setErrors({});
    setShowForm(true);
  };

  const openEdit = (u: User) => {
    setEditUser(u);
    setForm({ name: u.name, email: u.email, nip: u.nip || "", role: u.role, password: "", laboratory_id: u.laboratory_id?.toString() || "" });
    setErrors({});
    setShowForm(true);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Nama wajib diisi";
    if (!form.email.trim()) errs.email = "Email wajib diisi";
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "Email tidak valid";
    if (!form.nip.trim()) errs.nip = "NIP wajib diisi";
    if (!editUser && !form.password) errs.password = "Password wajib diisi";
    else if (!editUser && form.password.length < 6) errs.password = "Minimal 6 karakter";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    const payload: Partial<User> = {
      name: form.name,
      email: form.email,
      nip: form.nip,
      role: form.role as "admin" | "kalab" | "plp",
      laboratory_id: form.laboratory_id ? Number(form.laboratory_id) : null,
    };
    if (form.password) payload.password = form.password;
    try {
      if (editUser) {
        await updateUser(editUser.id, payload);
        toast.success("User berhasil diperbarui");
      } else {
        await createUser(payload);
        toast.success("User berhasil disimpan");
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
      toast.error(err.response?.data?.message || "Gagal menyimpan user");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await deleteUser(deleteId);
      toast.success("User berhasil dihapus");
      setDeleteId(null);
      fetch();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal menghapus user");
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns = [
    { key: "name", header: "Nama", render: (u: User) => <span className="text-white font-medium">{u.name}</span> },
    { key: "email", header: "Email", render: (u: User) => <span className="text-white/50">{u.email}</span> },
    { key: "nip", header: "NIP", render: (u: User) => <span className="text-white/50">{u.nip || "—"}</span> },
    { key: "role", header: "Role", render: (u: User) => <StatusBadge status={u.role} /> },
    {
      key: "actions", header: "Aksi",
      render: (u: User) => (
        <div className="flex items-center gap-2">
          <button onClick={() => openEdit(u)} className="p-1.5 rounded-lg hover:bg-white/5 text-white/50 hover:text-[#FBBF24] transition-colors"><Pencil className="w-4 h-4" /></button>
          <button onClick={() => setDeleteId(u.id)} className="p-1.5 rounded-lg hover:bg-white/5 text-white/50 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <AdminPageHeader title="Users" description="Manajemen pengguna sistem">
        <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FBBF24] text-[#0F172A] text-sm font-semibold hover:bg-[#FCD34D] transition-all hover:scale-[1.02] shadow-lg shadow-[#FBBF24]/20">
          + Tambah User
        </button>
      </AdminPageHeader>
      <DataTable columns={columns} data={users} searchKey="name" searchPlaceholder="Cari nama/email..." isLoading={loading} emptyMessage="Belum ada user" />

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[8vh] sm:pt-[12vh] p-4 bg-black/60 backdrop-blur-sm overflow-y-auto modal-scroll" onClick={() => {setHighlightCancel(true); setTimeout(() => {setHighlightCancel(false);}, 700);}}>
          <div className="w-full max-w-lg rounded-2xl bg-[#1E293B] border border-white/10 p-6 shadow-2xl my-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-white mb-4">{editUser ? "Edit User" : "Tambah User"}</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-white/60 mb-1">Nama</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#FBBF24]/40" />
                {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-white/60 mb-1">Email</label>
                <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#FBBF24]/40" />
                {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-white/60 mb-1">NIP</label>
                <input value={form.nip} onChange={(e) => setForm({ ...form, nip: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#FBBF24]/40" />
                {errors.nip && <p className="text-xs text-red-400 mt-1">{errors.nip}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-white/60 mb-1">Role</label>
                <CustomSelect
                  value={form.role}
                  onChange={(v) => setForm({ ...form, role: v })}
                  options={[
                    { value: "admin", label: "Admin" },
                    { value: "kalab", label: "Kalab" },
                    { value: "plp", label: "PLP" },
                  ]}
                  placeholder="Pilih Role"
                  showSearch={false}
                />
              </div>
              {/* <div>
                <label className="block text-xs font-medium text-white/60 mb-1">Laboratory (opsional)</label>
                <CustomSelect
                  value={form.laboratory_id}
                  onChange={(v) => setForm({ ...form, laboratory_id: v })}
                  options={[
                    { value: "", label: "Tidak ada" },
                    ...labs.map((l) => ({ value: String(l.id), label: l.nama_lab })),
                  ]}
                  placeholder="Pilih Lab"
                  showSearch={labs.length > 5}
                  searchPlaceholder="Cari lab..."
                />
              </div> */}
              <div>
                <label className="block text-xs font-medium text-white/60 mb-1">{editUser ? "Password (kosongkan jika tidak diubah)" : "Password"}</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#FBBF24]/40 pr-10" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-white/5 text-white/30 hover:text-white transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password}</p>}
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button onClick={() => setShowForm(false)} disabled={saving} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${highlightCancel? "bg-red-500 text-white scale-105 shadow-lg shadow-red-500/30": "text-white/70 hover:text-white hover:bg-white/5"}`} >Batal</button>
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
        title="Hapus User"
        description="Apakah Anda yakin ingin menghapus user ini?"
        loading={deleteLoading}
      />
    </div>
  );
}
