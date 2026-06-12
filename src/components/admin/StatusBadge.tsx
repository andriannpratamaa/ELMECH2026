interface StatusBadgeProps {
  status: string;
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  approved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  rejected: "bg-red-500/10 text-red-400 border-red-500/20",
  completed: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  aktif: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  nonaktif: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  baik: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  rusak_ringan: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  rusak_berat: "bg-red-500/10 text-red-400 border-red-500/20",
  admin: "bg-[#FBBF24]/10 text-[#FBBF24] border-[#FBBF24]/20",
  kalab: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const key = status?.toLowerCase().replace(/\s+/g, "_") || "";
  const style = STATUS_STYLES[key] || "bg-white/5 text-white/50 border-white/10";

  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-lg text-xs font-medium border ${style}`}>
      {status}
    </span>
  );
}
