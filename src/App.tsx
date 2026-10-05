import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  Images,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  Printer,
  RefreshCw,
  Search,
  ShieldCheck,
  ShoppingBag,
  Truck,
  WifiOff,
  X,
} from 'lucide-react';
import {
  CartItem,
  Category,
  GalleryItem,
  Product,
  StoreSettings,
} from './types';
import {
  INITIAL_CATEGORIES,
  INITIAL_GALLERY,
  INITIAL_PRODUCTS,
  INITIAL_STORE_SETTINGS,
} from './data/initialSeed';
import {
  checkActiveAdminSession,
  ensureDatabaseInitialized,
  logoutAdmin,
  manualVerifyFirestoreConnection,
  StoredAdminSession,
  subscribePublicStoreData,
} from './services/dbService';
import {
  buildWhatsAppConsultUrl,
  formatRupiah,
  SmartImage,
} from './utils/imageUtils';
import { BrandLogo } from './components/BrandLogo';
import { GalleryLightbox } from './components/GalleryLightbox';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartCheckoutDrawer } from './components/CartCheckoutDrawer';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import { AdminDashboard } from './components/admin/AdminDashboard';

const CART_STORAGE_KEY = 'istafa_cart_v1';

type NavSectionId =
  | 'beranda'
  | 'katalog'
  | 'tentang-kami'
  | 'cara-pesan'
  | 'faq'
  | 'kontak';

const NAV_ITEMS: Array<{ id: NavSectionId; label: string }> = [
  { id: 'beranda', label: 'Beranda' },
  { id: 'katalog', label: 'Produk' },
  { id: 'tentang-kami', label: 'Tentang Kami' },
  { id: 'cara-pesan', label: 'Cara Pesan' },
  { id: 'faq', label: 'FAQ' },
  { id: 'kontak', label: 'Kontak' },
];

const QUICK_SEARCH_TERMS = [
  'Print A4',
  'Banner',
  'Kartu Nama',
  'ID Card',
  'Sticker',
  'Undangan',
  'Tumbler',
  'Paper Bag',
  'Nota NCR',
];

const PRODUCTS_PER_PAGE = 12;

const FAQ_LIST = [
  {
    q: 'Bagaimana cara memesan produk di ISTAFA PRINTING?',
    a: 'Pilih produk yang Anda butuhkan pada bagian Produk, tentukan spesifikasi variasi serta jumlah pesanan, tambahkan catatan bila ada, lalu klik "Pesan Sekarang". Isi data pengiriman singkat dan pesanan Anda akan diteruskan secara otomatis ke WhatsApp kami untuk konfirmasi.',
  },
  {
    q: 'Apakah bisa memesan dengan desain custom sendiri?',
    a: 'Tentu. Seluruh produk kami dapat dicetak menggunakan desain, logo perusahaan, atau identitas acara Anda sendiri. Setelah menekan tombol pesan, Anda dapat langsung mengirimkan file desain melalui WhatsApp.',
  },
  {
    q: 'Berapa lama estimasi proses pengerjaan pesanan?',
    a: 'Waktu pengerjaan disesuaikan dengan jenis produk dan jumlah pesanan. Untuk cetak dokumen, banner, kartu nama, dan pesanan satuan umumnya membutuhkan 1–2 hari kerja, sedangkan pesanan merchandise partai besar berkisar 3–5 hari kerja.',
  },
  {
    q: 'Bagaimana metode pembayaran yang tersedia?',
    a: 'Pembayaran dapat dilakukan melalui transfer bank resmi atau pembayaran tunai di workshop kami setelah rincian pesanan dan desain dikonfirmasi oleh admin.',
  },
  {
    q: 'Apakah pesanan dapat dikirim ke luar kota?',
    a: 'Ya, kami melayani pengiriman ke berbagai kota di seluruh Indonesia menggunakan layanan ekspedisi maupun kurir instan dengan pengemasan yang aman.',
  },
  {
    q: 'Bagaimana cara menghubungi kami jika membutuhkan informasi tambahan?',
    a: 'Anda dapat menekan tombol "Hubungi Kami" pada halaman ini atau mengunjungi bagian Kontak di bawah untuk terhubung langsung melalui WhatsApp maupun email resmi kami.',
  },
];

export default function App() {
  // Check for unknown pathname (404 handling)
  const [isNotFoundPath, setIsNotFoundPath] = useState<boolean>(() => {
    const path = window.location.pathname;
    return path !== '/' && path !== '/index.html';
  });

  // Live Firestore Data States
  const [settings, setSettings] = useState<StoreSettings>(
    INITIAL_STORE_SETTINGS
  );
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [gallery, setGallery] = useState<GalleryItem[]>(INITIAL_GALLERY);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [retryingConnection, setRetryingConnection] = useState(false);

  // Per-card active photo index for multi-photo product cards
  const [cardPhotoIdx, setCardPhotoIdx] = useState<Record<string, number>>({});

  // Active Navigation Section (Scroll-Spy)
  const [activeSection, setActiveSection] = useState<NavSectionId>('beranda');

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Cart State (Persisted in localStorage across refreshes)
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(
            (item) =>
              item &&
              typeof item.cartItemId === 'string' &&
              typeof item.name === 'string' &&
              Number.isFinite(Number(item.price)) &&
              Number.isFinite(Number(item.quantity)) &&
              Number(item.quantity) > 0
          );
        }
      }
    } catch {
      // ignore parse error
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // ignore storage quota error
    }
  }, [cart]);

  // UI & Filter States
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [collectionFilter, setCollectionFilter] = useState<
    'all' | 'featured' | 'new' | 'popular'
  >('all');
  const [priceFilter, setPriceFilter] = useState<
    'all' | 'under_15k' | '15k_50k' | 'over_50k'
  >('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<
    'default' | 'popular' | 'price_asc' | 'price_desc' | 'newest'
  >('default');
  const [visibleCount, setVisibleCount] = useState<number>(PRODUCTS_PER_PAGE);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Modals & Drawers
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [cartInitialMode, setCartInitialMode] = useState<'cart' | 'checkout'>(
    'cart'
  );

  // Lightbox State
  const [lightboxData, setLightboxData] = useState<{
    images: string[];
    index: number;
    title: string;
  } | null>(null);

  // Admin Auth & Route Protection State
  const [adminSession, setAdminSession] = useState<StoredAdminSession | null>(
    null
  );
  const [isAdminView, setIsAdminView] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  // Toast Notification State
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  const showToast = (
    message: string,
    type: 'success' | 'error' = 'success'
  ) => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 3200);
  };

  // Scroll-Spy Observer for Active Menu Indicator
  useEffect(() => {
    if (isAdminView || isNotFoundPath) return;

    const sectionIds: NavSectionId[] = [
      'beranda',
      'katalog',
      'tentang-kami',
      'cara-pesan',
      'faq',
      'kontak',
    ];

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 140;
      let current: NavSectionId = 'beranda';
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= scrollPosition) {
          current = id;
        }
      }
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isAdminView, isNotFoundPath]);

  // Boot: One-Time Firestore Seed + Real-Time Subscriptions
  useEffect(() => {
    let unsubPublic: (() => void) | null = null;

    async function init() {
      try {
        await ensureDatabaseInitialized();
        setConnectionError(null);
      } catch (err) {
        console.error('Database init warning:', err);
      }

      unsubPublic = subscribePublicStoreData({
        onSettings: (s) => {
          setSettings(s);
          setConnectionError(null);
        },
        onCategories: (c) => {
          if (c.length > 0) setCategories(c);
        },
        onProducts: (p) => {
          if (p.length > 0) setProducts(p);
        },
        onGallery: (g) => {
          if (g.length > 0) setGallery(g);
        },
        onError: (msg) => {
          console.warn('Storefront listener fallback active:', msg);
        },
      });

      const existingSession = await checkActiveAdminSession();
      if (existingSession) {
        setAdminSession(existingSession);
      } else {
        setAdminSession(null);
        setIsAdminView(false);
      }
    }

    init();

    return () => {
      if (unsubPublic) unsubPublic();
    };
  }, []);

  // Keep detailProduct synced if edited in Firestore
  useEffect(() => {
    if (detailProduct) {
      const updated = products.find((p) => p.id === detailProduct.id);
      if (updated) setDetailProduct(updated);
    }
  }, [products]);

  // Cart Handlers
  const handleAddToCart = (params: {
    product: Product;
    quantity: number;
    selectedVariant: string;
    itemNotes: string;
    openCheckoutImmediately: boolean;
  }) => {
    const {
      product,
      quantity,
      selectedVariant,
      itemNotes,
      openCheckoutImmediately,
    } = params;
    const cleanQty = Math.max(product.minOrder || 1, quantity);
    const variantKey = selectedVariant || product.variants?.[0] || 'Standar';
    const cartItemId = `${product.id}__${variantKey}`;

    setCart((prev) => {
      const existingIndex = prev.findIndex((i) => i.cartItemId === cartItemId);
      if (existingIndex >= 0) {
        const copy = [...prev];
        copy[existingIndex] = {
          ...copy[existingIndex],
          quantity: copy[existingIndex].quantity + cleanQty,
          itemNotes: itemNotes || copy[existingIndex].itemNotes,
        };
        return copy;
      }
      return [
        ...prev,
        {
          cartItemId,
          productId: product.id,
          name: product.name,
          categoryName: product.categoryName,
          price: product.price,
          image: product.images?.[0] || '',
          quantity: cleanQty,
          minOrder: product.minOrder || 1,
          unit: product.unit || 'pcs',
          selectedVariant: variantKey,
          itemNotes: itemNotes || '',
        },
      ];
    });

    if (detailProduct) {
      setDetailProduct(null);
    }

    if (openCheckoutImmediately) {
      setCartInitialMode('checkout');
      setCartDrawerOpen(true);
    } else {
      showToast(`"${product.name}" berhasil ditambahkan ke keranjang.`, 'success');
    }
  };

  const handleUpdateCartQuantity = (cartItemId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveCartItem(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.cartItemId === cartItemId ? { ...item, quantity: newQty } : item
      )
    );
  };

  const handleRemoveCartItem = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
    showToast('Produk dihapus dari keranjang.', 'success');
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Admin Access Click Handler (Strict Route Protection — triggered only from Footer)
  const handleAdminAccessClick = async () => {
    const verified = await checkActiveAdminSession();
    if (verified && adminSession) {
      setAdminSession(verified);
      setIsAdminView(true);
    } else {
      setAdminSession(null);
      setIsAdminView(false);
      setLoginModalOpen(true);
    }
  };

  const handleAdminLogout = async () => {
    const actor = adminSession?.username || 'Isatafa';
    await logoutAdmin(actor);
    setAdminSession(null);
    setIsAdminView(false);
    showToast('Anda telah keluar dari Admin Panel.', 'success');
  };

  // Filtered & Sorted Products
  const activeCategories = useMemo(
    () => categories.filter((c) => c.active !== false),
    [categories]
  );

  // Public visible products (excluding products hidden by Admin)
  const publicProducts = useMemo(
    () => products.filter((p) => !p.hidden),
    [products]
  );

  // Reset pagination when filters change
  useEffect(() => {
    setVisibleCount(PRODUCTS_PER_PAGE);
  }, [selectedCategoryId, collectionFilter, priceFilter, searchQuery, sortBy]);

  const displayedProducts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const filtered = publicProducts.filter((p) => {
      const matchCategory =
        selectedCategoryId === 'all' || p.categoryId === selectedCategoryId;

      const matchCollection =
        collectionFilter === 'all' ||
        (collectionFilter === 'featured' && Boolean(p.featured)) ||
        (collectionFilter === 'new' && Boolean(p.isNew)) ||
        (collectionFilter === 'popular' && (p.soldCount || 0) >= 500);

      const priceNum = Number(p.price) || 0;
      const matchPrice =
        priceFilter === 'all' ||
        (priceFilter === 'under_15k' && priceNum > 0 && priceNum < 15000) ||
        (priceFilter === '15k_50k' && priceNum >= 15000 && priceNum <= 50000) ||
        (priceFilter === 'over_50k' && priceNum > 50000);

      const matchQuery =
        !q ||
        (p.name || '').toLowerCase().includes(q) ||
        (p.categoryName || '').toLowerCase().includes(q) ||
        (p.subcategory || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q) ||
        (p.shortDescription || '').toLowerCase().includes(q) ||
        (p.sizeOptions || []).some((s) => s.toLowerCase().includes(q)) ||
        (p.materialOptions || []).some((m) => m.toLowerCase().includes(q)) ||
        (p.finishingOptions || []).some((f) => f.toLowerCase().includes(q));

      return matchCategory && matchCollection && matchPrice && matchQuery;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === 'price_asc') {
        const pa = Number(a.price) > 0 ? Number(a.price) : 999999999;
        const pb = Number(b.price) > 0 ? Number(b.price) : 999999999;
        return pa - pb;
      }
      if (sortBy === 'price_desc')
        return (Number(b.price) || 0) - (Number(a.price) || 0);
      if (sortBy === 'newest') {
        if (Boolean(b.isNew) !== Boolean(a.isNew)) {
          return b.isNew ? 1 : -1;
        }
        return (b.id || '').localeCompare(a.id || '');
      }
      if (sortBy === 'popular') {
        return (b.soldCount || 0) - (a.soldCount || 0);
      }
      return (
        (a.sortOrder ?? 99) - (b.sortOrder ?? 99) ||
        (b.soldCount || 0) - (a.soldCount || 0)
      );
    });
  }, [
    publicProducts,
    selectedCategoryId,
    collectionFilter,
    priceFilter,
    searchQuery,
    sortBy,
  ]);

  const paginatedProducts = useMemo(
    () => displayedProducts.slice(0, visibleCount),
    [displayedProducts, visibleCount]
  );

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const contactWhatsappUrl = buildWhatsAppConsultUrl(settings.whatsappNumber);

  // 404 Page View if user navigated to an unknown URL path
  if (isNotFoundPath) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] text-[#141413] flex flex-col justify-between">
        <header className="h-16 border-b border-neutral-200/80 px-4 sm:px-6 lg:px-10 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              window.history.pushState({}, '', '/');
              setIsNotFoundPath(false);
            }}
            className="cursor-pointer"
          >
            <BrandLogo
              storeName={settings.storeName}
              customLogoUrl={settings.logoUrl}
              theme="light"
              size="md"
            />
          </button>
        </header>

        <main className="ds-container py-20 text-center max-w-lg mx-auto space-y-5">
          <p className="text-xs font-semibold text-[#9A7237] tracking-wide">
            404 · Halaman Tidak Ditemukan
          </p>
          <h1 className="font-display font-semibold text-2xl sm:text-3xl text-[#141413]">
            Maaf, halaman yang Anda tuju tidak tersedia.
          </h1>
          <p className="text-sm text-neutral-600 leading-relaxed">
            Tautan mungkin telah berubah atau halaman tidak ditemukan. Silakan
            kembali ke beranda untuk melihat katalog produk ISTAFA PRINTING.
          </p>
          <div>
            <button
              type="button"
              onClick={() => {
                window.history.pushState({}, '', '/');
                setIsNotFoundPath(false);
              }}
              className="ds-btn-primary"
            >
              Kembali ke Beranda
            </button>
          </div>
        </main>

        <footer className="py-6 border-t border-neutral-200/80 text-center text-xs text-neutral-500">
          © {new Date().getFullYear()} {settings.storeName}. Hak Cipta
          Dilindungi.
        </footer>
      </div>
    );
  }

  // If Admin View is active AND adminSession is verified, render Protected AdminDashboard
  if (isAdminView && adminSession) {
    return (
      <>
        <AdminDashboard
          adminUsername={adminSession.username}
          settings={settings}
          categories={categories}
          products={products}
          gallery={gallery}
          onLogout={handleAdminLogout}
          onExitToStorefront={() => setIsAdminView(false)}
          onShowToast={showToast}
          onOpenLightbox={(images, index, title) =>
            setLightboxData({ images, index, title })
          }
        />

        {lightboxData && (
          <GalleryLightbox
            images={lightboxData.images}
            initialIndex={lightboxData.index}
            title={lightboxData.title}
            onClose={() => setLightboxData(null)}
          />
        )}

        {toast && (
          <div
            role="status"
            className={`fixed bottom-5 right-5 z-[95] px-4 py-3 rounded-xl shadow-xl border text-xs font-medium flex items-center gap-2 transition-all ${
              toast.type === 'success'
                ? 'bg-[#141413] text-white border-neutral-800'
                : 'bg-rose-600 text-white border-rose-500'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-[#C59B5F] shrink-0" />
            <span>{toast.message}</span>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#141413]">
      {/* Friendly Indonesian Error / Network Recovery Banner */}
      {connectionError && (
        <div
          role="alert"
          className="bg-rose-700 text-white px-4 py-2.5 text-xs flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 shrink-0" />
            <span>
              Maaf, halaman sedang mengalami kendala jaringan. Silakan coba
              kembali.
            </span>
          </div>
          <button
            type="button"
            disabled={retryingConnection}
            onClick={async () => {
              setRetryingConnection(true);
              const ok = await manualVerifyFirestoreConnection();
              setRetryingConnection(false);
              if (ok) {
                setConnectionError(null);
                showToast('Koneksi berhasil dipulihkan.', 'success');
              }
            }}
            className="px-3 py-1 rounded-md bg-white text-rose-800 font-medium inline-flex items-center gap-1 cursor-pointer shrink-0"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${
                retryingConnection ? 'animate-spin' : ''
              }`}
            />
            <span>Coba Kembali</span>
          </button>
        </div>
      )}

      {/* TOP NAVIGATION BAR — 3-Zone Contract with Active State Indicator */}
      <header className="sticky top-0 z-40 h-16 sm:h-[72px] bg-[#FAF9F6]/95 backdrop-blur-md border-b border-neutral-200/80">
        <div className="ds-container h-full flex items-center justify-between gap-4">
          {/* Zone 1: Brand Identity */}
          <a
            href="#beranda"
            onClick={() => setActiveSection('beranda')}
            aria-label={settings.storeName || 'ISTAFA PRINTING'}
          >
            <BrandLogo
              storeName={settings.storeName}
              customLogoUrl={settings.logoUrl}
              theme="light"
              size="md"
            />
          </a>

          {/* Zone 2: Clean Navigation Links with Active State */}
          <nav
            aria-label="Navigasi Utama"
            className="hidden md:flex items-center gap-7 text-sm"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={() => setActiveSection(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`relative py-2 transition-colors whitespace-nowrap ${
                    isActive
                      ? 'text-[#141413] font-semibold'
                      : 'text-neutral-600 hover:text-[#141413] font-medium'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 inset-x-0 h-0.5 bg-[#C59B5F] rounded-full" />
                  )}
                </a>
              );
            })}
          </nav>

          {/* Zone 3: Cart Action Only (No Customer Login or Admin Button in Header) */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                setCartInitialMode('cart');
                setCartDrawerOpen(true);
              }}
              className="ds-btn-primary text-xs sm:text-[13px] px-4 py-2.5"
              aria-label={`Keranjang Pesanan, ${totalCartCount} item`}
            >
              <ShoppingBag className="w-4 h-4 text-[#C59B5F]" />
              <span>Keranjang</span>
              <span className="tabular-nums font-semibold text-[#C59B5F]">
                ({totalCartCount})
              </span>
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((m) => !m)}
              className="md:hidden w-11 h-11 rounded-xl border border-neutral-300 bg-white text-neutral-800 flex items-center justify-center cursor-pointer"
              aria-label={mobileMenuOpen ? 'Tutup menu' : 'Buka menu navigasi'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Dropdown Navigation with Active State */}
      {mobileMenuOpen && (
        <nav
          aria-label="Navigasi Mobile"
          className="md:hidden bg-white border-b border-neutral-200 px-5 py-3 flex flex-col divide-y divide-neutral-100 text-sm"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={() => {
                  setActiveSection(item.id);
                  setMobileMenuOpen(false);
                }}
                aria-current={isActive ? 'page' : undefined}
                className={`py-3 flex items-center justify-between ${
                  isActive
                    ? 'text-[#141413] font-semibold'
                    : 'text-neutral-600 font-medium'
                }`}
              >
                <span>{item.label}</span>
                {isActive && (
                  <span className="w-2 h-2 rounded-full bg-[#C59B5F]" />
                )}
              </a>
            );
          })}
        </nav>
      )}

      {/* SECTION 1: HERO SECTION (#beranda) */}
      <section
        id="beranda"
        className="relative overflow-hidden bg-[#141413] text-[#FAF9F6] py-14 sm:py-20 lg:py-24 border-b border-neutral-800"
      >
        <div className="ds-container grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Hero Content */}
          <div className="lg:col-span-6 space-y-6 animate-fade-up">
            <div className="inline-flex items-center gap-2 text-xs text-neutral-400">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C59B5F]" />
              <span className="font-medium text-[#C59B5F]">
                {settings.storeName || 'ISTAFA PRINTING'}
              </span>
              <span aria-hidden="true">·</span>
              <span>Percetakan & Custom Merchandise</span>
            </div>

            <h1 className="font-display font-semibold text-3xl sm:text-4xl lg:text-[42px] tracking-[-0.025em] text-[#FAF9F6] leading-[1.16] [text-wrap:balance]">
              {settings.tagline ||
                'Cetak Berkualitas, Wujudkan Ide Tanpa Batas.'}
            </h1>

            <p className="text-sm sm:text-base text-neutral-300 leading-relaxed max-w-xl font-normal">
              {settings.heroDescription ||
                'Mitra percetakan profesional dan pembuatan custom merchandise untuk kebutuhan perusahaan, instansi, acara, dan personal dengan kualitas material terjamin.'}
            </p>

            {/* Primary & Secondary CTAs */}
            <div className="flex flex-wrap items-center gap-3.5 pt-1">
              <a href="#katalog" className="ds-btn-accent px-6 py-3.5">
                <span>Pesan Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <a
                href={contactWhatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="min-height-[44px] px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#FAF9F6] border border-neutral-700 font-medium text-sm inline-flex items-center gap-2 transition-colors whitespace-nowrap"
              >
                <MessageCircle className="w-4 h-4 text-[#C59B5F]" />
                <span>Hubungi Kami</span>
              </a>
            </div>

            {/* Key Value Indicators */}
            <div className="pt-6 border-t border-neutral-800/90 grid grid-cols-3 gap-6 text-xs">
              <div>
                <span className="font-semibold text-base sm:text-lg text-[#FAF9F6] block tabular-nums">
                  2400 DPI
                </span>
                <span className="text-neutral-400">Cetakan Tajam & Akurat</span>
              </div>
              <div>
                <span className="font-semibold text-base sm:text-lg text-[#C59B5F] block">
                  Satuan & Grosir
                </span>
                <span className="text-neutral-400">Fleksibel Sesuai Pesanan</span>
              </div>
              <div>
                <span className="font-semibold text-base sm:text-lg text-[#FAF9F6] block">
                  Tepat Waktu
                </span>
                <span className="text-neutral-400">Siap Kirim Seluruh Indonesia</span>
              </div>
            </div>
          </div>

          {/* Right Hero Showcase Image */}
          <div className="lg:col-span-6 relative">
            <div className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-neutral-800 shadow-2xl bg-[#1C1B1A]">
              <SmartImage
                src={settings.heroBannerUrl}
                alt={`Koleksi Produk ${settings.storeName}`}
                fallbackTitle={settings.storeName}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#141413]/85 via-[#141413]/20 to-transparent" />

              <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4 text-[#FAF9F6]">
                <div>
                  <p className="text-xs text-[#C59B5F] font-medium mb-0.5">
                    Layanan Produksi Utama
                  </p>
                  <p className="font-display font-medium text-sm sm:text-base text-neutral-100">
                    Tumbler Custom · Kartu Nama · Lanyard ID Card · Banner · Sticker · Souvenir
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: KATALOG PRODUK, SEARCH & FILTER (#katalog) */}
      <section id="katalog" className="py-16 sm:py-20 ds-container w-full space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
          <div>
            <p className="text-xs font-medium text-[#9A7237] mb-1.5">
              Katalog Produk & Layanan
            </p>
            <h2 className="font-display font-semibold text-2xl sm:text-3xl text-[#141413]">
              Pilih Produk Kebutuhan Cetak Anda
            </h2>
          </div>

          {/* Search, Price Filter & Sort Controls */}
          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 w-full lg:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari produk, ukuran, bahan..."
                aria-label="Cari produk"
                className="ds-input pl-10 pr-9"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-700 cursor-pointer"
                  aria-label="Hapus kata kunci pencarian"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <select
              value={priceFilter}
              onChange={(e) =>
                setPriceFilter(
                  e.target.value as
                    | 'all'
                    | 'under_15k'
                    | '15k_50k'
                    | 'over_50k'
                )
              }
              aria-label="Filter harga"
              className="ds-input sm:w-48 font-medium cursor-pointer"
            >
              <option value="all">Filter Harga: Semua</option>
              <option value="under_15k">Di bawah Rp 15.000</option>
              <option value="15k_50k">Rp 15.000 – Rp 50.000</option>
              <option value="over_50k">Di atas Rp 50.000</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(
                  e.target.value as
                    | 'default'
                    | 'popular'
                    | 'price_asc'
                    | 'price_desc'
                    | 'newest'
                )
              }
              aria-label="Urutkan produk"
              className="ds-input sm:w-48 font-medium cursor-pointer"
            >
              <option value="default">Urutan: Katalog Utama</option>
              <option value="popular">Urutan: Terpopuler</option>
              <option value="newest">Urutan: Produk Terbaru</option>
              <option value="price_asc">Harga: Terendah ke Tinggi</option>
              <option value="price_desc">Harga: Tertinggi ke Rendah</option>
            </select>
          </div>
        </div>

        {/* Collection Highlight Tabs (Semua, Produk Unggulan, Produk Terbaru, Produk Populer) & Quick Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {(
              [
                { id: 'all', label: 'Semua Koleksi' },
                { id: 'featured', label: 'Produk Unggulan' },
                { id: 'new', label: 'Produk Terbaru' },
                { id: 'popular', label: 'Produk Populer' },
              ] as const
            ).map((col) => {
              const active = collectionFilter === col.id;
              return (
                <button
                  key={col.id}
                  type="button"
                  onClick={() => setCollectionFilter(col.id)}
                  className={`px-3.5 py-1.5 rounded-lg font-medium border transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#141413] text-[#FAF9F6] border-[#141413]'
                      : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400 hover:text-[#141413]'
                  }`}
                >
                  {col.label}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-neutral-400 font-medium mr-0.5">
              Pencarian cepat:
            </span>
            {QUICK_SEARCH_TERMS.map((term) => {
              const isMatched =
                searchQuery.toLowerCase().trim() === term.toLowerCase();
              return (
                <button
                  key={term}
                  type="button"
                  onClick={() => {
                    setSelectedCategoryId('all');
                    setSearchQuery(isMatched ? '' : term);
                  }}
                  className={`px-2.5 py-1 rounded-md border transition-colors cursor-pointer ${
                    isMatched
                      ? 'bg-[#141413] text-white border-[#141413]'
                      : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400 hover:text-[#141413]'
                  }`}
                >
                  {term}
                </button>
              );
            })}
          </div>
        </div>

        {/* 12-Category Filter Bar */}
        <div
          role="tablist"
          aria-label="Filter Kategori Produk"
          className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-neutral-200/80"
        >
          <button
            type="button"
            role="tab"
            aria-selected={selectedCategoryId === 'all'}
            onClick={() => setSelectedCategoryId('all')}
            className={`min-h-[40px] px-4 py-2 rounded-lg text-xs sm:text-[13px] font-medium whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategoryId === 'all'
                ? 'bg-[#141413] text-[#FAF9F6]'
                : 'bg-transparent text-neutral-600 hover:text-[#141413] hover:bg-neutral-200/50'
            }`}
          >
            Semua Kategori ({publicProducts.length})
          </button>
          {activeCategories.map((cat) => {
            const count = publicProducts.filter(
              (p) => p.categoryId === cat.id
            ).length;
            const isSelected = selectedCategoryId === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => setSelectedCategoryId(cat.id)}
                className={`min-h-[40px] px-4 py-2 rounded-lg text-xs sm:text-[13px] font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#141413] text-[#FAF9F6]'
                    : 'bg-transparent text-neutral-600 hover:text-[#141413] hover:bg-neutral-200/50'
                }`}
              >
                {cat.name}{' '}
                <span className="opacity-60 tabular-nums">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Product Grid or Informative Empty State */}
        {displayedProducts.length === 0 ? (
          <div className="py-16 text-center ds-card p-8 max-w-xl mx-auto">
            <p className="font-display font-semibold text-lg text-[#141413]">
              Produk tidak ditemukan
            </p>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1.5 leading-relaxed">
              Maaf, kami tidak menemukan produk yang sesuai dengan pencarian{' '}
              {searchQuery ? `"${searchQuery}"` : 'filter ini'}. Silakan coba
              kata kunci lain atau tampilkan seluruh katalog.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategoryId('all');
                setCollectionFilter('all');
                setPriceFilter('all');
                setSearchQuery('');
              }}
              className="mt-5 ds-btn-primary"
            >
              Tampilkan Semua Produk
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
              {paginatedProducts.map((product) => {
                const imgs =
                  product.images && product.images.length > 0
                    ? product.images
                    : [''];
                const activeIdx = Math.min(
                  cardPhotoIdx[product.id] ?? 0,
                  imgs.length - 1
                );

                return (
                  <article
                    key={product.id}
                    className="group ds-card ds-card-interactive overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      {/* Product Image Area (4:3) with Built-In Multi-Photo Carousel */}
                      <div className="relative aspect-[4/3] bg-[#181817] overflow-hidden border-b border-neutral-100">
                        <SmartImage
                          src={imgs[activeIdx]}
                          alt={product.name}
                          fallbackTitle={product.name}
                          onClick={() => setDetailProduct(product)}
                          className="w-full h-full object-cover cursor-pointer transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                        />

                        {/* Subtle Status Label (Unggulan / Terbaru) */}
                        {(product.featured || product.isNew || product.badge) && (
                          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-[#141413]/85 text-[#FAF9F6] text-[11px] font-medium backdrop-blur-sm">
                            {product.badge ||
                              (product.isNew ? 'Terbaru' : 'Unggulan')}
                          </span>
                        )}

                        {/* Prev/Next Photo Controls on Card if Multi-Photo */}
                        {imgs.length > 1 && (
                          <>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setCardPhotoIdx((prev) => ({
                                  ...prev,
                                  [product.id]:
                                    activeIdx === 0
                                      ? imgs.length - 1
                                      : activeIdx - 1,
                                }));
                              }}
                              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-[#141413] text-neutral-900 hover:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm cursor-pointer"
                              aria-label="Foto produk sebelumnya"
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setCardPhotoIdx((prev) => ({
                                  ...prev,
                                  [product.id]:
                                    activeIdx === imgs.length - 1
                                      ? 0
                                      : activeIdx + 1,
                                }));
                              }}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-[#141413] text-neutral-900 hover:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm cursor-pointer"
                              aria-label="Foto produk berikutnya"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </>
                        )}

                        {/* Multi-Photo Lightbox Trigger */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setLightboxData({
                              images: imgs,
                              index: activeIdx,
                              title: product.name,
                            });
                          }}
                          className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-[#141413]/80 hover:bg-[#141413] text-white text-[11px] font-medium flex items-center gap-1.5 backdrop-blur-sm transition-colors cursor-pointer tabular-nums"
                          title="Perbesar foto produk"
                        >
                          <Images className="w-3.5 h-3.5 text-[#C59B5F]" />
                          <span>
                            {activeIdx + 1}/{imgs.length}
                          </span>
                        </button>
                      </div>

                      {/* Product Content */}
                      <div className="p-5 sm:p-6">
                        <div className="flex flex-wrap items-center gap-1.5 text-xs text-neutral-500 mb-1.5">
                          <span className="font-medium text-[#9A7237]">
                            {product.categoryName}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="tabular-nums">
                            Min. {product.minOrder} {product.unit}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span
                            className={
                              product.available
                                ? 'text-emerald-700 font-medium'
                                : 'text-rose-600 font-medium'
                            }
                          >
                            {product.available ? 'Tersedia' : 'Stok Habis'}
                          </span>
                        </div>

                        <h3
                          onClick={() => setDetailProduct(product)}
                          className="font-display font-semibold text-base sm:text-[17px] text-[#141413] group-hover:text-[#9A7237] transition-colors cursor-pointer line-clamp-2 leading-snug"
                        >
                          {product.name}
                        </h3>

                        <p className="text-xs sm:text-[13px] text-neutral-600 mt-1.5 line-clamp-2 leading-relaxed">
                          {product.shortDescription || product.description}
                        </p>
                      </div>
                    </div>

                    {/* Price & Action Footer */}
                    <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-3.5 border-t border-neutral-100 flex items-center justify-between gap-3">
                      <div>
                        <span className="block text-[11px] text-neutral-400">
                          {product.price > 0
                            ? product.priceLabel || 'Mulai dari'
                            : 'Harga Katalog'}
                        </span>
                        {product.price > 0 ? (
                          <div className="flex items-baseline gap-1.5">
                            <span className="font-semibold text-lg text-[#141413] tabular-nums">
                              {formatRupiah(product.price)}
                            </span>
                            <span className="text-[11px] text-neutral-500">
                              /{product.unit}
                            </span>
                          </div>
                        ) : (
                          <span className="font-semibold text-xs sm:text-sm text-[#9A7237] block">
                            {product.priceLabel || 'Hubungi kami untuk harga'}
                          </span>
                        )}
                        {product.originalPrice > product.price &&
                          product.price > 0 && (
                            <span className="text-[11px] text-neutral-400 line-through block tabular-nums">
                              {formatRupiah(product.originalPrice)}
                            </span>
                          )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setDetailProduct(product)}
                          className="ds-btn-secondary text-xs px-3 py-2"
                        >
                          Detail
                        </button>
                        <button
                          type="button"
                          disabled={!product.available}
                          onClick={() => setDetailProduct(product)}
                          className="ds-btn-primary text-xs px-4 py-2 disabled:opacity-40"
                        >
                          <span>Pesan Sekarang</span>
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Pagination / Load More Footer */}
            <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-neutral-200/80 text-xs text-neutral-500">
              <span>
                Menampilkan{' '}
                <strong className="text-[#141413] tabular-nums">
                  {paginatedProducts.length}
                </strong>{' '}
                dari{' '}
                <strong className="text-[#141413] tabular-nums">
                  {displayedProducts.length}
                </strong>{' '}
                produk percetakan
              </span>

              {visibleCount < displayedProducts.length && (
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() =>
                      setVisibleCount((prev) => prev + PRODUCTS_PER_PAGE)
                    }
                    className="ds-btn-primary text-xs px-5 py-2.5"
                  >
                    <span>
                      Tampilkan Lebih Banyak Produk (+
                      {Math.min(
                        PRODUCTS_PER_PAGE,
                        displayedProducts.length - visibleCount
                      )}
                      )
                    </span>
                  </button>
                  {displayedProducts.length - visibleCount >
                    PRODUCTS_PER_PAGE && (
                    <button
                      type="button"
                      onClick={() => setVisibleCount(displayedProducts.length)}
                      className="ds-btn-secondary text-xs px-4 py-2.5"
                    >
                      Tampilkan Semua ({displayedProducts.length})
                    </button>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </section>

      {/* SECTION 3: TENTANG KAMI, KEPERCAYAAN & GALERI PRODUKSI (#tentang-kami) */}
      <section
        id="tentang-kami"
        className="py-16 sm:py-20 bg-white border-y border-neutral-200/80"
      >
        <div className="ds-container space-y-14">
          {/* Brand Trust Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5 space-y-3">
              <p className="text-xs font-medium text-[#9A7237]">
                Tentang {settings.storeName}
              </p>
              <h2 className="font-display font-semibold text-2xl sm:text-3xl text-[#141413] leading-snug">
                Komitmen Kualitas Cetak & Pelayanan yang Terukur
              </h2>
            </div>
            <div className="lg:col-span-7 space-y-3 text-sm text-neutral-600 leading-relaxed">
              <p>
                {settings.aboutText ||
                  'ISTAFA PRINTING adalah layanan percetakan dan pembuatan custom merchandise yang berfokus pada ketajaman hasil cetak, ketepatan spesifikasi material, serta pelayanan yang komunikatif.'}
              </p>
              <p>
                Setiap pesanan—baik untuk kebutuhan bisnis, acara instansi,
                sekolah, maupun personal—dikerjakan melalui tahapan pemeriksaan
                file dan kontrol kualitas sebelum diserahkan kepada pelanggan.
              </p>
            </div>
          </div>

          {/* 3 Pillars of Trust */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Printer,
                title: 'Kualitas Material & Mesin Presisi',
                desc: 'Menggunakan mesin cetak digital resolusi tinggi, UV flatbed, serta grafir laser untuk menghasilkan detail warna dan ketahanan optimal.',
              },
              {
                icon: ShieldCheck,
                title: 'Pemeriksaan Kualitas Berlapis',
                desc: 'Setiap produk diperiksa kesesuaian warna, ukuran, dan kerapihan finishing-nya. Kami memberikan jaminan cetak ulang bila terdapat cacat produksi.',
              },
              {
                icon: Truck,
                title: 'Pelayanan Responsif & Tepat Waktu',
                desc: 'Proses konfirmasi spesifikasi dan pengiriman terjadwal dengan baik, melayani pemesanan satuan maupun pengadaan jumlah besar.',
              },
            ].map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-[#FAF9F6] border border-neutral-200/80 space-y-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#141413] text-[#C59B5F] flex items-center justify-center">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <h3 className="font-display font-semibold text-base text-[#141413]">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-[13px] text-neutral-600 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Galeri Dokumentasi Hasil Cetak */}
          <div id="galeri" className="pt-4 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-[#9A7237] mb-1">
                  Dokumentasi Produksi
                </p>
                <h3 className="font-display font-semibold text-xl sm:text-2xl text-[#141413]">
                  Contoh Hasil Produksi Kami
                </h3>
              </div>
              <p className="text-xs text-neutral-500">
                Klik pada gambar untuk memperbesar dokumentasi hasil cetak.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {gallery.map((item) => (
                <div
                  key={item.id}
                  onClick={() =>
                    setLightboxData({
                      images: item.images || [],
                      index: 0,
                      title: item.title,
                    })
                  }
                  className="group ds-card ds-card-interactive overflow-hidden cursor-pointer"
                >
                  <div className="relative aspect-[4/3] bg-[#181817] overflow-hidden">
                    <SmartImage
                      src={item.images?.[0]}
                      alt={item.title}
                      fallbackTitle={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                    />
                    <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-[#141413]/80 text-white text-[11px] font-medium flex items-center gap-1.5 tabular-nums">
                      <Eye className="w-3.5 h-3.5 text-[#C59B5F]" />
                      <span>{(item.images || []).length} Foto</span>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="text-xs text-neutral-500 mb-1">
                      <span className="font-medium text-[#9A7237]">
                        {item.category}
                      </span>
                      <span aria-hidden="true"> · </span>
                      <span>{item.clientName}</span>
                    </div>
                    <h4 className="font-display font-semibold text-base text-[#141413]">
                      {item.title}
                    </h4>
                    <p className="text-xs sm:text-[13px] text-neutral-600 mt-1 leading-relaxed line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: BAGAIMANA CARA MEMESAN? (#cara-pesan) */}
      <section
        id="cara-pesan"
        className="py-16 sm:py-20 bg-[#141413] text-[#FAF9F6]"
      >
        <div className="ds-container space-y-12">
          <div className="max-w-2xl space-y-2">
            <p className="text-xs font-medium text-[#C59B5F]">
              Alur Pemesanan
            </p>
            <h2 className="font-display font-semibold text-2xl sm:text-3xl text-[#FAF9F6]">
              Bagaimana Cara Memesan?
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
              Proses pemesanan dirancang sederhana dan transparan agar pesanan
              Anda dapat segera diproses dengan akurat.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                num: '01',
                title: 'Pilih Produk',
                desc: 'Pilih produk percetakan atau custom merchandise yang Anda butuhkan pada katalog kami.',
              },
              {
                num: '02',
                title: 'Tentukan Jumlah & Variasi',
                desc: 'Pilih spesifikasi bahan/ukuran yang tersedia dan masukkan jumlah pesanan.',
              },
              {
                num: '03',
                title: 'Isi Catatan Pesanan',
                desc: 'Tuliskan keterangan tambahan seperti warna, tulisan custom, atau instruksi desain.',
              },
              {
                num: '04',
                title: 'Klik Pesan Sekarang',
                desc: 'Lengkapi nama, nomor WhatsApp aktif, dan alamat pengiriman pada formulir pemesanan.',
              },
              {
                num: '05',
                title: 'Pesanan Diteruskan ke WhatsApp',
                desc: 'Rincian produk, jumlah, harga, dan total biaya otomatis terformat rapi ke WhatsApp kami.',
              },
              {
                num: '06',
                title: 'Admin Mengonfirmasi Pesanan',
                desc: 'Admin kami memverifikasi file desain dan pembayaran, lalu pesanan segera masuk tahap produksi.',
              },
            ].map((step) => (
              <div
                key={step.num}
                className="p-6 rounded-2xl bg-[#1C1B1A] border border-neutral-800/90 space-y-2.5"
              >
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#262523] text-[#C59B5F] font-semibold text-xs tabular-nums">
                  {step.num}
                </span>
                <h3 className="font-display font-semibold text-base text-[#FAF9F6]">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-[13px] text-neutral-400 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5: FAQ ACCORDION (#faq) */}
      <section id="faq" className="py-16 sm:py-20 ds-container w-full">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <p className="text-xs font-medium text-[#9A7237]">
              Informasi Bantuan
            </p>
            <h2 className="font-display font-semibold text-2xl sm:text-3xl text-[#141413]">
              Pertanyaan yang Sering Diajukan (FAQ)
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500">
              Temukan jawaban cepat seputar pemesanan, pengerjaan, dan pengiriman.
            </p>
          </div>

          <div className="space-y-3">
            {FAQ_LIST.map((item, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div key={index} className="ds-card overflow-hidden">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenFaqIndex((prev) => (prev === index ? null : index))
                    }
                    aria-expanded={isOpen}
                    className="w-full px-5 sm:px-6 py-4 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-neutral-50/80 transition-colors"
                  >
                    <span className="font-display font-semibold text-sm sm:text-base text-[#141413]">
                      {item.q}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-neutral-500 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-[#141413]' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-5 pt-1 text-xs sm:text-sm text-neutral-600 leading-relaxed border-t border-neutral-100">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 6: KONTAK & LOKASI (#kontak) */}
      <section
        id="kontak"
        className="py-16 sm:py-20 bg-white border-t border-neutral-200/80"
      >
        <div className="ds-container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-4">
              <p className="text-xs font-medium text-[#9A7237]">
                Hubungi Kami
              </p>
              <h2 className="font-display font-semibold text-2xl sm:text-3xl text-[#141413]">
                Siap Memproses Kebutuhan Cetak Anda
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                Hubungi kami melalui WhatsApp atau kunjungi workshop kami pada
                jam operasional untuk pemesanan maupun pengambilan barang.
              </p>
              <div className="pt-2 flex flex-wrap gap-3">
                <a
                  href={contactWhatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ds-btn-primary"
                >
                  <MessageCircle className="w-4 h-4 text-[#C59B5F]" />
                  <span>Hubungi via WhatsApp</span>
                </a>
                <a href="#katalog" className="ds-btn-secondary">
                  <span>Lihat Katalog Produk</span>
                </a>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-[#FAF9F6] border border-neutral-200/80 space-y-2">
                <div className="w-9 h-9 rounded-lg bg-[#141413] text-[#C59B5F] flex items-center justify-center">
                  <Phone className="w-4 h-4" />
                </div>
                <h3 className="font-display font-semibold text-sm text-[#141413]">
                  WhatsApp & Telepon
                </h3>
                <p className="text-xs sm:text-sm text-neutral-700 font-medium tabular-nums">
                  +{settings.whatsappNumber}
                </p>
                <p className="text-xs text-neutral-500">
                  Respons cepat pada jam kerja
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#FAF9F6] border border-neutral-200/80 space-y-2">
                <div className="w-9 h-9 rounded-lg bg-[#141413] text-[#C59B5F] flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <h3 className="font-display font-semibold text-sm text-[#141413]">
                  Jam Operasional
                </h3>
                <p className="text-xs sm:text-sm text-neutral-700">
                  {(settings.operatingHours || '').replace(
                    /Konsultasi Online/gi,
                    'Layanan Pesanan Online'
                  )}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#FAF9F6] border border-neutral-200/80 space-y-2">
                <div className="w-9 h-9 rounded-lg bg-[#141413] text-[#C59B5F] flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <h3 className="font-display font-semibold text-sm text-[#141413]">
                  Alamat Workshop
                </h3>
                <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed">
                  {settings.address}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#FAF9F6] border border-neutral-200/80 space-y-2">
                <div className="w-9 h-9 rounded-lg bg-[#141413] text-[#C59B5F] flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <h3 className="font-display font-semibold text-sm text-[#141413]">
                  Email Pengiriman File
                </h3>
                <p className="text-xs sm:text-sm text-neutral-700 break-all">
                  {settings.email}
                </p>
                <p className="text-xs text-neutral-500">
                  Untuk file cetak ukuran besar (PDF / CDR / AI / PSD)
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROFESSIONAL CORPORATE FOOTER */}
      <footer className="bg-[#10100F] text-neutral-400 py-14 border-t border-neutral-800/80 mt-auto">
        <div className="ds-container">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-10 border-b border-neutral-800/80">
            {/* Brand Column */}
            <div className="md:col-span-5 space-y-3.5">
              <BrandLogo
                storeName={settings.storeName}
                customLogoUrl={settings.logoUrl}
                theme="dark"
                size="md"
              />
              <p className="text-xs sm:text-[13px] text-neutral-400 leading-relaxed max-w-sm">
                {settings.aboutText}
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-neutral-400">
                {settings.instagramUrl && (
                  <a
                    href={settings.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#FAF9F6] transition-colors"
                  >
                    Instagram
                  </a>
                )}
                {settings.facebookUrl && (
                  <a
                    href={settings.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#FAF9F6] transition-colors"
                  >
                    Facebook
                  </a>
                )}
                {settings.tiktokUrl && (
                  <a
                    href={settings.tiktokUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#FAF9F6] transition-colors"
                  >
                    TikTok
                  </a>
                )}
              </div>
            </div>

            {/* Navigation Column */}
            <div className="md:col-span-3 space-y-2.5 text-xs sm:text-[13px]">
              <h4 className="font-display font-semibold text-sm text-[#FAF9F6] mb-3">
                Navigasi
              </h4>
              <ul className="space-y-2">
                {NAV_ITEMS.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className="hover:text-[#FAF9F6] transition-colors"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Column */}
            <div className="md:col-span-4 space-y-2.5 text-xs sm:text-[13px]">
              <h4 className="font-display font-semibold text-sm text-[#FAF9F6] mb-3">
                Informasi Kontak
              </h4>
              <p className="leading-relaxed">{settings.address}</p>
              <p className="text-neutral-300 tabular-nums">
                WhatsApp: +{settings.whatsappNumber}
              </p>
              <p className="text-neutral-400">{settings.email}</p>
            </div>
          </div>

          {/* Bottom Bar with Copyright & Subtle "Admin Login" */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
            <p>
              © {new Date().getFullYear()} {settings.storeName}. Hak Cipta
              Dilindungi.
            </p>
            <div className="flex items-center gap-5">
              <button
                type="button"
                onClick={handleAdminAccessClick}
                className="text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer text-xs"
              >
                Admin Login
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* PRODUCT DETAIL MODAL (With Related Products) */}
      {detailProduct && (
        <ProductDetailModal
          product={detailProduct}
          allProducts={products}
          whatsappNumber={settings.whatsappNumber}
          onClose={() => setDetailProduct(null)}
          onSelectProduct={(nextProd) => setDetailProduct(nextProd)}
          onAddToCart={handleAddToCart}
          onOpenLightbox={(images, startIndex, title) =>
            setLightboxData({ images, index: startIndex, title })
          }
        />
      )}

      {/* CART & CHECKOUT DRAWER */}
      <CartCheckoutDrawer
        isOpen={cartDrawerOpen}
        initialMode={cartInitialMode}
        cart={cart}
        whatsappNumber={settings.whatsappNumber}
        onClose={() => setCartDrawerOpen(false)}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        onShowToast={showToast}
      />

      {/* MULTI-PHOTO LIGHTBOX */}
      {lightboxData && (
        <GalleryLightbox
          images={lightboxData.images}
          initialIndex={lightboxData.index}
          title={lightboxData.title}
          onClose={() => setLightboxData(null)}
        />
      )}

      {/* PROTECTED ADMIN LOGIN MODAL */}
      <AdminLoginModal
        isOpen={loginModalOpen}
        settings={settings}
        onClose={() => setLoginModalOpen(false)}
        onSuccess={(session) => {
          setAdminSession(session);
          setLoginModalOpen(false);
          setIsAdminView(true);
          showToast(
            `Selamat datang kembali, Admin ${session.username}!`,
            'success'
          );
        }}
      />

      {/* TOAST NOTIFICATION */}
      {toast && (
        <div
          role="status"
          className={`fixed bottom-6 right-5 z-50 px-4 py-3 rounded-xl shadow-2xl border text-xs font-medium flex items-center gap-2 ${
            toast.type === 'success'
              ? 'bg-[#141413] text-white border-neutral-800'
              : 'bg-rose-600 text-white border-rose-500'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-[#C59B5F] shrink-0" />
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
