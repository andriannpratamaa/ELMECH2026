"use client";

import { useState, useRef, useCallback } from "react";
import {
  Upload,
  Library,
  Copy,
  Check,
  Trash2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { uploadFile, mediaUrl } from "@/services/cms";
import ImagePreview from "./ImagePreview";
import ImagePickerModal from "./ImagePickerModal";
import type { Media } from "@/types/cms";

interface ImageFieldProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

export default function ImageField({ value, onChange, label = "Gambar" }: ImageFieldProps) {
  const safeValue = typeof value === "string" ? value : "";
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const handleUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Hanya file gambar yang diizinkan");
      return;
    }
    try {
      setUploading(true);
      const result = await uploadFile(file);
      onChange(mediaUrl(result.url));
      toast.success("Gambar berhasil diupload");
    } catch {
      toast.error("Gagal mengupload gambar");
    } finally {
      setUploading(false);
    }
  }, [onChange]);

  const handleFileSelect = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = () => {
      const file = input.files?.[0];
      if (file) handleUpload(file);
    };
    input.click();
  }, [handleUpload]);

  const handleSelectFromLibrary = useCallback((url: string, _media: Media) => {
    onChange(url);
    setIsPickerOpen(false);
    toast.success("Gambar dipilih");
  }, [onChange]);

  const handleRemove = useCallback(() => {
    onChange("");
  }, [onChange]);

  const handleCopyUrl = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(safeValue);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("URL disalin");
    } catch {
      toast.error("Gagal menyalin URL");
    }
  }, [value]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  }, [handleUpload]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) handleUpload(file);
        return;
      }
    }
  }, [handleUpload]);

  return (
    <div
      ref={dropRef}
      className="space-y-2"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Label */}
      {label && (
        <label className="block text-xs font-medium text-white/50 capitalize">
          {label}
        </label>
      )}

      {/* URL Input + Action Buttons */}
      <div className="flex gap-2 flex-wrap">
        <div className="flex-1 min-w-0 relative">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onPaste={handlePaste}
            placeholder="URL gambar — atau upload / pilih dari library"
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#FBBF24]/40 focus:bg-white/10 transition-all"
          />
        </div>

        <div className="flex gap-2 flex-shrink-0">
          {/* Upload */}
          <button
            onClick={handleFileSelect}
            disabled={uploading}
            title="Upload Gambar"
            className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white text-sm transition-all disabled:opacity-50 flex items-center gap-1.5"
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : safeValue ? (
              <Upload className="w-4 h-4" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">{safeValue ? "Ganti" : "Upload"}</span>
          </button>

          {/* Media Library */}
          <button
            onClick={() => setIsPickerOpen(true)}
            title="Pilih dari Media Library"
            className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white text-sm transition-all flex items-center gap-1.5"
          >
            <Library className="w-4 h-4" />
            <span className="hidden sm:inline">Pilih</span>
          </button>
        </div>
      </div>

      {/* Drag & Drop hint */}
      <div
        className={`rounded-lg border-2 border-dashed p-3 text-center transition-all ${
          dragging
            ? "border-[#FBBF24] bg-[#FBBF24]/5"
            : "border-white/5 bg-white/[0.02]"
        }`}
      >
        {uploading ? (
          <div className="flex items-center justify-center gap-2 text-white/40 text-xs">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Mengupload...
          </div>
        ) : dragging ? (
          <p className="text-[#FBBF24] text-xs font-medium">Lepaskan gambar di sini</p>
        ) : (
          <p className="text-white/20 text-[10px]">
            Tarik & lepas gambar, atau tempel (Ctrl+V) screenshot
          </p>
        )}
      </div>

      {/* Preview + Action Row */}
      {safeValue && (
        <div className="space-y-1.5">
          <ImagePreview src={safeValue} showInfo />

          <div className="flex gap-2">
            {/* Copy URL */}
            <button
              onClick={handleCopyUrl}
              className="text-[10px] text-white/40 hover:text-white transition-colors flex items-center gap-1"
              title="Salin URL"
            >
              {copied ? (
                <Check className="w-3 h-3" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
              {copied ? "Tersalin" : "Salin URL"}
            </button>

            <span className="text-white/10">|</span>

            {/* Remove */}
            <button
              onClick={handleRemove}
              className="text-[10px] text-red-400/60 hover:text-red-400 transition-colors flex items-center gap-1"
              title="Hapus Gambar"
            >
              <Trash2 className="w-3 h-3" />
              Hapus
            </button>
          </div>
        </div>
      )}

      {/* Image Picker Modal */}
      <ImagePickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelectImage={handleSelectFromLibrary}
      />
    </div>
  );
}
