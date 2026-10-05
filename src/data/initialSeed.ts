import heroBannerImg from '../assets/images/hero_istafa_printing_1791192534990.jpg';
import tumblerImg from '../assets/images/product_tumbler_custom_1791192560770.jpg';
import kartuNamaImg from '../assets/images/product_kartu_nama_1791192576546.jpg';
import lanyardImg from '../assets/images/product_lanyard_idcard_1791192586890.jpg';
import bannerXbannerImg from '../assets/images/product_banner_xbanner_1791214161681.jpg';
import mugMerchImg from '../assets/images/product_mug_merchandise_1791214181390.jpg';
import stikerCuttingImg from '../assets/images/product_stiker_cutting_1791214195132.jpg';
import undanganImg from '../assets/images/product_undangan_pernikahan_1791214207720.jpg';
import kaosTotebagImg from '../assets/images/product_kaos_totebag_1791214232754.jpg';

import {
  Category,
  DebtReceivable,
  FinanceTransaction,
  GalleryItem,
  Product,
  StoreSettings,
} from '../types';
import {
  CatalogVisualTheme,
  createDefaultLogoDataUrl,
  createProductMultiPhotos,
  createStoreLogoDataUrl,
  createStudioSpecPhoto,
  DEFAULT_ADMIN_HASH,
} from '../utils/imageUtils';

export const INITIAL_STORE_SETTINGS: StoreSettings = {
  storeId: 'istafa_printing',
  storeName: 'ISTAFA PRINTING',
  tagline: 'Cetak Berkualitas, Wujudkan Ide Tanpa Batas.',
  heroDescription:
    'Solusi percetakan lengkap dan pembuatan custom merchandise untuk kebutuhan dokumen, promosi bisnis, instansi, sekolah, acara, hingga kemasan produk.',
  whatsappNumber: '628212236933',
  logoUrl: createStoreLogoDataUrl() || createDefaultLogoDataUrl(),
  heroBannerUrl: heroBannerImg,
  address: 'Jl. Percetakan Raya No. 88, Pusat Bisnis & Kreatif, Indonesia',
  operatingHours:
    'Senin – Sabtu: 08.00 – 20.00 WIB | Minggu: Layanan Pesanan Online',
  email: 'order@istafaprinting.com',
  instagramUrl: 'https://instagram.com/istafaprinting',
  facebookUrl: 'https://facebook.com/istafaprinting',
  tiktokUrl: 'https://tiktok.com/@istafaprinting',
  aboutText:
    'ISTAFA PRINTING adalah perusahaan percetakan modern dan custom merchandise terpercaya. Kami melayani cetak dokumen, media promosi, identitas, stiker, undangan, kemasan, hingga perlengkapan kantor dan sekolah.',
  initialCashBalance: 15000000,
  adminUsername: 'Isatafa',
  adminPasswordHash: DEFAULT_ADMIN_HASH,
  updatedBy: 'System Initialization',
};

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat_dokumen',
    storeId: 'istafa_printing',
    name: 'Cetak Dokumen',
    slug: 'cetak-dokumen',
    icon: '01',
    description:
      'Print A4/A3 hitam putih & warna, fotokopi, scan, penjilidan spiral/lem/hardcover, laminasi, skripsi, modul, dan buku.',
    sortOrder: 1,
    active: true,
  },
  {
    id: 'cat_banner',
    storeId: 'istafa_printing',
    name: 'Banner & Media Promosi',
    slug: 'banner-media-promosi',
    icon: '02',
    description:
      'Cetak spanduk, baliho, X-Banner, Roll Banner, Y-Banner, backdrop, poster, umbul-umbul, dan flag promosi.',
    sortOrder: 2,
    active: true,
  },
  {
    id: 'cat_kartu',
    storeId: 'istafa_printing',
    name: 'Kartu & Identitas',
    slug: 'kartu-identitas',
    icon: '03',
    description:
      'Kartu nama, ID Card PVC, kartu anggota/pelajar/panitia, name tag, tali lanyard printing, dan gantungan ID card.',
    sortOrder: 3,
    active: true,
  },
  {
    id: 'cat_sticker',
    storeId: 'istafa_printing',
    name: 'Sticker',
    slug: 'sticker',
    icon: '04',
    description:
      'Sticker vinyl, transparan, chromo, cutting die-cut, label kemasan, sticker logo, kendaraan, dan hologram.',
    sortOrder: 4,
    active: true,
  },
  {
    id: 'cat_undangan',
    storeId: 'istafa_printing',
    name: 'Undangan & Acara',
    slug: 'undangan-acara',
    icon: '05',
    description:
      'Undangan pernikahan, khitanan, ulang tahun, aqiqah, tasyakuran, kartu ucapan, terima kasih, dan label souvenir.',
    sortOrder: 5,
    active: true,
  },
  {
    id: 'cat_foto',
    storeId: 'istafa_printing',
    name: 'Cetak Foto',
    slug: 'cetak-foto',
    icon: '06',
    description:
      'Pas foto dokumen 2x3, 3x4, 4x6, cetak foto 10R/12R, ukuran custom, polaroid, kolase, dan foto lab premium.',
    sortOrder: 6,
    active: true,
  },
  {
    id: 'cat_merchandise',
    storeId: 'istafa_printing',
    name: 'Merchandise',
    slug: 'merchandise',
    icon: '07',
    description:
      'Tumbler, mug, botol, gantungan kunci, pin, magnet, pulpen, kalender, notebook, agenda, tote bag, kaos, dan topi custom.',
    sortOrder: 7,
    active: true,
  },
  {
    id: 'cat_kemasan',
    storeId: 'istafa_printing',
    name: 'Kemasan & Label',
    slug: 'kemasan-label',
    icon: '08',
    description:
      'Paper bag, box custom, dus produk, sleeve packaging, hang tag, thank you card, kartu garansi, dan label kemasan.',
    sortOrder: 8,
    active: true,
  },
  {
    id: 'cat_promosi_toko',
    storeId: 'istafa_printing',
    name: 'Alat Promosi Toko',
    slug: 'alat-promosi-toko',
    icon: '09',
    description:
      'Neon box, papan nama toko, acrylic sign, menu board, price list, standing banner, display acrylic, dan stiker kaca/etalase.',
    sortOrder: 9,
    active: true,
  },
  {
    id: 'cat_sekolah_kantor',
    storeId: 'istafa_printing',
    name: 'Produk Sekolah & Kantor',
    slug: 'produk-sekolah-kantor',
    icon: '10',
    description:
      'Map sekolah/perusahaan, sertifikat, piagam, kop surat, amplop, nota/invoice NCR, buku kas, dan sampul raport.',
    sortOrder: 10,
    active: true,
  },
  {
    id: 'cat_foto_dekorasi',
    storeId: 'istafa_printing',
    name: 'Produk Foto & Dekorasi',
    slug: 'produk-foto-dekorasi',
    icon: '11',
    description:
      'Photo frame, foto canvas spanram, foto acrylic dinding, poster foto, wall decoration, dan kalender foto.',
    sortOrder: 11,
    active: true,
  },
  {
    id: 'cat_custom',
    storeId: 'istafa_printing',
    name: 'Custom Request',
    slug: 'custom-request',
    icon: '12',
    description:
      'Pemesanan cetak khusus sesuai spesifikasi, ukuran, bahan, dan kebutuhan unik Anda yang belum tertera di katalog.',
    sortOrder: 12,
    active: true,
  },
];

interface SeedProductInput {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  subcategory: string;
  theme: CatalogVisualTheme;
  price: number;
  originalPrice?: number;
  priceLabel?: string;
  unit: string;
  minOrder: number;
  shortDescription: string;
  description: string;
  sizeOptions: string[];
  materialOptions: string[];
  finishingOptions: string[];
  featured?: boolean;
  isNew?: boolean;
  badge?: string;
  soldCount?: number;
  sortOrder: number;
  primaryRealPhotoUrl?: string;
  orderNotesHint?: string;
}

function makeProduct(input: SeedProductInput): Product {
  const images = createProductMultiPhotos({
    title: input.name,
    categoryName: input.categoryName,
    subcategory: input.subcategory,
    theme: input.theme,
    sizeOptions: input.sizeOptions,
    materialOptions: input.materialOptions,
    finishingOptions: input.finishingOptions,
    primaryRealPhotoUrl: input.primaryRealPhotoUrl,
  });

  const combinedVariants = [
    ...input.sizeOptions.slice(0, 3).map((s) => `Ukuran: ${s}`),
    ...input.materialOptions.slice(0, 3).map((m) => `Bahan: ${m}`),
  ];

  return {
    id: input.id,
    storeId: 'istafa_printing',
    name: input.name,
    categoryId: input.categoryId,
    categoryName: input.categoryName,
    subcategory: input.subcategory,
    price: input.price,
    originalPrice: input.originalPrice || 0,
    priceLabel:
      input.priceLabel ||
      (input.price > 0 ? 'Mulai dari' : 'Hubungi kami untuk harga'),
    shortDescription: input.shortDescription,
    description: input.description,
    images,
    variants: combinedVariants.length > 0 ? combinedVariants : ['Standar'],
    sizeOptions: input.sizeOptions,
    materialOptions: input.materialOptions,
    finishingOptions: input.finishingOptions,
    badge: input.badge || (input.featured ? 'Unggulan' : ''),
    available: true,
    featured: Boolean(input.featured),
    isNew: Boolean(input.isNew),
    hidden: false,
    sortOrder: input.sortOrder,
    minOrder: input.minOrder,
    stock: 999,
    unit: input.unit,
    orderNotesHint:
      input.orderNotesHint ||
      'Cantumkan detail ukuran, bahan, finishing, atau instruksi file cetak...',
    rating: 4.9,
    soldCount: input.soldCount || 120,
  };
}

export const INITIAL_PRODUCTS: Product[] = [
  // ============================================================================
  // 1. CETAK DOKUMEN
  // ============================================================================
  makeProduct({
    id: 'prod_dok_print_a4_a3',
    name: 'Print Dokumen A4 / F4 / A3 (Hitam Putih & Warna)',
    categoryId: 'cat_dokumen',
    categoryName: 'Cetak Dokumen',
    subcategory: 'Print A4, Print A3, Hitam Putih & Warna',
    theme: 'dokumen',
    price: 500,
    priceLabel: 'Mulai dari',
    unit: 'lembar',
    minOrder: 1,
    featured: true,
    soldCount: 1450,
    sortOrder: 1,
    shortDescription:
      'Layanan print dokumen A4, F4, dan A3 hitam putih maupun full color untuk tugas, makalah, dan dokumen kerja.',
    description:
      'Layanan cetak dokumen resolusi tajam menggunakan mesin laser & digital press. Melayani print hitam putih (B/W) maupun full color pada ukuran A4, F4/Folio, hingga A3 untuk kebutuhan tugas kuliah, makalah, laporan kantor, dan dokumen administrasi.',
    sizeOptions: ['A4 (21 x 29.7 cm)', 'F4 / Folio', 'A3 (29.7 x 42 cm)', 'B5'],
    materialOptions: [
      'HVS 75 gsm',
      'HVS 80 gsm',
      'HVS 100 gsm',
      'Art Paper 120 gsm',
      'Art Carton 230 gsm',
    ],
    finishingOptions: [
      'Tanpa Jilid (Lembaran)',
      'Staples Pojok / Tengah',
      'Jilid Lakban / Mika',
      'Jilid Spiral',
    ],
  }),
  makeProduct({
    id: 'prod_dok_fotokopi_scan',
    name: 'Layanan Fotokopi & Scan Dokumen Resolusi Tinggi',
    categoryId: 'cat_dokumen',
    categoryName: 'Cetak Dokumen',
    subcategory: 'Fotokopi & Scan Dokumen',
    theme: 'dokumen',
    price: 300,
    priceLabel: 'Mulai dari',
    unit: 'lembar',
    minOrder: 1,
    soldCount: 980,
    sortOrder: 2,
    shortDescription:
      'Penggandaan fotokopi dokumen cepat serta scan dokumen ke format PDF/JPG bersih dan rapi.',
    description:
      'Layanan fotokopi dokumen bolak-balik maupun satu sisi dengan hasil bersih dan jelas, dilengkapi layanan scan dokumen berkecepatan tinggi (ADF/Flatbed) langsung menjadi file PDF atau JPG terstruktur.',
    sizeOptions: ['A4', 'F4 / Folio', 'A3', 'Ukuran KTP / Kartu'],
    materialOptions: ['HVS 75 gsm', 'HVS 80 gsm', 'File Digital PDF / JPG'],
    finishingOptions: [
      'Lembaran Urut Halaman',
      'Staples & Susun',
      'Simpan PDF Gabungan',
    ],
  }),
  makeProduct({
    id: 'prod_dok_jilid_hardcover_spiral',
    name: 'Jilid Spiral, Jilid Lem Panas & Hardcover Skripsi',
    categoryId: 'cat_dokumen',
    categoryName: 'Cetak Dokumen',
    subcategory: 'Jilid Spiral, Jilid Lem & Hardcover',
    theme: 'dokumen',
    price: 15000,
    priceLabel: 'Mulai dari',
    unit: 'buku',
    minOrder: 1,
    featured: true,
    soldCount: 620,
    sortOrder: 3,
    shortDescription:
      'Penjilidan profesional: jilid spiral kawat/plastik, jilid lem panas (softcover), dan jilid hardcover poli emas/perak.',
    description:
      'Solusi penjilidan dokumen agar rapi, kuat, dan representatif. Tersedia jilid spiral kawat/plastik, jilid lem panas (perfect binding) seperti buku terbitan, serta jilid hardcover skripsi/laporan akhir lengkap dengan hotprint tinta emas atau perak dan pita pembatas.',
    sizeOptions: ['A5 (14.8 x 21 cm)', 'B5', 'A4 (21 x 29.7 cm)', 'F4 / Folio'],
    materialOptions: [
      'Cover Mika & Buffalo',
      'Softcover Art Carton 260 gsm',
      'Hardcover Board 30 + Linen / Art Paper',
    ],
    finishingOptions: [
      'Jilid Spiral Kawat',
      'Jilid Lem Panas (Perfect Binding)',
      'Hardcover Hotprint Foil Emas / Perak',
      'Laminasi Cover Doff / Glossy',
    ],
  }),
  makeProduct({
    id: 'prod_dok_cetak_skripsi_modul_buku',
    name: 'Cetak Skripsi, Proposal, Modul & Buku',
    categoryId: 'cat_dokumen',
    categoryName: 'Cetak Dokumen',
    subcategory: 'Cetak Tugas, Makalah, Skripsi, Proposal, Modul & Buku',
    theme: 'dokumen',
    price: 35000,
    priceLabel: 'Mulai dari',
    unit: 'eksemplar',
    minOrder: 1,
    isNew: true,
    soldCount: 540,
    sortOrder: 4,
    shortDescription:
      'Paket lengkap cetak dan jilid skripsi, tesis, proposal bisnis, modul pelatihan, hingga cetak buku.',
    description:
      'Paket cetak terpadu untuk kebutuhan akademik dan korporat: mulai dari cetak tugas, makalah, skripsi, proposal proyek, modul pelatihan/workshop, hingga buku ber-ISBN. Mendukung cetak isi hitam putih, kombinasi halaman warna, dan cover full color.',
    sizeOptions: ['A5', 'UNESCO (15.5 x 23 cm)', 'B5', 'A4'],
    materialOptions: [
      'HVS 80 gsm Putih Bersih',
      'HVS 100 gsm Premium',
      'Bookpaper 72 gsm (Ramah Mata)',
      'Art Paper 120 gsm',
    ],
    finishingOptions: [
      'Softcover Lem Panas + Laminasi',
      'Hardcover Skripsi Poli Emas',
      'Jilid Spiral Kawat',
      'Wrapping Plastik Shrink',
    ],
  }),
  makeProduct({
    id: 'prod_dok_laminasi',
    name: 'Laminasi Dokumen A4 / F4 / A3 & Laminasi KTP / ID',
    categoryId: 'cat_dokumen',
    categoryName: 'Cetak Dokumen',
    subcategory: 'Laminasi & Laminasi KTP/ID',
    theme: 'dokumen',
    price: 3000,
    priceLabel: 'Mulai dari',
    unit: 'lembar',
    minOrder: 1,
    soldCount: 410,
    sortOrder: 5,
    shortDescription:
      'Laminating kaku (rigid) maupun laminasi dingin/panas untuk KTP, kartu identitas, ijazah, dan dokumen penting.',
    description:
      'Lindungi dokumen berharga, sertifikat, ijazah, serta kartu identitas (KTP/ID Card) dari air, lipatan, dan pudar dengan layanan laminasi plastik kaku (100 micron) maupun laminasi tipis glossy/doff.',
    sizeOptions: ['Ukuran KTP / Kartu', 'A5', 'A4', 'F4 / Folio', 'A3'],
    materialOptions: [
      'Plastik Laminating Kaku 100 Micron',
      'Laminasi Panas Glossy',
      'Laminasi Panas Doff',
    ],
    finishingOptions: ['Potong Sudut Rounded', 'Potong Rapi Sesuai Dokumen'],
  }),
  makeProduct({
    id: 'prod_dok_print_a3_warna',
    name: 'Print A3 / A3+ Full Color & Hitam Putih (Poster, Gambar Kerja & Peta)',
    categoryId: 'cat_dokumen',
    categoryName: 'Cetak Dokumen',
    subcategory: 'Print A3, Print Warna & Print Hitam Putih',
    theme: 'dokumen',
    price: 3500,
    priceLabel: 'Mulai dari',
    unit: 'lembar',
    minOrder: 1,
    isNew: true,
    soldCount: 490,
    sortOrder: 5,
    shortDescription:
      'Cetak ukuran besar A3 dan A3+ pada kertas HVS, Art Paper, maupun Art Carton dengan detail presisi.',
    description:
      'Layanan print ukuran A3 (29.7 x 42 cm) dan A3+ (32 x 48 cm) untuk gambar teknik/arsitektur (CAD), tabel laporan keuangan, poster presentasi, hingga proof desain dengan akurasi warna tinggi.',
    sizeOptions: ['A3 (29.7 x 42 cm)', 'A3+ (32.5 x 48.5 cm)'],
    materialOptions: [
      'HVS 80 gsm / 100 gsm',
      'Art Paper 120 / 150 gsm',
      'Art Carton 210 / 260 / 310 gsm',
      'Kertas BW / Linen / Jasmine',
    ],
    finishingOptions: [
      'Tanpa Laminasi (Lembaran)',
      'Laminasi Glossy / Doff 1 Sisi atau 2 Sisi',
      'Potong Pas Ukuran / Lipat Rapi',
    ],
  }),
  makeProduct({
    id: 'prod_dok_cetak_tugas_makalah',
    name: 'Paket Cetak Tugas, Makalah, Laporan & Proposal Kantor',
    categoryId: 'cat_dokumen',
    categoryName: 'Cetak Dokumen',
    subcategory: 'Cetak Tugas, Cetak Makalah & Cetak Proposal',
    theme: 'dokumen',
    price: 10000,
    priceLabel: 'Mulai dari',
    unit: 'berkas',
    minOrder: 1,
    soldCount: 860,
    sortOrder: 5,
    shortDescription:
      'Cetak cepat tugas sekolah/kuliah, makalah seminar, dan proposal penawaran lengkap dengan penjilidan rapi.',
    description:
      'Layanan praktis bagi pelajar, mahasiswa, dan staf kantor untuk mencetak tugas, makalah, laporan praktikum, maupun dokumen tender/proposal perusahaan. File dapat dikirim via WhatsApp atau email dan langsung diambil maupun dikirim kurir.',
    sizeOptions: ['A4 (21 x 29.7 cm)', 'F4 / Folio', 'B5 / A5'],
    materialOptions: [
      'HVS 75 gsm Standar',
      'HVS 80 gsm Tebal',
      'Cover Buffalo + Plastik Mika Bening',
      'Cover Art Carton Full Color',
    ],
    finishingOptions: [
      'Jilid Lakban Rapi (Mika + Buffalo)',
      'Jilid Spiral Kawat / Plastik',
      'Jilid Ring / Klip Segitiga',
    ],
  }),

  // ============================================================================
  // 2. BANNER & MEDIA PROMOSI
  // ============================================================================
  makeProduct({
    id: 'prod_banner_spanduk_outdoor',
    name: 'Cetak Banner, Spanduk & Baliho Outdoor / Indoor',
    categoryId: 'cat_banner',
    categoryName: 'Banner & Media Promosi',
    subcategory: 'Banner, Spanduk & Baliho',
    theme: 'banner',
    price: 25000,
    priceLabel: 'Mulai dari',
    unit: 'meter',
    minOrder: 1,
    featured: true,
    soldCount: 890,
    sortOrder: 6,
    primaryRealPhotoUrl: heroBannerImg,
    shortDescription:
      'Cetak banner, spanduk promosi, dan baliho tahan cuaca matahari & hujan dengan warna tajam.',
    description:
      'Layanan cetak spanduk, banner acara, dan baliho ukuran bebas menggunakan bahan Flexi China, Flexi Korea, maupun Flexi Jerman serta Albatros Indoor. Tinta tahan cuaca dan sinar UV, lengkap dengan mata ayam (ring) atau selongsong.',
    sizeOptions: [
      '100 x 100 cm (Per Meter Persegi)',
      '200 x 100 cm',
      '300 x 100 cm',
      '400 x 200 cm (Baliho)',
      'Ukuran Custom Bebas',
    ],
    materialOptions: [
      'Flexi China 280 gsm',
      'Flexi China 340 gsm',
      'Flexi Korea 440 gsm (Tebal & Halus)',
      'Albatros High Resolution Indoor',
    ],
    finishingOptions: [
      'Mata Ayam (Ring Pojok / Keliling)',
      'Selongsong Kayu / Bambu',
      'Lipat & Lem Pinggir Rapi',
      'Potong Pas (Tanpa Lipat)',
    ],
  }),
  makeProduct({
    id: 'prod_xbanner_rollbanner',
    name: 'X-Banner, Y-Banner & Roll Up Banner Lengkap Rangka',
    categoryId: 'cat_banner',
    categoryName: 'Banner & Media Promosi',
    subcategory: 'X-Banner, Roll Banner & Y-Banner',
    theme: 'banner',
    price: 85000,
    priceLabel: 'Mulai dari',
    unit: 'set',
    minOrder: 1,
    featured: true,
    soldCount: 510,
    sortOrder: 7,
    primaryRealPhotoUrl: bannerXbannerImg,
    shortDescription:
      'Standing display X-Banner, Y-Banner, dan Roll Up Banner kokoh lengkap dengan cetakan resolusi tinggi dan tas.',
    description:
      'Media promosi berdiri (standing banner) praktis untuk pameran, lobi kantor, seminar, dan depan toko. Tersedia pilihan X-Banner ringan, Y-Banner kokoh, serta Roll Up Banner mekanisme gulung otomatis berbahan aluminium.',
    sizeOptions: [
      '60 x 160 cm (Standar)',
      '80 x 180 cm (Besar)',
      '85 x 200 cm (Roll Up Lebar)',
    ],
    materialOptions: [
      'Albatros + Laminasi Doff/Glossy',
      'Luster Premium (Anti Pantul)',
      'Flexi Korea 440 gsm',
    ],
    finishingOptions: [
      'Paket Lengkap Cetakan + Rangka X-Banner',
      'Paket Lengkap Cetakan + Rangka Y-Banner',
      'Paket Lengkap Cetakan + Roll Up Aluminium',
      'Hanya Cetakan Banner (Tanpa Rangka)',
    ],
  }),
  makeProduct({
    id: 'prod_backdrop_poster_umbul',
    name: 'Backdrop Acara, Poster Promosi & Umbul-Umbul / Flag',
    categoryId: 'cat_banner',
    categoryName: 'Banner & Media Promosi',
    subcategory: 'Backdrop, Poster, Sticker Banner, Umbul-umbul & Flag',
    theme: 'banner',
    price: 15000,
    priceLabel: 'Mulai dari',
    unit: 'pcs',
    minOrder: 1,
    soldCount: 340,
    sortOrder: 8,
    shortDescription:
      'Cetak poster A3+, backdrop panggung/photobooth, sticker banner, serta umbul-umbul dan bendera promosi.',
    description:
      'Melayani cetak poster promosi ukuran A3/A2/A1, backdrop seminar dan panggung acara, sticker banner tempel dinding/papan, hingga umbul-umbul kain satin/TC untuk pembukaan cabang dan event.',
    sizeOptions: [
      'Poster A3+ (32 x 48 cm)',
      'Poster A2 / A1',
      'Umbul-Umbul 90 x 300 cm',
      'Backdrop Custom (Per Meter)',
    ],
    materialOptions: [
      'Art Paper 150 gsm / Art Carton 260 gsm',
      'Albatros / Luster Poster',
      'Kain Satin / TC Printing (Umbul-umbul)',
      'Flexi Korea Matte (Backdrop Anti Silau)',
    ],
    finishingOptions: [
      'Laminasi Glossy / Doff',
      'Jahit Keliling + Tali Pengikat',
      'Selongsong Pipa / Rangka Backdrop',
    ],
  }),
  makeProduct({
    id: 'prod_banner_rollup_aluminium',
    name: 'Roll Up Banner Aluminium Eksklusif & Papan Nama Promosi',
    categoryId: 'cat_banner',
    categoryName: 'Banner & Media Promosi',
    subcategory: 'Roll Banner, Sticker Banner & Papan Nama',
    theme: 'banner',
    price: 215000,
    priceLabel: 'Mulai dari',
    unit: 'set',
    minOrder: 1,
    isNew: true,
    soldCount: 320,
    sortOrder: 8,
    shortDescription:
      'Roll Up Banner sistem gulung otomatis berbahan rangka aluminium tebal, praktis dibawa untuk event dan lobi bisnis.',
    description:
      'Display promosi kelas korporat dengan bodi aluminium kokoh yang menyimpan media cetak di dalam tabung saat tidak digunakan. Tersedia pula layanan sticker banner tempel papan nama dan rangka besi.',
    sizeOptions: [
      '60 x 160 cm (Standar)',
      '80 x 200 cm (Besar)',
      '85 x 200 cm (Wide Series)',
    ],
    materialOptions: [
      'Albatros High Resolution + Laminasi Doff / Glossy',
      'Luster Photo Media (Tahan Lengkung)',
      'Flexi Korea 440 gsm',
    ],
    finishingOptions: [
      'Lengkap Rangka Roll Up Aluminium + Tas Kanvas',
      'Sticker Banner Tempel Board / Papan Nama',
    ],
  }),

  // ============================================================================
  // 3. KARTU & IDENTITAS
  // ============================================================================
  makeProduct({
    id: 'prod_kartu_nama_foil',
    name: 'Kartu Nama Eksklusif (Standar, Laminasi & Hotprint Foil)',
    categoryId: 'cat_kartu',
    categoryName: 'Kartu & Identitas',
    subcategory: 'Kartu Nama',
    theme: 'kartu',
    price: 45000,
    priceLabel: 'Mulai dari',
    unit: 'box',
    minOrder: 1,
    featured: true,
    soldCount: 780,
    sortOrder: 9,
    primaryRealPhotoUrl: kartuNamaImg,
    shortDescription:
      'Cetak kartu nama bisnis 1 atau 2 sisi dengan pilihan kertas eksklusif, laminasi beludru/doff, dan foil emas.',
    description:
      'Tingkatkan citra profesional bisnis Anda dengan kartu nama berkualitas tinggi (isi 100 lembar per box). Tersedia cetak 1 sisi atau 2 sisi dengan pilihan kertas Art Carton maupun kertas bertekstur (Fancy Paper) dan opsi sudut melengkung (rounded).',
    sizeOptions: [
      'Standar 9 x 5.5 cm (Isi 100 Lembar/Box)',
      'Ukuran Kartu ATM 8.6 x 5.4 cm',
      'Ukuran Custom Persegi',
    ],
    materialOptions: [
      'Art Carton 260 gsm',
      'Art Carton 310 gsm (Lebih Tebal)',
      'Bw / Linen / Coronado Fancy Paper',
      'PVC Waterproof Tipis',
    ],
    finishingOptions: [
      'Tanpa Laminasi + Box Kartu Nama',
      'Laminasi Doff / Glossy 2 Sisi',
      'Hotprint Foil Emas / Perak',
      'Potong Sudut Rounded + Spot UV',
    ],
  }),
  makeProduct({
    id: 'prod_lanyard_idcard',
    name: 'ID Card PVC, Kartu Pelajar / Anggota & Tali Lanyard Printing',
    categoryId: 'cat_kartu',
    categoryName: 'Kartu & Identitas',
    subcategory: 'ID Card, Kartu Anggota/Pelajar/Panitia, PVC & Lanyard',
    theme: 'kartu',
    price: 15000,
    priceLabel: 'Mulai dari',
    unit: 'pcs',
    minOrder: 5,
    featured: true,
    soldCount: 920,
    sortOrder: 10,
    primaryRealPhotoUrl: lanyardImg,
    shortDescription:
      'Cetak ID Card PVC tebal setara kartu ATM, kartu siswa/panitia, serta tali lanyard printing sublimasi 2 sisi.',
    description:
      'Paket pembuatan kartu identitas karyawan, kartu pelajar, kartu anggota komunitas, dan kartu panitia event. Tersedia cetak kartu PVC tebal 0.76mm anti luntur serta tali lanyard tisu lembut full print 2 sisi lengkap dengan kait besi, stopper, dan casing holder.',
    sizeOptions: [
      'ID Card Standar ISO (8.6 x 5.4 cm)',
      'ID Card Panitia B1 / B2 / B3 / B4',
      'Lanyard Lebar 2 cm x 90 cm',
      'Lanyard Lebar 2.5 cm x 90 cm',
    ],
    materialOptions: [
      'PVC Instant White 0.76 mm (Setara ATM)',
      'PVC RFID / Mifare Smart Card',
      'Tali Lanyard Tisu Halus (Sublimasi 2 Sisi)',
      'Art Carton Laminasi Kaku (Kartu Panitia)',
    ],
    finishingOptions: [
      'Hanya ID Card PVC',
      'Hanya Tali Lanyard + Kait Oval + Stopper',
      'Paket Lengkap: Lanyard + ID Card PVC + Holder',
      'Gantungan Yoyo ID Card + Holder',
    ],
  }),
  makeProduct({
    id: 'prod_kartu_nametag_gantungan',
    name: 'Name Tag Dada (Akrilik / Kuningan Resin) & Gantungan ID Card',
    categoryId: 'cat_kartu',
    categoryName: 'Kartu & Identitas',
    subcategory: 'Name Tag & Gantungan ID Card',
    theme: 'kartu',
    price: 20000,
    priceLabel: 'Mulai dari',
    unit: 'pcs',
    minOrder: 2,
    soldCount: 310,
    sortOrder: 11,
    shortDescription:
      'Name tag dada lapis resin bening mengkilap dengan pengait magnet kuat atau peniti, serta aksesoris holder ID.',
    description:
      'Pembuatan papan nama dada (name tag) untuk seragam kantor, instansi, sekolah, dan perhotelan. Menggunakan lapisan resin timbul (lycal) yang jernih dan tahan gores dengan pilihan pengait magnet neodymium maupun peniti.',
    sizeOptions: ['8 x 2 cm (Standar)', '7.5 x 2.5 cm', 'Ukuran Custom'],
    materialOptions: [
      'Akrilik Hitam / Putih + Lapis Resin',
      'Plat Kuningan Etching + Lapis Resin',
      'Plat Stainless Hairline',
    ],
    finishingOptions: [
      'Pengait Magnet Kuat',
      'Pengait Peniti',
      'Lapisan Resin Cembung Mengkilap',
    ],
  }),

  // ============================================================================
  // 4. STICKER
  // ============================================================================
  makeProduct({
    id: 'prod_sticker_vinyl',
    name: 'Sticker Vinyl, Transparan & Chromo (Kiss-Cut / Die-Cut A3+)',
    categoryId: 'cat_sticker',
    categoryName: 'Sticker',
    subcategory: 'Sticker Vinyl, Transparan, Chromo & Cutting',
    theme: 'sticker',
    price: 12000,
    priceLabel: 'Mulai dari',
    unit: 'lembar A3+',
    minOrder: 5,
    featured: true,
    soldCount: 1150,
    sortOrder: 12,
    primaryRealPhotoUrl: stikerCuttingImg,
    shortDescription:
      'Cetak stiker label produk, stiker kemasan, stiker logo, dan stiker tahan air lengkap dengan potong sesuai bentuk.',
    description:
      'Cetak stiker lembar A3+ (area cetak 31 x 47 cm) sudah termasuk mesin potong presisi mengikuti pola desain (kiss-cut tinggal kelupas maupun die-cut putus). Cocok untuk label botol minuman, kemasan makanan/frozen food, dan stiker komunitas.',
    sizeOptions: [
      'Lembar A3+ (Isi sesuai ukuran bulat/kotak)',
      'Bulat 4 cm (±70 pcs / lembar A3+)',
      'Bulat 5 cm (±45 pcs / lembar A3+)',
      'Bulat 6 cm (±30 pcs / lembar A3+)',
      'Ukuran Custom Sesuai Pola Desain',
    ],
    materialOptions: [
      'Sticker Chromo (Ekonomis untuk Kemasan Kering)',
      'Sticker Vinyl Putih (Tahan Air & Tidak Sobek)',
      'Sticker Vinyl Transparan (Bening)',
      'Sticker Hologram Pelangi',
    ],
    finishingOptions: [
      'Kiss-Cut (Setengah Putus — Tinggal Kelupas)',
      'Die-Cut (Potong Putus Satuan)',
      'Laminasi Glossy / Doff + Cutting',
    ],
  }),
  makeProduct({
    id: 'prod_sticker_cutting_kendaraan',
    name: 'Sticker Cutting, Sticker Kendaraan & Sticker Custom Meteran',
    categoryId: 'cat_sticker',
    categoryName: 'Sticker',
    subcategory: 'Sticker Cutting, Sticker Kendaraan, Logo & Hologram',
    theme: 'sticker',
    price: 45000,
    priceLabel: 'Mulai dari',
    unit: 'meter',
    minOrder: 1,
    soldCount: 280,
    sortOrder: 13,
    shortDescription:
      'Sticker cutting Oracal, sticker branding mobil/motor, sticker kaca, dan sticker decal ukuran besar.',
    description:
      'Layanan pembuatan stiker cutting tulisan/logo untuk kaca mobil, etalase, dan dinding menggunakan bahan Oracal/Reflective, serta cetak stiker meteran outdoor (Ritrama/Quantac) dengan pelindung laminasi tahan gores.',
    sizeOptions: [
      '20 x 60 cm',
      '50 x 100 cm',
      '100 x 100 cm (Per Meter)',
      'Ukuran Custom',
    ],
    materialOptions: [
      'Oracal 651 (Sticker Cutting Solid)',
      'Sticker Reflective (Menyala Saat Kena Sorot Lampu)',
      'Sticker Vinyl Outdoor Ritrama / Quantac',
      'Sticker One Way Vision (Kaca Mobil/Gedung)',
    ],
    finishingOptions: [
      'Lengkap Plastik Masking Transfer Tape',
      'Laminasi Outdoor Glossy / Matte',
      'Potong Sesuai Kontur',
    ],
  }),

  // ============================================================================
  // 5. UNDANGAN & ACARA
  // ============================================================================
  makeProduct({
    id: 'prod_undangan_eksklusif',
    name: 'Cetak Undangan Pernikahan, Khitanan, Aqiqah & Acara',
    categoryId: 'cat_undangan',
    categoryName: 'Undangan & Acara',
    subcategory: 'Undangan Pernikahan, Khitanan, Ulang Tahun, Aqiqah & Tasyakuran',
    theme: 'undangan',
    price: 2500,
    priceLabel: 'Mulai dari',
    unit: 'pcs',
    minOrder: 50,
    featured: true,
    soldCount: 840,
    sortOrder: 14,
    primaryRealPhotoUrl: undanganImg,
    shortDescription:
      'Cetak undangan pernikahan, khitanan, ulang tahun, aqiqah, tasyakuran, dan acara resmi dengan desain elegan.',
    description:
      'Wujudkan undangan berkesan untuk momen spesial Anda: pernikahan, khitanan, ulang tahun, aqiqah, tasyakuran, hingga acara sekolah dan instansi. Sudah termasuk plastik OPP, label nama, dan denah lokasi/QR Code Google Maps.',
    sizeOptions: [
      'Lipat 2 (14 x 20 cm Tertutup)',
      'Lipat 3 (13 x 19 cm Tertutup)',
      'Single Board 15 x 21 cm + Amplop',
    ],
    materialOptions: [
      'Brief Card (BC) 200 gsm',
      'Art Carton 260 gsm + Laminasi Doff',
      'Jasmine Glitter Paper (Efek Mutiara)',
      'Hardcover Board Eksklusif',
    ],
    finishingOptions: [
      'Standar + Plastik OPP + Label Nama',
      'Laminasi Doff + Hotprint Foil Emas Nama',
      'Amplop Custom + Wax Seal / Pita',
    ],
  }),
  makeProduct({
    id: 'prod_undangan_kartu_souvenir',
    name: 'Kartu Ucapan, Kartu Terima Kasih & Souvenir Tag / Label',
    categoryId: 'cat_undangan',
    categoryName: 'Undangan & Acara',
    subcategory: 'Kartu Ucapan, Kartu Terima Kasih, Souvenir Tag & Label Souvenir',
    theme: 'undangan',
    price: 300,
    priceLabel: 'Mulai dari',
    unit: 'pcs',
    minOrder: 50,
    soldCount: 670,
    sortOrder: 15,
    shortDescription:
      'Cetak kartu ucapan hampers, kupon pengambilan souvenir, hang tag terima kasih, dan stiker label tasyakuran.',
    description:
      'Pelengkap acara dan bingkisan: kartu ucapan terima kasih (thank you card) untuk souvenir pernikahan, label nasi kotak aqiqah/tasyakuran, kartu ucapan lebaran/natal, lengkap dengan opsi lubang tali rami atau pita.',
    sizeOptions: [
      '4 x 6 cm (Souvenir Tag)',
      '5 x 9 cm',
      '7 x 10 cm (Kartu Ucapan)',
      '10 x 15 cm (Kartu Hampers)',
    ],
    materialOptions: [
      'Art Carton 260 gsm',
      'Kertas Kraft Coklat Klasik 280 gsm',
      'Kertas Jasmine Mutiara',
      'Sticker Chromo / Vinyl (Untuk Label Kotak)',
    ],
    finishingOptions: [
      'Potong Kotak + Plong Lubang 3mm',
      'Potong Bentuk Custom (Die-Cut)',
      'Lengkap Tali Rami / Rantai Biji Lada',
    ],
  }),

  // ============================================================================
  // 6. CETAK FOTO
  // ============================================================================
  makeProduct({
    id: 'prod_foto_print_polaroid',
    name: 'Cetak Pas Foto (2x3, 3x4, 4x6), Foto Polaroid & Foto 10R / 12R',
    categoryId: 'cat_foto',
    categoryName: 'Cetak Foto',
    subcategory: 'Foto 2x3, 3x4, 4x6, 10R, 12R, Polaroid, Collage & Foto Dokumen',
    theme: 'foto',
    price: 5000,
    priceLabel: 'Mulai dari',
    unit: 'paket',
    minOrder: 1,
    featured: true,
    soldCount: 910,
    sortOrder: 16,
    shortDescription:
      'Cetak pas foto resmi (ganti warna background), foto gaya polaroid, kolase foto, hingga cetak ukuran 4R–12R.',
    description:
      'Layanan cetak foto kualitas lab pada kertas Silky / Lustre maupun Glossy Photo Paper yang tahan pudar. Melayani cetak pas foto sekolah, ijazah, buku nikah, dan lamaran kerja (bisa bantu ganti warna latar merah/biru) serta paket foto polaroid dan perbesaran 10R/12R.',
    sizeOptions: [
      'Paket Pas Foto (2x3, 3x4, 4x6)',
      'Paket Polaroid 2R (Isi 25 Foto)',
      'Ukuran 4R / 5R / 6R',
      'Ukuran Besar 10R (20x25 cm) / 12R (30x40 cm)',
      'Ukuran Custom / Collage Foto',
    ],
    materialOptions: [
      'Silky / Lustre Photo Paper 260 gsm (Tekstur Kulit Jeruk)',
      'Premium Glossy Photo Paper 260 gsm',
      'Art Carton 310 gsm + Laminasi (Khusus Polaroid)',
    ],
    finishingOptions: [
      'Potong Presisi Siap Tempel',
      'Gratis Ganti Warna Background Pas Foto (Merah/Biru)',
      'Laminasi Pelindung Foto',
    ],
  }),
  makeProduct({
    id: 'prod_foto_10r_12r_premium',
    name: 'Cetak Foto Ukuran Besar (10R, 12R, Custom), Polaroid & Collage Foto',
    categoryId: 'cat_foto',
    categoryName: 'Cetak Foto',
    subcategory: 'Foto 10R, Foto 12R, Foto Ukuran Custom, Polaroid & Foto Premium',
    theme: 'foto',
    price: 15000,
    priceLabel: 'Mulai dari',
    unit: 'lembar / paket',
    minOrder: 1,
    isNew: true,
    soldCount: 440,
    sortOrder: 16,
    shortDescription:
      'Cetak foto keluarga, wisuda, pernikahan ukuran 10R/12R/custom serta paket cetak foto polaroid dan kolase.',
    description:
      'Abadikan foto keluarga, wisuda, maupun kenangan perjalanan dengan cetakan kualitas lab foto profesional yang tajam dan tahan puluhan tahun. Tersedia pula desain kolase (collage foto) banyak frame dalam satu lembar.',
    sizeOptions: [
      '10R (20 x 25 cm) / 10RS (20 x 30 cm)',
      '12R (30 x 40 cm) / 12RS (30 x 45 cm)',
      '16R (40 x 50 cm) / 20R (50 x 60 cm)',
      'Paket Polaroid Custom & Collage Foto',
    ],
    materialOptions: [
      'Lustre / Silky Photo Paper Premium (Anti Sidik Jari)',
      'Glossy Photo Paper High Definition',
      'Art Carton 310 gsm Laminasi Glossy (Paket Polaroid)',
    ],
    finishingOptions: [
      'Laminasi Dingin Tekstur Kanvas / Doff',
      'Tanpa Bingkai (Lembaran Aman Dalam Tube)',
      'Lengkap Bingkai Minimalis Siap Pajang',
    ],
  }),

  // ============================================================================
  // 7. MERCHANDISE
  // ============================================================================
  makeProduct({
    id: 'prod_tumbler_custom',
    name: 'Tumbler Custom & Botol Minum (Grafir Laser / UV Full Color)',
    categoryId: 'cat_merchandise',
    categoryName: 'Merchandise',
    subcategory: 'Tumbler Custom & Botol Custom',
    theme: 'merchandise',
    price: 65000,
    originalPrice: 80000,
    priceLabel: 'Mulai dari',
    unit: 'pcs',
    minOrder: 1,
    featured: true,
    soldCount: 1120,
    sortOrder: 17,
    primaryRealPhotoUrl: tumblerImg,
    shortDescription:
      'Tumbler stainless steel vacuum flask tahan panas/dingin dengan grafir laser permanen maupun cetak UV warna.',
    description:
      'Tumbler stainless steel SUS 304 double-wall yang menjaga suhu minuman hingga 8–12 jam. Cocok untuk souvenir perusahaan, seminar kit, maupun kado personal dengan pilihan grafir laser silver permanen atau cetak UV full color.',
    sizeOptions: [
      '500 ml (Sakura / Niagara / LED Suhu / Bowling)',
      '420 ml (Tumbler Bambu / Travel Mug)',
      '750 ml – 1000 ml (Sport Bottle)',
    ],
    materialOptions: [
      'Stainless Steel SUS 304 Double Wall',
      'Aluminium Sport Bottle',
      'BPA-Free Tritan Bottle',
    ],
    finishingOptions: [
      'Grafir Laser 1 Sisi + Box Satuan',
      'Grafir Laser 2 Sisi + Box Satuan',
      'UV Print Full Color Logo / Nama',
    ],
  }),
  makeProduct({
    id: 'prod_mug_custom',
    name: 'Mug Custom Keramik SNI Full Print + Box Satuan',
    categoryId: 'cat_merchandise',
    categoryName: 'Merchandise',
    subcategory: 'Mug Custom',
    theme: 'merchandise',
    price: 22000,
    priceLabel: 'Mulai dari',
    unit: 'pcs',
    minOrder: 1,
    featured: true,
    soldCount: 740,
    sortOrder: 18,
    primaryRealPhotoUrl: mugMerchImg,
    shortDescription:
      'Mug keramik standar SNI putih bersih dengan cetakan foto, logo, atau desain melingkar penuh sudah termasuk box.',
    description:
      'Cetak mug keramik ukuran 11 oz (325 ml) dengan coating kualitas tinggi sehingga hasil cetak tajam, mengkilap, dan aman dicuci berulang kali. Setiap pemesanan sudah dilengkapi box karton putih satuan.',
    sizeOptions: ['Standar 11 oz / 325 ml (Area Cetak 20 x 8 cm)'],
    materialOptions: [
      'Keramik Putih Standar SNI',
      'Mug Dalam Warna (Merah, Kuning, Hitam, Biru)',
      'Mug Bunglon (Berubah Warna Saat Diisi Air Panas)',
    ],
    finishingOptions: [
      'Cetak Sublimasi Full Color + Box Putih',
      'Tambahan Pita & Kartu Ucapan Souvenir',
    ],
  }),
  makeProduct({
    id: 'prod_keychain_akrilik',
    name: 'Gantungan Kunci Akrilik, Pin, Magnet Kulkas & Pulpen Custom',
    categoryId: 'cat_merchandise',
    categoryName: 'Merchandise',
    subcategory: 'Gantungan Kunci, Pin, Magnet Kulkas & Pulpen Custom',
    theme: 'merchandise',
    price: 3500,
    priceLabel: 'Mulai dari',
    unit: 'pcs',
    minOrder: 10,
    soldCount: 830,
    sortOrder: 19,
    shortDescription:
      'Souvenir promosi populer: gantungan kunci akrilik potong laser, pin peniti, magnet kulkas, dan pulpen logo.',
    description:
      'Aneka merchandise promosi ekonomis dengan daya guna tinggi untuk kampanye, komunitas, sekolah, dan souvenir event: gantungan kunci akrilik UV print + laser cut, pin bulat peniti/gantungan, magnet kulkas, serta pulpen promosi cetak logo.',
    sizeOptions: [
      'Diameter 4.4 cm / 5.8 cm (Pin & Magnet)',
      'Area 5 x 5 cm / Custom (Gantungan Kunci Akrilik)',
      'Ukuran Standar Pulpen Promosi',
    ],
    materialOptions: [
      'Akrilik Bening 3mm / 4mm (2 Sisi)',
      'Pin Kaleng + Mylar Glossy / Doff',
      'Magnet Karet Fleksibel / Magnet Pin',
      'Pulpen Plastik / Metal Grafir',
    ],
    finishingOptions: [
      'Kemas Plastik OPP Satuan',
      'Ring Gantungan Putar Tebal',
      'Laminasi Glossy / Doff / Kanvas',
    ],
  }),
  makeProduct({
    id: 'prod_merch_kalender_notebook',
    name: 'Kalender Custom (Meja / Dinding), Notebook & Buku Agenda',
    categoryId: 'cat_merchandise',
    categoryName: 'Merchandise',
    subcategory: 'Kalender Custom, Notebook Custom & Buku Agenda',
    theme: 'merchandise',
    price: 25000,
    priceLabel: 'Mulai dari',
    unit: 'pcs',
    minOrder: 5,
    isNew: true,
    soldCount: 460,
    sortOrder: 20,
    shortDescription:
      'Pembuatan kalender meja dudukan hardboard, kalender dinding klem seng/spiral, serta buku agenda dan notebook custom.',
    description:
      'Souvenir tahunan terbaik untuk klien dan relasi bisnis. Melayani pembuatan kalender meja (7 lembar atau 13 lembar bolak-balik dengan dudukan linen kokoh), kalender dinding berbagai ukuran, serta notebook spiral dan buku agenda kulit sintetis (PU Leather).',
    sizeOptions: [
      'Kalender Meja 21 x 15 cm (Landscape / Portrait)',
      'Kalender Dinding 32 x 48 cm / 38 x 54 cm',
      'Notebook & Agenda A5 (14.8 x 21 cm)',
    ],
    materialOptions: [
      'Art Carton 230 / 260 gsm + Dudukan Board Linen',
      'Art Paper 150 gsm (Kalender Dinding)',
      'Cover Hardboard / Kulit Sintetis + Isi HVS 80 gsm',
    ],
    finishingOptions: [
      'Ring Spiral Kawat Hitam / Putih',
      'Klem Seng (Kalender Dinding)',
      'Hotprint Foil / Emboss Logo pada Agenda',
    ],
  }),
  makeProduct({
    id: 'prod_kaos_custom',
    name: 'Kaos Custom, Tote Bag Kanvas / Blacu & Topi Custom',
    categoryId: 'cat_merchandise',
    categoryName: 'Merchandise',
    subcategory: 'Tote Bag, Tas Custom, Kaos Custom & Topi Custom',
    theme: 'merchandise',
    price: 35000,
    priceLabel: 'Mulai dari',
    unit: 'pcs',
    minOrder: 1,
    featured: true,
    soldCount: 680,
    sortOrder: 21,
    primaryRealPhotoUrl: kaosTotebagImg,
    shortDescription:
      'Sablon kaos cotton combed 24s/30s, tas tote bag seminar/belanja, serta topi custom untuk komunitas dan seragam.',
    description:
      'Produksi apparel dan tas promosi dengan teknologi sablon DTF (Direct Transfer Film) resolusi tinggi maupun bordir komputer. Tersedia kaos Cotton Combed 24s/30s yang sejuk, tote bag kanvas/blacu/spunbond, dan topi trucker/baseball.',
    sizeOptions: [
      'Kaos Ukuran S, M, L, XL, XXL, 3XL',
      'Tote Bag 30 x 40 cm (Muat Laptop / Map)',
      'Topi All Size Dewasa (Pengatur Belakang)',
    ],
    materialOptions: [
      'Kaos 100% Cotton Combed 30s / 24s',
      'Kain Kanvas Tebal / Blacu Natural (Tote Bag)',
      'Kain Drill / Rafel (Topi Baseball) & Jaring (Trucker)',
    ],
    finishingOptions: [
      'Sablon Digital DTF Full Color Halus & Kuat',
      'Sablon Polyflex Satu Warna',
      'Bordir Komputer Presisi',
    ],
  }),

  // ============================================================================
  // 8. KEMASAN & LABEL
  // ============================================================================
  makeProduct({
    id: 'prod_kemasan_paperbag_box',
    name: 'Paper Bag Custom, Box Custom, Dus Produk & Sleeve Packaging',
    categoryId: 'cat_kemasan',
    categoryName: 'Kemasan & Label',
    subcategory: 'Paper Bag, Box Custom, Dus Produk & Sleeve Packaging',
    theme: 'kemasan',
    price: 2500,
    priceLabel: 'Mulai dari',
    unit: 'pcs',
    minOrder: 50,
    featured: true,
    isNew: true,
    soldCount: 590,
    sortOrder: 22,
    shortDescription:
      'Cetak tas kertas (paper bag) butik/acara, dus makanan & kosmetik, box hampers, serta sabuk kemasan (sleeve).',
    description:
      'Tingkatkan nilai jual produk Anda dengan kemasan cetak profesional. Kami memproduksi paper bag custom lengkap dengan tali kur/pita, box kemasan produk (kuliner, skincare, parfum, pakaian), hingga paper belt / sleeve packaging.',
    sizeOptions: [
      'Kecil (15 x 8 x 20 cm)',
      'Sedang (22 x 10 x 28 cm)',
      'Besar (30 x 12 x 40 cm)',
      'Ukuran Box / Sleeve Custom Sesuai Produk',
    ],
    materialOptions: [
      'Kraft Coklat 150 / 200 gsm (Ramah Lingkungan)',
      'Ivory 230 / 270 / 310 gsm (Standar Food Grade & Kosmetik)',
      'Duplex 250 / 310 gsm',
      'Art Carton 260 gsm',
    ],
    finishingOptions: [
      'Laminasi Glossy / Doff + Tali Kur / Pita',
      'Pond / Die-Cut Lipatan Presisi',
      'Hotprint Foil Logo',
    ],
  }),
  makeProduct({
    id: 'prod_kemasan_hangtag_garansi',
    name: 'Hang Tag Pakaian, Thank You Card, Kartu Garansi & Label Kemasan',
    categoryId: 'cat_kemasan',
    categoryName: 'Kemasan & Label',
    subcategory: 'Label Produk, Sticker Kemasan, Hang Tag, Thank You Card & Kartu Garansi',
    theme: 'kemasan',
    price: 400,
    priceLabel: 'Mulai dari',
    unit: 'pcs',
    minOrder: 100,
    soldCount: 730,
    sortOrder: 23,
    shortDescription:
      'Cetak label gantung (hang tag) brand fashion, kartu terima kasih olshop, kartu garansi produk, dan segel kemasan.',
    description:
      'Kelengkapan branding wajib untuk bisnis fashion, F&B, dan retail online: hang tag tebal dengan lubang loop pin, kartu ucapan terima kasih pelanggan, kartu instruksi perawatan/garansi, serta stiker segel bukaan box (packaging seal).',
    sizeOptions: [
      'Hang Tag 4 x 9 cm / 5 x 9 cm',
      'Kartu 9 x 5.5 cm / 10 x 7 cm',
      'Segel Box 3 x 10 cm / 4 x 12 cm',
    ],
    materialOptions: [
      'Art Carton 310 gsm / Ivory 350 gsm Tebal',
      'Kraft Liner 280 gsm',
      'Sticker Vinyl / Chromo (Untuk Segel Kemasan)',
    ],
    finishingOptions: [
      'Laminasi Doff 2 Sisi + Lubang Hang Tag',
      'Potong Sudut Rounded / Bentuk Custom',
      'Tambah Tali Loop Pin / Rantai Biji Lada',
    ],
  }),

  // ============================================================================
  // 9. ALAT PROMOSI TOKO
  // ============================================================================
  makeProduct({
    id: 'prod_toko_neonbox_signage',
    name: 'Neon Box, Papan Nama Toko, Acrylic Sign & Signage Ruangan',
    categoryId: 'cat_promosi_toko',
    categoryName: 'Alat Promosi Toko',
    subcategory: 'Neon Box, Papan Nama Toko, Acrylic Sign & Signage',
    theme: 'promosi_toko',
    price: 150000,
    priceLabel: 'Mulai dari',
    unit: 'unit',
    minOrder: 1,
    featured: true,
    isNew: true,
    soldCount: 195,
    sortOrder: 24,
    shortDescription:
      'Pembuatan papan nama akrilik, signage pintu/ruangan kantor, hingga neon box LED bulat/kotak untuk identitas usaha.',
    description:
      'Buat lokasi toko, kafe, klinik, dan kantor Anda mudah dikenali siang maupun malam. Melayani pembuatan signage akrilik (petunjuk ruangan, nomor kamar, logo resepsionis dengan baut pen iklan) serta Neon Box LED terang hemat daya.',
    sizeOptions: [
      'Signage Akrilik 20 x 10 cm / 30 x 15 cm / A4 / A3',
      'Neon Box Bulat Diameter 40 cm / 60 cm / 80 cm',
      'Papan Nama Toko Ukuran Custom',
    ],
    materialOptions: [
      'Akrilik Bening / Susu / Hitam 3mm – 5mm',
      'Neon Box Akrilik 2 Sisi + Lampu LED + Adaptor',
      'Rangka Besi Hollow + Visual Backlite / Akrilik',
    ],
    finishingOptions: [
      'Lengkap Baut Pen Iklan (Sign Board)',
      'UV Print Langsung di Akrilik / Sticker Cutting Oracal',
      'Bracket Besi Siap Pasang',
    ],
  }),
  makeProduct({
    id: 'prod_toko_menuboard_stikerkaca',
    name: 'Menu Board, Price List, Display Acrylic & Stiker Kaca / Etalase',
    categoryId: 'cat_promosi_toko',
    categoryName: 'Alat Promosi Toko',
    subcategory: 'Menu Board, Price List, Display Acrylic, Stiker Kaca & Etalase',
    theme: 'promosi_toko',
    price: 15000,
    priceLabel: 'Mulai dari',
    unit: 'pcs',
    minOrder: 1,
    soldCount: 420,
    sortOrder: 25,
    shortDescription:
      'Cetak buku/lembaran daftar menu tahan air, tent card akrilik meja kasir, serta stiker sandblast dan kaca toko.',
    description:
      'Perlengkapan promosi di dalam toko, restoran, kafe, dan barbershop: cetak buku menu & price list bahan PVC/Art Carton laminasi tebal tahan air, display akrilik meja (QRIS stand / brosur holder), serta stiker kaca etalase dan sandblast.',
    sizeOptions: [
      'Menu A4 / A3 (1 Lembar atau Buku)',
      'Display Akrilik A6 / A5 / A4',
      'Stiker Kaca / Sandblast (Per Meter Persegi)',
    ],
    materialOptions: [
      'Art Carton 310 gsm + Laminasi Kaku Tahan Air',
      'Board PVC + Akrilik Bening 2mm (Tent Card)',
      'Sticker Sandblast Buram / Vinyl Kaca Etalase',
    ],
    finishingOptions: [
      'Laminasi Glossy / Doff Tahan Cipratan Air',
      'Jilid Spiral / Ring Menu',
      'Cutting Pola Tulisan Jam Buka & Logo Toko',
    ],
  }),

  // ============================================================================
  // 10. PRODUK SEKOLAH & KANTOR
  // ============================================================================
  makeProduct({
    id: 'prod_kantor_map_sertifikat_raport',
    name: 'Map Sekolah / Perusahaan, Sampul Raport, Sertifikat & Piagam',
    categoryId: 'cat_sekolah_kantor',
    categoryName: 'Produk Sekolah & Kantor',
    subcategory: 'Map Sekolah, Map Perusahaan, Sertifikat, Piagam & Buku Raport',
    theme: 'sekolah_kantor',
    price: 5000,
    priceLabel: 'Mulai dari',
    unit: 'pcs',
    minOrder: 10,
    featured: true,
    soldCount: 640,
    sortOrder: 26,
    shortDescription:
      'Cetak stopmap folder berkantong, map ijazah/raport ASE hotprint emas, serta cetak sertifikat dan piagam penghargaan.',
    description:
      'Layanan cetak perlengkapan institusi pendidikan, kampus, dan perusahaan: pembuatan map folder dokumen (stopmap) dengan kantong dalam, map ijazah & sampul raport bahan ASE/TPK poli emas, serta cetak sertifikat pelatihan/lomba di kertas Linen/Concorde.',
    sizeOptions: [
      'Sertifikat / Piagam A4 (21 x 29.7 cm)',
      'Stopmap Folder Masuk A4 / F4',
      'Map Ijazah / Raport F4 + Isi Kantong Plastik',
    ],
    materialOptions: [
      'Kertas Linen / Concorde / Bw 230 gsm (Sertifikat)',
      'Art Carton 260 / 310 gsm (Map Folder)',
      'Bahan ASE / TPK + Karton Tebal (Sampul Raport)',
    ],
    finishingOptions: [
      'Hotprint Foil Emas / Perak Logo',
      'Kantong Dalam Map + Slot Kartu Nama',
      'Laminasi Doff / Glossy',
    ],
  }),
  makeProduct({
    id: 'prod_kantor_nota_kopsurat_amplop',
    name: 'Cetak Nota / Kwitansi / Invoice NCR, Kop Surat, Amplop & Buku Kas',
    categoryId: 'cat_sekolah_kantor',
    categoryName: 'Produk Sekolah & Kantor',
    subcategory: 'Kop Surat, Amplop, Nota, Kwitansi, Invoice, Buku Kas & Form Administrasi',
    theme: 'sekolah_kantor',
    price: 25000,
    priceLabel: 'Mulai dari',
    unit: 'buku / pak',
    minOrder: 5,
    soldCount: 810,
    sortOrder: 27,
    shortDescription:
      'Cetak buku nota/faktur NCR rangkap 2–4 langsung tembus tanpa karbon, kop surat resmi, amplop kabinet, dan form kantor.',
    description:
      'Penuhi kebutuhan administrasi dan transaksi bisnis Anda dengan cetakan beridentitas resmi: buku nota, kwitansi, surat jalan, dan invoice berbahan kertas NCR (tembus otomatis rangkap 1, 2, 3, atau 4), kop surat HVS, amplop berlogo, serta buku kas.',
    sizeOptions: [
      'Nota 1/4 Folio, 1/3 Folio, 1/2 Folio, atau 1 Folio',
      'Kop Surat A4 / F4 (1 Rim = 500 Lembar)',
      'Amplop Kabinet Panjang (11 x 23 cm Isi 100 pcs)',
    ],
    materialOptions: [
      'Kertas NCR Tembus Otomatis (Putih, Merah, Kuning, Hijau, Biru)',
      'HVS 80 gsm / 100 gsm (Kop Surat & Form)',
      'Amplop Paperline / Jayamas + Perekat',
    ],
    finishingOptions: [
      'Jilid Buku + Cacah Perforasi (Mudah Disobek)',
      'Nomorator Urut Otomatis (Nomor Seri Nota)',
      'Cetak 1 Warna / Full Color',
    ],
  }),
  makeProduct({
    id: 'prod_kantor_idcard_siswa_pegawai',
    name: 'ID Card Sekolah, Kartu Siswa, Kartu Pegawai & Form Administrasi',
    categoryId: 'cat_sekolah_kantor',
    categoryName: 'Produk Sekolah & Kantor',
    subcategory: 'ID Card Sekolah, Kartu Siswa, Kartu Pegawai & Form Administrasi',
    theme: 'sekolah_kantor',
    price: 7500,
    priceLabel: 'Mulai dari',
    unit: 'pcs',
    minOrder: 10,
    isNew: true,
    soldCount: 530,
    sortOrder: 27,
    primaryRealPhotoUrl: lanyardImg,
    shortDescription:
      'Cetak kartu pelajar/siswa dengan barcode/QR, kartu pegawai instansi, buku agenda sekolah, dan formulir administrasi.',
    description:
      'Layanan khusus sekolah, pesantren, universitas, dan kantor untuk pencetakan kartu pelajar/mahasiswa (mendukung variabel data foto, NISN, dan barcode perpustakaan), kartu pegawai, serta berbagai lembar formulir administrasi.',
    sizeOptions: [
      'Standar Kartu PVC ATM (8.6 x 5.4 cm)',
      'Formulir Administrasi A4 / F4',
      'Buku Agenda / Buku Penghubung Siswa A5',
    ],
    materialOptions: [
      'PVC Tebal 0.76 mm Anti Luntur',
      'HVS 80 gsm / NCR (Formulir Administrasi)',
      'Art Carton 260 gsm + Isi HVS (Buku Siswa)',
    ],
    finishingOptions: [
      'Cetak Data Variabel (Nama, NIS/NIP, Foto & Barcode)',
      'Lengkap Tali Lanyard Sekolah + Casing Holder',
      'Plong Lubang ID Card',
    ],
  }),

  // ============================================================================
  // 11. PRODUK FOTO & DEKORASI
  // ============================================================================
  makeProduct({
    id: 'prod_dekor_canvas_acrylic_frame',
    name: 'Foto Canvas Spanram, Foto Acrylic, Photo Frame & Wall Decoration',
    categoryId: 'cat_foto_dekorasi',
    categoryName: 'Produk Foto & Dekorasi',
    subcategory: 'Photo Frame, Foto Canvas, Foto Acrylic, Poster Foto & Wall Decoration',
    theme: 'foto_dekorasi',
    price: 45000,
    priceLabel: 'Mulai dari',
    unit: 'pcs',
    minOrder: 1,
    featured: true,
    isNew: true,
    soldCount: 330,
    sortOrder: 28,
    shortDescription:
      'Cetak foto kanvas lengkap rangka kayu (spanram), foto blok MDF, foto akrilik dinding, dan bingkai foto dekorasi ruangan.',
    description:
      'Ubah momen berharga dan karya visual menjadi dekorasi dinding berkelas. Tersedia cetak foto di atas kain kanvas asli lengkap dengan rangka kayu spanram siap gantung, cetak foto langsung di akrilik bening, hingga poster bingkai minimalis.',
    sizeOptions: [
      '20 x 30 cm (8R / A4)',
      '30 x 40 cm (12R / A3)',
      '40 x 60 cm (16R)',
      '60 x 90 cm (Besar)',
      'Ukuran Custom / Set Kolase Dinding',
    ],
    materialOptions: [
      'Kanvas Cotton / Poly + Rangka Kayu Spanram Tebal 2.5 cm',
      'Akrilik Bening 3mm / 5mm UV Print',
      'Papan MDF 6mm / 9mm (Frameless Photo Block)',
      'Bingkai Minimalis Hitam / Putih / Motif Kayu',
    ],
    finishingOptions: [
      'Siap Gantung (Lengkap Pengait Belakang)',
      'Baut Pen Iklan Dinding (Khusus Foto Akrilik)',
      'Laminasi Pelindung Anti Jamur & Mudah Dibersihkan',
    ],
  }),
  makeProduct({
    id: 'prod_dekor_kalender_kolase_custom',
    name: 'Kalender Foto Custom, Kolase Foto Bingkai & Cetak Foto Dekorasi',
    categoryId: 'cat_foto_dekorasi',
    categoryName: 'Produk Foto & Dekorasi',
    subcategory: 'Kalender Foto, Kolase Foto, Poster Foto & Cetak Foto Custom',
    theme: 'foto_dekorasi',
    price: 25000,
    priceLabel: 'Mulai dari',
    unit: 'pcs',
    minOrder: 1,
    isNew: true,
    soldCount: 275,
    sortOrder: 28,
    shortDescription:
      'Cetak kalender dinding/meja dengan foto keluarga sendiri, poster foto estetik, dan kolase foto hadiah ulang tahun/wisuda.',
    description:
      'Buat hadiah berkesan atau hiasan kamar dan ruang keluarga dengan kalender foto custom (bisa mulai dari 1 pcs), kolase banyak foto dengan ucapan custom, serta poster foto resolusi tinggi.',
    sizeOptions: [
      'Kalender Meja Foto (21 x 15 cm)',
      'Kalender Dinding Foto (32 x 48 cm)',
      'Kolase Foto A4 (21 x 30 cm) / A3 (30 x 42 cm)',
    ],
    materialOptions: [
      'Art Carton 260 gsm + Dudukan Hardboard Linen',
      'Silky Photo Paper + Bingkai Minimalis',
      'Papan MDF + Stiker Vinyl Laminasi Doff',
    ],
    finishingOptions: [
      'Spiral Kawat Putih / Hitam (Kalender)',
      'Bingkai Kaca / Frameless Block Siap Pajang',
      'Gratis Susun Tata Letak Kolase & Tambah Teks Ucapan',
    ],
  }),

  // ============================================================================
  // CETAKAN UMUM, PROMOSI BISNIS & MERCHANDISE TAMBAHAN
  // ============================================================================
  makeProduct({
    id: 'prod_umum_brosur_leaflet',
    name: 'Cetak Brosur & Leaflet Lipat Promosi (Lipat 2 / Lipat 3 Full Color)',
    categoryId: 'cat_dokumen',
    categoryName: 'Cetak Dokumen',
    subcategory: 'Brosur, Leaflet & Brosur Usaha',
    theme: 'dokumen',
    price: 175000,
    priceLabel: 'Mulai dari',
    unit: 'rim / 100 lembar',
    minOrder: 1,
    featured: true,
    isNew: true,
    soldCount: 690,
    sortOrder: 4,
    shortDescription:
      'Cetak brosur dan leaflet promosi usaha ukuran A4/A5/F4 bolak-balik pada kertas Art Paper mengkilap dengan lipatan rapi.',
    description:
      'Media promosi cetak paling efektif untuk pameran, penerimaan siswa/mahasiswa baru, katalog daftar harga, dan penawaran produk. Dicetak full color 1 atau 2 sisi di atas kertas Art Paper 120/150 gsm dengan opsi lipat 2 (bi-fold) atau lipat 3 (tri-fold).',
    sizeOptions: [
      'A4 Terbuka (21 x 29.7 cm) — Lipat 2 / Lipat 3',
      'F4 / Folio Terbuka (21.5 x 33 cm)',
      'A5 (14.8 x 21 cm)',
      'DL (10 x 21 cm)',
    ],
    materialOptions: [
      'Art Paper 120 gsm (Standar Brosur)',
      'Art Paper 150 gsm (Tebal & Eksklusif)',
      'Art Carton 210 gsm',
      'HVS 80 / 100 gsm',
    ],
    finishingOptions: [
      'Tanpa Lipat (Lembaran)',
      'Lipat 2 (Bi-Fold) / Lipat 3 (Tri-Fold) Mesin Rapi',
      'Laminasi Glossy / Doff 2 Sisi',
    ],
  }),
  makeProduct({
    id: 'prod_umum_flyer_selebaran',
    name: 'Cetak Flyer Promosi & Selebaran Event (A5 / A6 / DL)',
    categoryId: 'cat_banner',
    categoryName: 'Banner & Media Promosi',
    subcategory: 'Flyer, Brosur Usaha & Poster Promosi',
    theme: 'banner',
    price: 95000,
    priceLabel: 'Mulai dari',
    unit: 'pak (100 lembar)',
    minOrder: 1,
    isNew: true,
    soldCount: 540,
    sortOrder: 7,
    shortDescription:
      'Flyer promosi praktis dan tajam untuk pembukaan toko, diskon restoran, event, dan promosi produk.',
    description:
      'Cetak flyer satu lembar tanpa lipat dengan warna kontras dan teks tajam. Sangat ekonomis untuk dibagikan pada pameran, sisipan kemasan pesanan online, maupun promosi gerai kuliner dan retail.',
    sizeOptions: [
      'A6 (10.5 x 14.8 cm)',
      'A5 (14.8 x 21 cm — Paling Populer)',
      'DL (9.9 x 21 cm)',
      'A4 (21 x 29.7 cm)',
    ],
    materialOptions: [
      'Art Paper 120 gsm',
      'Art Paper 150 gsm',
      'Art Carton 210 / 260 gsm',
    ],
    finishingOptions: [
      'Cetak 1 Sisi Full Color',
      'Cetak 2 Sisi (Bolak-Balik) Full Color',
      'Potong Presisi Siap Sebar',
    ],
  }),
  makeProduct({
    id: 'prod_umum_katalog_compro_booklet',
    name: 'Cetak Katalog Produk, Company Profile, Booklet & Majalah',
    categoryId: 'cat_dokumen',
    categoryName: 'Cetak Dokumen',
    subcategory: 'Katalog, Company Profile, Booklet & Majalah',
    theme: 'dokumen',
    price: 25000,
    priceLabel: 'Mulai dari',
    unit: 'buku',
    minOrder: 5,
    featured: true,
    isNew: true,
    soldCount: 380,
    sortOrder: 4,
    shortDescription:
      'Cetak buku company profile perusahaan, katalog produk, booklet acara, dan majalah internal kualitas offset/digital.',
    description:
      'Tampilkan kredibilitas perusahaan dan portofolio produk Anda melalui cetakan Company Profile, Katalog, Booklet, dan Majalah berstandar tinggi. Menggunakan kertas Art Paper yang menghasilkan foto tajam dengan sampul Art Carton berlaminasi doff atau glossy.',
    sizeOptions: [
      'A4 Portrait / Landscape (21 x 29.7 cm)',
      'A5 Booklet (14.8 x 21 cm)',
      'Square 20 x 20 cm / 21 x 21 cm',
    ],
    materialOptions: [
      'Cover Art Carton 260/310 gsm + Isi Art Paper 150 gsm',
      'Full Art Carton 210 gsm (Company Profile Tebal)',
      'Cover Hardcover Eksklusif + Isi Matt Paper 150 gsm',
    ],
    finishingOptions: [
      'Jilid Jahit Kawat (Saddle Stitch / Staples Tengah)',
      'Jilid Lem Panas (Perfect Binding) + Laminasi Cover',
      'Spot UV / Hotprint Foil pada Logo Cover',
    ],
  }),
  makeProduct({
    id: 'prod_undangan_digital_souvenir',
    name: 'Undangan Digital Website / Video, Souvenir Pernikahan & Kartu Nama Souvenir',
    categoryId: 'cat_undangan',
    categoryName: 'Undangan & Acara',
    subcategory: 'Undangan Digital, Souvenir Pernikahan & Kartu Nama Souvenir',
    theme: 'undangan',
    price: 1500,
    priceLabel: 'Mulai dari',
    unit: 'pcs / paket',
    minOrder: 1,
    isNew: true,
    soldCount: 490,
    sortOrder: 15,
    primaryRealPhotoUrl: undanganImg,
    shortDescription:
      'Pembuatan undangan digital interaktif, paket souvenir pernikahan custom, serta kartu nama/kupon penukaran souvenir.',
    description:
      'Lengkapi acara pernikahan dan syukuran Anda dengan paket souvenir pernikahan custom (mug, tumbler, pouch, gantungan kunci, kipas, atau tote bag), kartu nama/kupon pengambilan souvenir, serta undangan digital siap sebar via WhatsApp.',
    sizeOptions: [
      'Kartu Nama Souvenir 4 x 6 cm / 5.5 x 9 cm',
      'Souvenir Pernikahan Custom (Kemasan Tile / Box)',
      'Paket Undangan Digital Web / Video Full Fitur',
    ],
    materialOptions: [
      'Art Carton 260 gsm / Jasmine Glitter',
      'Souvenir Custom + Sablon Nama Pengantin',
      'Desain Digital Responsif + Musik & Navigasi Peta',
    ],
    finishingOptions: [
      'Plong Lubang + Tali Pita / Rami',
      'Kemas Plastik OPP / Kantong Tile + Kartu Ucapan',
      'Revisi Data Acara & Tamu Tanpa Batas',
    ],
  }),
  makeProduct({
    id: 'prod_kartu_nameplate_holder',
    name: 'Name Plate Meja (Akrilik / Kuningan) & Holder ID Card Kulit / Akrilik',
    categoryId: 'cat_kartu',
    categoryName: 'Kartu & Identitas',
    subcategory: 'Name Plate, Holder ID Card & Name Tag',
    theme: 'kartu',
    price: 10000,
    priceLabel: 'Mulai dari',
    unit: 'pcs',
    minOrder: 1,
    isNew: true,
    soldCount: 315,
    sortOrder: 11,
    shortDescription:
      'Papan nama meja kerja (name plate) pejabat/staf bahan akrilik atau plat kuningan kayu, serta casing holder ID Card.',
    description:
      'Sempurnakan identitas ruang kerja dan kartu pegawai dengan Name Plate meja berbahan akrilik bening tekuk L/segitiga maupun plat kuningan di atas dudukan kayu mahoni, serta berbagai pilihan casing Holder ID Card kulit sintetis, akrilik bening, dan karet.',
    sizeOptions: [
      'Name Plate Meja 25 x 7 cm / 30 x 8 cm',
      'Holder ID Card Standar 1 Kartu / 2 Kartu',
      'Ukuran Custom Sesuai Jabatan',
    ],
    materialOptions: [
      'Akrilik Bening 3mm / 5mm Tekuk Presisi',
      'Plat Kuningan / Stainless + Dudukan Kayu Eksklusif',
      'Holder Kulit Sintetis (PU Leather) / Akrilik Transparan',
    ],
    finishingOptions: [
      'UV Print Full Color / Etching Grafir Logam',
      'Jahit Rapi + Kancing Magnet (Holder Kulit)',
    ],
  }),
  makeProduct({
    id: 'prod_merch_plakat_acrylic_custom',
    name: 'Plakat Akrilik Custom, Trophy Penghargaan & Acrylic Custom Laser',
    categoryId: 'cat_merchandise',
    categoryName: 'Merchandise',
    subcategory: 'Plakat, Acrylic Custom & Merchandise Promosi',
    theme: 'merchandise',
    price: 85000,
    priceLabel: 'Mulai dari',
    unit: 'pcs',
    minOrder: 1,
    featured: true,
    isNew: true,
    soldCount: 395,
    sortOrder: 20,
    shortDescription:
      'Pembuatan plakat akrilik wisuda, cenderamata pembicara seminar, kenang-kenangan KKN/magang, dan potong akrilik custom.',
    description:
      'Plakat penghargaan dan cenderamata eksklusif berbahan akrilik bening tebal (8mm, 10mm, hingga 15mm) yang dipotong menggunakan mesin laser cutting dengan pinggiran bevel berlian dan dicetak langsung menggunakan mesin UV Flatbed resolusi tinggi.',
    sizeOptions: [
      'Standar 15 x 20 cm (Tebal 8mm / 10mm)',
      'Besar 17 x 22 cm (Tebal 10mm / 15mm)',
      'Bentuk Custom Sesuai Logo / Siluet',
    ],
    materialOptions: [
      'Akrilik Bening Murni 8 mm / 10 mm / 15 mm',
      'Kombinasi Akrilik Hitam & Emas Mirror',
      'Dudukan Kaki Akrilik Tebal / Kayu Hitam',
    ],
    finishingOptions: [
      'Potong Laser Bevel Berlian + UV Print Full Color',
      'Termasuk Kotak Bludru Eksklusif (Biru / Merah / Hitam)',
      'Pengerjaan Kilat 1–2 Hari Kerja',
    ],
  }),
  makeProduct({
    id: 'prod_sticker_pack_diecut',
    name: 'Sticker Pack Custom & Stiker Die Cut Satuan (Tahan Air & Gores)',
    categoryId: 'cat_sticker',
    categoryName: 'Sticker',
    subcategory: 'Sticker Pack, Stiker Die Cut & Stiker Custom',
    theme: 'sticker',
    price: 15000,
    priceLabel: 'Mulai dari',
    unit: 'pack',
    minOrder: 5,
    isNew: true,
    soldCount: 610,
    sortOrder: 13,
    primaryRealPhotoUrl: stikerCuttingImg,
    shortDescription:
      'Paket stiker komunitas, merchandise band/event, dan stiker laptop/helm potong putus satuan (die-cut) berlaminasi.',
    description:
      'Buat Sticker Pack eksklusif berisi kumpulan desain ilustrasi atau logo brand Anda. Dicetak di atas bahan Vinyl tebal tahan air, dilapisi laminasi doff/glossy/glitter agar tahan goresan di permukaan helm, tumbler, koper, dan laptop.',
    sizeOptions: [
      'Sticker Pack A6 / A5 (Kiss-Cut Dalam 1 Lembar)',
      'Sticker Pack Die-Cut (Isi 5–10 Stiker Potong Putus)',
      'Ukuran Satuan 5–8 cm Sesuai Desain',
    ],
    materialOptions: [
      'Sticker Vinyl Graftac / Ritrama Tebal Waterproof',
      'Sticker Hologram Rainbow Effect',
      'Sticker Transparan Bening',
    ],
    finishingOptions: [
      'Laminasi Doff / Glossy / Glitter + Potong Die-Cut',
      'Kemasan Plastik Ziplock / OPP + Header Card Brand',
    ],
  }),
  makeProduct({
    id: 'prod_promosi_voucher_kupon_member',
    name: 'Cetak Kartu Member, Voucher Diskon & Kupon Undian Nomorator',
    categoryId: 'cat_promosi_toko',
    categoryName: 'Alat Promosi Toko',
    subcategory: 'Kartu Member, Voucher, Kupon & Promosi Bisnis',
    theme: 'promosi_toko',
    price: 25000,
    priceLabel: 'Mulai dari',
    unit: 'buku / pak',
    minOrder: 2,
    isNew: true,
    soldCount: 470,
    sortOrder: 25,
    shortDescription:
      'Cetak voucher belanja, kupon jalan sehat/bazar dengan garis sobek (perforasi) & nomor seri, serta kartu member toko.',
    description:
      'Tingkatkan loyalitas pelanggan dan kemeriahan acara dengan cetakan Voucher Diskon, Kupon Undian/Kupon Makan ber-nomor seri urut otomatis dan garis cacah perforasi yang mudah disobek, serta Kartu Member VIP berbahan PVC atau Art Carton.',
    sizeOptions: [
      'Voucher / Kupon 7 x 15 cm atau 8 x 18 cm',
      'Kartu Member Standar ATM (8.6 x 5.4 cm)',
      'Kartu Stamp Loyalitas Lipat 2',
    ],
    materialOptions: [
      'Art Paper 150 gsm / Art Carton 260 gsm',
      'HVS 100 gsm / Kertas Concorde (Untuk Kupon)',
      'PVC Tebal 0.76 mm (Untuk Kartu Member VIP)',
    ],
    finishingOptions: [
      'Cacah Perforasi (Garis Sobek) + Jilid Buku',
      'Nomorator Urut / Barcode / QR Code Unik',
      'Foil Emas / Perak Anti Pemalsuan',
    ],
  }),

  // ============================================================================
  // 12. CUSTOM REQUEST
  // ============================================================================
  makeProduct({
    id: 'prod_custom_request_khusus',
    name: 'Custom Request — Pesanan Cetak & Produksi Sesuai Kebutuhan Anda',
    categoryId: 'cat_custom',
    categoryName: 'Custom Request',
    subcategory: 'Layanan Cetak Custom & Pengadaan Khusus',
    theme: 'custom_request',
    price: 0,
    priceLabel: 'Hubungi kami untuk harga',
    unit: 'pesanan',
    minOrder: 1,
    featured: true,
    isNew: true,
    badge: 'Custom Sesuai Kebutuhan',
    soldCount: 290,
    sortOrder: 29,
    shortDescription:
      'Belum menemukan spesifikasi produk yang Anda cari di katalog? Kirimkan detail ukuran, bahan, dan kebutuhan cetak Anda di sini.',
    description:
      'Layanan khusus bagi pelanggan individu, bisnis, sekolah, maupun instansi yang membutuhkan cetakan atau produksi custom di luar item standar katalog. Anda dapat menuliskan jenis produk, ukuran yang diinginkan, jumlah, serta keterangan desain pada catatan pesanan, lalu meneruskannya langsung ke WhatsApp kami untuk mendapatkan estimasi biaya.',
    sizeOptions: [
      'Ukuran Custom Sesuai Permintaan',
      'Format Kecil / Satuan',
      'Format Besar / Pengadaan Proyek',
    ],
    materialOptions: [
      'Kertas / Karton Custom',
      'Vinyl / Flexi / Kain Custom',
      'Akrilik / PVC / Stainless / Kayu',
      'Sesuai Rekomendasi Tim Produksi',
    ],
    finishingOptions: [
      'Sesuai Spesifikasi Permintaan Pelanggan',
      'Termasuk Pengecekan File & Proofing',
    ],
    orderNotesHint:
      'Jelaskan produk yang ingin dibuat, ukuran, jumlah, dan detail kebutuhan Anda...',
  }),
];

export const INITIAL_GALLERY: GalleryItem[] = [
  {
    id: 'gal_1',
    storeId: 'istafa_printing',
    title: 'Paket Seminar Kit: 350 Tumbler Grafir, Lanyard & Blocknote',
    category: 'Merchandise & Identitas',
    clientName: 'PT Nusantara Energi Mandiri',
    description:
      'Produksi paket seminar korporat berisi tumbler stainless grafir laser 2 sisi, tali lanyard sublimasi, ID card PVC, dan buku catatan A5.',
    images: [
      tumblerImg,
      lanyardImg,
      createStudioSpecPhoto(
        'Dokumentasi Quality Control 350 Set',
        'Merchandise Korporat',
        'Pengecekan presisi grafir dan warna cetak setiap unit',
        'Pengemasan dalam box eksklusif siap bagikan',
        '#C59B5F',
        '#141413'
      ),
    ],
    featured: true,
    dateLabel: '2025',
  },
  {
    id: 'gal_2',
    storeId: 'istafa_printing',
    title: 'Cetak Kartu Nama Foil Emas, Kop Surat & Map Perusahaan',
    category: 'Kartu & Produk Kantor',
    clientName: 'Bima Sakti Law Firm',
    description:
      'Pencetakan identitas kantor terpadu: kartu nama berlapis laminasi doff dengan hotprint emas, kop surat HVS 100 gsm, serta stopmap folder.',
    images: [
      kartuNamaImg,
      createStudioSpecPhoto(
        'Detail Finishing Hotprint Foil Emas',
        'Kartu & Identitas',
        'Kertas Art Carton 310 gsm berlapis laminasi doff halus',
        'Presisi registrasi foil emas pada logo dan nama',
        '#C59B5F',
        '#141413'
      ),
    ],
    featured: true,
    dateLabel: '2025',
  },
  {
    id: 'gal_3',
    storeId: 'istafa_printing',
    title: 'Produksi Banner Pameran, X-Banner & Stiker Kemasan UMKM',
    category: 'Banner & Kemasan',
    clientName: 'Kopi Senja Roastery',
    description:
      'Pencetakan perangkat promosi gerai baru: Roll Up Banner aluminium, spanduk outdoor, stiker label vinyl die-cut, dan paper bag kraft.',
    images: [
      heroBannerImg,
      createStudioSpecPhoto(
        'Paket Branding Gerai & Kemasan',
        'Media Promosi & Kemasan',
        'Warna cetak konsisten di seluruh media banner dan label',
        'Tahan air dan cuaca untuk penggunaan jangka panjang',
        '#C59B5F',
        '#141413'
      ),
    ],
    featured: true,
    dateLabel: '2025',
  },
];

export const INITIAL_FINANCE_TRANSACTIONS: FinanceTransaction[] = [
  {
    id: 'tx_seed_1',
    storeId: 'istafa_printing',
    adminScope: 'istafa_admin',
    transactionNumber: 'TRX-202505-001',
    type: 'income',
    dateIso: '2025-05-01T09:30:00',
    sourceOrTarget: 'PT Nusantara Energi Mandiri',
    category: 'Penjualan Produk Cetak',
    amount: 6750000,
    paymentMethod: 'Transfer',
    description:
      'Pelunasan pesanan 100 pcs Tumbler Custom Grafir Laser + Box.',
    proofImageUrl: '',
    relatedOrderId: 'ORD-SEED-001',
    createdBy: 'Isatafa',
    updatedBy: 'Isatafa',
    correctionHistory: [],
  },
  {
    id: 'tx_seed_2',
    storeId: 'istafa_printing',
    adminScope: 'istafa_admin',
    transactionNumber: 'TRX-202505-002',
    type: 'expense',
    dateIso: '2025-05-02T14:15:00',
    sourceOrTarget: 'Supplier Bahan Kertas & Tinta',
    category: 'Pembelian Bahan Baku',
    amount: 1850000,
    paymentMethod: 'Transfer',
    description:
      'Belanja stok kertas Art Carton 260g, Sticker Vinyl A3+, dan tinta UV.',
    proofImageUrl: '',
    relatedOrderId: '',
    createdBy: 'Isatafa',
    updatedBy: 'Isatafa',
    correctionHistory: [],
  },
  {
    id: 'tx_seed_3',
    storeId: 'istafa_printing',
    adminScope: 'istafa_admin',
    transactionNumber: 'TRX-202505-003',
    type: 'income',
    dateIso: '2025-05-03T11:20:00',
    sourceOrTarget: 'Panitia Festival Kreatif',
    category: 'Penjualan Produk Cetak',
    amount: 3200000,
    paymentMethod: 'QRIS',
    description:
      'Pesanan 160 set Lanyard Tissue Sublimasi + ID Card PVC + Backdrop.',
    proofImageUrl: '',
    relatedOrderId: 'ORD-SEED-002',
    createdBy: 'Isatafa',
    updatedBy: 'Isatafa',
    correctionHistory: [],
  },
];

export const INITIAL_DEBTS_RECEIVABLES: DebtReceivable[] = [
  {
    id: 'dr_seed_1',
    storeId: 'istafa_printing',
    adminScope: 'istafa_admin',
    recordType: 'piutang',
    partyName: 'CV Kreasi Event Nusantara',
    phone: '081298765432',
    dateIso: '2025-05-02',
    dueDateIso: '2025-05-20',
    totalAmount: 4500000,
    paidAmount: 2000000,
    status: 'Sebagian',
    description:
      'Piutang cetak 150 pcs Kaos Event & Banner Panggung (Sudah DP Rp 2.000.000).',
    paymentHistory: [
      {
        id: 'pay_1',
        dateIso: '2025-05-02',
        amount: 2000000,
        method: 'Transfer',
        note: 'Pembayaran DP 1 saat naik cetak',
      },
    ],
    createdBy: 'Isatafa',
    updatedBy: 'Isatafa',
  },
  {
    id: 'dr_seed_2',
    storeId: 'istafa_printing',
    adminScope: 'istafa_admin',
    recordType: 'hutang',
    partyName: 'PT Sentra Media Grafika',
    phone: '081122334455',
    dateIso: '2025-05-01',
    dueDateIso: '2025-05-25',
    totalAmount: 3000000,
    paidAmount: 1000000,
    status: 'Sebagian',
    description:
      'Pembelian 10 roll bahan Flexi Korea 440g & Albatros.',
    paymentHistory: [
      {
        id: 'pay_2',
        dateIso: '2025-05-01',
        amount: 1000000,
        method: 'Transfer',
        note: 'Pembayaran awal faktur bahan',
      },
    ],
    createdBy: 'Isatafa',
    updatedBy: 'Isatafa',
  },
];
