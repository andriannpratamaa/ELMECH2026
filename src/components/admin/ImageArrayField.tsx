"use client";

import { useCallback } from "react";
import { Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import ImageField from "./ImageField";

interface ImageArrayFieldProps {
  value: string[];
  onChange: (value: string[]) => void;
  label?: string;
}

export default function ImageArrayField({
  value = [],
  onChange,
  label = "Gambar",
}: ImageArrayFieldProps) {
  const updateItem = useCallback(
    (index: number, url: string) => {
      const next = [...value];
      next[index] = url;
      onChange(next);
    },
    [value, onChange],
  );

  const removeItem = useCallback(
    (index: number) => {
      onChange(value.filter((_, i) => i !== index));
    },
    [value, onChange],
  );

  const moveUp = useCallback(
    (index: number) => {
      if (index === 0) return;
      const next = [...value];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      onChange(next);
    },
    [value, onChange],
  );

  const moveDown = useCallback(
    (index: number) => {
      if (index >= value.length - 1) return;
      const next = [...value];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      onChange(next);
    },
    [value, onChange],
  );

  const addItem = useCallback(() => {
    onChange([...value, ""]);
  }, [value, onChange]);

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-xs font-medium text-white/50 capitalize">
          {label}
        </label>
      )}

      <div className="space-y-3">
        {value.map((url, i) => (
          <div key={i} className="flex gap-2 items-start">
            <div className="flex-1 min-w-0">
              <ImageField
                value={url}
                onChange={(v) => updateItem(i, v)}
              />
            </div>

            <div className="flex flex-col gap-0.5 pt-1 flex-shrink-0">
              {/* Move Up */}
              <button
                onClick={() => moveUp(i)}
                disabled={i === 0}
                title="Pindah ke atas"
                className="p-1 rounded hover:bg-white/5 text-white/20 hover:text-white/60 disabled:opacity-20 disabled:cursor-not-allowed"
              >
                <ChevronUp className="w-3.5 h-3.5" />
              </button>

              {/* Move Down */}
              <button
                onClick={() => moveDown(i)}
                disabled={i >= value.length - 1}
                title="Pindah ke bawah"
                className="p-1 rounded hover:bg-white/5 text-white/20 hover:text-white/60 disabled:opacity-20 disabled:cursor-not-allowed"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {/* Delete */}
              <button
                onClick={() => removeItem(i)}
                title="Hapus"
                className="p-1 rounded hover:bg-red-500/10 text-white/20 hover:text-red-400"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={addItem}
        className="text-xs text-[#FBBF24] hover:text-[#FCD34D] transition-colors flex items-center gap-1"
      >
        <Plus className="w-3 h-3" />
        Tambah {label.toLowerCase()}
      </button>
    </div>
  );
}
