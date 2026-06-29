"use client";

import { useState, useCallback } from "react";
import { ImageIcon, FileWarning } from "lucide-react";

interface ImagePreviewProps {
  src: string;
  alt?: string;
  className?: string;
  showInfo?: boolean;
}

export default function ImagePreview({
  src,
  alt = "Preview",
  className = "",
  showInfo = false,
}: ImagePreviewProps) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [naturalDimensions, setNaturalDimensions] = useState({ width: 0, height: 0 });

  const handleLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const img = e.currentTarget;
      setLoaded(true);
      setError(false);
      setDimensions({ width: img.offsetWidth, height: img.offsetHeight });
      setNaturalDimensions({ width: img.naturalWidth, height: img.naturalHeight });
    },
    [],
  );

  const handleError = useCallback(() => {
    setError(true);
    setLoaded(false);
  }, []);

  if (!src) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg bg-white/5 border border-dashed border-white/10 ${className || "h-32"}`}
      >
        <div className="text-center">
          <ImageIcon className="w-6 h-6 text-white/20 mx-auto mb-1" />
          <p className="text-[10px] text-white/20">Belum ada gambar</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg bg-red-500/5 border border-dashed border-red-500/20 ${className || "h-32"}`}
      >
        <div className="text-center">
          <FileWarning className="w-6 h-6 text-red-400/50 mx-auto mb-1" />
          <p className="text-[10px] text-red-400/60">Gagal memuat gambar</p>
        </div>
      </div>
    );
  }

  const fileType = typeof src === "string"
    ? src.match(/\.(\w+)(?:\?.*)?$/)?.[1]?.toUpperCase() || null
    : null;

  return (
    <div className={`space-y-1.5 ${className ? "" : ""}`}>
      <div className="relative rounded-lg overflow-hidden bg-white/5 border border-white/10">
        {!loaded && (
          <div className={`flex items-center justify-center ${className || "h-32"} bg-white/5`}>
            <div className="w-5 h-5 border-2 border-[#FBBF24]/30 border-t-[#FBBF24] rounded-full animate-spin" />
          </div>
        )}
        <img
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className={`w-full object-cover transition-opacity duration-200 ${
            loaded ? "opacity-100" : "opacity-0"
          } ${className || "h-32"} rounded-lg`}
        />
      </div>

      {showInfo && loaded && (
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-white/40">
          {naturalDimensions.width > 0 && (
            <span>
              {naturalDimensions.width} &times; {naturalDimensions.height}
            </span>
          )}
          {fileType && <span>{fileType}</span>}
        </div>
      )}
    </div>
  );
}
