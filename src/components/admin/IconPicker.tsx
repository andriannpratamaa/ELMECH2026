"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";

const ICONS = [
  "Ship", "Zap", "Cog", "Wrench", "Microscope", "Cpu", "Factory",
  "FlaskConical", "Monitor", "Globe", "CheckCircle", "BookOpen",
  "Users", "Award", "Calendar", "Building2", "GraduationCap",
  "Leaf", "Sun", "Wind", "Droplets", "Recycle", "TreePine",
  "Heart", "Star", "Bell", "Shield", "Lock", "Unlock",
  "Mail", "Phone", "MapPin", "Compass", "Anchor", "Sailboat",
  "Warehouse", "Container", "Truck", "Plane", "Train", "Car",
  "Bike", "Wallet", "CreditCard", "DollarSign", "TrendingUp",
  "BarChart3", "PieChart", "Activity", "Clock", "CalendarDays",
  "Camera", "Video", "Image", "FileText", "Folder", "Files",
  "Database", "Server", "Cloud", "Wifi", "Bluetooth",
  "Smartphone", "Tablet", "Laptop", "Printer", "Radio",
  "Headphones", "Music", "Palette", "Pen", "Pencil",
  "Brush", "Eraser", "Ruler", "Scissors", "Trash2",
  "Settings", "SlidersHorizontal", "Search", "ZoomIn", "ZoomOut",
  "Maximize2", "Minimize2", "Expand", "Collapse", "Move",
  "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight",
  "ChevronUp", "ChevronDown", "ChevronLeft", "ChevronRight",
  "Plus", "Minus", "X", "Check", "AlertCircle", "Info",
  "HelpCircle", "MessageCircle", "MessageSquare", "Send",
  "ThumbsUp", "ThumbsDown", "Share2", "ExternalLink", "Link",
  "Copy", "Download", "Upload", "RefreshCw", "RotateCw",
  "LogIn", "LogOut", "UserPlus", "UserCheck", "UserX",
];

export default function IconPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = search
    ? ICONS.filter((n) => n.toLowerCase().includes(search.toLowerCase()))
    : ICONS;

  return (
    <div>
      <label className="block text-xs font-medium text-white/50 mb-2">Ikon</label>
      <div className="flex gap-2">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Nama ikon (contoh: Ship, Zap, Cog)"
          className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#FBBF24]/40"
        />
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all text-sm"
        >
          Pilih
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-2xl max-h-[80vh] bg-[#1E293B] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <h2 className="text-base font-semibold text-white">Pilih Ikon</h2>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-5 py-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  placeholder="Cari ikon..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#FBBF24]/40"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-5 pb-4">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-white/40 text-sm">Ikon tidak ditemukan</p>
                </div>
              ) : (
                <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
                  {filtered.map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => {
                        onChange(name);
                        setOpen(false);
                      }}
                      className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${
                        value === name
                          ? "bg-[#FBBF24]/20 border-[#FBBF24]/40 text-[#FBBF24]"
                          : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
                      }`}
                      title={name}
                    >
                      <span className="text-[10px] leading-tight text-center truncate w-full">
                        {name}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
