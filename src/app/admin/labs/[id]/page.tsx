"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, FlaskConical, MapPin, User, Package, Pencil, Trash2, ClipboardCheck, Download } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import DataTable from "@/components/admin/DataTable";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { getLabs } from "@/services/labs";
import { getItemsByLab, createItem, updateItem, deleteItem } from "@/services/items";
import { getLabSemesters, getInspectionByItemId, checkLabInspectionsStatus, exportLabItems } from "@/services/inspections";
import { getTahunSemester, buildSemesterOptions, isPeriodPast } from "@/lib/semester";
import type { TahunSemester } from "@/lib/semester";
import type { Lab, Item } from "@/types/admin";

function formatDate(dateStr?: string) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" });
}

export default function LabDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const [highlightCancel, setHighlightCancel] = useState(false);
  const [lab, setLab] = useState<Lab | null>(null);
  const [labItems, setLabItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [semesterOptions, setSemesterOptions] = useState<TahunSemester[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<TahunSemester | null>(null);
  const [itemStatuses, setItemStatuses] = useState<Record<number, { exists: boolean; review_status?: string | null }>>({});
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
  const readOnly = selectedSemester !== null && isPeriodPast(selectedSemester.tahun, selectedSemester.semester);
  const displayItems = readOnly ? labItems.filter((i) => itemStatuses[i.id]?.exists) : labItems;

  // Menghitung statistik berdasarkan data itemStatuses yang ada
  const stats = (() => {
    const totalPeralatan = labItems.length;
    let totalInspeksi = 0;
    let totalDisetujui = 0;
    let totalDitolak = 0;

    labItems.forEach((item) => {
      const status = itemStatuses[item.id];
      if (status && status.exists) {
        totalInspeksi++;
        if (status.review_status === "APPROVED") {
          totalDisetujui++;
        } else if (status.review_status === "REJECTED") {
          totalDitolak++;
        }
      }
    });

    return { totalPeralatan, totalInspeksi, totalDisetujui, totalDitolak };
  })();

  const fetchData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [labs, items, semesters] = await Promise.all([
        getLabs(),
        getItemsByLab(id),
        getLabSemesters(id).catch(() => []),
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
      const options = buildSemesterOptions(semesters as { tahun: number; semester: 'GANJIL' | 'GENAP' }[]);
      setSemesterOptions(options);
      const current = getTahunSemester();
      const defaultOpt = options.find(
        (o) => o.tahun === current.tahun && o.semester === current.semester
      ) || options[0] || current;
      setSelectedSemester(defaultOpt);
    } catch {
      toast.error("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchData(); }, [fetchData]);

   useEffect(() => {
     if (!selectedSemester || labItems.length === 0) return;
     const fetchStatuses = async () => {
       const results = await Promise.all(
         labItems.map((item) =>
           getInspectionByItemId(item.id, selectedSemester.tahun, selectedSemester.semester)
             .catch(() => ({ exists: false as const, review_status: null })),
         ),
       );
       const statuses: Record<number, { exists: boolean; review_status?: string | null }> = {};
       labItems.forEach((item, i) => { statuses[item.id] = results[i]; });
       setItemStatuses(statuses);

       // Check export status
       try {
         const exportCheckResult = await checkLabInspectionsStatus(id, selectedSemester.tahun, selectedSemester.semester);
         setExportStatus(exportCheckResult);
       } catch {
         setExportStatus({canExport: false, incompleteInspections: []});
       }
     };
     fetchStatuses();
   }, [selectedSemester, labItems]);

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
    if (!form.nama_barang.trim()) errs.nama_barang = "Nama alat wajib diisi";
    if (!form.kode_barang.trim()) errs.kode_barang = "Kode alat wajib diisi";
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
        toast.success("Peralatan berhasil diperbarui");
      } else {
        await createItem(payload);
        toast.success("Peralatan berhasil disimpan");
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
      toast.error(err.response?.data?.message || "Gagal menyimpan peralatan");
    } finally {
      setSaving(false);
    }
  };

   const handleDelete = async () => {
     if (!deleteId) return;
     setDeleteLoading(true);
     try {
       await deleteItem(deleteId);
       toast.success("Peralatan berhasil dihapus");
       setDeleteId(null);
       fetchData();
     } catch (err: any) {
       toast.error(err.response?.data?.message || "Gagal menghapus peralatan");
     } finally {
       setDeleteLoading(false);
     }
   };

   const handleExportLab = async () => {
     if (!selectedSemester) {
       toast.error("Silakan pilih periode inspeksi terlebih dahulu");
       return;
     }

     if (!exportStatus.canExport) {
       const incomplete = exportStatus.incompleteInspections;
       if (incomplete.length === 0) {
         toast.error("Tidak ada inspeksi yang dapat di-export");
       } else {
         const itemNames = incomplete.map(i => `${i.nama_barang || `Item #${i.item_id}`} (${i.message})`).join('\n');
         toast.error(`Inspeksi belum lengkap:\n${itemNames}`, { duration: 5000 });
       }
       return;
     }

     setExportLoading(true);
     try {
       await exportLabItems(id, selectedSemester.tahun, selectedSemester.semester);
       toast.success("Export berhasil");
     } catch (err: any) {
       toast.error(err.response?.data?.message || "Gagal export data");
     } finally {
       setExportLoading(false);
     }
   };

   const [file, setFile] = useState<File | null>(null);
   const [uploading, setUploading] = useState(false);
   const [uploadedFile, setUploadedFile] = useState<string | null>(null);

   const [exportLoading, setExportLoading] = useState(false);
   const [exportStatus, setExportStatus] = useState<{canExport: boolean; incompleteInspections: any[]}>({canExport: false, incompleteInspections: []});

  const columns = [
    { key: "nama_barang", header: "Nama Alat", render: (i: Item) => <span className="text-white font-medium">{i.nama_barang}</span> },
    { key: "kode_barang", header: "Kode Alat", render: (i: Item) => <span className="text-white/50">{i.kode_barang || "—"}</span> },
    { key: "pembuat_alat", header: "Pembuat Alat", render: (i: Item) => <span className="text-white/50">{i.pembuat_alat || "—"}</span> },
    { key: "tanggal_pembelian", header: "Tgl Pembelian", render: (i: Item) => <span className="text-white/50">{formatDate(i.tanggal_pembelian)}</span> },
    {
      key: "status", header: "Inspeksi",
      render: (i: Item) => {
        const s = itemStatuses[i.id];
        if (!selectedSemester) return <span className="text-xs text-white/30">—</span>;
        if (!s) return <span className="text-xs text-white/30">Memuat...</span>;
        if (!s.exists) return <span className="text-xs text-white/30">Belum Ada</span>;
        if (s.review_status === "APPROVED") return <span className="text-xs text-emerald-400 font-medium">Disetujui</span>;
        if (s.review_status === "REJECTED") return <span className="text-xs text-red-400 font-medium">Ditolak</span>;
        return <span className="text-xs text-yellow-400 font-medium">Menunggu</span>;
      },
    },
    {
      key: "actions", header: "Aksi",
      render: (i: Item) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push(`/admin/labs/${id}/inspeksi/${i.id}?tahun=${selectedSemester?.tahun}&semester=${selectedSemester?.semester}`)}
            className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-white/50 hover:text-emerald-400 transition-colors"
            title="Inspeksi"
          >
            <ClipboardCheck className="w-4 h-4" />
          </button>
          {!readOnly && (
            <button onClick={() => openEdit(i)} className="p-1.5 rounded-lg hover:bg-white/5 text-white/50 hover:text-[#FBBF24] transition-colors"><Pencil className="w-4 h-4" /></button>
          )}
          {!readOnly && (
            <button onClick={() => setDeleteId(i.id)} className="p-1.5 rounded-lg hover:bg-white/5 text-white/50 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
          )}
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
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
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
                <p className="text-xs text-white/40 mb-1">Jumlah Peralatan</p>
                <p className="text-sm font-medium text-white flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-white/30 shrink-0" strokeWidth={1.5} />
                  {readOnly ? `${displayItems.length} dari ${labItems.length} Peralatan` : `${labItems.length} Peralatan`}
                </p>
              </div>
              <div>
                <p className="text-xs text-white/40 mb-1">Periode Inspeksi</p>
                <select
                  value={selectedSemester ? `${selectedSemester.tahun}-${selectedSemester.semester}` : ''}
                  onChange={(e) => {
                    const [tahun, semester] = e.target.value.split('-');
                    const opt = semesterOptions.find((o) => o.tahun === Number(tahun) && o.semester === semester);
                    if (opt) setSelectedSemester(opt);
                  }}
                  className="text-sm font-medium bg-white/10 border border-white/20 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-400/40 cursor-pointer"
                >
                  {semesterOptions.map((opt) => (
                    <option key={`${opt.tahun}-${opt.semester}`} value={`${opt.tahun}-${opt.semester}`} className="bg-[#1E293B]">
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-start">
        <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-4">
          <p className="text-xs text-white/40 mb-1">Total Peralatan</p>
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-[#FBBF24]" strokeWidth={1.5} />
            <span className="text-2xl font-bold text-white">{labItems.length}</span>
          </div>
        </div>
        <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-4">
          <p className="text-xs text-white/40 mb-1">Total Inspeksi</p>
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-[#FBBF24]" strokeWidth={1.5} />
            <span className="text-2xl font-bold text-white">{stats.totalInspeksi}</span>
          </div>
        </div>
        <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-4">
          <p className="text-xs text-white/40 mb-1">Total Inspeksi Approve</p>
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-[#FBBF24]" strokeWidth={1.5} />
            <span className="text-2xl font-bold text-white">{stats.totalDisetujui}</span>
          </div>
        </div>
        <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-4">
          <p className="text-xs text-white/40 mb-3">Laporan Lab</p>

          {/* FILE INPUT HIDDEN */}
          <input
            id="file-upload"
            type="file"
            accept="application/pdf,image/*"
            disabled={!!uploadedFile}
            onChange={(e) => {
              if (e.target.files?.[0]) setFile(e.target.files[0]);
            }}
            className="hidden"
          />

          {/* CUSTOM BUTTON */}
          <label
            htmlFor="file-upload"
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-xs transition
      ${uploadedFile
                ? "bg-white/5 text-white/30 border-white/10 cursor-not-allowed"
                : "bg-white/10 hover:bg-white/15 border-white/10 text-white cursor-pointer"
              }`}
          >
            📁 Pilih File
          </label>

          {/* FILE INFO */}
          {file && !uploadedFile && (
            <div className="mt-3 flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-3 py-2">
              <div className="text-xs text-white/70 truncate max-w-[180px]">
                📄 {file.name}
              </div>

              <button
                onClick={() => setFile(null)}
                className="text-xs text-red-400 hover:text-red-300"
              >
                Hapus
              </button>
            </div>
          )}

          {/* UPLOADED FILE INFO */}
          {uploadedFile && (
            <div className="mt-3 flex items-center justify-between bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-3 py-2">
              <div className="text-xs text-emerald-400 truncate max-w-[180px]">
                ✔ File sudah diupload
              </div>

              <a
                href={`${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}${uploadedFile}`}
                target="_blank"
                className="text-xs text-emerald-400 underline"
              >
                Lihat
              </a>
            </div>
          )}

          {/* ACTION BUTTONS */}
          <div className="flex items-center gap-2 mt-4">
            <button
              disabled={!!uploadedFile || uploading}
              onClick={async () => {
                if (!file) return toast.error("Pilih file dulu");
                if (uploadedFile) return;

                const formData = new FormData();
                formData.append("file", file);
                formData.append("lab_id", String(id));

                setUploading(true);

                try {
                  const res = await fetch("${process.env.NEXT_PUBLIC_API_URL}/lab/upload", {
                    method: "POST",
                    body: formData,
                  });

                  if (!res.ok) throw new Error("Upload gagal");

                  const data = await res.json();
                  setUploadedFile(data.url);

                  toast.success("File berhasil diupload");
                } catch (err) {
                  toast.error("Upload gagal");
                } finally {
                  setUploading(false);
                }
              }}
              className={`px-4 py-2 text-xs rounded-xl font-semibold transition
        ${uploadedFile
                  ? "bg-white/10 text-white/30 cursor-not-allowed"
                  : "bg-[#FBBF24] text-black hover:bg-[#FCD34D]"
                }`}
            >
              {uploading
                ? "Uploading..."
                : uploadedFile
                  ? "Sudah Upload"
                  : "Upload"}
            </button>

            {/* RESET (optional kalau mau ganti file) */}
            {uploadedFile && (
              <button
                onClick={() => {
                  setUploadedFile(null);
                  setFile(null);
                }}
                className="px-3 py-2 text-xs rounded-xl bg-white/10 text-white/70 hover:bg-white/15"
              >
                Ganti File
              </button>
            )}
          </div>
        </div>
      </div>


       {readOnly && (
         <div className="mb-4 px-4 py-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-sm text-yellow-300 font-medium">
           Mode hanya-lihat — Periode {selectedSemester.tahun} {selectedSemester.semester === 'GANJIL' ? 'Ganjil' : 'Genap'} sudah lewat
         </div>
       )}

       <div className="flex justify-between gap-3">
         <div className="flex-1" />
         <div className="flex items-center gap-3">
           {selectedSemester && (
             <button 
               onClick={handleExportLab}
               disabled={!exportStatus.canExport || exportLoading}
               title={!exportStatus.canExport ? "Semua inspeksi harus lengkap (6 bulan) untuk export" : "Export semua peralatan ke Excel"}
               className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-lg ${
                 !exportStatus.canExport || exportLoading
                   ? 'bg-emerald-500/30 text-emerald-300 cursor-not-allowed opacity-50 shadow-emerald-500/10'
                   : 'bg-emerald-500 text-white hover:bg-emerald-600 hover:scale-[1.02] shadow-emerald-500/20'
               }`}
             >
               {exportLoading ? (
                 <>
                   <span className="animate-spin">⚙</span>
                   Exporting...
                 </>
               ) : (
                 <>
                   <Download className="w-4 h-4" />
                   Export Semua
                 </>
               )}
             </button>
           )}
           {!readOnly && (
             <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FBBF24] text-[#0F172A] text-sm font-semibold hover:bg-[#FCD34D] transition-all hover:scale-[1.02] shadow-lg shadow-[#FBBF24]/20">
               + Tambah Peralatan
             </button>
           )}
         </div>
       </div>

      <DataTable
        columns={columns}
        data={displayItems}
        searchKey="nama_barang"
        searchPlaceholder="Cari peralatan di lab ini..."
        isLoading={loading}
        emptyMessage={readOnly ? "Tidak ada inspeksi untuk periode ini" : "Belum ada peralatan di laboratorium ini"}
      />

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[8vh] sm:pt-[12vh] p-4 bg-black/60 backdrop-blur-sm overflow-y-auto modal-scroll" onClick={() => {setHighlightCancel(true);setTimeout(() => {setHighlightCancel(false);}, 700);}}>
          <div className="w-full max-w-md rounded-2xl bg-[#1E293B] border border-white/10 p-6 shadow-2xl my-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-white mb-4">{editItem ? "Edit Peralatan" : "Tambah Peralatan"}</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-white/60 mb-1">Nama Alat</label>
                <input value={form.nama_barang} onChange={(e) => { setForm({ ...form, nama_barang: e.target.value }); if (errors.nama_barang) setErrors((prev) => { const n = { ...prev }; delete n.nama_barang; return n; }); }} placeholder="Contoh: MULTI GAS DETECTOR" className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#FBBF24]/40" />
                {errors.nama_barang && <p className="text-xs text-red-400 mt-1">{errors.nama_barang}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-white/60 mb-1">Kode Alat</label>
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
        title="Hapus Peralatan"
        description="Yakin ingin menghapus peralatan ini?"
        loading={deleteLoading}
      />
    </div>
  );
}
