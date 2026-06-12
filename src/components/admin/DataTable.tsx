"use client";

import { useState } from "react";
import { Search, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import LoadingSkeleton from "./LoadingSkeleton";

interface Column<T> {
  key: string;
  header: string;
  render: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  searchKey?: string;
  searchPlaceholder?: string;
  onAdd?: () => void;
  addLabel?: string;
  isLoading?: boolean;
  emptyMessage?: string;
}

export default function DataTable<T>({
  columns, data, searchKey, searchPlaceholder, onAdd, addLabel, isLoading, emptyMessage,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 10;

  const filtered = searchKey && search
    ? data.filter((item: any) =>
        String(item[searchKey] || "").toLowerCase().includes(search.toLowerCase())
      )
    : data;

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const resetPage = () => setPage(1);

  return (
    <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border-b border-white/10">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            placeholder={searchPlaceholder || "Cari..."}
            value={search}
            onChange={(e) => { setSearch(e.target.value); resetPage(); }}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#FBBF24]/40 focus:border-[#FBBF24]/40 transition-all"
          />
        </div>
        {onAdd && (
          <button
            onClick={onAdd}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FBBF24] text-[#0F172A] text-sm font-semibold hover:bg-[#FCD34D] transition-all hover:scale-[1.02] shadow-lg shadow-[#FBBF24]/20"
          >
            <Plus className="w-4 h-4" />
            {addLabel || "Tambah"}
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="p-4"><LoadingSkeleton rows={5} /></div>
      ) : paged.length === 0 ? (
        <div className="p-10 text-center text-white/30 text-sm">{emptyMessage || "Tidak ada data"}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                {columns.map((col) => (
                  <th key={col.key} className={`text-left text-xs font-semibold text-white/40 uppercase tracking-wider py-3 px-4 ${col.className || ""}`}>
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map((item, idx) => (
                <tr key={idx} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                  {columns.map((col) => (
                    <td key={col.key} className={`py-3 px-4 ${col.className || ""}`}>
                      {col.render(item)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
          <p className="text-xs text-white/30">Page {page} of {totalPages}</p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg hover:bg-white/5 text-white/50 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg hover:bg-white/5 text-white/50 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
