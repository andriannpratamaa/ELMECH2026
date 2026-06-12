import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
}

export default function StatCard({ icon: Icon, label, value }: StatCardProps) {
  return (
    <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-5 hover:bg-white/10 transition-all duration-300">
      <div className="w-10 h-10 rounded-xl bg-[#FBBF24]/10 flex items-center justify-center mb-3">
        <Icon className="w-5 h-5 text-[#FBBF24]" strokeWidth={1.5} />
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-white/40 mt-1">{label}</p>
    </div>
  );
}
