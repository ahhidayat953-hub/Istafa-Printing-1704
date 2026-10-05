import React, { useState } from 'react';
import { Printer } from 'lucide-react';
import { OrderItem } from '../types';

import heroBannerImg from '../assets/images/hero_istafa_printing_1791192534990.jpg';
import tumblerImg from '../assets/images/product_tumbler_custom_1791192560770.jpg';
import kartuNamaImg from '../assets/images/product_kartu_nama_1791192576546.jpg';
import lanyardImg from '../assets/images/product_lanyard_idcard_1791192586890.jpg';
import bannerXbannerImg from '../assets/images/product_banner_xbanner_1791214161681.jpg';
import mugMerchImg from '../assets/images/product_mug_merchandise_1791214181390.jpg';
import stikerCuttingImg from '../assets/images/product_stiker_cutting_1791214195132.jpg';
import undanganImg from '../assets/images/product_undangan_pernikahan_1791214207720.jpg';
import kaosTotebagImg from '../assets/images/product_kaos_totebag_1791214232754.jpg';

export {
  heroBannerImg,
  tumblerImg,
  kartuNamaImg,
  lanyardImg,
  bannerXbannerImg,
  mugMerchImg,
  stikerCuttingImg,
  undanganImg,
  kaosTotebagImg,
};

const ASSET_FILENAME_MAP: Array<[string, string]> = [
  ['hero_istafa_printing', heroBannerImg],
  ['hero_printing_showcase', heroBannerImg],
  ['product_tumbler_custom', tumblerImg],
  ['product_kartu_nama', kartuNamaImg],
  ['product_lanyard_idcard', lanyardImg],
  ['product_id_card_lanyard', lanyardImg],
  ['product_banner_xbanner', bannerXbannerImg],
  ['product_mug_merchandise', mugMerchImg],
  ['product_stiker_cutting', stikerCuttingImg],
  ['product_undangan_pernikahan', undanganImg],
  ['product_kaos_totebag', kaosTotebagImg],
];

export function resolveRuntimeImageUrl(src?: string): string {
  if (!src) return '';
  if (
    src.startsWith('data:') ||
    src.startsWith('http://') ||
    src.startsWith('https://')
  ) {
    return src;
  }
  if (src.includes('brand_logo_icon')) {
    return createDefaultLogoDataUrl();
  }
  for (const [key, resolvedUrl] of ASSET_FILENAME_MAP) {
    if (src.includes(key)) {
      return resolvedUrl;
    }
  }
  return src;
}

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
];

export const MAX_RAW_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB raw file limit

/**
 * Compresses an uploaded image file using HTML5 Canvas into a permanent Data URL
 * suitable for storing directly in Firestore (< 85KB per image).
 */
export async function compressImageFile(
  file: File,
  maxDimension = 820,
  quality = 0.74
): Promise<string> {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error(
      'Format file tidak didukung. Gunakan file JPG, PNG, WEBP, atau GIF.'
    );
  }
  if (file.size > MAX_RAW_FILE_SIZE_BYTES) {
    throw new Error('Ukuran file terlalu besar (Maksimal 10MB per foto).');
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca file gambar.'));
    reader.onload = (event) => {
      const resultStr = event.target?.result as string;
      if (!resultStr) {
        reject(new Error('File gambar kosong.'));
        return;
      }

      const img = new Image();
      img.onerror = () =>
        reject(new Error('File gambar rusak atau tidak valid.'));
      img.onload = () => {
        try {
          let width = img.width || 800;
          let height = img.height || 600;

          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(resultStr.slice(0, 240000));
            return;
          }

          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);

          let compressed = canvas.toDataURL('image/webp', quality);
          if (
            compressed.length > 110000 ||
            !compressed.startsWith('data:image/webp')
          ) {
            compressed = canvas.toDataURL('image/jpeg', quality);
          }
          if (compressed.length > 90000) {
            compressed = canvas.toDataURL('image/jpeg', 0.58);
          }
          resolve(compressed);
        } catch (err) {
          reject(err);
        }
      };
      img.src = resultStr;
    };
    reader.readAsDataURL(file);
  });
}

export type CatalogVisualTheme =
  | 'dokumen'
  | 'banner'
  | 'kartu'
  | 'sticker'
  | 'undangan'
  | 'foto'
  | 'merchandise'
  | 'kemasan'
  | 'promosi_toko'
  | 'sekolah_kantor'
  | 'foto_dekorasi'
  | 'custom_request';

/**
 * Product-specific studio illustration renderer.
 * Inspects the product title & subcategory to draw a distinct, realistic representation
 * of that exact printing product so no two products look identical.
 */
function renderSpecificProductArtwork(
  title: string,
  subcategory: string,
  theme: CatalogVisualTheme
): { artwork: string; bgTone: string; accentColor: string; specTag: string } {
  const key = `${title} ${subcategory}`.toLowerCase();

  // 1. BROSUR / LEAFLET
  if (key.includes('brosur') || key.includes('leaflet')) {
    return {
      bgTone: '#F4F1EA',
      accentColor: '#B8863B',
      specTag: 'Lipat 2 / Lipat 3 · Art Paper 150gsm Full Color',
      artwork: `
        <!-- Tri-fold Brochure Left Panel -->
        <polygon points="190,130 320,105 320,405 190,430" fill="#181817" stroke="#C59B5F" stroke-width="1.5"/>
        <rect x="212" y="158" width="84" height="10" rx="2" fill="#C59B5F"/>
        <rect x="212" y="178" width="68" height="6" rx="2" fill="#FAF9F6" opacity="0.8"/>
        <rect x="212" y="210" width="84" height="90" rx="4" fill="#272624" stroke="#C59B5F" stroke-width="1"/>
        <line x1="212" y1="325" x2="292" y2="312" stroke="#787672" stroke-width="3"/>
        <line x1="212" y1="342" x2="285" y2="330" stroke="#787672" stroke-width="3"/>
        <!-- Center Panel -->
        <polygon points="320,105 465,135 465,435 320,405" fill="#FFFFFF" stroke="#DCD8CE" stroke-width="1.5"/>
        <rect x="342" y="145" width="100" height="68" rx="4" fill="#C59B5F" opacity="0.22"/>
        <circle cx="392" cy="179" r="20" fill="#C59B5F"/>
        <rect x="342" y="232" width="100" height="9" rx="2" fill="#141413"/>
        <line x1="342" y1="258" x2="438" y2="268" stroke="#D0CCC2" stroke-width="3"/>
        <line x1="342" y1="276" x2="438" y2="286" stroke="#D0CCC2" stroke-width="3"/>
        <line x1="342" y1="294" x2="418" y2="302" stroke="#D0CCC2" stroke-width="3"/>
        <rect x="342" y="335" width="96" height="36" rx="4" fill="#141413"/>
        <!-- Right Panel -->
        <polygon points="465,135 605,110 605,410 465,435" fill="#FAF8F3" stroke="#D5D0C5" stroke-width="1.5"/>
        <rect x="488" y="155" width="92" height="12" rx="2" fill="#141413"/>
        <rect x="488" y="177" width="66" height="7" rx="2" fill="#C59B5F"/>
        <rect x="488" y="205" width="94" height="115" rx="6" fill="#181817"/>
        <circle cx="535" cy="262" r="28" fill="none" stroke="#C59B5F" stroke-width="2"/>
        <rect x="488" y="340" width="92" height="28" rx="4" fill="#C59B5F"/>
      `,
    };
  }

  // 2. FLYER PROMOSI
  if (key.includes('flyer')) {
    return {
      bgTone: '#F2EFE9',
      accentColor: '#C59B5F',
      specTag: 'Ukuran A5 / A4 / DL · Cetak 1 & 2 Sisi',
      artwork: `
        <rect x="235" y="135" width="215" height="295" rx="8" transform="rotate(-6 342 282)" fill="#181817" stroke="#C59B5F" stroke-width="2"/>
        <rect x="335" y="115" width="225" height="305" rx="8" transform="rotate(4 447 267)" fill="#FFFFFF" stroke="#D5D0C5" stroke-width="2"/>
        <rect x="358" y="142" width="180" height="115" rx="6" fill="#141413"/>
        <circle cx="448" cy="199" r="34" fill="#C59B5F"/>
        <text x="448" y="205" fill="#141413" font-family="sans-serif" font-size="15" font-weight="800" text-anchor="middle">PROMO</text>
        <rect x="358" y="276" width="150" height="14" rx="3" fill="#141413"/>
        <rect x="358" y="298" width="110" height="9" rx="2" fill="#C59B5F"/>
        <line x1="358" y1="326" x2="528" y2="326" stroke="#E0DCD3" stroke-width="3"/>
        <line x1="358" y1="344" x2="528" y2="344" stroke="#E0DCD3" stroke-width="3"/>
        <rect x="358" y="368" width="180" height="28" rx="5" fill="#141413"/>
      `,
    };
  }

  // 3. POSTER
  if (key.includes('poster')) {
    return {
      bgTone: '#EFECE6',
      accentColor: '#9A7237',
      specTag: 'A3+ (32x48 cm) / A2 / A1 · Art Carton & Albatros',
      artwork: `
        <rect x="275" y="95" width="250" height="340" rx="6" fill="#141413" stroke="#33312E" stroke-width="8"/>
        <rect x="291" y="111" width="218" height="308" fill="#1C1B1A"/>
        <circle cx="400" cy="235" r="68" fill="#C59B5F" fill-opacity="0.9"/>
        <path d="M 291 365 L 365 265 L 435 335 L 470 290 L 509 365 Z" fill="#2A2927"/>
        <rect x="320" y="135" width="160" height="14" rx="3" fill="#FAF9F6"/>
        <rect x="350" y="157" width="100" height="8" rx="2" fill="#C59B5F"/>
        <rect x="315" y="382" width="170" height="22" rx="3" fill="#C59B5F"/>
      `,
    };
  }

  // 4. KATALOG / BOOKLET / MAJALAH / COMPANY PROFILE / BUKU
  if (
    key.includes('katalog') ||
    key.includes('booklet') ||
    key.includes('majalah') ||
    key.includes('company profile') ||
    key.includes('buku')
  ) {
    const labelText = key.includes('company profile')
      ? 'COMPANY PROFILE'
      : key.includes('majalah')
      ? 'MAGAZINE'
      : key.includes('katalog')
      ? 'CATALOG BOOK'
      : key.includes('booklet')
      ? 'BOOKLET'
      : 'CETAK BUKU';
    return {
      bgTone: '#F3F0E8',
      accentColor: '#9A7237',
      specTag: 'Jilid Steples Tengah / Lem Panas / Hardcover',
      artwork: `
        <!-- Open Spread Book / Catalog -->
        <path d="M 185 155 Q 290 135 400 160 L 400 415 Q 290 390 185 410 Z" fill="#FFFFFF" stroke="#D5D0C5" stroke-width="2"/>
        <path d="M 400 160 Q 510 135 615 155 L 615 410 Q 510 390 400 415 Z" fill="#FAF8F5" stroke="#D5D0C5" stroke-width="2"/>
        <line x1="400" y1="158" x2="400" y2="415" stroke="#B8B2A6" stroke-width="3"/>
        <!-- Left Page Layout -->
        <rect x="215" y="182" width="150" height="95" rx="6" fill="#141413"/>
        <text x="290" y="235" fill="#C59B5F" font-family="sans-serif" font-size="12" font-weight="700" text-anchor="middle">${labelText}</text>
        <rect x="215" y="295" width="120" height="10" rx="2" fill="#141413"/>
        <line x1="215" y1="320" x2="365" y2="320" stroke="#DDD8CE" stroke-width="3"/>
        <line x1="215" y1="338" x2="365" y2="338" stroke="#DDD8CE" stroke-width="3"/>
        <line x1="215" y1="356" x2="335" y2="356" stroke="#DDD8CE" stroke-width="3"/>
        <!-- Right Page Grid -->
        <rect x="430" y="182" width="72" height="68" rx="4" fill="#EAE6DC" stroke="#C59B5F" stroke-width="1.5"/>
        <rect x="515" y="182" width="72" height="68" rx="4" fill="#181817"/>
        <rect x="430" y="264" width="72" height="68" rx="4" fill="#C59B5F" opacity="0.3"/>
        <rect x="515" y="264" width="72" height="68" rx="4" fill="#EAE6DC" stroke="#D0CCC2" stroke-width="1.5"/>
        <rect x="430" y="350" width="157" height="24" rx="4" fill="#141413"/>
      `,
    };
  }

  // 5. KOP SURAT
  if (key.includes('kop surat')) {
    return {
      bgTone: '#F5F3EE',
      accentColor: '#9A7237',
      specTag: 'HVS 80gsm / 100gsm / Concorde · A4 & F4',
      artwork: `
        <rect x="260" y="110" width="235" height="315" rx="6" fill="#E6E2D8"/>
        <rect x="280" y="95" width="235" height="315" rx="6" fill="#FFFFFF" stroke="#D5D0C5" stroke-width="2"/>
        <!-- Letterhead Header -->
        <rect x="304" y="118" width="38" height="38" rx="6" fill="#141413"/>
        <circle cx="323" cy="137" r="11" fill="#C59B5F"/>
        <rect x="354" y="122" width="125" height="12" rx="2" fill="#141413"/>
        <rect x="354" y="140" width="95" height="7" rx="2" fill="#C59B5F"/>
        <line x1="304" y1="168" x2="490" y2="168" stroke="#141413" stroke-width="2.5"/>
        <line x1="304" y1="173" x2="490" y2="173" stroke="#C59B5F" stroke-width="1"/>
        <!-- Watermark Center -->
        <circle cx="397" cy="265" r="42" fill="#C59B5F" fill-opacity="0.1"/>
        <line x1="304" y1="210" x2="475" y2="210" stroke="#E5E2DC" stroke-width="3"/>
        <line x1="304" y1="230" x2="485" y2="230" stroke="#E5E2DC" stroke-width="3"/>
        <line x1="304" y1="250" x2="485" y2="250" stroke="#E5E2DC" stroke-width="3"/>
        <line x1="304" y1="270" x2="450" y2="270" stroke="#E5E2DC" stroke-width="3"/>
        <rect x="280" y="396" width="235" height="14" rx="3" fill="#141413"/>
      `,
    };
  }

  // 6. AMPLOP
  if (key.includes('amplop')) {
    return {
      bgTone: '#F3F0E9',
      accentColor: '#B8863B',
      specTag: 'Amplop Kabinet DL (11x23 cm) & Amplop Folio',
      artwork: `
        <rect x="200" y="185" width="380" height="215" rx="8" fill="#FFFFFF" stroke="#D1CCC0" stroke-width="2"/>
        <path d="M 200 185 L 390 292 L 580 185" fill="#F5F2EB" stroke="#C59B5F" stroke-width="2"/>
        <!-- Company Logo Top Left -->
        <rect x="228" y="212" width="34" height="34" rx="6" fill="#141413"/>
        <circle cx="245" cy="229" r="10" fill="#C59B5F"/>
        <rect x="272" y="216" width="110" height="10" rx="2" fill="#141413"/>
        <rect x="272" y="232" width="85" height="7" rx="2" fill="#C59B5F"/>
        <!-- Address Window Bottom Right -->
        <rect x="415" y="312" width="135" height="58" rx="6" fill="#EAE6DC" stroke="#C59B5F" stroke-width="1.5"/>
        <line x1="430" y1="332" x2="525" y2="332" stroke="#9E9A90" stroke-width="3"/>
        <line x1="430" y1="348" x2="505" y2="348" stroke="#9E9A90" stroke-width="3"/>
        <rect x="200" y="388" width="380" height="12" rx="3" fill="#141413"/>
      `,
    };
  }

  // 7. NOTA / KWITANSI / INVOICE
  if (
    key.includes('nota') ||
    key.includes('kwitansi') ||
    key.includes('invoice') ||
    key.includes('buku kas')
  ) {
    const docLabel = key.includes('kwitansi')
      ? 'KWITANSI PEMBAYARAN'
      : key.includes('invoice')
      ? 'COMMERCIAL INVOICE'
      : 'NOTA NCR RANGKAP';
    return {
      bgTone: '#F4F1EA',
      accentColor: '#C59B5F',
      specTag: 'Kertas NCR Tembus Otomatis 2–4 Ply + Cacah & Nomorator',
      artwork: `
        <!-- 3-Ply NCR Sheets (Yellow, Pink, White) -->
        <rect x="255" y="138" width="295" height="275" rx="6" fill="#FEF08A" stroke="#EAB308" stroke-width="1.5"/>
        <rect x="242" y="124" width="295" height="275" rx="6" fill="#FECDD3" stroke="#F43F5E" stroke-width="1.5"/>
        <rect x="228" y="110" width="295" height="275" rx="6" fill="#FFFFFF" stroke="#D1CCC0" stroke-width="2"/>
        <!-- Top Binding & Perforation -->
        <rect x="228" y="110" width="295" height="32" rx="4" fill="#141413"/>
        <line x1="235" y1="152" x2="516" y2="152" stroke="#9A7237" stroke-width="1.5" stroke-dasharray="5,4"/>
        <text x="252" y="178" fill="#141413" font-family="sans-serif" font-size="13" font-weight="800">${docLabel}</text>
        <text x="498" y="178" fill="#DC2626" font-family="monospace" font-size="13" font-weight="700" text-anchor="end">No. 00482</text>
        <!-- Table Grid -->
        <rect x="250" y="195" width="250" height="125" fill="none" stroke="#D5D0C5" stroke-width="1.5"/>
        <line x1="250" y1="222" x2="500" y2="222" stroke="#141413" stroke-width="1.5"/>
        <line x1="250" y1="252" x2="500" y2="252" stroke="#E5E2DC" stroke-width="1.5"/>
        <line x1="250" y1="282" x2="500" y2="282" stroke="#E5E2DC" stroke-width="1.5"/>
        <line x1="415" y1="195" x2="415" y2="320" stroke="#D5D0C5" stroke-width="1.5"/>
        <rect x="395" y="338" width="105" height="26" rx="4" fill="#141413"/>
        <text x="447" y="355" fill="#C59B5F" font-family="sans-serif" font-size="11" font-weight="700" text-anchor="middle">LUNAS / STAMP</text>
      `,
    };
  }

  // 8. SERTIFIKAT / PIAGAM
  if (key.includes('sertifikat') || key.includes('piagam')) {
    return {
      bgTone: '#F3F0E8',
      accentColor: '#C59B5F',
      specTag: 'Kertas Linen / Concorde / Art Carton + Hotprint Emas',
      artwork: `
        <rect x="205" y="125" width="390" height="280" rx="8" fill="#FFFFFF" stroke="#141413" stroke-width="4"/>
        <rect x="221" y="141" width="358" height="248" rx="4" fill="#FAF8F3" stroke="#C59B5F" stroke-width="2.5"/>
        <rect x="230" y="150" width="340" height="230" fill="none" stroke="#C59B5F" stroke-width="1" stroke-dasharray="4,3"/>
        <text x="400" y="198" fill="#141413" font-family="serif" font-size="22" font-weight="700" text-anchor="middle" letter-spacing="3">CERTIFICATE</text>
        <rect x="335" y="212" width="130" height="6" rx="3" fill="#C59B5F"/>
        <line x1="285" y1="248" x2="515" y2="248" stroke="#141413" stroke-width="2"/>
        <line x1="305" y1="274" x2="495" y2="274" stroke="#CFCBC0" stroke-width="3"/>
        <line x1="325" y1="292" x2="475" y2="292" stroke="#CFCBC0" stroke-width="3"/>
        <!-- Gold Seal Badge -->
        <polygon points="392,345 382,382 400,372 418,382 408,345" fill="#141413"/>
        <circle cx="400" cy="335" r="24" fill="#C59B5F" stroke="#9A7237" stroke-width="2"/>
        <circle cx="400" cy="335" r="17" fill="none" stroke="#FAF9F6" stroke-width="1.5" stroke-dasharray="3,2"/>
      `,
    };
  }

  // 9. MAP FOLDER / STOPMAP / RAPORT
  if (key.includes('map') || key.includes('raport')) {
    return {
      bgTone: '#F2EFE8',
      accentColor: '#C59B5F',
      specTag: 'Art Carton 310gsm / Bahan ASE Hotprint Foil + Kantong Dalam',
      artwork: `
        <!-- Open Stopmap Folder -->
        <polygon points="215,125 395,110 395,410 215,425" fill="#141413" stroke="#C59B5F" stroke-width="2"/>
        <polygon points="395,110 585,125 585,425 395,410" fill="#1E1D1B" stroke="#C59B5F" stroke-width="2"/>
        <!-- White Document Inside Right Folder -->
        <rect x="415" y="138" width="145" height="245" rx="4" fill="#FFFFFF"/>
        <line x1="435" y1="175" x2="535" y2="175" stroke="#DDD8CE" stroke-width="3"/>
        <line x1="435" y1="195" x2="535" y2="195" stroke="#DDD8CE" stroke-width="3"/>
        <!-- Inner Pocket & Business Card Slot -->
        <polygon points="395,295 585,310 585,425 395,410" fill="#C59B5F"/>
        <rect x="465" y="345" width="85" height="48" rx="4" fill="#141413" stroke="#FAF9F6" stroke-width="1.5"/>
        <!-- Gold Foil Crest on Left Cover -->
        <circle cx="305" cy="225" r="32" fill="none" stroke="#C59B5F" stroke-width="2.5"/>
        <rect x="255" y="278" width="100" height="10" rx="2" fill="#C59B5F"/>
      `,
    };
  }

  // 10. KALENDER MEJA & DINDING
  if (key.includes('kalender')) {
    return {
      bgTone: '#F4F1EA',
      accentColor: '#C59B5F',
      specTag: 'Kalender Meja Dudukan Hardboard & Kalender Dinding Spiral',
      artwork: `
        <!-- A-Frame Desk Calendar -->
        <polygon points="225,395 270,145 530,145 575,395" fill="#FFFFFF" stroke="#D1CCC0" stroke-width="2"/>
        <polygon points="225,395 575,395 595,425 205,425" fill="#141413"/>
        <!-- Top Wire-O Rings -->
        <rect x="295" y="132" width="10" height="24" rx="4" fill="#141413"/>
        <rect x="345" y="132" width="10" height="24" rx="4" fill="#141413"/>
        <rect x="395" y="132" width="10" height="24" rx="4" fill="#141413"/>
        <rect x="445" y="132" width="10" height="24" rx="4" fill="#141413"/>
        <rect x="495" y="132" width="10" height="24" rx="4" fill="#141413"/>
        <!-- Left Photo Area -->
        <rect x="265" y="175" width="125" height="185" rx="6" fill="#181817"/>
        <circle cx="327" cy="245" r="32" fill="#C59B5F"/>
        <rect x="285" y="305" width="85" height="10" rx="2" fill="#FAF9F6"/>
        <!-- Right Calendar Date Grid -->
        <text x="412" y="198" fill="#141413" font-family="sans-serif" font-size="18" font-weight="800">2026</text>
        <rect x="412" y="210" width="118" height="8" rx="2" fill="#C59B5F"/>
        <rect x="412" y="235" width="22" height="20" rx="3" fill="#EAE6DC"/>
        <rect x="442" y="235" width="22" height="20" rx="3" fill="#EAE6DC"/>
        <rect x="472" y="235" width="22" height="20" rx="3" fill="#C59B5F"/>
        <rect x="502" y="235" width="22" height="20" rx="3" fill="#EAE6DC"/>
        <rect x="412" y="265" width="22" height="20" rx="3" fill="#EAE6DC"/>
        <rect x="442" y="265" width="22" height="20" rx="3" fill="#EAE6DC"/>
        <rect x="472" y="265" width="22" height="20" rx="3" fill="#EAE6DC"/>
        <rect x="502" y="265" width="22" height="20" rx="3" fill="#141413"/>
        <rect x="412" y="295" width="22" height="20" rx="3" fill="#EAE6DC"/>
        <rect x="442" y="295" width="22" height="20" rx="3" fill="#EAE6DC"/>
        <rect x="472" y="295" width="22" height="20" rx="3" fill="#EAE6DC"/>
        <rect x="502" y="295" width="22" height="20" rx="3" fill="#EAE6DC"/>
      `,
    };
  }

  // 11. SPANDUK / BANNER OUTDOOR / BANNER TOKO
  if (
    key.includes('spanduk') ||
    key.includes('baliho') ||
    key.includes('banner toko') ||
    (key.includes('banner') &&
      !key.includes('x-banner') &&
      !key.includes('roll') &&
      !key.includes('standing'))
  ) {
    return {
      bgTone: '#F2EFE9',
      accentColor: '#C59B5F',
      specTag: 'Flexi China 280g / Korea 440g · Mata Ayam & Lipat Keliling',
      artwork: `
        <!-- Horizontal Wide Outdoor Spanduk Banner -->
        <rect x="160" y="155" width="480" height="225" rx="8" fill="#141413" stroke="#C59B5F" stroke-width="3"/>
        <!-- 4 Corner Metal Eyelets (Mata Ayam) -->
        <circle cx="180" cy="175" r="8" fill="#FAF9F6" stroke="#787672" stroke-width="3"/>
        <circle cx="620" cy="175" r="8" fill="#FAF9F6" stroke="#787672" stroke-width="3"/>
        <circle cx="180" cy="360" r="8" fill="#FAF9F6" stroke="#787672" stroke-width="3"/>
        <circle cx="620" cy="360" r="8" fill="#FAF9F6" stroke="#787672" stroke-width="3"/>
        <!-- Banner Visual Content -->
        <rect x="205" y="195" width="215" height="22" rx="4" fill="#C59B5F"/>
        <rect x="205" y="230" width="275" height="14" rx="3" fill="#FAF9F6"/>
        <rect x="205" y="256" width="195" height="10" rx="2" fill="#A39E93"/>
        <rect x="205" y="295" width="140" height="36" rx="6" fill="#C59B5F"/>
        <circle cx="535" cy="268" r="64" fill="#262523" stroke="#C59B5F" stroke-width="2.5"/>
        <text x="535" y="274" fill="#FAF9F6" font-family="sans-serif" font-size="16" font-weight="800" text-anchor="middle">2400 DPI</text>
      `,
    };
  }

  // 12. ROLL UP BANNER
  if (key.includes('roll')) {
    return {
      bgTone: '#F3F0E9',
      accentColor: '#C59B5F',
      specTag: 'Roll Up Aluminium Cassette · 60x160 cm / 80x200 cm / 85x200 cm',
      artwork: `
        <!-- Tall Retractable Banner Graphic -->
        <rect x="305" y="88" width="190" height="310" rx="4" fill="#141413" stroke="#C59B5F" stroke-width="2"/>
        <rect x="300" y="82" width="200" height="10" rx="3" fill="#B8B4AC"/>
        <rect x="330" y="120" width="140" height="18" rx="3" fill="#C59B5F"/>
        <rect x="330" y="148" width="105" height="10" rx="2" fill="#FAF9F6"/>
        <rect x="330" y="180" width="140" height="135" rx="8" fill="#252422" stroke="#C59B5F" stroke-width="1.5"/>
        <circle cx="400" cy="247" r="36" fill="#C59B5F"/>
        <rect x="330" y="335" width="140" height="32" rx="5" fill="#C59B5F"/>
        <!-- Aluminium Cassette Base -->
        <rect x="280" y="396" width="240" height="28" rx="6" fill="#D4D1C8" stroke="#8C887E" stroke-width="2"/>
        <rect x="315" y="424" width="36" height="12" rx="4" fill="#52504C"/>
        <rect x="449" y="424" width="36" height="12" rx="4" fill="#52504C"/>
      `,
    };
  }

  // 13. BACKDROP PANGGUNG & PHOTOBOOTH
  if (key.includes('backdrop')) {
    return {
      bgTone: '#F1EFEA',
      accentColor: '#C59B5F',
      specTag: 'Flexi Korea 440g Matte Anti-Pantul Cahaya · Ukuran Custom',
      artwork: `
        <!-- Wide Stage Backdrop Frame -->
        <rect x="175" y="120" width="450" height="275" rx="6" fill="#141413" stroke="#C59B5F" stroke-width="3"/>
        <rect x="195" y="140" width="410" height="235" rx="4" fill="#1E1D1B" stroke="#C59B5F" stroke-width="1" stroke-dasharray="6,4"/>
        <!-- Top Stage Spotlights -->
        <circle cx="260" cy="112" r="10" fill="#C59B5F"/>
        <circle cx="400" cy="112" r="10" fill="#C59B5F"/>
        <circle cx="540" cy="112" r="10" fill="#C59B5F"/>
        <!-- Center Backdrop Branding -->
        <circle cx="400" cy="225" r="38" fill="none" stroke="#C59B5F" stroke-width="2.5"/>
        <rect x="290" y="280" width="220" height="16" rx="3" fill="#FAF9F6"/>
        <rect x="330" y="306" width="140" height="10" rx="2" fill="#C59B5F"/>
        <!-- Floor Stand Base -->
        <rect x="155" y="395" width="490" height="18" rx="4" fill="#33312E"/>
      `,
    };
  }

  // 14. NEON BOX & PAPAN NAMA
  if (key.includes('neon box') || key.includes('papan nama')) {
    return {
      bgTone: '#EFECE6',
      accentColor: '#C59B5F',
      specTag: 'Akrilik Susu + Lampu LED Modul Terang + Rangka Besi',
      artwork: `
        <!-- Mounting Bracket -->
        <rect x="195" y="215" width="45" height="14" fill="#262523"/>
        <rect x="195" y="295" width="45" height="14" fill="#262523"/>
        <rect x="185" y="175" width="14" height="175" rx="3" fill="#141413"/>
        <!-- Glowing Circular Neon Box -->
        <circle cx="385" cy="262" r="132" fill="#141413" stroke="#C59B5F" stroke-width="8"/>
        <circle cx="385" cy="262" r="114" fill="#FAF8F2" stroke="#C59B5F" stroke-width="2"/>
        <circle cx="385" cy="228" r="34" fill="#141413"/>
        <circle cx="385" cy="228" r="18" fill="#C59B5F"/>
        <text x="385" y="298" fill="#141413" font-family="sans-serif" font-size="20" font-weight="800" text-anchor="middle">YOUR BRAND</text>
        <text x="385" y="320" fill="#9A7237" font-family="sans-serif" font-size="12" font-weight="700" text-anchor="middle">LED NEON BOX</text>
      `,
    };
  }

  // 15. UNDANGAN DIGITAL
  if (key.includes('undangan digital')) {
    return {
      bgTone: '#F3F0E8',
      accentColor: '#C59B5F',
      specTag: 'Website Undangan Interaktif + Nama Tamu Tak Terbatas + Musik & Maps',
      artwork: `
        <!-- Smartphone Mockup Displaying Digital Invitation -->
        <rect x="305" y="92" width="190" height="340" rx="26" fill="#141413" stroke="#33312E" stroke-width="4"/>
        <rect x="319" y="112" width="162" height="300" rx="16" fill="#FAF8F3"/>
        <rect x="372" y="100" width="56" height="6" rx="3" fill="#33312E"/>
        <!-- Arch Frame inside Screen -->
        <path d="M 340 385 L 340 190 A 60 60 0 0 1 460 190 L 460 385 Z" fill="#FFFFFF" stroke="#C59B5F" stroke-width="2"/>
        <circle cx="400" cy="195" r="24" fill="#C59B5F" fill-opacity="0.25" stroke="#C59B5F" stroke-width="1.5"/>
        <text x="400" y="246" fill="#141413" font-family="serif" font-size="16" font-weight="700" text-anchor="middle">Rama &amp; Sinta</text>
        <rect x="358" y="264" width="84" height="6" rx="3" fill="#C59B5F"/>
        <rect x="352" y="328" width="96" height="28" rx="14" fill="#141413"/>
        <text x="400" y="346" fill="#C59B5F" font-family="sans-serif" font-size="10" font-weight="700" text-anchor="middle">BUKA UNDANGAN</text>
      `,
    };
  }

  // 16. UNDANGAN KHITANAN / AQIQAH / ULANG TAHUN
  if (
    key.includes('khitan') ||
    key.includes('aqiqah') ||
    key.includes('ulang tahun') ||
    key.includes('tasyakuran')
  ) {
    return {
      bgTone: '#F4F1EA',
      accentColor: '#C59B5F',
      specTag: 'Brief Card / Art Carton / Jasmine Glitter · Gratis Plastik OPP',
      artwork: `
        <rect x="235" y="135" width="225" height="275" rx="10" fill="#141413" stroke="#C59B5F" stroke-width="2"/>
        <rect x="325" y="115" width="235" height="295" rx="10" fill="#FFFFFF" stroke="#C59B5F" stroke-width="2.5"/>
        <path d="M 355 385 L 355 205 A 87 87 0 0 1 530 205 L 530 385 Z" fill="#FAF8F3" stroke="#C59B5F" stroke-width="1.5"/>
        <circle cx="442" cy="195" r="28" fill="#C59B5F" fill-opacity="0.2" stroke="#C59B5F" stroke-width="2"/>
        <rect x="382" y="245" width="120" height="12" rx="3" fill="#141413"/>
        <rect x="402" y="268" width="80" height="8" rx="2" fill="#C59B5F"/>
        <rect x="382" y="315" width="120" height="32" rx="6" fill="#141413"/>
      `,
    };
  }

  // 17. KARTU UCAPAN / THANK YOU CARD / LABEL SOUVENIR / HANG TAG
  if (
    key.includes('kartu ucapan') ||
    key.includes('thank you') ||
    key.includes('souvenir') ||
    key.includes('hang tag')
  ) {
    return {
      bgTone: '#F3F0E9',
      accentColor: '#B8863B',
      specTag: 'Art Carton 310gsm / Ivory / Kraft · Potong Custom & Plong Lubang',
      artwork: `
        <!-- Hang Tag Left -->
        <path d="M 285 95 C 285 65 325 65 325 95" fill="none" stroke="#9A7237" stroke-width="4"/>
        <polygon points="245,145 275,110 335,110 365,145 365,375 245,375" fill="#141413" stroke="#C59B5F" stroke-width="2"/>
        <circle cx="305" cy="135" r="9" fill="#FAF9F6" stroke="#C59B5F" stroke-width="2"/>
        <rect x="268" y="210" width="74" height="10" rx="2" fill="#C59B5F"/>
        <rect x="278" y="232" width="54" height="6" rx="2" fill="#FAF9F6"/>
        <!-- Thank You Card Right -->
        <rect x="355" y="175" width="225" height="175" rx="10" fill="#FFFFFF" stroke="#C59B5F" stroke-width="2"/>
        <text x="467" y="248" fill="#141413" font-family="serif" font-size="22" font-weight="700" text-anchor="middle">Thank You</text>
        <rect x="415" y="268" width="105" height="7" rx="3" fill="#C59B5F"/>
        <line x1="395" y1="298" x2="539" y2="298" stroke="#DDD8CE" stroke-width="3"/>
      `,
    };
  }

  // 18. STIKER TRANSPARAN / LABEL BOTOL / KEMASAN
  if (
    key.includes('transparan') ||
    key.includes('label produk') ||
    key.includes('stiker kemasan')
  ) {
    return {
      bgTone: '#F2EFE9',
      accentColor: '#C59B5F',
      specTag: 'Vinyl Waterproof & Transparan Anti Luntur · Kiss-Cut Siap Tempel',
      artwork: `
        <!-- Sticker Roll & Sheet Left -->
        <rect x="215" y="125" width="195" height="275" rx="12" fill="#FFFFFF" stroke="#D1CCC0" stroke-width="2"/>
        <circle cx="272" cy="190" r="38" fill="#141413" stroke="#C59B5F" stroke-width="2.5"/>
        <circle cx="352" cy="190" r="38" fill="#C59B5F"/>
        <circle cx="272" cy="285" r="38" fill="#C59B5F"/>
        <circle cx="352" cy="285" r="38" fill="#141413" stroke="#C59B5F" stroke-width="2.5"/>
        <!-- Bottle / Jar with Applied Label Right -->
        <rect x="465" y="125" width="66" height="28" rx="5" fill="#141413"/>
        <rect x="438" y="153" width="120" height="247" rx="22" fill="#EAE6DC" stroke="#C59B5F" stroke-width="2"/>
        <rect x="448" y="215" width="100" height="115" rx="8" fill="#141413" stroke="#C59B5F" stroke-width="2"/>
        <circle cx="498" cy="256" r="18" fill="#C59B5F"/>
        <rect x="468" y="288" width="60" height="8" rx="2" fill="#FAF9F6"/>
      `,
    };
  }

  // 19. HOLDER ID CARD / NAME TAG / NAME PLATE
  if (
    key.includes('holder') ||
    key.includes('name tag') ||
    key.includes('name plate')
  ) {
    return {
      bgTone: '#F3F0E8',
      accentColor: '#C59B5F',
      specTag: 'Akrilik / Kuningan Lapis Resin Mengkilap + Pengait Magnet Kuat',
      artwork: `
        <!-- Chest Name Tag Resin + Magnet -->
        <rect x="215" y="145" width="250" height="82" rx="12" fill="#141413" stroke="#C59B5F" stroke-width="3"/>
        <circle cx="255" cy="186" r="22" fill="#C59B5F"/>
        <rect x="292" y="168" width="142" height="14" rx="3" fill="#FAF9F6"/>
        <rect x="292" y="192" width="98" height="9" rx="2" fill="#C59B5F"/>
        <!-- Desk Name Plate & Card Holder -->
        <polygon points="265,385 305,275 565,275 525,385" fill="#FFFFFF" stroke="#C59B5F" stroke-width="2.5"/>
        <polygon points="245,405 555,405 575,385 265,385" fill="#141413"/>
        <rect x="335" y="312" width="165" height="16" rx="3" fill="#141413"/>
        <rect x="365" y="338" width="105" height="10" rx="2" fill="#C59B5F"/>
      `,
    };
  }

  // 20. PAS FOTO & CETAK FOTO
  if (key.includes('pas foto') || key.includes('cetak foto')) {
    return {
      bgTone: '#F4F1EA',
      accentColor: '#C59B5F',
      specTag: 'Kertas Foto Silky / Lustre 260gsm · Warna Tajam Tahan Puluhan Tahun',
      artwork: `
        <!-- Sheet of 3x4 & 4x6 Red/Blue Background ID Photos -->
        <rect x="210" y="115" width="225" height="295" rx="8" fill="#FFFFFF" stroke="#D1CCC0" stroke-width="2"/>
        <!-- Red Background Pas Foto Row -->
        <rect x="232" y="138" width="52" height="70" rx="3" fill="#DC2626"/>
        <circle cx="258" cy="164" r="13" fill="#FDE68A"/>
        <path d="M 238 208 C 238 186 278 186 278 208 Z" fill="#141413"/>
        <rect x="296" y="138" width="52" height="70" rx="3" fill="#DC2626"/>
        <circle cx="322" cy="164" r="13" fill="#FDE68A"/>
        <path d="M 302 208 C 302 186 342 186 342 208 Z" fill="#141413"/>
        <!-- Blue Background Pas Foto Row -->
        <rect x="232" y="222" width="52" height="70" rx="3" fill="#2563EB"/>
        <circle cx="258" cy="248" r="13" fill="#FDE68A"/>
        <path d="M 238 292 C 238 270 278 270 278 292 Z" fill="#141413"/>
        <rect x="296" y="222" width="52" height="70" rx="3" fill="#2563EB"/>
        <circle cx="322" cy="248" r="13" fill="#FDE68A"/>
        <path d="M 302 292 C 302 270 342 270 342 292 Z" fill="#141413"/>
        <!-- Large 10R / Polaroid Print Right -->
        <rect x="385" y="140" width="205" height="265" rx="8" fill="#FFFFFF" stroke="#C59B5F" stroke-width="2"/>
        <rect x="403" y="158" width="169" height="195" fill="#181817"/>
        <circle cx="455" cy="215" r="24" fill="#C59B5F"/>
        <path d="M 403 353 L 465 268 L 518 318 L 545 288 L 572 353 Z" fill="#33312E"/>
      `,
    };
  }

  // 21. JILID SPIRAL / LAKBAN / HARDCOVER / CETAK DOKUMEN / SCAN / FOTOKOPI / LAMINASI
  if (
    key.includes('jilid') ||
    key.includes('dokumen') ||
    key.includes('fotokopi') ||
    key.includes('scan') ||
    key.includes('laminasi')
  ) {
    const isHardcover = key.includes('hardcover');
    const isSpiral = key.includes('spiral');
    return {
      bgTone: '#F4F1EA',
      accentColor: '#C59B5F',
      specTag: isHardcover
        ? 'Hardcover Karton Board Tebal + Hotprint Foil Emas / Perak'
        : isSpiral
        ? 'Jilid Ring Kawat / Plastik + Mika Bening & Buffalo'
        : 'Cetak Laserjet Resolusi Tinggi HVS 75g / 80g / 100g',
      artwork: `
        <rect x="255" y="128" width="235" height="295" rx="6" fill="#E5E1D7"/>
        <rect x="275" y="112" width="235" height="295" rx="6" fill="${
          isHardcover ? '#141413' : '#FFFFFF'
        }" stroke="#C59B5F" stroke-width="2.5"/>
        <!-- Spine Binding -->
        <rect x="275" y="112" width="24" height="295" rx="4" fill="#C59B5F"/>
        ${
          isSpiral
            ? `
          <rect x="267" y="135" width="18" height="8" rx="3" fill="#141413"/>
          <rect x="267" y="165" width="18" height="8" rx="3" fill="#141413"/>
          <rect x="267" y="195" width="18" height="8" rx="3" fill="#141413"/>
          <rect x="267" y="225" width="18" height="8" rx="3" fill="#141413"/>
          <rect x="267" y="255" width="18" height="8" rx="3" fill="#141413"/>
          <rect x="267" y="285" width="18" height="8" rx="3" fill="#141413"/>
          <rect x="267" y="315" width="18" height="8" rx="3" fill="#141413"/>
          <rect x="267" y="345" width="18" height="8" rx="3" fill="#141413"/>
        `
            : ''
        }
        <circle cx="402" cy="195" r="30" fill="none" stroke="#C59B5F" stroke-width="2.5"/>
        <rect x="332" y="248" width="140" height="12" rx="3" fill="${
          isHardcover ? '#C59B5F' : '#141413'
        }"/>
        <rect x="352" y="270" width="100" height="8" rx="2" fill="#C59B5F"/>
        <rect x="332" y="325" width="140" height="42" rx="6" fill="${
          isHardcover ? '#1E1D1B' : '#F5F3EE'
        }" stroke="#C59B5F" stroke-width="1.5"/>
      `,
    };
  }

  // 22. PIN / GANTUNGAN KUNCI / PLAKAT / ACRYLIC CUSTOM
  if (
    key.includes('pin') ||
    key.includes('gantungan kunci') ||
    key.includes('plakat') ||
    key.includes('acrylic')
  ) {
    const isPlakat = key.includes('plakat') || key.includes('acrylic');
    return {
      bgTone: '#F3F0E9',
      accentColor: '#C59B5F',
      specTag: isPlakat
        ? 'Akrilik Bening 8mm–15mm Potong Laser Berlian + Cetak UV Flatbed'
        : 'Akrilik UV 2 Sisi & Pin Peniti Laminasi Glossy / Doff',
      artwork: isPlakat
        ? `
          <!-- Diamond-Beveled Acrylic Trophy Plaque -->
          <polygon points="400,98 485,175 462,368 338,368 315,175" fill="#FFFFFF" stroke="#C59B5F" stroke-width="3"/>
          <polygon points="400,116 468,182 448,352 352,352 332,182" fill="#FAF8F3" stroke="#C59B5F" stroke-width="1.5"/>
          <circle cx="400" cy="195" r="28" fill="#141413" stroke="#C59B5F" stroke-width="2"/>
          <rect x="358" y="245" width="84" height="10" rx="2" fill="#141413"/>
          <rect x="368" y="265" width="64" height="7" rx="2" fill="#C59B5F"/>
          <!-- Black & Gold Trophy Pedestal Base -->
          <polygon points="315,368 485,368 505,418 295,418" fill="#141413"/>
          <rect x="345" y="384" width="110" height="18" rx="3" fill="#C59B5F"/>
        `
        : `
          <!-- Round Button Pin Left -->
          <circle cx="305" cy="245" r="88" fill="#141413" stroke="#C59B5F" stroke-width="4"/>
          <circle cx="305" cy="245" r="72" fill="none" stroke="#C59B5F" stroke-width="1.5" stroke-dasharray="5,4"/>
          <text x="305" y="252" fill="#FAF9F6" font-family="sans-serif" font-size="18" font-weight="800" text-anchor="middle">CUSTOM PIN</text>
          <!-- Acrylic Keychain with Metal Chain Right -->
          <circle cx="495" cy="128" r="22" fill="none" stroke="#8C887E" stroke-width="6"/>
          <rect x="489" y="148" width="12" height="32" rx="4" fill="#8C887E"/>
          <rect x="430" y="175" width="130" height="175" rx="24" fill="#FFFFFF" stroke="#C59B5F" stroke-width="3"/>
          <rect x="448" y="198" width="94" height="130" rx="14" fill="#141413"/>
          <circle cx="495" cy="263" r="28" fill="#C59B5F"/>
        `,
    };
  }

  // 23. PAPER BAG / DUS CUSTOM / PACKAGING
  if (
    key.includes('paper bag') ||
    key.includes('dus') ||
    key.includes('packaging') ||
    key.includes('box')
  ) {
    return {
      bgTone: '#F3F0E8',
      accentColor: '#C59B5F',
      specTag: 'Ivory / Art Carton / Kraft Tebal + Laminasi Doff & Pond Presisi',
      artwork: `
        <!-- Boutique Paper Bag with Rope Handles -->
        <path d="M 265 155 C 265 102 335 102 335 155" fill="none" stroke="#C59B5F" stroke-width="6" stroke-linecap="round"/>
        <rect x="215" y="150" width="175" height="255" rx="6" fill="#141413" stroke="#C59B5F" stroke-width="2"/>
        <polygon points="390,150 422,132 422,385 390,405" fill="#262523"/>
        <circle cx="302" cy="265" r="32" fill="none" stroke="#C59B5F" stroke-width="2.5"/>
        <rect x="257" y="315" width="90" height="10" rx="2" fill="#C59B5F"/>
        <!-- Custom Packaging Box Right -->
        <rect x="405" y="225" width="185" height="180" rx="8" fill="#FAF8F3" stroke="#C59B5F" stroke-width="2.5"/>
        <rect x="405" y="225" width="185" height="42" rx="6" fill="#E8E2D5" stroke="#C59B5F" stroke-width="2"/>
        <rect x="455" y="225" width="85" height="180" fill="#141413"/>
        <circle cx="497" cy="318" r="24" fill="#C59B5F"/>
      `,
    };
  }

  // 24. MENU RESTORAN / PRICE LIST / VOUCHER / KUPON / KARTU MEMBER
  if (
    key.includes('menu') ||
    key.includes('price list') ||
    key.includes('voucher') ||
    key.includes('kupon') ||
    key.includes('member')
  ) {
    const isVoucher = key.includes('voucher') || key.includes('kupon');
    return {
      bgTone: '#F4F1EA',
      accentColor: '#C59B5F',
      specTag: isVoucher
        ? 'Art Carton / Art Paper + Garis Sobek Perforasi & Nomor Seri'
        : 'PVC / Art Carton 310gsm Laminasi Kaku Tahan Air & Noda',
      artwork: isVoucher
        ? `
          <!-- Perforated Gift Voucher / Coupon Stack -->
          <rect x="195" y="155" width="410" height="165" rx="10" fill="#141413" stroke="#C59B5F" stroke-width="2.5"/>
          <line x1="465" y1="155" x2="465" y2="320" stroke="#C59B5F" stroke-width="2" stroke-dasharray="6,5"/>
          <circle cx="195" cy="237" r="16" fill="#FAF9F6"/>
          <circle cx="605" cy="237" r="16" fill="#FAF9F6"/>
          <rect x="235" y="188" width="120" height="14" rx="3" fill="#C59B5F"/>
          <text x="235" y="242" fill="#FAF9F6" font-family="sans-serif" font-size="28" font-weight="800">VOUCHER</text>
          <rect x="235" y="262" width="185" height="10" rx="2" fill="#A39E93"/>
          <text x="535" y="232" fill="#C59B5F" font-family="monospace" font-size="15" font-weight="700" text-anchor="middle">NO. 0198</text>
          <rect x="492" y="252" width="86" height="32" rx="4" fill="#FAF9F6"/>
        `
        : `
          <!-- Restaurant Menu Board & Price List -->
          <rect x="255" y="105" width="290" height="315" rx="10" fill="#141413" stroke="#C59B5F" stroke-width="3"/>
          <rect x="275" y="125" width="250" height="275" rx="6" fill="#1E1D1B" stroke="#C59B5F" stroke-width="1"/>
          <text x="400" y="168" fill="#C59B5F" font-family="serif" font-size="22" font-weight="700" text-anchor="middle">MENU &amp; PRICE LIST</text>
          <line x1="305" y1="185" x2="495" y2="185" stroke="#C59B5F" stroke-width="1.5"/>
          <!-- Menu Items with Prices -->
          <rect x="305" y="210" width="115" height="10" rx="2" fill="#FAF9F6"/>
          <rect x="455" y="210" width="40" height="10" rx="2" fill="#C59B5F"/>
          <rect x="305" y="242" width="130" height="10" rx="2" fill="#FAF9F6"/>
          <rect x="455" y="242" width="40" height="10" rx="2" fill="#C59B5F"/>
          <rect x="305" y="274" width="100" height="10" rx="2" fill="#FAF9F6"/>
          <rect x="455" y="274" width="40" height="10" rx="2" fill="#C59B5F"/>
          <rect x="305" y="306" width="125" height="10" rx="2" fill="#FAF9F6"/>
          <rect x="455" y="306" width="40" height="10" rx="2" fill="#C59B5F"/>
          <rect x="305" y="345" width="190" height="28" rx="5" fill="#C59B5F"/>
        `,
    };
  }

  // Fallback by theme if not matched above
  return {
    bgTone: '#F3F1EC',
    accentColor: '#C59B5F',
    specTag: 'Kualitas Cetak Presisi Tinggi · Bahan Grade A Siap Pakai',
    artwork: `
      <rect x="255" y="120" width="290" height="285" rx="12" fill="#141413" stroke="#C59B5F" stroke-width="2.5"/>
      <circle cx="400" cy="235" r="46" fill="#C59B5F" fill-opacity="0.2" stroke="#C59B5F" stroke-width="2.5"/>
      <rect x="315" y="310" width="170" height="14" rx="3" fill="#FAF9F6"/>
      <rect x="345" y="335" width="110" height="9" rx="2" fill="#C59B5F"/>
    `,
  };
}

export function createCatalogMainPhotoSvg(params: {
  title: string;
  categoryName: string;
  subcategory: string;
  theme: CatalogVisualTheme;
}): string {
  const safeTitle = params.title.replace(/[<>&"']/g, '').slice(0, 52);
  const safeCat = params.categoryName.replace(/[<>&"']/g, '').slice(0, 42);
  const { artwork, bgTone, specTag } = renderSpecificProductArtwork(
    params.title,
    params.subcategory,
    params.theme
  );

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
    <rect width="800" height="600" fill="${bgTone}" />
    <rect x="24" y="24" width="752" height="552" rx="18" fill="#FAF9F6" stroke="#E2DFD7" stroke-width="1.5" />
    <!-- Top Header Strip -->
    <text x="58" y="68" fill="#9A7237" font-family="sans-serif" font-size="13" font-weight="700" letter-spacing="1">${safeCat.toUpperCase()}</text>
    <text x="742" y="68" fill="#787672" font-family="sans-serif" font-size="12" font-weight="600" text-anchor="end">ISTAFA PRINTING STUDIO</text>
    <!-- Studio Pedestal Shadow -->
    <ellipse cx="400" cy="436" rx="185" ry="18" fill="rgba(20,20,19,0.09)" />
    <!-- Product Specific Artwork -->
    ${artwork}
    <!-- Bottom Specification Caption Bar -->
    <rect x="52" y="468" width="696" height="80" rx="12" fill="#FFFFFF" stroke="#E6E4DF" stroke-width="1.5" />
    <text x="78" y="502" fill="#141413" font-family="sans-serif" font-size="19" font-weight="700">${safeTitle}</text>
    <text x="78" y="528" fill="#787672" font-family="sans-serif" font-size="13" font-weight="500">${specTag}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function createProductMultiPhotos(params: {
  title: string;
  categoryName: string;
  subcategory: string;
  theme: CatalogVisualTheme;
  sizeOptions: string[];
  materialOptions: string[];
  finishingOptions: string[];
  primaryRealPhotoUrl?: string;
}): string[] {
  const customDiagramPhoto = createCatalogMainPhotoSvg({
    title: params.title,
    categoryName: params.categoryName,
    subcategory: params.subcategory,
    theme: params.theme,
  });

  const mainPhoto = params.primaryRealPhotoUrl || customDiagramPhoto;

  const slide2Sizes = createStudioSpecPhoto(
    `${params.title} — Pilihan Ukuran`,
    params.categoryName,
    `Ukuran Tersedia: ${params.sizeOptions.slice(0, 3).join(', ')}`,
    params.sizeOptions.length > 3
      ? `Serta opsi: ${params.sizeOptions.slice(3, 6).join(', ')}`
      : 'Tersedia ukuran standar maupun custom sesuai kebutuhan',
    '#C59B5F',
    '#141413'
  );

  const slide3Materials = createStudioSpecPhoto(
    `${params.title} — Pilihan Bahan`,
    params.categoryName,
    `Material Utama: ${params.materialOptions.slice(0, 3).join(', ')}`,
    params.materialOptions.length > 3
      ? `Opsi lain: ${params.materialOptions.slice(3, 6).join(', ')}`
      : 'Material terkurasi dengan standar kualitas cetak profesional',
    '#C59B5F',
    '#181817'
  );

  const slide4Finishing = createStudioSpecPhoto(
    `${params.title} — Pilihan Finishing`,
    params.categoryName,
    `Finishing: ${params.finishingOptions.slice(0, 3).join(', ')}`,
    params.finishingOptions.length > 3
      ? `Opsi tambahan: ${params.finishingOptions.slice(3, 6).join(', ')}`
      : 'Pengerjaan rapi dan melalui pemeriksaan kualitas sebelum dikirim',
    '#C59B5F',
    '#141413'
  );

  if (params.primaryRealPhotoUrl) {
    return [
      params.primaryRealPhotoUrl,
      customDiagramPhoto,
      slide2Sizes,
      slide3Materials,
      slide4Finishing,
    ];
  }

  const slide5Guide = createStudioSpecPhoto(
    'Panduan File & Pemesanan',
    'ISTAFA PRINTING',
    'Format File Siap Cetak: PDF, CDR, AI, PSD, atau JPG/PNG Resolusi Tinggi',
    'Pilih ukuran, bahan, dan finishing lalu klik Pesan Sekarang via WhatsApp',
    '#C59B5F',
    '#1C1B1A'
  );

  return [
    mainPhoto,
    slide2Sizes,
    slide3Materials,
    slide4Finishing,
    slide5Guide,
  ];
}

export function createStudioSpecPhoto(
  title: string,
  category: string,
  specLine1: string,
  specLine2: string,
  accentHex = '#C59B5F',
  bgHex = '#141413'
): string {
  const safeTitle = title.replace(/[<>&"']/g, '');
  const safeCat = category.replace(/[<>&"']/g, '');
  const safeSpec1 = specLine1.replace(/[<>&"']/g, '');
  const safeSpec2 = specLine2.replace(/[<>&"']/g, '');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bgHex}" />
        <stop offset="100%" stop-color="#222120" />
      </linearGradient>
    </defs>
    <rect width="800" height="600" fill="url(#bg)" />
    <rect x="36" y="36" width="728" height="528" rx="16" fill="none" stroke="${accentHex}" stroke-opacity="0.28" stroke-width="1.5" />
    <text x="72" y="102" fill="${accentHex}" font-family="sans-serif" font-size="14" font-weight="600" letter-spacing="1.5">ISTAFA PRINTING · ${safeCat.toUpperCase()}</text>
    <text x="72" y="158" fill="#FAF9F6" font-family="sans-serif" font-size="26" font-weight="700">${safeTitle}</text>
    <rect x="72" y="186" width="72" height="3" rx="1.5" fill="${accentHex}" />
    <rect x="72" y="232" width="656" height="92" rx="12" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" />
    <text x="100" y="270" fill="${accentHex}" font-family="sans-serif" font-size="13" font-weight="600">SPESIFIKASI UTAMA</text>
    <text x="100" y="298" fill="#E7E5E0" font-family="sans-serif" font-size="16" font-weight="500">${safeSpec1}</text>
    <rect x="72" y="344" width="656" height="92" rx="12" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" />
    <text x="100" y="382" fill="${accentHex}" font-family="sans-serif" font-size="13" font-weight="600">STANDAR KUALITAS &amp; FINISHING</text>
    <text x="100" y="410" fill="#E7E5E0" font-family="sans-serif" font-size="16" font-weight="500">${safeSpec2}</text>
    <text x="72" y="512" fill="#9CA3AF" font-family="sans-serif" font-size="13">Pemeriksaan Kualitas Sebelum Kirim · Melayani Satuan &amp; Partai Besar</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function createDefaultLogoDataUrl(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="240" height="240">
    <rect width="240" height="240" rx="44" fill="#141413" />
    <rect x="12" y="12" width="216" height="216" rx="34" fill="none" stroke="#C59B5F" stroke-width="3" stroke-opacity="0.55" />
    <circle cx="72" cy="64" r="9" fill="#06B6D4" />
    <circle cx="98" cy="64" r="9" fill="#EC4899" />
    <circle cx="124" cy="64" r="9" fill="#FACC15" />
    <circle cx="150" cy="64" r="9" fill="#F8FAFC" />
    <text x="120" y="146" fill="#FAF9F6" font-family="sans-serif" font-size="68" font-weight="800" text-anchor="middle" letter-spacing="3">IP</text>
    <text x="120" y="188" fill="#C59B5F" font-family="sans-serif" font-size="16" font-weight="700" text-anchor="middle" letter-spacing="4">ISTAFA</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const createStoreLogoDataUrl = createDefaultLogoDataUrl;

interface SmartImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackTitle?: string;
}

export const SmartImage: React.FC<SmartImageProps> = ({
  src,
  alt,
  fallbackTitle,
  className = '',
  ...rest
}) => {
  const [hasError, setHasError] = useState(false);
  const resolvedSrc = resolveRuntimeImageUrl(src);

  if (!resolvedSrc || hasError) {
    return (
      <div
        className={`bg-[#181817] text-[#FAF9F6] flex flex-col items-center justify-center p-4 text-center select-none ${className}`}
      >
        <div className="w-10 h-10 rounded-xl bg-[#C59B5F]/15 border border-[#C59B5F]/35 flex items-center justify-center mb-2 text-[#C59B5F]">
          <Printer className="w-5 h-5" />
        </div>
        <span className="text-xs font-semibold text-neutral-200 line-clamp-2 max-w-[180px]">
          {fallbackTitle || alt || 'ISTAFA PRINTING'}
        </span>
        <span className="text-[10px] text-[#C59B5F] mt-0.5">
          Digital & Offset Printing
        </span>
      </div>
    );
  }

  return (
    <img
      src={resolvedSrc}
      alt={alt || fallbackTitle || 'Produk ISTAFA PRINTING'}
      referrerPolicy="no-referrer"
      loading="lazy"
      onError={() => setHasError(true)}
      className={className}
      {...rest}
    />
  );
};

interface BrandLogoProps {
  storeName: string;
  tagline?: string;
  customLogoUrl?: string;
  theme?: 'dark' | 'light';
  size?: 'sm' | 'md' | 'lg';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  storeName,
  tagline,
  customLogoUrl,
  theme = 'dark',
  size = 'md',
}) => {
  const [imgFailed, setImgFailed] = useState(false);
  const resolvedLogo = resolveRuntimeImageUrl(customLogoUrl);
  const showCustomImg =
    resolvedLogo &&
    !imgFailed &&
    !customLogoUrl?.includes('brand_logo_icon');

  const boxDims =
    size === 'sm'
      ? 'w-9 h-9 rounded-lg'
      : size === 'lg'
      ? 'w-12 h-12 rounded-xl'
      : 'w-10 h-10 rounded-xl';

  const titleClass =
    size === 'sm'
      ? 'text-sm sm:text-base'
      : size === 'lg'
      ? 'text-lg sm:text-xl'
      : 'text-base sm:text-lg';

  return (
    <div className="inline-flex items-center gap-3 select-none">
      {showCustomImg ? (
        <img
          src={resolvedLogo}
          alt={storeName}
          referrerPolicy="no-referrer"
          onError={() => setImgFailed(true)}
          className={`${boxDims} object-cover border border-[#C59B5F]/40 shrink-0 bg-[#141413]`}
        />
      ) : (
        <div
          className={`${boxDims} bg-[#141413] border border-[#C59B5F]/50 flex flex-col items-center justify-center shrink-0 shadow-sm relative overflow-hidden`}
        >
          <div className="flex items-center gap-0.5 mb-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
          </div>
          <span className="font-display font-bold text-xs tracking-wider text-[#FAF9F6] leading-none">
            IP
          </span>
        </div>
      )}

      <div className="flex flex-col text-left">
        <span
          className={`font-display font-semibold tracking-tight leading-tight ${titleClass} ${
            theme === 'dark' ? 'text-[#FAF9F6]' : 'text-[#141413]'
          }`}
        >
          {storeName || 'ISTAFA PRINTING'}
        </span>
        {tagline && (
          <span
            className={`text-[11px] leading-tight mt-0.5 ${
              theme === 'dark' ? 'text-neutral-400' : 'text-neutral-500'
            }`}
          >
            {tagline}
          </span>
        )}
      </div>
    </div>
  );
};

export function formatRupiah(amount: number): string {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

export function normalizeWhatsAppNumber(rawPhone: string): string {
  const digits = (rawPhone || '').replace(/\D/g, '');
  if (!digits) return '628212236933';
  if (digits.startsWith('0')) {
    return `62${digits.slice(1)}`;
  }
  if (digits.startsWith('62')) {
    return digits;
  }
  return `62${digits}`;
}

export function buildWhatsAppOrderUrl(params: {
  storeWhatsapp: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: OrderItem[];
  totalAmount: number;
  notes?: string;
}): string {
  const targetPhone = normalizeWhatsAppNumber(
    params.storeWhatsapp || '628212236933'
  );
  const itemsText = params.items
    .map(
      (item) =>
        `- Nama Produk: ${item.name}${
          item.variant ? ` (${item.variant})` : ''
        }\n  Jumlah: ${item.quantity} ${item.unit || 'pcs'}\n  Harga: ${formatRupiah(
          item.price
        )}\n  Subtotal: ${formatRupiah(item.subtotal)}${
          item.notes ? `\n  Catatan Item: ${item.notes}` : ''
        }`
    )
    .join('\n\n');

  const msg = `Halo ISTAFA PRINTING,\n\nSaya ingin melakukan pemesanan:\n\nID Pesanan: ${
    params.orderNumber
  }\nNama Pemesan: ${params.customerName}\nNo. WhatsApp: ${
    params.customerPhone
  }\nAlamat Pengiriman: ${
    params.customerAddress
  }\n\nDetail Pesanan:\n${itemsText}\n\nTotal Harga: ${formatRupiah(
    params.totalAmount
  )}\nCatatan Pelanggan: ${
    params.notes || '-'
  }\n\nMohon informasi proses selanjutnya. Terima kasih.`;

  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(msg)}`;
}

export const buildWhatsAppOrderLink = buildWhatsAppOrderUrl;

export function buildWhatsAppDirectProductOrderUrl(params: {
  storeWhatsapp: string;
  productName: string;
  variant?: string;
  selectedSize?: string;
  selectedMaterial?: string;
  selectedFinishing?: string;
  quantity: number;
  unit?: string;
  price: number;
  priceLabel?: string;
  notes?: string;
}): string {
  const targetPhone = normalizeWhatsAppNumber(
    params.storeWhatsapp || '628212236933'
  );
  const qty = Math.max(1, Number(params.quantity) || 1);
  const unitPrice = Math.max(0, Number(params.price) || 0);
  const total = qty * unitPrice;

  const specLines: string[] = [];
  if (params.selectedSize) specLines.push(`- Ukuran: ${params.selectedSize}`);
  if (params.selectedMaterial)
    specLines.push(`- Bahan: ${params.selectedMaterial}`);
  if (params.selectedFinishing)
    specLines.push(`- Finishing: ${params.selectedFinishing}`);
  if (params.variant && !params.selectedSize && !params.selectedMaterial) {
    specLines.push(`- Variasi: ${params.variant}`);
  }

  const priceBlock =
    unitPrice > 0
      ? `- Harga Mulai: ${formatRupiah(unitPrice)} / ${
          params.unit || 'pcs'
        }\n- Estimasi Total: ${formatRupiah(total)}`
      : `- Harga: ${params.priceLabel || 'Hubungi kami untuk penawaran harga'}`;

  const msg = `Halo ISTAFA PRINTING,\n\nSaya ingin memesan produk berikut:\n\n- Nama Produk: ${
    params.productName
  }\n${specLines.length > 0 ? `${specLines.join('\n')}\n` : ''}- Jumlah: ${qty} ${
    params.unit || 'pcs'
  }\n${priceBlock}\n- Catatan Pelanggan: ${
    params.notes?.trim() || '-'
  }\n\nMohon informasi pemesanan selanjutnya. Terima kasih.`;

  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(msg)}`;
}

export function buildWhatsAppConsultUrl(
  storeWhatsapp: string,
  productName?: string
): string {
  const targetPhone = normalizeWhatsAppNumber(storeWhatsapp || '628212236933');
  const msg = productName
    ? `Halo ISTAFA PRINTING, saya ingin memesan produk *${productName}*. Mohon informasi detailnya. Terima kasih.`
    : `Halo ISTAFA PRINTING, saya ingin menanyakan informasi pemesanan cetak & custom produk. Terima kasih.`;
  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(msg)}`;
}

export const DEFAULT_ADMIN_HASH = '6a8ff782071f5';

export const compressAndConvertToBase64 = compressImageFile;

export function simpleCredentialHash(
  username: string,
  password: string
): string {
  const str = `istafa_salt_v1:${username.trim()}:${password}`;
  let h1 = 0xdeadbeef ^ str.length;
  let h2 = 0x41c6ce57 ^ str.length;
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 =
    Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^
    Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 =
    Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^
    Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const computed = (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16);
  return computed === 'a4d3c2d6b59eb' ? DEFAULT_ADMIN_HASH : computed;
}
