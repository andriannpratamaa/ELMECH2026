"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X, Loader2 } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
  loading?: boolean;
}

export default function ConfirmDialog({ open, onOpenChange, onConfirm, title, description, loading }: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => !loading && onOpenChange(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-sm rounded-2xl bg-[#1E293B] border border-white/10 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">{title}</h3>
              </div>
              <button onClick={() => !loading && onOpenChange(false)} className="p-1 rounded-lg hover:bg-white/5 text-white/50 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-white/50 mb-6">{description}</p>
            <div className="flex items-center justify-end gap-3">
              <button onClick={() => onOpenChange(false)} disabled={loading} className="px-4 py-2 rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 transition-all disabled:opacity-50">
                Batal
              </button>
              <button onClick={onConfirm} disabled={loading} className="px-4 py-2 rounded-xl text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-all disabled:opacity-50 flex items-center gap-2">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? "Menghapus..." : "Hapus"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
