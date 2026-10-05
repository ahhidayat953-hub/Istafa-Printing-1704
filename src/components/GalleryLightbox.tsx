import React, { useEffect, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { SmartImage } from '../utils/imageUtils';

interface GalleryLightboxProps {
  images: string[];
  initialIndex?: number;
  title: string;
  subtitle?: string;
  onClose: () => void;
}

export const GalleryLightbox: React.FC<GalleryLightboxProps> = ({
  images,
  initialIndex = 0,
  title,
  subtitle,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(
    Math.min(Math.max(0, initialIndex), Math.max(0, images.length - 1))
  );
  const [zoomed, setZoomed] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const safeImages = images.length > 0 ? images : [''];

  const handlePrev = () => {
    setZoomed(false);
    setCurrentIndex((prev) => (prev === 0 ? safeImages.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setZoomed(false);
    setCurrentIndex((prev) => (prev === safeImages.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [safeImages.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(deltaX) > 45) {
      if (deltaX > 0) handlePrev();
      else handleNext();
    }
    setTouchStartX(null);
  };

  return (
    <div
      className="fixed inset-0 z-[90] bg-slate-950/95 backdrop-blur-md flex flex-col justify-between p-4 md:p-6 select-none"
      role="dialog"
      aria-modal="true"
      aria-label={`Galeri Foto ${title}`}
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-4 text-white z-10">
        <div className="min-w-0">
          <h3 className="font-display font-bold text-base md:text-lg truncate">
            {title}
          </h3>
          <p className="text-xs text-slate-400 truncate font-mono tabular-nums">
            Foto {currentIndex + 1} dari {safeImages.length}
            {subtitle ? ` · ${subtitle}` : ''}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setZoomed((z) => !z)}
            className="px-3 py-2 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            title={zoomed ? 'Perkecil' : 'Perbesar'}
          >
            {zoomed ? (
              <>
                <ZoomOut className="w-4 h-4" />
                <span className="hidden sm:inline">1x</span>
              </>
            ) : (
              <>
                <ZoomIn className="w-4 h-4" />
                <span className="hidden sm:inline">Perbesar</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800/90 hover:bg-rose-600 text-white transition-colors cursor-pointer"
            aria-label="Tutup galeri"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Image Viewport with Swipe */}
      <div
        className="relative flex-1 flex items-center justify-center overflow-hidden my-3"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {safeImages.length > 1 && (
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-2 md:left-6 z-20 w-11 h-11 rounded-full bg-slate-900/80 hover:bg-amber-500 text-white border border-slate-700 flex items-center justify-center transition-colors shadow-lg cursor-pointer"
            aria-label="Foto sebelumnya"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        <div
          onClick={() => setZoomed((z) => !z)}
          className={`transition-transform duration-200 cursor-zoom-in max-h-[70vh] max-w-4xl w-full flex items-center justify-center ${
            zoomed ? 'scale-125 md:scale-150 cursor-zoom-out' : 'scale-100'
          }`}
        >
          <SmartImage
            src={safeImages[currentIndex]}
            alt={`${title} - Foto ${currentIndex + 1}`}
            fallbackTitle={title}
            className="max-h-[68vh] w-auto max-w-full object-contain rounded-xl shadow-2xl border border-slate-800"
          />
        </div>

        {safeImages.length > 1 && (
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-2 md:right-6 z-20 w-11 h-11 rounded-full bg-slate-900/80 hover:bg-amber-500 text-white border border-slate-700 flex items-center justify-center transition-colors shadow-lg cursor-pointer"
            aria-label="Foto berikutnya"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Thumbnail Strip */}
      {safeImages.length > 1 && (
        <div className="flex items-center justify-center gap-2.5 overflow-x-auto py-2 px-2">
          {safeImages.map((imgUrl, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setZoomed(false);
                setCurrentIndex(idx);
              }}
              className={`relative w-16 h-14 md:w-20 md:h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                idx === currentIndex
                  ? 'border-amber-500 scale-105 shadow-md'
                  : 'border-slate-700 opacity-60 hover:opacity-100'
              }`}
            >
              <SmartImage
                src={imgUrl}
                alt={`Thumbnail ${idx + 1}`}
                fallbackTitle={`${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
