import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Boxes,
  CheckCircle2,
  Download,
  Edit3,
  ExternalLink,
  Eye,
  FileText,
  FolderKanban,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Package,
  Plus,
  Search,
  Settings,
  ShieldAlert,
  ShoppingBag,
  Sparkles,
  Star,
  Trash2,
  TrendingUp,
  Upload,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import {
  AuditLog,
  Category,
  Customer,
  DebtReceivable,
  FinanceTransaction,
  GalleryItem,
  Order,
  OrderStatus,
  PaymentMethodType,
  PaymentStatus,
  Product,
  StoreSettings,
} from '../../types';
import {
  compressImageFile,
  createStudioSpecPhoto,
  formatRupiah,
  normalizeWhatsAppNumber,
  simpleCredentialHash,
  SmartImage,
} from '../../utils/imageUtils';
import {
  deleteCategoryById,
  deleteCustomerById,
  deleteGalleryItemById,
  deleteOrderById,
  deleteProductById,
  saveCategory,
  saveCustomerRecord,
  saveGalleryItem,
  saveProduct,
  saveStoreSettings,
  subscribeAdminData,
  updateOrderAndSyncFinance,
} from '../../services/dbService';
import { FinanceModule, FinanceSubTab } from './FinanceModule';
import { BrandLogo } from '../BrandLogo';

type AdminMenuTab =
  | 'dashboard'
  | 'produk'
  | 'kategori'
  | 'pesanan'
  | 'pelanggan'
  | 'galeri'
  | 'keuangan'
  | 'laporan'
  | 'pengaturan';

interface AdminDashboardProps {
  adminUsername: string;
  settings: StoreSettings;
  categories: Category[];
  products: Product[];
  gallery: GalleryItem[];
  onLogout: () => void;
  onExitToStorefront: () => void;
  onShowToast: (message: string, type?: 'success' | 'error') => void;
  onOpenLightbox: (images: string[], startIndex: number, title: string) => void;
}

const CATEGORY_ICONS = ['🖨️', '🎨', '🎁', '👕', '💳', '🏷️', '🪧', '💌', '📦', '✨', '🏆', '📸'];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  adminUsername,
  settings,
  categories,
  products,
  gallery,
  onLogout,
  onExitToStorefront,
  onShowToast,
  onOpenLightbox,
}) => {
  const [activeTab, setActiveTab] = useState<AdminMenuTab>('dashboard');
  const [financeSubTab, setFinanceSubTab] = useState<FinanceSubTab>('dashboard');

  // Protected Admin Collections State
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [financeTxs, setFinanceTxs] = useState<FinanceTransaction[]>([]);
  const [debts, setDebts] = useState<DebtReceivable[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    const unsub = subscribeAdminData({
      onOrders: setOrders,
      onCustomers: setCustomers,
      onFinance: setFinanceTxs,
      onDebts: setDebts,
      onAuditLogs: setAuditLogs,
    });
    return () => unsub();
  }, []);

  // Search & Filter states
  const [productSearch, setProductSearch] = useState('');
  const [productCatFilter, setProductCatFilter] = useState('all');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');

  // PRODUCT CRUD MODAL STATE
  const [prodModalOpen, setProdModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [pName, setPName] = useState('');
  const [pCategoryId, setPCategoryId] = useState('');
  const [pSubcategory, setPSubcategory] = useState('');
  const [pPrice, setPPrice] = useState('');
  const [pPriceLabel, setPPriceLabel] = useState('Mulai dari');
  const [pOriginalPrice, setPOriginalPrice] = useState('0');
  const [pShortDesc, setPShortDesc] = useState('');
  const [pDesc, setPDesc] = useState('');
  const [pImages, setPImages] = useState<string[]>([]);
  const [pImageUrlInput, setPImageUrlInput] = useState('');
  const [pVariantsInput, setPVariantsInput] = useState('');
  const [pSizesInput, setPSizesInput] = useState('');
  const [pMaterialsInput, setPMaterialsInput] = useState('');
  const [pFinishingsInput, setPFinishingsInput] = useState('');
  const [pBadge, setPBadge] = useState('');
  const [pAvailable, setPAvailable] = useState(true);
  const [pFeatured, setPFeatured] = useState(true);
  const [pIsNew, setPIsNew] = useState(true);
  const [pHidden, setPHidden] = useState(false);
  const [pSortOrder, setPSortOrder] = useState('99');
  const [pMinOrder, setPMinOrder] = useState('1');
  const [pStock, setPStock] = useState('100');
  const [pUnit, setPUnit] = useState('pcs');
  const [pNotesHint, setPNotesHint] = useState('');
  const [pSaving, setPSaving] = useState(false);
  const [confirmDeleteProd, setConfirmDeleteProd] = useState<Product | null>(null);

  // CATEGORY CRUD MODAL STATE
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [cName, setCName] = useState('');
  const [cIcon, setCIcon] = useState('🖨️');
  const [cDesc, setCDesc] = useState('');
  const [cSortOrder, setCSortOrder] = useState('1');
  const [cActive, setCActive] = useState(true);
  const [confirmDeleteCat, setConfirmDeleteCat] = useState<Category | null>(null);

  // GALLERY CRUD MODAL STATE
  const [galModalOpen, setGalModalOpen] = useState(false);
  const [editingGallery, setEditingGallery] = useState<GalleryItem | null>(null);
  const [gTitle, setGTitle] = useState('');
  const [gCategory, setGCategory] = useState('');
  const [gClient, setGClient] = useState('');
  const [gDesc, setGDesc] = useState('');
  const [gDateLabel, setGDateLabel] = useState('Oktober 2026');
  const [gImages, setGImages] = useState<string[]>([]);
  const [gFeatured, setGFeatured] = useState(true);
  const [confirmDeleteGal, setConfirmDeleteGal] = useState<GalleryItem | null>(null);

  // ORDER EDIT MODAL STATE
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [oStatus, setOStatus] = useState<OrderStatus>('Baru');
  const [oPaymentStatus, setOPaymentStatus] = useState<PaymentStatus>('Belum Bayar');
  const [oPaymentMethod, setOPaymentMethod] = useState<PaymentMethodType>('Transfer');
  const [oNotes, setONotes] = useState('');
  const [oAutoFinance, setOAutoFinance] = useState(true);
  const [confirmDeleteOrder, setConfirmDeleteOrder] = useState<Order | null>(null);

  // CUSTOMER CRUD MODAL STATE
  const [custModalOpen, setCustModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custAddress, setCustAddress] = useState('');
  const [custNotes, setCustNotes] = useState('');
  const [confirmDeleteCust, setConfirmDeleteCust] = useState<Customer | null>(null);

  // SETTINGS FORM STATE
  const [sStoreName, setSStoreName] = useState(settings.storeName);
  const [sTagline, setSTagline] = useState(settings.tagline);
  const [sHeroDesc, setSHeroDesc] = useState(settings.heroDescription);
  const [sWhatsapp, setSWhatsapp] = useState(settings.whatsappNumber);
  const [sLogoUrl, setSLogoUrl] = useState(settings.logoUrl);
  const [sBannerUrl, setSBannerUrl] = useState(settings.heroBannerUrl);
  const [sAddress, setSAddress] = useState(settings.address);
  const [sHours, setSHours] = useState(settings.operatingHours);
  const [sEmail, setSEmail] = useState(settings.email);
  const [sInstagram, setSInstagram] = useState(settings.instagramUrl);
  const [sFacebook, setSFacebook] = useState(settings.facebookUrl);
  const [sTiktok, setSTiktok] = useState(settings.tiktokUrl);
  const [sAbout, setSAbout] = useState(settings.aboutText);
  const [sInitialCash, setSInitialCash] = useState(String(settings.initialCashBalance));
  const [sAdminUser, setSAdminUser] = useState(settings.adminUsername || 'Isatafa');
  const [sNewPassword, setSNewPassword] = useState('');
  const [sSaving, setSSaving] = useState(false);

  useEffect(() => {
    setSStoreName(settings.storeName);
    setSTagline(settings.tagline);
    setSHeroDesc(settings.heroDescription);
    setSWhatsapp(settings.whatsappNumber);
    setSLogoUrl(settings.logoUrl);
    setSBannerUrl(settings.heroBannerUrl);
    setSAddress(settings.address);
    setSHours(settings.operatingHours);
    setSEmail(settings.email);
    setSInstagram(settings.instagramUrl);
    setSFacebook(settings.facebookUrl);
    setSTiktok(settings.tiktokUrl);
    setSAbout(settings.aboutText);
    setSInitialCash(String(settings.initialCashBalance));
    setSAdminUser(settings.adminUsername || 'Isatafa');
  }, [settings]);

  // Dashboard Executive Metrics
  const dashboardStats = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const monthStr = todayStr.slice(0, 7);

    let totalIncomeAll = 0;
    let totalExpenseAll = 0;
    let salesToday = 0;
    let salesThisMonth = 0;

    for (const tx of financeTxs) {
      if (tx.type === 'income' || tx.type === 'cash_in') {
        totalIncomeAll += tx.amount;
        if (tx.dateIso === todayStr) salesToday += tx.amount;
        if ((tx.dateIso || '').slice(0, 7) === monthStr) salesThisMonth += tx.amount;
      } else if (tx.type === 'expense' || tx.type === 'cash_out') {
        totalExpenseAll += tx.amount;
      }
    }

    // Also include orders created today/month if not yet in finance
    for (const ord of orders) {
      if (ord.status !== 'Dibatalkan' && !ord.financeRecorded) {
        if (ord.dateIso === todayStr) salesToday += ord.totalAmount;
        if ((ord.dateIso || '').slice(0, 7) === monthStr) salesThisMonth += ord.totalAmount;
      }
    }

    const newOrdersCount = orders.filter((o) => o.status === 'Baru').length;
    const netProfit = totalIncomeAll - totalExpenseAll;
    const cashBalance =
      (Number(settings.initialCashBalance) || 0) +
      totalIncomeAll -
      totalExpenseAll;

    const topProducts = [...products]
      .sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0))
      .slice(0, 5);

    return {
      totalIncomeAll,
      totalExpenseAll,
      salesToday,
      salesThisMonth,
      newOrdersCount,
      netProfit,
      cashBalance,
      topProducts,
    };
  }, [financeTxs, orders, products, settings]);

  // Product Modal Openers & Multi-Photo Handlers
  const openAddProductModal = () => {
    setEditingProduct(null);
    setPName('');
    setPCategoryId(categories[0]?.id || 'cat_dokumen');
    setPSubcategory('');
    setPPrice('25000');
    setPPriceLabel('Mulai dari');
    setPOriginalPrice('0');
    setPShortDesc('');
    setPDesc('');
    setPImages([]);
    setPImageUrlInput('');
    setPVariantsInput('Standar, Custom Desain');
    setPSizesInput('Standar, Ukuran Custom');
    setPMaterialsInput('Bahan Premium Grade A');
    setPFinishingsInput('Finishing Rapi Siap Pakai');
    setPBadge('Terbaru');
    setPAvailable(true);
    setPFeatured(false);
    setPIsNew(true);
    setPHidden(false);
    setPSortOrder(String(products.length + 1));
    setPMinOrder('1');
    setPStock('100');
    setPUnit('pcs');
    setPNotesHint('Sebutkan ukuran, bahan, finishing, atau kirim file desain via WhatsApp.');
    setProdModalOpen(true);
  };

  const openEditProductModal = (prod: Product) => {
    setEditingProduct(prod);
    setPName(prod.name);
    setPCategoryId(prod.categoryId);
    setPSubcategory(prod.subcategory || '');
    setPPrice(String(prod.price));
    setPPriceLabel(prod.priceLabel || 'Mulai dari');
    setPOriginalPrice(String(prod.originalPrice || 0));
    setPShortDesc(prod.shortDescription || '');
    setPDesc(prod.description || '');
    setPImages([...(prod.images || [])]);
    setPImageUrlInput('');
    setPVariantsInput((prod.variants || []).join(', '));
    setPSizesInput((prod.sizeOptions || []).join(', '));
    setPMaterialsInput((prod.materialOptions || []).join(', '));
    setPFinishingsInput((prod.finishingOptions || []).join(', '));
    setPBadge(prod.badge || '');
    setPAvailable(prod.available);
    setPFeatured(prod.featured);
    setPIsNew(Boolean(prod.isNew));
    setPHidden(Boolean(prod.hidden));
    setPSortOrder(String(prod.sortOrder || 99));
    setPMinOrder(String(prod.minOrder || 1));
    setPStock(String(prod.stock || 0));
    setPUnit(prod.unit || 'pcs');
    setPNotesHint(prod.orderNotesHint || '');
    setProdModalOpen(true);
  };

  const handleMultiPhotoUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target: 'product' | 'gallery'
  ) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const uploadedUrls: string[] = [];
    for (let i = 0; i < fileList.length; i++) {
      try {
        const dataUrl = await compressImageFile(fileList[i]);
        uploadedUrls.push(dataUrl);
      } catch (err) {
        onShowToast(
          err instanceof Error ? err.message : 'Gagal memproses salah satu foto.',
          'error'
        );
      }
    }

    if (uploadedUrls.length > 0) {
      if (target === 'product') {
        setPImages((prev) => [...prev, ...uploadedUrls].slice(0, 10));
      } else {
        setGImages((prev) => [...prev, ...uploadedUrls].slice(0, 10));
      }
      onShowToast(
        `${uploadedUrls.length} foto berhasil diupload dan siap disimpan.`,
        'success'
      );
    }
    e.target.value = '';
  };

  const handleSaveProductForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName.trim()) {
      onShowToast('Nama produk wajib diisi.', 'error');
      return;
    }
    if (pImages.length === 0) {
      onShowToast('Tambahkan minimal 1 foto produk terlebih dahulu.', 'error');
      return;
    }

    setPSaving(true);
    const matchedCat = categories.find((c) => c.id === pCategoryId);
    const variantsList = pVariantsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const sizesList = pSizesInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const materialsList = pMaterialsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const finishingsList = pFinishingsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      await saveProduct(
        {
          id: editingProduct ? editingProduct.id : `prod_${Date.now()}`,
          name: pName.trim(),
          categoryId: pCategoryId || 'cat_custom',
          categoryName: matchedCat?.name || 'Custom & Layanan Lainnya',
          subcategory: pSubcategory.trim() || matchedCat?.name || 'Percetakan',
          price: Math.max(0, Number(pPrice) || 0),
          priceLabel: pPriceLabel.trim() || 'Mulai dari',
          originalPrice: Math.max(0, Number(pOriginalPrice) || 0),
          shortDescription: pShortDesc.trim() || pDesc.trim().slice(0, 150),
          description: pDesc.trim() || pShortDesc.trim(),
          images: pImages,
          variants: variantsList.length > 0 ? variantsList : ['Standar'],
          sizeOptions: sizesList,
          materialOptions: materialsList,
          finishingOptions: finishingsList,
          badge: pBadge.trim(),
          available: pAvailable,
          featured: pFeatured,
          isNew: pIsNew,
          hidden: pHidden,
          sortOrder: Number(pSortOrder) || 99,
          minOrder: Math.max(1, Number(pMinOrder) || 1),
          stock: Math.max(0, Number(pStock) || 0),
          unit: pUnit.trim() || 'pcs',
          orderNotesHint: pNotesHint.trim(),
          rating: editingProduct?.rating || 4.9,
          soldCount: editingProduct?.soldCount || 0,
        },
        Boolean(editingProduct),
        adminUsername
      );
      setProdModalOpen(false);
      onShowToast('Produk berhasil disimpan.', 'success');
    } catch (err) {
      onShowToast(
        err instanceof Error ? err.message : 'Gagal menyimpan produk.',
        'error'
      );
    } finally {
      setPSaving(false);
    }
  };

  const handleSaveCategoryForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cName.trim()) {
      onShowToast('Nama kategori wajib diisi.', 'error');
      return;
    }
    try {
      await saveCategory(
        {
          id: editingCategory ? editingCategory.id : `cat_${Date.now()}`,
          name: cName.trim(),
          slug: cName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, ''),
          icon: cIcon || '🖨️',
          description: cDesc.trim(),
          sortOrder: Number(cSortOrder) || 1,
          active: cActive,
        },
        Boolean(editingCategory),
        adminUsername
      );
      setCatModalOpen(false);
      onShowToast('Kategori berhasil disimpan.', 'success');
    } catch (err) {
      onShowToast(
        err instanceof Error ? err.message : 'Gagal menyimpan kategori.',
        'error'
      );
    }
  };

  const handleSaveGalleryForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gTitle.trim() || gImages.length === 0) {
      onShowToast('Judul dan minimal 1 foto galeri wajib diisi.', 'error');
      return;
    }
    try {
      await saveGalleryItem(
        {
          id: editingGallery ? editingGallery.id : `gal_${Date.now()}`,
          title: gTitle.trim(),
          category: gCategory.trim() || 'Custom Printing',
          clientName: gClient.trim() || 'Pelanggan ISTAFA',
          description: gDesc.trim(),
          images: gImages,
          featured: gFeatured,
          dateLabel: gDateLabel.trim() || 'Oktober 2026',
        },
        Boolean(editingGallery),
        adminUsername
      );
      setGalModalOpen(false);
      onShowToast('Item galeri berhasil disimpan.', 'success');
    } catch (err) {
      onShowToast(
        err instanceof Error ? err.message : 'Gagal menyimpan galeri.',
        'error'
      );
    }
  };

  const handleSaveSettingsForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setSSaving(true);
    try {
      const passwordHashToSave = sNewPassword.trim()
        ? simpleCredentialHash(sAdminUser.trim(), sNewPassword.trim())
        : settings.adminPasswordHash;

      await saveStoreSettings(
        {
          storeName: sStoreName.trim() || 'ISTAFA PRINTING',
          tagline: sTagline.trim(),
          heroDescription: sHeroDesc.trim(),
          whatsappNumber: sWhatsapp.trim() || '628212236933',
          logoUrl: sLogoUrl,
          heroBannerUrl: sBannerUrl,
          address: sAddress.trim(),
          operatingHours: sHours.trim(),
          email: sEmail.trim(),
          instagramUrl: sInstagram.trim(),
          facebookUrl: sFacebook.trim(),
          tiktokUrl: sTiktok.trim(),
          aboutText: sAbout.trim(),
          initialCashBalance: Number(sInitialCash) || 0,
          adminUsername: sAdminUser.trim() || 'Isatafa',
          adminPasswordHash: passwordHashToSave,
          updatedBy: adminUsername,
        },
        adminUsername
      );
      setSNewPassword('');
      onShowToast('Pengaturan berhasil diperbarui.', 'success');
    } catch (err) {
      onShowToast(
        err instanceof Error ? err.message : 'Gagal menyimpan pengaturan.',
        'error'
      );
    } finally {
      setSSaving(false);
    }
  };

  const handleExportFullBackup = () => {
    const backupPayload = {
      exportedAt: new Date().toISOString(),
      storeId: 'istafa_printing',
      settings,
      categories,
      products,
      gallery,
      orders,
      customers,
      financeTransactions: financeTxs,
      debtsReceivables: debts,
      auditLogs,
    };
    const blob = new Blob([JSON.stringify(backupPayload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Backup_ISTAFA_PRINTING_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onShowToast('File Backup Database JSON berhasil diunduh.', 'success');
  };

  const filteredProductsList = useMemo(() => {
    return products.filter((p) => {
      const matchCat =
        productCatFilter === 'all' || p.categoryId === productCatFilter;
      const q = productSearch.toLowerCase().trim();
      const matchSearch =
        !q ||
        (p.name || '').toLowerCase().includes(q) ||
        (p.categoryName || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [products, productCatFilter, productSearch]);

  const filteredOrdersList = useMemo(() => {
    if (orderStatusFilter === 'all') return orders;
    return orders.filter((o) => o.status === orderStatusFilter);
  }, [orders, orderStatusFilter]);

  return (
    <div className="min-h-screen bg-[#F4F3EF] text-slate-900 flex flex-col lg:flex-row">
      {/* Sidebar Navigation */}
      <aside className="no-print w-full lg:w-64 bg-slate-950 text-white shrink-0 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800">
        <div>
          {/* Brand Header */}
          <div className="p-5 border-b border-slate-800 space-y-1.5">
            <BrandLogo
              storeName={settings.storeName}
              customLogoUrl={settings.logoUrl}
              theme="dark"
              size="sm"
            />
            <p className="text-[11px] text-neutral-400 truncate pl-0.5">
              Administrator: {adminUsername}
            </p>
          </div>

          {/* Menu Links */}
          <nav className="p-3 flex lg:flex-col gap-1 overflow-x-auto">
            {(
              [
                { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                {
                  id: 'produk',
                  label: `Produk (${products.length})`,
                  icon: Package,
                },
                {
                  id: 'kategori',
                  label: `Kategori (${categories.length})`,
                  icon: FolderKanban,
                },
                {
                  id: 'pesanan',
                  label: `Pesanan (${orders.length})`,
                  icon: ShoppingBag,
                },
                {
                  id: 'pelanggan',
                  label: `Pelanggan (${customers.length})`,
                  icon: Users,
                },
                {
                  id: 'galeri',
                  label: `Galeri (${gallery.length})`,
                  icon: ImageIcon,
                },
                { id: 'keuangan', label: 'Keuangan', icon: Wallet },
                { id: 'laporan', label: 'Laporan & Cetak', icon: FileText },
                { id: 'pengaturan', label: 'Pengaturan', icon: Settings },
              ] as const
            ).map((item) => {
              const IconComp = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    if (item.id === 'laporan') {
                      setActiveTab('keuangan');
                      setFinanceSubTab('laporan');
                    } else {
                      setActiveTab(item.id);
                    }
                  }}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <IconComp className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-slate-800 flex lg:flex-col gap-2">
          <button
            type="button"
            onClick={onExitToStorefront}
            className="flex-1 flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Lihat Website</span>
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="flex-1 flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-semibold transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout Admin</span>
          </button>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {/* Top Bar Breadcrumb */}
        <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl px-5 py-3.5">
          <div>
            <p className="text-xs text-slate-400 font-mono">
              ISTAFA PRINTING / ADMIN PANEL / {activeTab.toUpperCase()}
            </p>
            <h2 className="font-display font-bold text-lg text-slate-900">
              {activeTab === 'dashboard' && 'Ringkasan Eksekutif & Statistik'}
              {activeTab === 'produk' && 'Manajemen Katalog Produk Multi-Foto'}
              {activeTab === 'kategori' && 'Manajemen Kategori Percetakan'}
              {activeTab === 'pesanan' && 'Manajemen Pesanan & Sinkronisasi Kas'}
              {activeTab === 'pelanggan' && 'Database Pelanggan Setia'}
              {activeTab === 'galeri' && 'Manajemen Portofolio & Galeri Cetak'}
              {(activeTab === 'keuangan' || activeTab === 'laporan') &&
                'Sistem Keuangan, Kas & Laporan Laba Rugi'}
              {activeTab === 'pengaturan' &&
                'Pengaturan Toko, Identitas Brand & Audit Log'}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openAddProductModal}
              className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Produk</span>
            </button>
          </div>
        </div>

        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* 8 KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <span className="text-xs text-slate-500 block">
                  Total Pemasukan / Penjualan
                </span>
                <p className="font-mono font-bold text-xl text-emerald-700 mt-1 tabular-nums">
                  {formatRupiah(dashboardStats.totalIncomeAll)}
                </p>
                <span className="text-[11px] text-slate-400 font-mono tabular-nums">
                  Bulan Ini: {formatRupiah(dashboardStats.salesThisMonth)}
                </span>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <span className="text-xs text-slate-500 block">
                  Penjualan Hari Ini
                </span>
                <p className="font-mono font-bold text-xl text-slate-900 mt-1 tabular-nums">
                  {formatRupiah(dashboardStats.salesToday)}
                </p>
                <span className="text-[11px] text-amber-700 font-semibold">
                  {dashboardStats.newOrdersCount} Pesanan Baru Menunggu
                </span>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <span className="text-xs text-slate-500 block">
                  Keuntungan Bersih (Laba)
                </span>
                <p
                  className={`font-mono font-bold text-xl mt-1 tabular-nums ${
                    dashboardStats.netProfit >= 0
                      ? 'text-slate-900'
                      : 'text-rose-600'
                  }`}
                >
                  {formatRupiah(dashboardStats.netProfit)}
                </p>
                <span className="text-[11px] text-rose-600 font-mono tabular-nums">
                  Pengeluaran: {formatRupiah(dashboardStats.totalExpenseAll)}
                </span>
              </div>

              <div className="bg-slate-900 text-white rounded-xl p-5">
                <span className="text-xs text-slate-400 block">
                  Saldo Kas Aktif
                </span>
                <p className="font-mono font-bold text-xl text-amber-400 mt-1 tabular-nums">
                  {formatRupiah(dashboardStats.cashBalance)}
                </p>
                <span className="text-[11px] text-slate-400">
                  Total Pesanan: {orders.length} · Produk: {products.length}
                </span>
              </div>
            </div>

            {/* Recent Orders + Top Selling Products */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                  <h3 className="font-display font-bold text-sm text-slate-900">
                    Pesanan Terbaru ({orders.length})
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab('pesanan')}
                    className="text-xs text-amber-700 hover:underline font-semibold cursor-pointer"
                  >
                    Lihat Semua
                  </button>
                </div>

                {orders.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500">
                    Belum ada pesanan masuk dari checkout website.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-500">
                          <th className="py-2.5 px-4">ID Pesanan</th>
                          <th className="py-2.5 px-4">Pelanggan</th>
                          <th className="py-2.5 px-4">Status</th>
                          <th className="py-2.5 px-4 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {orders.slice(0, 6).map((ord) => (
                          <tr key={ord.id} className="hover:bg-slate-50">
                            <td className="py-2.5 px-4 font-mono font-semibold">
                              {ord.orderNumber}
                            </td>
                            <td className="py-2.5 px-4">
                              <span className="font-medium text-slate-900 block">
                                {ord.customerName}
                              </span>
                              <span className="text-[11px] font-mono text-slate-400">
                                {ord.dateIso}
                              </span>
                            </td>
                            <td className="py-2.5 px-4 font-semibold">
                              {ord.status}
                            </td>
                            <td className="py-2.5 px-4 text-right font-mono font-bold tabular-nums">
                              {formatRupiah(ord.totalAmount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-bold text-sm text-slate-900">
                    Produk Terlaris
                  </h3>
                  <TrendingUp className="w-4 h-4 text-amber-600" />
                </div>

                <div className="space-y-3">
                  {dashboardStats.topProducts.map((prod, idx) => (
                    <div
                      key={prod.id}
                      className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80"
                    >
                      <span className="w-6 h-6 rounded-lg bg-slate-900 text-amber-400 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div className="w-11 h-11 rounded-lg overflow-hidden bg-slate-900 shrink-0">
                        <SmartImage
                          src={(prod.images || [])[0]}
                          alt={prod.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-xs text-slate-900 truncate">
                          {prod.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 font-mono tabular-nums">
                          {formatRupiah(prod.price)} · {(prod.images || []).length} Foto
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-mono font-bold text-xs text-emerald-700 block tabular-nums">
                          {prod.soldCount} terjual
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PRODUK (FULL CRUD + MULTI PHOTO) */}
        {activeTab === 'produk' && (
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[240px]">
                <div className="relative flex-1 max-w-xs">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Cari nama produk..."
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300"
                  />
                </div>
                <select
                  value={productCatFilter}
                  onChange={(e) => setProductCatFilter(e.target.value)}
                  className="px-3 py-2 text-xs rounded-lg border border-slate-300"
                >
                  <option value="all">Semua Kategori ({products.length})</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={openAddProductModal}
                className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Produk Baru</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredProductsList.map((prod) => (
                <div
                  key={prod.id}
                  className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-[4/3] bg-slate-900 border-b border-slate-200">
                      <SmartImage
                        src={prod.images?.[0]}
                        alt={prod.name}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          onOpenLightbox(prod.images || [], 0, prod.name)
                        }
                        className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-md bg-slate-900/80 text-white text-[11px] font-mono flex items-center gap-1 cursor-pointer"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                        <span>{(prod.images || []).length} Foto</span>
                      </button>
                    </div>

                    <div className="p-4">
                      <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-1.5 mb-1">
                        <span className="font-semibold text-amber-700">
                          {prod.categoryName}
                        </span>
                        {prod.subcategory && (
                          <>
                            <span>·</span>
                            <span className="text-slate-600">{prod.subcategory}</span>
                          </>
                        )}
                        <span>·</span>
                        <span
                          className={
                            prod.available
                              ? 'text-emerald-700 font-semibold'
                              : 'text-rose-600 font-semibold'
                          }
                        >
                          {prod.available ? 'Tersedia' : 'Stok Habis'}
                        </span>
                        {prod.hidden && (
                          <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 font-semibold">
                            Disembunyikan
                          </span>
                        )}
                      </div>

                      <h3 className="font-display font-bold text-sm text-slate-900 line-clamp-2">
                        {prod.name}
                      </h3>

                      <div className="mt-2 flex items-baseline gap-2">
                        {prod.price > 0 ? (
                          <>
                            <span className="text-[11px] text-slate-400">
                              {prod.priceLabel || 'Mulai dari'}
                            </span>
                            <span className="font-mono font-bold text-base text-slate-900 tabular-nums">
                              {formatRupiah(prod.price)}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              /{prod.unit}
                            </span>
                          </>
                        ) : (
                          <span className="font-semibold text-xs text-amber-700">
                            Hubungi kami untuk harga
                          </span>
                        )}
                      </div>

                      {/* Mini Thumbnail Preview */}
                      {prod.images && prod.images.length > 1 && (
                        <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1">
                          {prod.images.map((img, i) => (
                            <img
                              key={i}
                              src={img}
                              alt=""
                              onClick={() =>
                                onOpenLightbox(prod.images, i, prod.name)
                              }
                              className="w-10 h-8 rounded object-cover border border-slate-200 cursor-pointer hover:border-amber-500 shrink-0"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => openEditProductModal(prod)}
                      className="flex-1 py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Produk</span>
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await saveProduct(
                            { ...prod, hidden: !prod.hidden },
                            true,
                            adminUsername
                          );
                          onShowToast(
                            !prod.hidden
                              ? 'Produk disembunyikan dari katalog publik.'
                              : 'Produk ditampilkan kembali di katalog publik.',
                            'success'
                          );
                        } catch {
                          onShowToast('Gagal mengubah visibilitas produk.', 'error');
                        }
                      }}
                      className={`py-2 px-2.5 rounded-lg border text-xs font-semibold cursor-pointer ${
                        prod.hidden
                          ? 'border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100'
                          : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                      }`}
                      title={
                        prod.hidden
                          ? 'Tampilkan di Katalog Publik'
                          : 'Sembunyikan dari Katalog Publik'
                      }
                    >
                      {prod.hidden ? 'Tampilkan' : 'Sembunyikan'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteProd(prod)}
                      className="py-2 px-2.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      aria-label={`Hapus ${prod.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: KATEGORI CRUD */}
        {activeTab === 'kategori' && (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-base text-slate-900">
                  Daftar Kategori Produk ({categories.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Tambah atau sesuaikan kategori produk tanpa perlu mengubah
                  kode
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingCategory(null);
                  setCName('');
                  setCIcon('🖨️');
                  setCDesc('');
                  setCSortOrder(String(categories.length + 1));
                  setCActive(true);
                  setCatModalOpen(true);
                }}
                className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Kategori</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500">
                    <th className="py-3 px-4">Urutan</th>
                    <th className="py-3 px-4">Ikon & Nama Kategori</th>
                    <th className="py-3 px-4">Deskripsi</th>
                    <th className="py-3 px-4">Jumlah Produk</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {categories.map((cat) => {
                    const count = products.filter(
                      (p) => p.categoryId === cat.id
                    ).length;
                    return (
                      <tr key={cat.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-mono">{cat.sortOrder}</td>
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          <span className="mr-2 text-base">{cat.icon}</span>
                          {cat.name}
                        </td>
                        <td className="py-3 px-4 text-slate-600 max-w-sm">
                          {cat.description}
                        </td>
                        <td className="py-3 px-4 font-mono">{count} produk</td>
                        <td className="py-3 px-4 font-semibold">
                          <span
                            className={
                              cat.active ? 'text-emerald-700' : 'text-slate-400'
                            }
                          >
                            {cat.active ? 'Aktif' : 'Nonaktif'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingCategory(cat);
                                setCName(cat.name);
                                setCIcon(cat.icon);
                                setCDesc(cat.description);
                                setCSortOrder(String(cat.sortOrder));
                                setCActive(cat.active);
                                setCatModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-200 cursor-pointer"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteCat(cat)}
                              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: PESANAN & AUTO SYNC KEUANGAN */}
        {activeTab === 'pesanan' && (
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5">
                {(['all', 'Baru', 'Diproses', 'Selesai', 'Dibatalkan'] as const).map(
                  (st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setOrderStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                        orderStatusFilter === st
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {st === 'all' ? `Semua (${orders.length})` : st}
                    </button>
                  )
                )}
              </div>
              <p className="text-xs text-slate-500">
                Saat pesanan diset <strong>Lunas / Selesai</strong>, nominal
                otomatis masuk ke buku Pemasukan Keuangan tanpa duplikat.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500">
                      <th className="py-3 px-4">ID & Tanggal</th>
                      <th className="py-3 px-4">Pelanggan & Alamat</th>
                      <th className="py-3 px-4">Item Pesanan</th>
                      <th className="py-3 px-4 text-right">Total</th>
                      <th className="py-3 px-4">Status Pesanan</th>
                      <th className="py-3 px-4">Status Keuangan</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredOrdersList.map((ord) => (
                      <tr key={ord.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="font-mono font-bold text-slate-900 block">
                            {ord.orderNumber}
                          </span>
                          <span className="font-mono text-[11px] text-slate-400">
                            {ord.dateIso}
                          </span>
                        </td>
                        <td className="py-3 px-4 max-w-xs">
                          <span className="font-semibold text-slate-900 block">
                            {ord.customerName}
                          </span>
                          <a
                            href={`https://wa.me/${normalizeWhatsAppNumber(ord.customerPhone)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-[11px] text-emerald-700 hover:underline inline-flex items-center gap-1"
                          >
                            <MessageCircle className="w-3 h-3" />
                            {ord.customerPhone}
                          </a>
                          <p className="text-[11px] text-slate-500 line-clamp-1">
                            {ord.customerAddress}
                          </p>
                        </td>
                        <td className="py-3 px-4 max-w-xs">
                          {(ord.items || []).map((item, idx) => (
                            <div key={idx} className="text-slate-700">
                              • {item.name} ({item.variant}) × {item.quantity}
                            </div>
                          ))}
                          {ord.notes && (
                            <span className="block text-[11px] italic text-slate-500 mt-0.5">
                              Catatan: {ord.notes}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 whitespace-nowrap tabular-nums">
                          {formatRupiah(ord.totalAmount)}
                        </td>
                        <td className="py-3 px-4 font-semibold">
                          <span
                            className={
                              ord.status === 'Selesai'
                                ? 'text-emerald-700'
                                : ord.status === 'Diproses'
                                ? 'text-amber-700'
                                : ord.status === 'Dibatalkan'
                                ? 'text-rose-600'
                                : 'text-blue-700'
                            }
                          >
                            {ord.status}
                          </span>
                          <span className="block text-[11px] text-slate-500">
                            Bayar: {ord.paymentStatus}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {ord.financeRecorded ? (
                            <span className="text-emerald-700 font-semibold inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Tercatat di Kas
                            </span>
                          ) : (
                            <span className="text-slate-400">
                              Belum Tercatat
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedOrder(ord);
                                setOStatus(ord.status);
                                setOPaymentStatus(ord.paymentStatus);
                                setOPaymentMethod('Transfer');
                                setONotes(ord.notes || '');
                                setOAutoFinance(true);
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-semibold cursor-pointer"
                            >
                              Kelola
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteOrder(ord)}
                              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: PELANGGAN CRUD */}
        {activeTab === 'pelanggan' && (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-base text-slate-900">
                  Data Pelanggan ({customers.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Pelanggan otomatis tercatat saat melakukan checkout pesanan
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingCustomer(null);
                  setCustName('');
                  setCustPhone('');
                  setCustAddress('');
                  setCustNotes('');
                  setCustModalOpen(true);
                }}
                className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Pelanggan</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500">
                    <th className="py-3 px-4">Nama Pelanggan</th>
                    <th className="py-3 px-4">No. WhatsApp</th>
                    <th className="py-3 px-4">Alamat</th>
                    <th className="py-3 px-4 text-right">Total Pesanan</th>
                    <th className="py-3 px-4 text-right">Total Transaksi</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {customers.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {c.name}
                      </td>
                      <td className="py-3 px-4 font-mono">
                        <a
                          href={`https://wa.me/${normalizeWhatsAppNumber(c.phone)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-700 hover:underline inline-flex items-center gap-1"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          {c.phone}
                        </a>
                      </td>
                      <td className="py-3 px-4 text-slate-600 max-w-xs">
                        {c.address}
                      </td>
                      <td className="py-3 px-4 text-right font-mono">
                        {c.totalOrders}x
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                        {formatRupiah(c.totalSpent)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCustomer(c);
                              setCustName(c.name);
                              setCustPhone(c.phone);
                              setCustAddress(c.address);
                              setCustNotes(c.notes);
                              setCustModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-200 cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteCust(c)}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: GALERI HASIL CETAK (MULTI-FOTO) */}
        {activeTab === 'galeri' && (
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-base text-slate-900">
                  Galeri Portofolio Hasil Cetak ({gallery.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Setiap portofolio dapat menyimpan banyak foto dokumentasi
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingGallery(null);
                  setGTitle('');
                  setGCategory(categories[0]?.name || 'Custom Printing');
                  setGClient('');
                  setGDesc('');
                  setGDateLabel('Oktober 2026');
                  setGImages([]);
                  setGFeatured(true);
                  setGalModalOpen(true);
                }}
                className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Portofolio Galeri</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {gallery.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-[4/3] bg-slate-900">
                      <SmartImage
                        src={item.images?.[0]}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          onOpenLightbox(item.images || [], 0, item.title)
                        }
                        className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-md bg-slate-900/80 text-white text-[11px] font-mono cursor-pointer"
                      >
                        {(item.images || []).length} Foto
                      </button>
                    </div>
                    <div className="p-4">
                      <p className="text-[11px] text-amber-700 font-semibold">
                        {item.category} · {item.clientName}
                      </p>
                      <h4 className="font-display font-bold text-sm text-slate-900 mt-1">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingGallery(item);
                        setGTitle(item.title);
                        setGCategory(item.category);
                        setGClient(item.clientName);
                        setGDesc(item.description);
                        setGDateLabel(item.dateLabel);
                        setGImages([...(item.images || [])]);
                        setGFeatured(item.featured);
                        setGalModalOpen(true);
                      }}
                      className="flex-1 py-1.5 px-3 rounded-lg bg-slate-900 text-white text-xs font-semibold cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteGal(item)}
                      className="py-1.5 px-3 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-600 hover:text-white text-xs font-semibold cursor-pointer"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7 & 8: KEUANGAN & LAPORAN */}
        {(activeTab === 'keuangan' || activeTab === 'laporan') && (
          <FinanceModule
            activeSubTab={financeSubTab}
            onSelectSubTab={setFinanceSubTab}
            transactions={financeTxs}
            debtsReceivables={debts}
            orders={orders}
            settings={settings}
            adminUsername={adminUsername}
            onShowToast={onShowToast}
            onOpenLightbox={onOpenLightbox}
          />
        )}

        {/* TAB 9: PENGATURAN TOKO, LOGO, BANNER & AUDIT LOG */}
        {activeTab === 'pengaturan' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <form
              onSubmit={handleSaveSettingsForm}
              className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 space-y-4 text-xs"
            >
              <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-base text-slate-900">
                    Identitas Brand, Logo, Banner & Pengaturan
                  </h3>
                  <p className="text-slate-500">
                    Semua perubahan tersimpan permanen di Firestore Database
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={sSaving}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold cursor-pointer"
                >
                  {sSaving ? 'Menyimpan...' : 'Simpan Pengaturan'}
                </button>
              </div>

              {/* Logo & Banner Upload */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <label className="block font-semibold text-slate-700 mb-2">
                    Logo Toko (Permanen)
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-900 border border-slate-300 shrink-0">
                      <SmartImage
                        src={sLogoUrl}
                        alt="Logo"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <label className="px-3 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 font-semibold cursor-pointer inline-flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Ganti Logo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            const dataUrl = await compressImageFile(
                              file,
                              400,
                              0.82
                            );
                            setSLogoUrl(dataUrl);
                            onShowToast(
                              'Logo baru siap disimpan. Klik Simpan Pengaturan.',
                              'success'
                            );
                          } catch (err) {
                            onShowToast(
                              err instanceof Error
                                ? err.message
                                : 'Gagal memproses logo.',
                              'error'
                            );
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-2">
                    Foto Banner Utama (Hero)
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-16 rounded-xl overflow-hidden bg-slate-900 border border-slate-300 shrink-0">
                      <SmartImage
                        src={sBannerUrl}
                        alt="Banner"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <label className="px-3 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 font-semibold cursor-pointer inline-flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Ganti Banner</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            const dataUrl = await compressImageFile(
                              file,
                              900,
                              0.75
                            );
                            setSBannerUrl(dataUrl);
                            onShowToast(
                              'Banner baru siap disimpan. Klik Simpan Pengaturan.',
                              'success'
                            );
                          } catch (err) {
                            onShowToast(
                              err instanceof Error
                                ? err.message
                                : 'Gagal memproses banner.',
                              'error'
                            );
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nama Toko / Brand
                  </label>
                  <input
                    type="text"
                    required
                    value={sStoreName}
                    onChange={(e) => setSStoreName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nomor WhatsApp Pesanan & Konsultasi
                  </label>
                  <input
                    type="text"
                    required
                    value={sWhatsapp}
                    onChange={(e) => setSWhatsapp(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tagline Utama (Hero)
                </label>
                <input
                  type="text"
                  value={sTagline}
                  onChange={(e) => setSTagline(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Deskripsi Singkat Hero
                </label>
                <textarea
                  rows={2}
                  value={sHeroDesc}
                  onChange={(e) => setSHeroDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Alamat Lengkap Workshop / Toko
                </label>
                <input
                  type="text"
                  value={sAddress}
                  onChange={(e) => setSAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Jam Operasional
                  </label>
                  <input
                    type="text"
                    value={sHours}
                    onChange={(e) => setSHours(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Saldo Awal Kas (Rp)
                  </label>
                  <input
                    type="number"
                    value={sInitialCash}
                    onChange={(e) => setSInitialCash(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Link Instagram
                  </label>
                  <input
                    type="text"
                    value={sInstagram}
                    onChange={(e) => setSInstagram(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Link Facebook
                  </label>
                  <input
                    type="text"
                    value={sFacebook}
                    onChange={(e) => setSFacebook(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Link TikTok
                  </label>
                  <input
                    type="text"
                    value={sTiktok}
                    onChange={(e) => setSTiktok(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-3">
                <h4 className="font-bold text-slate-900">
                  Kredensial Keamanan Login Admin
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Username Admin
                    </label>
                    <input
                      type="text"
                      value={sAdminUser}
                      onChange={(e) => setSAdminUser(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Password Baru (Kosongkan jika tidak diubah)
                    </label>
                    <input
                      type="password"
                      value={sNewPassword}
                      onChange={(e) => setSNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={sSaving}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold cursor-pointer"
                >
                  {sSaving ? 'Menyimpan...' : 'Simpan Semua Pengaturan'}
                </button>
              </div>
            </form>

            {/* Right Column: Backup & Audit Log */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-slate-900 text-white rounded-xl p-5 space-y-3">
                <h3 className="font-display font-bold text-base">
                  Backup & Pemulihan Data
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Unduh salinan lengkap seluruh produk, foto, pesanan, pelanggan,
                  dan catatan keuangan ISTAFA PRINTING dalam format JSON.
                </p>
                <button
                  type="button"
                  onClick={handleExportFullBackup}
                  className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Full Backup (.JSON)</span>
                </button>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <h3 className="font-display font-bold text-sm text-slate-900 mb-3">
                  Audit Log Aktivitas Admin ({auditLogs.length})
                </h3>
                <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1 text-xs">
                  {auditLogs.slice(0, 30).map((log) => (
                    <div
                      key={log.id}
                      className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80"
                    >
                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                        <span>
                          {log.module} · Oleh {log.actor}
                        </span>
                        <span>{(log.dateIso || '').replace('T', ' ')}</span>
                      </div>
                      <p className="font-semibold text-slate-800 mt-0.5">
                        {log.action}
                      </p>
                      <p className="text-slate-600 text-[11px]">
                        {log.details}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL: PRODUCT CREATE / EDIT WITH MULTI-PHOTO MANAGER */}
      {prodModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto p-5 sm:p-7 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-display font-bold text-lg text-slate-900">
                {editingProduct
                  ? `Edit Produk: ${editingProduct.name}`
                  : 'Tambah Produk Baru (Multi-Foto)'}
              </h3>
              <button
                type="button"
                onClick={() => setProdModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProductForm} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nama Produk *
                  </label>
                  <input
                    type="text"
                    required
                    value={pName}
                    onChange={(e) => setPName(e.target.value)}
                    placeholder="Contoh: Cetak Kartu Nama Premium (1 Muka & 2 Muka)"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Kategori Utama *
                  </label>
                  <select
                    value={pCategoryId}
                    onChange={(e) => setPCategoryId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Subkategori / Jenis Layanan
                  </label>
                  <input
                    type="text"
                    value={pSubcategory}
                    onChange={(e) => setPSubcategory(e.target.value)}
                    placeholder="Contoh: Kartu Nama & Bisnis"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tampilan Label Harga
                  </label>
                  <select
                    value={pPriceLabel}
                    onChange={(e) => setPPriceLabel(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  >
                    <option value="Mulai dari">Mulai dari Rp ...</option>
                    <option value="Harga tetap">Harga tetap Rp ...</option>
                    <option value="Hubungi kami untuk harga">
                      Hubungi kami untuk harga (Set Harga = 0)
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Urutan Katalog
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={pSortOrder}
                    onChange={(e) => setPSortOrder(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Harga Mulai (Rp) * (Isi 0 jika Hubungi Kami)
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={pPrice}
                    onChange={(e) => setPPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Harga Coret (Rp)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={pOriginalPrice}
                    onChange={(e) => setPOriginalPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Minimal Order
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={pMinOrder}
                    onChange={(e) => setPMinOrder(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Satuan (pcs/box/m)
                  </label>
                  <input
                    type="text"
                    value={pUnit}
                    onChange={(e) => setPUnit(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              {/* MULTI-PHOTO MANAGER SECTION */}
              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-slate-200 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <label className="block font-bold text-slate-900">
                      Galeri Foto Produk ({pImages.length}/10 Foto) *
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Upload banyak foto sekaligus dari HP/Laptop, atur urutan,
                      atau pilih foto utama.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <label className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold cursor-pointer inline-flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5 text-amber-400" />
                      <span>Upload Foto dari Perangkat</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => handleMultiPhotoUpload(e, 'product')}
                        className="hidden"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() => {
                        const specImg = createStudioSpecPhoto(
                          pName || 'Produk Custom ISTAFA',
                          'Spesifikasi & Detail Cetak',
                          `Harga Mulai ${formatRupiah(Number(pPrice) || 50000)} / ${pUnit}`,
                          'Cetak Presisi Tinggi • Bahan Grade A',
                          '#F59E0B',
                          '#0F172A'
                        );
                        setPImages((prev) => [...prev, specImg].slice(0, 10));
                      }}
                      className="px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-semibold cursor-pointer inline-flex items-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>+ Slide Spesifikasi</span>
                    </button>
                  </div>
                </div>

                {/* Add Image by URL */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={pImageUrlInput}
                    onChange={(e) => setPImageUrlInput(e.target.value)}
                    placeholder="Atau tempel URL gambar lalu klik Tambah URL..."
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!pImageUrlInput.trim()) return;
                      setPImages((prev) =>
                        [...prev, pImageUrlInput.trim()].slice(0, 10)
                      );
                      setPImageUrlInput('');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold cursor-pointer"
                  >
                    Tambah URL
                  </button>
                </div>

                {/* Photo Cards Grid with Reorder, Main Photo & Delete */}
                {pImages.length === 0 ? (
                  <div className="p-6 text-center border-2 border-dashed border-slate-300 rounded-xl text-slate-400">
                    Belum ada foto. Klik tombol "Upload Foto dari Perangkat" di
                    atas.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {pImages.map((imgUrl, index) => (
                      <div
                        key={index}
                        className={`rounded-xl overflow-hidden border-2 bg-white flex flex-col justify-between ${
                          index === 0 ? 'border-amber-500' : 'border-slate-200'
                        }`}
                      >
                        <div className="relative aspect-[4/3] bg-slate-900">
                          <SmartImage
                            src={imgUrl}
                            alt={`Foto ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          {index === 0 && (
                            <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-bold text-[10px]">
                              FOTO UTAMA
                            </span>
                          )}
                        </div>

                        <div className="p-2 flex items-center justify-between gap-1 bg-slate-50 border-t border-slate-200">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              disabled={index === 0}
                              onClick={() => {
                                setPImages((prev) => {
                                  const copy = [...prev];
                                  const temp = copy[index - 1];
                                  copy[index - 1] = copy[index];
                                  copy[index] = temp;
                                  return copy;
                                });
                              }}
                              className="p-1 rounded hover:bg-slate-200 disabled:opacity-30 cursor-pointer"
                              title="Geser Kiri"
                            >
                              <ArrowLeft className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={index === pImages.length - 1}
                              onClick={() => {
                                setPImages((prev) => {
                                  const copy = [...prev];
                                  const temp = copy[index + 1];
                                  copy[index + 1] = copy[index];
                                  copy[index] = temp;
                                  return copy;
                                });
                              }}
                              className="p-1 rounded hover:bg-slate-200 disabled:opacity-30 cursor-pointer"
                              title="Geser Kanan"
                            >
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                            {index !== 0 && (
                              <button
                                type="button"
                                onClick={() => {
                                  setPImages((prev) => {
                                    const chosen = prev[index];
                                    const rest = prev.filter(
                                      (_, i) => i !== index
                                    );
                                    return [chosen, ...rest];
                                  });
                                }}
                                className="px-1.5 py-0.5 rounded bg-amber-100 hover:bg-amber-200 text-amber-900 text-[10px] font-semibold cursor-pointer"
                              >
                                Utama
                              </button>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              setPImages((prev) =>
                                prev.filter((_, i) => i !== index)
                              )
                            }
                            className="p-1 rounded text-rose-600 hover:bg-rose-50 cursor-pointer"
                            title="Hapus Foto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Pilihan Ukuran (Pisahkan dengan koma)
                  </label>
                  <input
                    type="text"
                    value={pSizesInput}
                    onChange={(e) => setPSizesInput(e.target.value)}
                    placeholder="Contoh: A4 (21x29.7 cm), A3 (29.7x42 cm), Ukuran Custom"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Pilihan Bahan / Material (Pisahkan dengan koma)
                  </label>
                  <input
                    type="text"
                    value={pMaterialsInput}
                    onChange={(e) => setPMaterialsInput(e.target.value)}
                    placeholder="Contoh: Art Carton 260gsm, HVS 80gsm, Flexi 340gsm"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Pilihan Finishing (Pisahkan dengan koma)
                  </label>
                  <input
                    type="text"
                    value={pFinishingsInput}
                    onChange={(e) => setPFinishingsInput(e.target.value)}
                    placeholder="Contoh: Laminasi Doff, Laminasi Glossy, Mata Ayam"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Variasi / Paket Produk (Pisahkan dengan koma)
                  </label>
                  <input
                    type="text"
                    value={pVariantsInput}
                    onChange={(e) => setPVariantsInput(e.target.value)}
                    placeholder="Contoh: Cetak 1 Sisi, Cetak 2 Sisi Bolak-Balik"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Deskripsi Singkat (Tampil di Katalog)
                </label>
                <input
                  type="text"
                  value={pShortDesc}
                  onChange={(e) => setPShortDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Deskripsi Lengkap Produk & Spesifikasi
                </label>
                <textarea
                  rows={3}
                  value={pDesc}
                  onChange={(e) => setPDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center pt-1">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Label / Kicker Singkat
                  </label>
                  <input
                    type="text"
                    value={pBadge}
                    onChange={(e) => setPBadge(e.target.value)}
                    placeholder="Contoh: Terlaris / Best Seller"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Petunjuk Catatan Pesanan Pelanggan
                  </label>
                  <input
                    type="text"
                    value={pNotesHint}
                    onChange={(e) => setPNotesHint(e.target.value)}
                    placeholder="Contoh: Sebutkan ukuran, warna, atau kirim desain via WA"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pAvailable}
                    onChange={(e) => setPAvailable(e.target.checked)}
                  />
                  <span className="font-semibold text-slate-800">
                    Stok Tersedia
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pFeatured}
                    onChange={(e) => setPFeatured(e.target.checked)}
                  />
                  <span className="font-semibold text-slate-800">
                    Produk Unggulan
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pIsNew}
                    onChange={(e) => setPIsNew(e.target.checked)}
                  />
                  <span className="font-semibold text-slate-800">
                    Produk Terbaru
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pHidden}
                    onChange={(e) => setPHidden(e.target.checked)}
                  />
                  <span className="font-semibold text-rose-700">
                    Sembunyikan Produk
                  </span>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setProdModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={pSaving}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold cursor-pointer disabled:opacity-50"
                >
                  {pSaving ? 'Menyimpan...' : 'Simpan Produk'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CATEGORY CREATE / EDIT */}
      {catModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-display font-bold text-base text-slate-900">
              {editingCategory ? 'Edit Kategori' : 'Tambah Kategori Baru'}
            </h3>
            <form onSubmit={handleSaveCategoryForm} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Pilih Ikon Kategori
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORY_ICONS.map((ic) => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => setCIcon(ic)}
                      className={`w-9 h-9 rounded-lg text-base flex items-center justify-center border cursor-pointer ${
                        cIcon === ic
                          ? 'border-slate-900 bg-amber-100'
                          : 'border-slate-200 bg-slate-50'
                      }`}
                    >
                      {ic}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Kategori *
                </label>
                <input
                  type="text"
                  required
                  value={cName}
                  onChange={(e) => setCName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Deskripsi Singkat
                </label>
                <textarea
                  rows={2}
                  value={cDesc}
                  onChange={(e) => setCDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>
              <div className="grid grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Urutan Tampil
                  </label>
                  <input
                    type="number"
                    value={cSortOrder}
                    onChange={(e) => setCSortOrder(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
                <label className="flex items-center gap-2 pt-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cActive}
                    onChange={(e) => setCActive(e.target.checked)}
                  />
                  <span className="font-semibold">Kategori Aktif</span>
                </label>
              </div>
              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCatModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-slate-900 text-white font-semibold cursor-pointer"
                >
                  Simpan Kategori
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: GALLERY CREATE / EDIT */}
      {galModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-display font-bold text-base text-slate-900">
              {editingGallery
                ? 'Edit Portofolio Galeri'
                : 'Tambah Portofolio Galeri (Multi-Foto)'}
            </h3>
            <form onSubmit={handleSaveGalleryForm} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Judul Pekerjaan / Hasil Cetak *
                </label>
                <input
                  type="text"
                  required
                  value={gTitle}
                  onChange={(e) => setGTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Kategori
                  </label>
                  <input
                    type="text"
                    value={gCategory}
                    onChange={(e) => setGCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nama Klien / Instansi
                  </label>
                  <input
                    type="text"
                    value={gClient}
                    onChange={(e) => setGClient(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Deskripsi Singkat
                </label>
                <textarea
                  rows={2}
                  value={gDesc}
                  onChange={(e) => setGDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">
                    Foto Dokumentasi ({gImages.length} Foto)
                  </span>
                  <label className="px-3 py-1.5 rounded-lg bg-slate-900 text-white font-semibold cursor-pointer inline-flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Foto</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleMultiPhotoUpload(e, 'gallery')}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {gImages.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-[4/3] rounded overflow-hidden border border-slate-300"
                    >
                      <SmartImage
                        src={img}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setGImages((prev) => prev.filter((_, i) => i !== idx))
                        }
                        className="absolute top-1 right-1 p-1 rounded bg-rose-600 text-white cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setGalModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-slate-900 text-white font-semibold cursor-pointer"
                >
                  Simpan Galeri
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: MANAGE ORDER STATUS & SYNC FINANCE */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-display font-bold text-base text-slate-900">
                Kelola Pesanan {selectedOrder.orderNumber}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <p className="font-semibold text-slate-900">
                {selectedOrder.customerName} ({selectedOrder.customerPhone})
              </p>
              <p className="font-mono font-bold text-sm text-amber-700">
                Total: {formatRupiah(selectedOrder.totalAmount)}
              </p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Status Pengerjaan Pesanan
              </label>
              <select
                value={oStatus}
                onChange={(e) => setOStatus(e.target.value as OrderStatus)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300"
              >
                <option value="Baru">Baru</option>
                <option value="Diproses">Diproses</option>
                <option value="Selesai">Selesai</option>
                <option value="Dibatalkan">Dibatalkan</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Status Pembayaran
                </label>
                <select
                  value={oPaymentStatus}
                  onChange={(e) =>
                    setOPaymentStatus(e.target.value as PaymentStatus)
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                >
                  <option value="Belum Bayar">Belum Bayar</option>
                  <option value="DP">DP</option>
                  <option value="Lunas">Lunas</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Metode Bayar
                </label>
                <select
                  value={oPaymentMethod}
                  onChange={(e) =>
                    setOPaymentMethod(e.target.value as PaymentMethodType)
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                >
                  <option value="Transfer">Transfer</option>
                  <option value="QRIS">QRIS</option>
                  <option value="Cash">Cash</option>
                  <option value="E-wallet">E-wallet</option>
                </select>
              </div>
            </div>

            {!selectedOrder.financeRecorded && (
              <label className="flex items-center gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={oAutoFinance}
                  onChange={(e) => setOAutoFinance(e.target.checked)}
                />
                <span className="font-semibold text-emerald-800">
                  Catat otomatis ke Pemasukan Keuangan sekarang
                </span>
              </label>
            )}

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await updateOrderAndSyncFinance(
                      selectedOrder,
                      {
                        status: oStatus,
                        paymentStatus: oPaymentStatus,
                        paymentMethod: oPaymentMethod,
                        notes: oNotes,
                        autoRecordFinance: oAutoFinance,
                      },
                      adminUsername
                    );
                    setSelectedOrder(null);
                    onShowToast('Pesanan berhasil diperbarui.', 'success');
                  } catch {
                    onShowToast('Gagal memperbarui pesanan.', 'error');
                  }
                }}
                className="px-5 py-2 rounded-lg bg-slate-900 text-white font-semibold cursor-pointer"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CUSTOMER CREATE / EDIT */}
      {custModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
            <h3 className="font-display font-bold text-base text-slate-900">
              {editingCustomer ? 'Edit Data Pelanggan' : 'Tambah Pelanggan'}
            </h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  await saveCustomerRecord(
                    {
                      id: editingCustomer
                        ? editingCustomer.id
                        : `cust_${Date.now()}`,
                      name: custName,
                      phone: custPhone,
                      address: custAddress,
                      totalOrders: editingCustomer?.totalOrders || 1,
                      totalSpent: editingCustomer?.totalSpent || 0,
                      lastOrderDate:
                        editingCustomer?.lastOrderDate ||
                        new Date().toISOString().slice(0, 10),
                      notes: custNotes,
                    },
                    Boolean(editingCustomer),
                    adminUsername
                  );
                  setCustModalOpen(false);
                  onShowToast('Data pelanggan berhasil disimpan.', 'success');
                } catch {
                  onShowToast('Gagal menyimpan pelanggan.', 'error');
                }
              }}
              className="space-y-3"
            >
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Pelanggan *
                </label>
                <input
                  type="text"
                  required
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nomor WhatsApp *
                </label>
                <input
                  type="text"
                  required
                  value={custPhone}
                  onChange={(e) => setCustPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Alamat Lengkap
                </label>
                <textarea
                  rows={2}
                  value={custAddress}
                  onChange={(e) => setCustAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>
              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCustModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-slate-900 text-white font-semibold cursor-pointer"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMATION DIALOGS FOR DELETING PRODUCT / CATEGORY / GALLERY / ORDER / CUSTOMER */}
      {confirmDeleteProd && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-display font-bold text-base text-slate-900">
              Hapus Produk?
            </h3>
            <p className="text-xs text-slate-600">
              Apakah Anda yakin ingin menghapus produk{' '}
              <strong>{confirmDeleteProd.name}</strong> secara permanen?
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteProd(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await deleteProductById(
                      confirmDeleteProd.id,
                      confirmDeleteProd.name,
                      adminUsername
                    );
                    setConfirmDeleteProd(null);
                    onShowToast('Produk berhasil dihapus.', 'success');
                  } catch {
                    onShowToast('Gagal menghapus produk.', 'error');
                  }
                }}
                className="px-4 py-2 rounded-lg bg-rose-600 text-white text-xs font-semibold cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDeleteCat && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-display font-bold text-base text-slate-900">
              Hapus Kategori?
            </h3>
            <p className="text-xs text-slate-600">
              Hapus kategori <strong>{confirmDeleteCat.name}</strong>?
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteCat(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await deleteCategoryById(
                      confirmDeleteCat.id,
                      confirmDeleteCat.name,
                      adminUsername
                    );
                    setConfirmDeleteCat(null);
                    onShowToast('Kategori berhasil dihapus.', 'success');
                  } catch {
                    onShowToast('Gagal menghapus kategori.', 'error');
                  }
                }}
                className="px-4 py-2 rounded-lg bg-rose-600 text-white text-xs font-semibold cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDeleteGal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-display font-bold text-base text-slate-900">
              Hapus Portofolio Galeri?
            </h3>
            <p className="text-xs text-slate-600">
              Hapus <strong>{confirmDeleteGal.title}</strong> dari galeri?
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteGal(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await deleteGalleryItemById(
                      confirmDeleteGal.id,
                      confirmDeleteGal.title,
                      adminUsername
                    );
                    setConfirmDeleteGal(null);
                    onShowToast('Galeri berhasil dihapus.', 'success');
                  } catch {
                    onShowToast('Gagal menghapus galeri.', 'error');
                  }
                }}
                className="px-4 py-2 rounded-lg bg-rose-600 text-white text-xs font-semibold cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDeleteOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-display font-bold text-base text-slate-900">
              Hapus Pesanan?
            </h3>
            <p className="text-xs text-slate-600">
              Hapus pesanan <strong>{confirmDeleteOrder.orderNumber}</strong>?
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteOrder(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await deleteOrderById(confirmDeleteOrder, adminUsername);
                    setConfirmDeleteOrder(null);
                    onShowToast('Pesanan berhasil dihapus.', 'success');
                  } catch {
                    onShowToast('Gagal menghapus pesanan.', 'error');
                  }
                }}
                className="px-4 py-2 rounded-lg bg-rose-600 text-white text-xs font-semibold cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDeleteCust && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-display font-bold text-base text-slate-900">
              Hapus Pelanggan?
            </h3>
            <p className="text-xs text-slate-600">
              Hapus pelanggan <strong>{confirmDeleteCust.name}</strong>?
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteCust(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await deleteCustomerById(
                      confirmDeleteCust.id,
                      confirmDeleteCust.name,
                      adminUsername
                    );
                    setConfirmDeleteCust(null);
                    onShowToast('Pelanggan berhasil dihapus.', 'success');
                  } catch {
                    onShowToast('Gagal menghapus pelanggan.', 'error');
                  }
                }}
                className="px-4 py-2 rounded-lg bg-rose-600 text-white text-xs font-semibold cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
