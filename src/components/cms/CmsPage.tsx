"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { getPageBySlug } from "@/services/cms";
import BlockRenderer from "./BlockRenderer";
import type { ContentBlock } from "@/types/cms";

interface CmsPageProps {
  slug: string;
  initialData?: {
    content: ContentBlock[];
  };
  children?: React.ReactNode;
}

export default function CmsPage({ slug, initialData, children }: CmsPageProps) {
  const [blocks, setBlocks] = useState<ContentBlock[]>(
    initialData?.content || [],
  );
  const [loading, setLoading] = useState(!initialData && !Boolean(children));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      return;
    }

    let isMounted = true;
    const hasFallback = Boolean(children);

    getPageBySlug(slug)
      .then((page) => {
        if (!isMounted) return;

        if (!page) {
          setBlocks([]);
          setError(hasFallback ? null : `Halaman "${slug}" tidak ditemukan`);
          return;
        }

        const content = Array.isArray(page.content) ? page.content : [];
        if (content.length === 0) {
          console.warn(
            `[CmsPage] Halaman "${slug}" tidak memiliki content blocks`,
          );
        }
        setBlocks(content);
        setError(null);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error(`[CmsPage] Error mengambil halaman "${slug}":`, err);
        setError(hasFallback ? null : `Gagal memuat halaman "${slug}"`);
        setBlocks([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [slug, initialData, children]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center bg-[#F8FAFC]">
        <Loader2 className="w-6 h-6 text-[#FBBF24] animate-spin" />
      </div>
    );
  }

  if (error && blocks.length === 0 && !children) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center bg-[#F8FAFC]">
        <div className="text-center">
          <p className="text-red-500 font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  if (blocks.length === 0) {
    return children || null;
  }

  return <BlockRenderer blocks={blocks} />;
}
