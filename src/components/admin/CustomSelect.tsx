"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, Search, X } from "lucide-react";
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  size,
} from "@floating-ui/react-dom";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
}

interface CustomSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
  triggerClassName?: string;
  disabled?: boolean;
  showSearch?: boolean;
  error?: string;
}

export function CustomSelect({
  options,
  value,
  onChange,
  placeholder = "Pilih...",
  searchPlaceholder = "Cari...",
  emptyMessage = "Tidak ada data",
  className,
  triggerClassName,
  disabled = false,
  showSearch = true,
  error,
}: CustomSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [mounted, setMounted] = React.useState(false);

  const { refs, floatingStyles, x, y, update } = useFloating({
    open,
    placement: "bottom-start",
    strategy: "fixed",
    middleware: [
      offset(8),
      flip({ fallbackAxisSideDirection: "start" }),
      shift(),
      size({
        apply({ rects, availableHeight, elements }) {
          Object.assign(elements.floating.style, {
            width: `${rects.reference.width}px`,
            maxHeight: `${Math.min(280, availableHeight)}px`,
          });
        },
      }),
    ],
    whileElementsMounted: autoUpdate,
  });

  const positionReady = x !== null && y !== null;

  const selectedOption = options.find((o) => o.value === value);

  const filteredOptions = React.useMemo(() => {
    if (!search) return options;
    const q = search.toLowerCase();
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        (o.description && o.description.toLowerCase().includes(q))
    );
  }, [options, search]);

  const close = React.useCallback(() => {
    setOpen(false);
    setSearch("");
  }, []);

  React.useEffect(() => {
    if (!open) setSearch("");
  }, [open]);

  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    if (open) document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, close]);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={className}>
        <button
          type="button"
          disabled
          className={cn(
            "flex w-full items-center justify-between gap-2 rounded-2xl border px-4 text-sm transition-all duration-200",
            "bg-[#1E293B] border-[#334155] text-white/40",
            "h-14",
            triggerClassName
          )}
        >
          <span className="truncate">{placeholder}</span>
          <ChevronDown className="w-4 h-4 text-white/40 shrink-0" />
        </button>
      </div>
    );
  }

  return (
    <div className={className}>
      <button
        ref={refs.setReference}
        type="button"
        onClick={() => { if (!disabled) setOpen((p) => !p); }}
        disabled={disabled}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-2xl border px-4 text-sm transition-all duration-200",
          "bg-[#1E293B] border-[#334155] text-white",
          error ? "border-red-500" : "",
          "h-14",
          "hover:border-white/20",
          "focus:outline-none focus:ring-2 focus:ring-[#FBBF24]/40",
          disabled && "opacity-50 cursor-not-allowed",
          open && "border-[#FBBF24]/40 ring-1 ring-[#FBBF24]/20",
          triggerClassName
        )}
      >
        <span className={cn("truncate", !selectedOption && "text-white/40")}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-white/40 shrink-0 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      {open && createPortal(
        <>
          <div className="fixed inset-0 z-[9998]" onClick={close} />
          <div
            ref={refs.setFloating}
            style={{
              ...floatingStyles,
              opacity: positionReady ? 1 : 0,
              visibility: positionReady ? "visible" : "hidden",
              transition: "opacity 0.15s ease-out",
              pointerEvents: positionReady ? "auto" : "none",
            }}
            className="z-[9999]"
          >
            <div
              style={{
                transform: positionReady ? "translateY(0)" : "translateY(-8px)",
                transition: "transform 0.15s ease-out",
              }}
            >
              <div className="bg-[#1E293B] border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/40 overflow-hidden">
                {showSearch && options.length > 5 && (
                  <div className="relative p-2 pb-0">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder={searchPlaceholder}
                      className="w-full h-10 pl-9 pr-8 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-[#FBBF24]/30"
                      autoFocus
                    />
                    {search && (
                      <button
                        type="button"
                        onClick={() => setSearch("")}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-white/5 text-white/30 hover:text-white transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}

                <div className="overflow-y-auto max-h-[280px] p-2">
                  {filteredOptions.length === 0 ? (
                    <div className="py-6 text-center text-sm text-white/30">
                      {emptyMessage}
                    </div>
                  ) : (
                    <div className="space-y-0.5">
                      {filteredOptions.map((option) => {
                        const isSelected = option.value === value;
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                              onChange(option.value);
                              close();
                            }}
                            className={cn(
                              "w-full flex items-start gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150 cursor-pointer",
                              isSelected
                                ? "bg-[rgba(251,191,36,0.15)] border border-[#FBBF24] text-[#FBBF24]"
                                : "text-white/80 border border-transparent hover:bg-[rgba(251,191,36,0.12)] hover:border-[rgba(251,191,36,0.4)]"
                            )}
                          >
                            <div className="flex-1 min-w-0">
                              <div
                                className={cn(
                                  "text-sm font-medium truncate",
                                  isSelected && "text-[#FBBF24]"
                                )}
                              >
                                {option.label}
                              </div>
                              {option.description && (
                                <div className="text-xs text-white/40 truncate mt-0.5">
                                  {option.description}
                                </div>
                              )}
                            </div>
                            {isSelected && (
                              <Check className="w-4 h-4 text-[#FBBF24] shrink-0 mt-0.5" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
