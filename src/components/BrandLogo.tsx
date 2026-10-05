import React from 'react';

interface BrandLogoProps {
  storeName?: string;
  customLogoUrl?: string;
  theme?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  className?: string;
}

/**
 * Bespoke Architectural Brand Identity for ISTAFA PRINTING.
 * Combines a geometric folded-sheet precision monogram ("IP") with balanced typography.
 */
export const BrandLogo: React.FC<BrandLogoProps> = ({
  storeName = 'ISTAFA PRINTING',
  customLogoUrl,
  theme = 'light',
  size = 'md',
  showSubtitle = false,
  className = '',
}) => {
  // Use custom uploaded logo only if admin uploaded a distinct photo/logo (not the legacy default SVG)
  const hasCustomUploadedLogo =
    Boolean(customLogoUrl) &&
    !customLogoUrl?.includes('CMYK Accent Bars') &&
    !customLogoUrl?.includes('istafa-architectural-mark');

  const sizeConfig = {
    sm: {
      box: 'w-8 h-8 rounded-lg',
      svg: 'w-8 h-8',
      title: 'text-[15px]',
      sub: 'text-[10px]',
      gap: 'gap-2.5',
    },
    md: {
      box: 'w-9 h-9 rounded-lg',
      svg: 'w-9 h-9',
      title: 'text-[17px]',
      sub: 'text-[10.5px]',
      gap: 'gap-3',
    },
    lg: {
      box: 'w-11 h-11 rounded-xl',
      svg: 'w-11 h-11',
      title: 'text-xl',
      sub: 'text-[11px]',
      gap: 'gap-3.5',
    },
  }[size];

  const isDarkBg = theme === 'dark';

  // Split "ISTAFA PRINTING" into primary & secondary wordmark parts for refined typographic contrast
  const trimmed = (storeName || 'ISTAFA PRINTING').trim();
  const parts = trimmed.split(/\s+/);
  const primaryWord = parts[0] || 'ISTAFA';
  const secondaryWords = parts.slice(1).join(' ');

  return (
    <span
      className={`inline-flex items-center ${sizeConfig.gap} select-none group ${className}`}
    >
      {hasCustomUploadedLogo ? (
        <span
          className={`${sizeConfig.box} overflow-hidden shrink-0 border ${
            isDarkBg ? 'border-neutral-800 bg-neutral-900' : 'border-neutral-200 bg-white'
          }`}
        >
          <img
            src={customLogoUrl}
            alt={trimmed}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </span>
      ) : (
        <svg
          viewBox="0 0 44 44"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`${sizeConfig.svg} shrink-0 transition-transform duration-300 group-hover:scale-[1.03]`}
          aria-hidden="true"
        >
          {/* Base Architectural Square */}
          <rect
            width="44"
            height="44"
            rx="10"
            fill={isDarkBg ? '#1C1B1A' : '#141413'}
          />
          <rect
            x="0.75"
            y="0.75"
            width="42.5"
            height="42.5"
            rx="9.25"
            stroke={isDarkBg ? '#33312E' : '#292826'}
            strokeWidth="1.5"
          />

          {/* Left Precision Spine ("I" pillar in Warm Bronze) */}
          <rect x="11" y="11" width="5.5" height="22" rx="1.5" fill="#C59B5F" />

          {/* Geometric Folded Sheet ("P" form in Crisp Ivory) */}
          <path
            d="M19.5 11H27.5C31.0899 11 34 13.9101 34 17.5C34 21.0899 31.0899 24 27.5 24H25V33H19.5V11ZM25 15.5V19.5H27.2C28.3046 19.5 29.2 18.6046 29.2 17.5C29.2 16.3954 28.3046 15.5 27.2 15.5H25Z"
            fill="#FAF9F6"
          />

          {/* Subtle Precision Registration Corner Accent */}
          <path
            d="M28.5 27.5L33.5 32.5H28.5V27.5Z"
            fill="#C59B5F"
            fillOpacity="0.85"
          />
        </svg>
      )}

      <span className="flex flex-col justify-center leading-none">
        <span
          className={`font-display tracking-[-0.02em] ${sizeConfig.title} whitespace-nowrap ${
            isDarkBg ? 'text-[#FAF9F6]' : 'text-[#141413]'
          }`}
        >
          <span className="font-bold">{primaryWord}</span>
          {secondaryWords && (
            <span
              className={`font-medium ml-1.5 ${
                isDarkBg ? 'text-neutral-300' : 'text-neutral-600'
              }`}
            >
              {secondaryWords}
            </span>
          )}
        </span>
        {showSubtitle && (
          <span
            className={`mt-1 font-normal tracking-[0.04em] ${sizeConfig.sub} ${
              isDarkBg ? 'text-neutral-400' : 'text-neutral-500'
            }`}
          >
            Print & Custom Studio
          </span>
        )}
      </span>
    </span>
  );
};
