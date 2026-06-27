"use client";

import { useState } from "react";
import { Image as ImageIcon } from "lucide-react";
import ImagePickerModal from "@/components/admin/ImagePickerModal";
import type { Media } from "@/types/cms";

interface ImageInputFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  showPreview?: boolean;
}

export default function ImageInputField({
  value,
  onChange,
  placeholder = "Masukkan URL gambar",
  label = "Gambar",
  showPreview = true,
}: ImageInputFieldProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [previewError, setPreviewError] = useState(false);

  const handleSelectImage = (url: string, media: Media) => {
    onChange(url);
    setPreviewError(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setPreviewError(false);
  };

  const handlePreviewError = () => {
    setPreviewError(true);
  };

  return (
    <div className="space-y-2">
      {/* Label */}
      {label && (
        <label className="block text-xs font-medium text-white/50 capitalize">
          {label}
        </label>
      )}

      {/* Input and button row */}
      <div className="flex gap-2">
        {/* URL Input */}
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#FBBF24]/40 focus:bg-white/10 transition-all"
        />

        {/* Media Picker Button */}
        <button
          onClick={() => setIsPickerOpen(true)}
          className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white text-sm transition-all flex items-center gap-2 whitespace-nowrap"
          title="Pilih dari Media Library"
        >
          <ImageIcon className="w-4 h-4" />
          <span className="hidden sm:inline">Pilih</span>
        </button>
      </div>

      {/* Preview */}
      {showPreview && value && !previewError && (
        <div className="mt-2 rounded-lg overflow-hidden bg-white/5 border border-white/10 p-2">
          <img
            src={value}
            alt="Preview"
            onError={handlePreviewError}
            className="w-full h-32 object-cover rounded-lg"
          />
        </div>
      )}

      {/* Error message for preview */}
      {showPreview && previewError && value && (
        <div className="text-xs text-red-400 mt-2">
          Tidak dapat menampilkan preview gambar. Periksa URL gambar.
        </div>
      )}

      {/* Image Picker Modal */}
      <ImagePickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelectImage={handleSelectImage}
      />
    </div>
  );
}
