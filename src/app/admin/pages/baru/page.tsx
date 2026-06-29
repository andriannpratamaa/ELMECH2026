"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, Plus, Trash2, GripVertical } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { createPage, revalidatePageCache } from "@/services/cms";
import TiptapEditor from "@/components/editor/TiptapEditor";
import type { ContentBlock } from "@/types/cms";

const BLOCK_TYPES = [
  { type: "hero", label: "Bagian Hero", fields: ["title", "subtitle", "badge", "description", "image", "button_text", "button_link", "stats"] },
  { type: "text", label: "Konten Teks", fields: ["badge", "title", "highlight", "description", "body"] },
  { type: "features", label: "Grid Fitur", fields: ["badge", "title", "description", "items"] },
  { type: "stats", label: "Statistik", fields: ["badge", "title", "items"] },
  { type: "gallery", label: "Galeri Gambar", fields: ["title", "images"] },
  { type: "cta", label: "Ajakan Bertindak", fields: ["title", "subtitle", "button_text", "button_link", "buttons"] },
];

function BlockEditor({
  block,
  index,
  onChange,
  onDelete,
}: {
  block: ContentBlock;
  index: number;
  onChange: (b: ContentBlock) => void;
  onDelete: () => void;
}) {
  const def = BLOCK_TYPES.find((b) => b.type === block.type);

  const updateField = (key: string, value: any) => {
    onChange({ ...block, data: { ...block.data, [key]: value } });
  };

  const renderField = (field: string) => {
    const value = block.data[field] || "";

    if (field === "body") {
      return (
        <div key={field}>
          <label className="block text-xs font-medium text-white/50 mb-2 capitalize">{field === "body" ? "Isi Konten" : field}</label>
          <TiptapEditor
            value={value}
            onChange={(html) => updateField(field, html)}
          />
        </div>
      );
    }

    if (field === "items" || field === "buttons") {
      const items: any[] = value || [];
      const isObjects = items.length > 0 && typeof items[0] === "object";

      return (
        <div key={field}>
          <label className="block text-xs font-medium text-white/50 mb-2 capitalize">
            {field === "items" ? "Item-item" : "Tombol"}
          </label>
          <div className="space-y-2">
            {items.map((item, i) => (
              <div key={i} className="flex gap-2">
                {isObjects ? (
                  <div className="flex-1 space-y-1">
                    <input
                      value={item.title || item.label || ""}
                      onChange={(e) => {
                        const next = [...items];
                        next[i] = { ...next[i], title: e.target.value, label: e.target.value };
                        updateField(field, next);
                      }}
                      placeholder="Judul/Label"
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#FBBF24]/40"
                    />
                    {field === "buttons" && (
                      <input
                        value={item.link || ""}
                        onChange={(e) => {
                          const next = [...items];
                          next[i] = { ...next[i], link: e.target.value };
                          updateField(field, next);
                        }}
                        placeholder="Link"
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#FBBF24]/40"
                      />
                    )}
                  </div>
                ) : (
                  <input
                    value={item}
                    onChange={(e) => {
                      const next = [...items];
                      next[i] = e.target.value;
                      updateField(field, next);
                    }}
                    placeholder="Item"
                    className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#FBBF24]/40"
                  />
                )}
                <button
                  onClick={() => updateField(field, items.filter((_, j) => j !== i))}
                  className="p-2 rounded-lg hover:bg-red-500/10 text-white/30 hover:text-red-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={() => {
              const newItem = field === "buttons" ? { label: "", link: "" } : "";
              updateField(field, [...items, newItem]);
            }}
            className="text-xs text-[#FBBF24] hover:text-[#FCD34D] transition-colors mt-2"
          >
            + Tambah {field === "items" ? "item" : "tombol"}
          </button>
        </div>
      );
    }

    if (field === "images") {
      const images: string[] = value || [];
      return (
        <div key={field}>
          <label className="block text-xs font-medium text-white/50 mb-2 capitalize">Gambar</label>
          <div className="space-y-2">
            {images.map((img, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={img}
                  onChange={(e) => {
                    const next = [...images];
                    next[i] = e.target.value;
                    updateField(field, next);
                  }}
                  placeholder="URL Gambar"
                  className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#FBBF24]/40"
                />
                <button
                  onClick={() => updateField(field, images.filter((_, j) => j !== i))}
                  className="p-2 rounded-lg hover:bg-red-500/10 text-white/30 hover:text-red-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={() => updateField(field, [...images, ""])}
            className="text-xs text-[#FBBF24] hover:text-[#FCD34D] transition-colors mt-2"
          >
            + Tambah Gambar
          </button>
        </div>
      );
    }

    return (
      <div key={field}>
        <label className="block text-xs font-medium text-white/50 mb-2 capitalize">
          {field === "highlight" ? "Teks Highlight" : field === "button_text" ? "Teks Tombol" : field === "button_link" ? "Link Tombol" : field}
        </label>
        <input
          value={value}
          onChange={(e) => updateField(field, e.target.value)}
          placeholder={`Masukkan ${field}`}
          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#FBBF24]/40"
        />
      </div>
    );
  };

  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-white/[0.02] border-b border-white/5">
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-white/20 cursor-move" />
          <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">{def?.label || block.type}</span>
        </div>
        <button onClick={onDelete} className="p-1 rounded-lg hover:bg-red-500/10 text-white/30 hover:text-red-400 transition-colors">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="p-4 space-y-3">
        {def?.fields.map((field) => renderField(field))}
      </div>
    </div>
  );
}

export default function CreatePagePage() {
  const router = useRouter();
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [saving, setSaving] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);

  const handleSave = async () => {
    if (!slug || !title) {
      toast.error("Slug dan judul halaman wajib diisi");
      return;
    }

    // Check token before saving
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      toast.error("Session expired. Silakan login kembali");
      router.push('/admin');
      return;
    }

    try {
      setSaving(true);
      await createPage({ slug, title, content: blocks });
      
      // Revalidate cache untuk slug baru
      await revalidatePageCache(slug);
      
      toast.success("Halaman berhasil dibuat");
      router.push("/admin/pages/list");
    } catch (error: any) {
      console.error('Save error:', error);
      const errorMsg = error.response?.data?.message || 'Gagal membuat halaman';
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const updateBlock = (index: number, block: ContentBlock) => {
    setBlocks((prev) => prev.map((b, i) => (i === index ? block : b)));
  };

  const deleteBlock = (index: number) => {
    setBlocks((prev) => prev.filter((_, i) => i !== index));
  };

  const addBlock = (type: string) => {
    const def = BLOCK_TYPES.find((b) => b.type === type);
    if (!def) return;
    const initial: Record<string, any> = {};
    for (const field of def.fields) {
      if (field === "items" || field === "buttons") {
        initial[field] = [];
      } else if (field === "images") {
        initial[field] = [];
      } else {
        initial[field] = "";
      }
    }
    setBlocks((prev) => [...prev, { type, data: initial }]);
    setShowAddMenu(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link href="/admin/pages/list" className="p-2 rounded-xl hover:bg-white/5 text-white/50 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white font-[family-name:var(--font-display)]">Halaman Baru</h1>
            <p className="text-sm text-white/40 mt-1">Buat halaman baru untuk website</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FBBF24] text-[#0F172A] text-sm font-semibold hover:bg-[#FCD34D] transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Menyimpan..." : "Buat Halaman"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-white/50 mb-2">Slug *</label>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
            placeholder="contoh: tentang-kami"
            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#FBBF24]/40"
          />
          <p className="text-[10px] text-white/30 mt-1">URL halaman akan menjadi: /{slug}</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-white/50 mb-2">Judul Halaman *</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Masukkan judul halaman"
            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#FBBF24]/40"
          />
        </div>
      </div>

      <div className="space-y-4">
        {blocks.map((block, i) => (
          <BlockEditor
            key={i}
            block={block}
            index={i}
            onChange={(b) => updateBlock(i, b)}
            onDelete={() => deleteBlock(i)}
          />
        ))}
      </div>

      <div className="relative">
        <button
          onClick={() => setShowAddMenu(!showAddMenu)}
          className="w-full py-3 rounded-2xl border-2 border-dashed border-white/10 text-white/30 hover:text-white/60 hover:border-white/20 transition-all text-sm font-medium flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Tambah Bagian
        </button>

        {showAddMenu && (
          <div className="mt-2 rounded-2xl bg-[#1E293B] border border-white/10 shadow-2xl overflow-hidden">
            {BLOCK_TYPES.map((bt) => (
              <button
                key={bt.type}
                onClick={() => addBlock(bt.type)}
                className="w-full text-left px-4 py-3 text-sm text-white/70 hover:bg-white/5 hover:text-white transition-colors"
              >
                {bt.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}