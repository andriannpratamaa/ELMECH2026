"use client";

import { useEffect, useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Loader2, Copy, Check, Image as ImageIcon } from "lucide-react";
import { getMedia, mediaUrl } from "@/services/cms";
import { toast } from "sonner";
import type { Media } from "@/types/cms";

interface ImagePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (url: string, media: Media) => void;
}

export default function ImagePickerModal({ isOpen, onClose, onSelectImage }: ImagePickerModalProps) {
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());

  // Load media on mount
  useEffect(() => {
    if (!isOpen) return;

    const loadMedia = async () => {
      try {
        setLoading(true);
        const data = await getMedia();
        setMedia(data);
      } catch (error) {
        console.error(error);
        toast.error("Gagal memuat media");
      } finally {
        setLoading(false);
      }
    };

    loadMedia();
  }, [isOpen]);

  // Filter media by search query
  const filteredMedia = useMemo(() => {
    if (!searchQuery) return media;
    return media.filter(m =>
      m.filename.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [media, searchQuery]);

  // Handle image selection
  const handleSelectImage = (m: Media) => {
    const url = mediaUrl(m.url);
    onSelectImage(url, m);
    onClose();
    toast.success("Gambar dipilih");
  };

  // Handle copy URL
  const handleCopyUrl = (m: Media) => {
    const url = mediaUrl(m.url);
    navigator.clipboard.writeText(url);
    setCopiedId(m.id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success("URL disalin");
  };

  // Handle image load for lazy loading
  const handleImageLoad = (id: number) => {
    setLoadedImages(prev => new Set([...prev, id]));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Pilih Gambar dari Media Library</DialogTitle>
        </DialogHeader>

        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Cari gambar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#FBBF24]/40 focus:bg-white/10 transition-all"
          />
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-[#FBBF24] animate-spin" />
          </div>
        )}

        {/* Media grid */}
        {!loading && (
          <div className="flex-1 overflow-y-auto pr-2">
            {filteredMedia.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <ImageIcon className="w-12 h-12 text-white/20 mb-3" />
                <p className="text-white/40">
                  {searchQuery ? "Tidak ada gambar yang cocok" : "Belum ada media"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {filteredMedia.map((m) => {
                  const url = mediaUrl(m.url);
                  const isLoaded = loadedImages.has(m.id);

                  return (
                    <div
                      key={m.id}
                      className="group relative rounded-xl overflow-hidden bg-white/5 border border-white/10 hover:border-white/20 transition-all cursor-pointer"
                    >
                      {/* Image container */}
                      <div className="relative w-full h-32 bg-white/5 overflow-hidden">
                        {/* Placeholder skeleton */}
                        {!isLoaded && (
                          <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-white/10 to-white/5 animate-pulse" />
                        )}

                        {/* Image */}
                        <img
                          src={url}
                          alt={m.filename}
                          onLoad={() => handleImageLoad(m.id)}
                          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                            isLoaded ? "opacity-100" : "opacity-0"
                          }`}
                        />
                      </div>

                      {/* Overlay on hover */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                        <button
                          onClick={() => handleSelectImage(m)}
                          className="px-3 py-1.5 rounded-lg bg-[#FBBF24] text-[#0F172A] text-xs font-semibold hover:bg-[#FCD34D] transition-all w-full"
                        >
                          Gunakan Gambar
                        </button>

                        <button
                          onClick={() => handleCopyUrl(m)}
                          className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all w-full flex items-center justify-center gap-1.5 text-xs"
                          title="Salin URL"
                        >
                          {copiedId === m.id ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Tersalin</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Salin URL</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Filename info */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-white/70 text-[10px] truncate">{m.filename}</p>
                        {m.created_at && (
                          <p className="text-white/50 text-[9px]">
                            {new Date(m.created_at).toLocaleDateString("id-ID")}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Results count */}
        {!loading && filteredMedia.length > 0 && (
          <div className="text-xs text-white/40 pt-2 border-t border-white/10">
            Menampilkan {filteredMedia.length} dari {media.length} gambar
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
