"use client";

import { useEffect, useState } from "react";
import { UserCircle, Mail, Fingerprint, Shield, FlaskConical, Pencil, X, Check } from "lucide-react";
import { toast } from "sonner";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import StatusBadge from "@/components/admin/StatusBadge";
import { getProfile, updateProfile } from "@/services/profile";
import type { Profile } from "@/types/admin";

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");

  useEffect(() => {
    getProfile()
      .then((d) => {
        setProfile(d);
        if (d) {
          setEditName(d.name);
          setEditEmail(d.email);
        }
      })
      .catch(() => toast.error("Gagal memuat profil"))
      .finally(() => setLoading(false));
  }, []);

  const startEditing = () => {
    if (!profile) return;
    setEditName(profile.name);
    setEditEmail(profile.email);
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
    if (profile) {
      setEditName(profile.name);
      setEditEmail(profile.email);
    }
  };

  const handleSave = async () => {
    if (!editName.trim()) {
      toast.error("Nama tidak boleh kosong");
      return;
    }
    setSaving(true);
    try {
      const updated = await updateProfile({ name: editName.trim(), email: editEmail.trim() });
      setProfile(updated);
      setEditing(false);
      toast.success("Profil berhasil diperbarui");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal memperbarui profil");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-48 rounded-xl bg-white/5" />
        <div className="h-64 rounded-2xl bg-white/5" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-10 text-center text-white/30 text-sm rounded-2xl bg-white/5 border border-white/10">
        Profil tidak ditemukan
      </div>
    );
  }

  const fields: { icon: typeof UserCircle; label: string; value: React.ReactNode }[] = [
    { icon: UserCircle, label: "Nama", value: profile.name },
    { icon: Mail, label: "Email", value: profile.email },
    { icon: Fingerprint, label: "NIP", value: profile.nip || "—" },
    { icon: Shield, label: "Role", value: <StatusBadge status={profile.role} /> },
    { icon: FlaskConical, label: "Laboratory", value: profile.lab_name || "—" },
  ];

  return (
    <div>
      <AdminPageHeader title="Profile" description="Informasi akun Anda" />

      <div className="max-w-2xl rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 sm:p-8">
        <div className="flex items-start justify-between mb-8 pb-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FBBF24] to-[#FCD34D] flex items-center justify-center">
              <UserCircle className="w-8 h-8 text-[#0F172A]" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">{profile.name}</h2>
              <p className="text-sm text-white/50">{profile.email}</p>
            </div>
          </div>
          {!editing ? (
            <button
              onClick={startEditing}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 text-white/50 text-sm font-medium hover:text-white hover:bg-white/10 transition-all border border-white/10"
            >
              <Pencil className="w-4 h-4" /> Edit
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 text-sm font-medium hover:bg-emerald-500/20 transition-all border border-emerald-500/20 disabled:opacity-50"
              >
                <Check className="w-4 h-4" /> {saving ? "Menyimpan..." : "Simpan"}
              </button>
              <button
                onClick={cancelEditing}
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 text-white/50 text-sm font-medium hover:text-white hover:bg-white/10 transition-all border border-white/10"
              >
                <X className="w-4 h-4" /> Batal
              </button>
            </div>
          )}
        </div>

        <div className="space-y-5">
          {fields.map((f) => (
            <div key={f.label} className="flex items-center gap-4">
              <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center">
                <f.icon className="w-4 h-4 text-white/40" strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white/40">{f.label}</p>
                {editing && (f.label === "Nama" || f.label === "Email") ? (
                  <input
                    value={f.label === "Nama" ? editName : editEmail}
                    onChange={(e) => f.label === "Nama" ? setEditName(e.target.value) : setEditEmail(e.target.value)}
                    className="mt-0.5 w-full px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm"
                  />
                ) : (
                  <div className="text-sm font-medium text-white mt-0.5">{f.value}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
