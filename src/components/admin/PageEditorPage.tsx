"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Loader2,
  Plus,
  Trash2,
  GripVertical, 
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { getPageBySlug, updatePage, revalidatePageCache, updatePageSlug } from "@/services/cms";
import TiptapEditor from "@/components/editor/TiptapEditor";
import ImageField from "@/components/admin/ImageField";
import ImageArrayField from "@/components/admin/ImageArrayField";
import IconPicker from "@/components/admin/IconPicker";
import { isImageField, isImageArrayField } from "@/lib/fieldTypes";
import BlockRenderer from "@/components/cms/BlockRenderer";
import type { Page, ContentBlock } from "@/types/cms";

const BLOCK_TYPES = [
  {
    type: "hero",
    label: "Bagian Hero (Beranda)",
    fields: [
      "title",
      "subtitle",
      "badge",
      "description",
      "image",
      "button_text",
      "button_link",
      "stats",
    ],
  },
  {
    type: "pagehero",
    label: "Hero Halaman",
    fields: ["title", "subtitle", "bgImage"],
  },
  {
    type: "text",
    label: "Konten Teks",
    fields: ["badge", "title", "highlight", "description", "body", "section_color"],
  },
  {
    type: "features",
    label: "Grid Fitur",
    fields: ["badge", "title", "highlight", "description", "items", "section_color", "item_color"],
  },
  {
    type: "statistics",
    label: "Statistik (Kartu)",
    fields: ["cards"],
  },
  {
    type: "gallery",
    label: "Galeri Gambar",
    fields: ["title", "images"],
  },
  {
    type: "cta",
    label: "Ajakan Bertindak",
    fields: ["title", "description", "buttons"],
  },
  {
    type: "contact",
    label: "Informasi Kontak",
    fields: ["address", "phone", "email", "maps"],
  },
  {
    type: "partners",
    label: "Mitra & Partner",
    fields: ["items"],
  },
  {
    type: "news",
    label: "Berita",
    fields: ["items", "featured"],
  },
  {
    type: "program",
    label: "Program (Beranda)",
    fields: ["bento_items", "programs", "facilities", "kerjasama"],
  },
  {
    type: "highlights",
    label: "Sorotan Angka",
    fields: ["items"],
  },
  {
    type: "timeline",
    label: "Timeline",
    fields: ["items"],
  },
  {
    type: "achievements",
    label: "Pencapaian",
    fields: ["items"],
  },
  {
    type: "aboutdetail",
    label: "Detail Tentang",
    fields: ["sejarah", "visi", "misi", "pimpinan"],
  },
  {
    type: "bento",
    label: "Bento Grid",
    fields: ["badge", "title", "highlight", "items"],
  },
  {
    type: "programs",
    label: "Program Studi",
    fields: ["badge", "title", "highlight", "description", "items"],
  },
  {
    type: "facilities",
    label: "Fasilitas",
    fields: ["badge", "title", "highlight", "items"],
  },
  {
    type: "kerjasama",
    label: "Kerjasama Industri",
    fields: ["badge", "title", "highlight", "items"],
  },
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

    if (["body", "description", "content", "summary", "excerpt", "text"].includes(field)) {
      const labelMap: Record<string, string> = {
        body: "Isi Konten",
        description: "Deskripsi",
        content: "Konten",
        summary: "Ringkasan",
        excerpt: "Cuplikan",
        text: "Teks",
      };
      return (
        <div key={field}>
          <label className="block text-xs font-medium text-white/50 mb-2 capitalize">
            {labelMap[field] || field}
          </label>
          <TiptapEditor
            value={value}
            onChange={(html) => updateField(field, html)}
          />
        </div>
      );
    }

    if (field === "items" || field === "buttons" || field === "cards" || field === "stats" || field === "bento_items" || field === "programs" || field === "facilities" || field === "kerjasama" || field === "featured" || field === "sejarah" || field === "misi" || field === "pimpinan") {
      const items: any[] = Array.isArray(value) ? value : [];
      const isObjects = items.length > 0 && typeof items[0] === "object";
      const isStringArray = items.length > 0 && typeof items[0] === "string";

      const getItemKeys = (item: any): string[] => {
        if (typeof item !== "object") return [];
        return Object.keys(item);
      };

      const keys = isObjects ? getItemKeys(items[0]) : [];

      return (
        <div key={field}>
          <label className="block text-xs font-medium text-white/50 mb-2 capitalize">
            {field}
          </label>
          <div className="space-y-3">
            {items.map((item, i) => (
              <div key={i} className="flex gap-2">
                {isObjects ? (
                  <div className="flex-1 space-y-1">
                    {keys.map((key) => {
                      const placeholderMap: Record<string, string> = {
                        title: "Judul",
                        desc: "Deskripsi",
                        description: "Deskripsi",
                        label: "Label",
                        value: "Nilai",
                        suffix: "Suffix (+, %, dll)",
                        buttonText: "Teks Tombol",
                        buttonUrl: "Link Tombol",
                        icon: "Ikon",
                        color: "Warna (from-xxx to-yyy)",
                        image: "URL Gambar",
                        size: "Ukuran (large/wide/tall/small)",
                        year: "Tahun",
                        name: "Nama",
                        bidang: "Bidang",
                        logo: "Logo",
                        slug: "Slug",
                        date: "Tanggal",
                        excerpt: "Cuplikan",
                        tag: "Tag",
                        content: "Konten",
                        link: "Link",
                        href: "Link",
                        variant: "Variant (primary/secondary)",
                        fileSize: "Ukuran File",
                        format: "Format",
                        nama: "Nama",
                        jabatan: "Jabatan",
                      };
                      if (isImageField(key) && typeof item[key] === "string") {
                        return (
                          <div key={key} className="mb-2">
                            <ImageField
                              value={item[key] || ""}
                              onChange={(v) => {
                                const next = [...items];
                                next[i] = { ...next[i], [key]: v };
                                updateField(field, next);
                              }}
                              label={placeholderMap[key] || key}
                            />
                          </div>
                        );
                      }
                      return (
                        <input
                          key={key}
                          value={item[key] || ""}
                          onChange={(e) => {
                            const next = [...items];
                            next[i] = { ...next[i], [key]: e.target.value };
                            updateField(field, next);
                          }}
                          placeholder={placeholderMap[key] || key}
                          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#FBBF24]/40"
                        />
                      );
                    })}
                  </div>
                ) : isStringArray ? (
                  <textarea
                    value={item}
                    onChange={(e) => {
                      const next = [...items];
                      next[i] = e.target.value;
                      updateField(field, next);
                    }}
                    placeholder="Teks"
                    rows={3}
                    className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#FBBF24]/40 resize-none"
                  />
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
                  onClick={() =>
                    updateField(
                      field,
                      items.filter((_, j) => j !== i),
                    )
                  }
                  className="p-2 rounded-lg hover:bg-red-500/10 text-white/30 hover:text-red-400 self-start"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={() => {
              let newItem: any = "";
              if (isObjects || (items.length === 0 && (field === "cards" || field === "pimpinan" || field === "bento_items" || field === "programs" || field === "facilities" || field === "kerjasama" || field === "featured" || field === "items" || field === "buttons"))) {
                const defaultKeys: Record<string, string[]> = {
                  cards: ["value", "suffix", "label", "desc"],
                  stats: ["value", "label"],
                  pimpinan: ["nama", "jabatan"],
                  bento_items: ["title", "desc", "icon", "color", "size", "image"],
                  programs: ["title", "desc", "icon", "color", "image"],
                  facilities: ["title", "desc", "image", "color"],
                  kerjasama: ["name", "bidang", "logo", "image"],
                  featured: ["slug", "date", "title", "excerpt", "tag", "image"],
                  items: ["title", "description"],
                  buttons: ["buttonText", "buttonUrl"],
                };
                const defaultKeyList = defaultKeys[field] || ["title", "description"];
                newItem = Object.fromEntries(defaultKeyList.map((k) => [k, ""]));
              }
              updateField(field, [...items, newItem]);
            }}
            className="text-xs text-[#FBBF24] hover:text-[#FCD34D] transition-colors mt-2"
          >
            + Tambah
          </button>
        </div>
      );
    }

    if (isImageArrayField(field)) {
      return (
        <div key={field}>
          <ImageArrayField
            value={Array.isArray(value) ? value : []}
            onChange={(val) => updateField(field, val)}
            label={field === "gallery" ? "Galeri" : field === "images" ? "Gambar" : field}
          />
        </div>
      );
    }

    if (isImageField(field)) {
      const fieldLabels: Record<string, string> = {
        bgImage: "Gambar Latar",
        backgroundImage: "Gambar Latar",
        heroImage: "Gambar Hero",
        thumbnail: "Thumbnail",
        cover: "Sampul",
        logo: "Logo",
        avatar: "Avatar",
        iconImage: "Ikon Gambar",
        banner: "Banner",
      };
      return (
        <div key={field}>
          <ImageField
            value={value}
            onChange={(val) => updateField(field, val)}
            label={fieldLabels[field] || field}
          />
        </div>
      );
    }

    if (field === "icon") {
      return (
        <div key={field}>
          <IconPicker
            value={value}
            onChange={(val) => updateField(field, val)}
          />
        </div>
      );
    }



    if (["visi"].includes(field)) {
      return (
        <div key={field}>
          <label className="block text-xs font-medium text-white/50 mb-2 capitalize">
            {field}
          </label>
          <textarea
            value={value}
            onChange={(e) => updateField(field, e.target.value)}
            placeholder={`Masukkan ${field}`}
            rows={4}
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#FBBF24]/40 resize-none"
          />
        </div>
      );
    }

    return (
      <div key={field}>
        <label className="block text-xs font-medium text-white/50 mb-2 capitalize">
          {field === "highlight"
            ? "Teks Highlight"
            : field === "button_text"
              ? "Teks Tombol"
              : field === "button_link"
                ? "Link Tombol"
                : field === "section_color"
                  ? "Warna Latar (hex)"
                  : field === "item_color"
                    ? "Warna Item (hex)"
                    : field}
        </label>
        <input
          value={value}
          onChange={(e) => updateField(field, e.target.value)}
          placeholder={
            field === "section_color" || field === "item_color"
              ? "Contoh: #F8FAFC"
              : `Masukkan ${field}`
          }
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
          <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">
            {def?.label || block.type}
          </span>
        </div>
        <button
          onClick={onDelete}
          className="p-1 rounded-lg hover:bg-red-500/10 text-white/30 hover:text-red-400 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="p-4 space-y-3">
        {def?.fields.map((field) => renderField(field))}
      </div>
    </div>
  );
}

export default function PageEditorPage({ slug: slugProp, backHref }: { slug?: string; backHref?: string }) {
  const router = useRouter();
  const slug = slugProp ?? "";

  const [page, setPage] = useState<Page | null>(null);
  const [title, setTitle] = useState("");
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [editSlug, setEditSlug] = useState(slug);

  const apiSlug = editSlug;

  useEffect(() => {
    getPageBySlug(apiSlug)
      .then((p) => {
        if (p) {
          setPage(p);
          setTitle(p.title);
          setBlocks(Array.isArray(p.content) ? p.content : []);
          setEditSlug(p.slug);
        }
      })
      .catch(() => toast.error("Gagal memuat halaman"))
      .finally(() => setLoading(false));
  }, [apiSlug]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updatePage(slug, { title, content: blocks });
      if (editSlug !== slug) {
        await updatePageSlug(slug, editSlug);
        await revalidatePageCache(editSlug);
        router.replace(`/admin/pages/${editSlug}`);
      } else {
        await revalidatePageCache(slug);
      }
      toast.success("Halaman berhasil disimpan");
    } catch {
      toast.error("Gagal menyimpan halaman");
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="w-6 h-6 text-[#FBBF24] animate-spin" />
      </div>
    );
  }

  if (showPreview) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPreview(false)}
              className="p-2 rounded-xl hover:bg-white/5 text-white/50 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white font-[family-name:var(--font-display)]">
                Pratinjau Halaman
              </h1>
              <p className="text-sm text-white/40 mt-1">
                {slug === "" ? "/" : `/${slug}`}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 overflow-hidden">
          {blocks.length === 0 ? (
            <div className="min-h-[400px] flex items-center justify-center bg-[#F8FAFC]">
              <div className="text-center text-gray-500">
                <p>Belum ada konten - tambahkan bagian untuk melihat preview</p>
              </div>
            </div>
          ) : (
            <BlockRenderer blocks={blocks} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          {backHref && (
            <Link
              href={backHref}
              className="p-2 rounded-xl hover:bg-white/5 text-white/50 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
          )}
          <div>
            <h1 className="text-xl font-bold text-white font-[family-name:var(--font-display)]">
              Edit Halaman
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-white/30">/</span>
              <input
                type="text"
                value={editSlug}
                onChange={(e) =>
                  setEditSlug(
                    e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                  )
                }
                className="bg-transparent text-sm text-white/60 border-b border-white/10 focus:border-white/30 outline-none px-1 py-0.5 min-w-[80px] transition-colors"
                disabled={slug === ""}
                placeholder="slug-halaman"
              />
              {editSlug !== slug && (
                <span className="text-[11px] text-amber-400/80">
                  ⚡ slug akan diubah
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowPreview(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-white text-sm font-semibold hover:bg-white/20 transition-all"
          >
            <Eye className="w-4 h-4" />
            Pratinjau
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FBBF24] text-[#0F172A] text-sm font-semibold hover:bg-[#FCD34D] transition-all disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-white/50 mb-2">
          Judul Halaman
        </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-lg font-semibold focus:outline-none focus:border-[#FBBF24]/40 transition-colors"
        />
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
