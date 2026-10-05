import React from 'react';
import { Printer, X } from 'lucide-react';

interface PrintingLoaderProps {
  storeName?: string;
  onSkip: () => void;
}

/**
 * Non-blocking studio welcome toast so the main website preview is NEVER covered or blank on initial load.
 */
export const PrintingLoader: React.FC<PrintingLoaderProps> = ({
  storeName = 'ISTAFA PRINTING',
  onSkip,
}) => {
  return (
    <div
      className="fixed bottom-4 left-4 z-40 max-w-xs bg-slate-950/95 text-white border border-slate-700 rounded-2xl p-3.5 shadow-2xl flex items-center gap-3 select-none backdrop-blur-md"
      role="status"
      aria-label="Memuat ISTAFA PRINTING"
    >
      <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center shrink-0 text-amber-400">
        <Printer className="w-4 h-4 animate-pulse" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
          <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          <span className="font-display font-bold text-xs text-white truncate ml-1">
            {storeName}
          </span>
        </div>
        <p className="text-[11px] text-slate-300 truncate mt-0.5">
          Katalog & sistem siap digunakan
        </p>
      </div>
      <button
        type="button"
        onClick={onSkip}
        className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
        aria-label="Tutup indikator"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
