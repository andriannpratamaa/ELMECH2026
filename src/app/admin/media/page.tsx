"use client";

import MediaLibrary from "@/components/admin/MediaLibrary";

export default function MediaPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-white font-[family-name:var(--font-display)]">Perpustakaan Media</h1>
        <p className="text-sm text-white/40 mt-1">Kelola dan unggah gambar untuk konten halaman</p>
      </div>

      <MediaLibrary readOnly={false} />
    </div>
  );
}