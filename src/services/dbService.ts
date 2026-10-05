import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import {
  ADMIN_SCOPE,
  auth,
  db,
  handleFirestoreError,
  OperationType,
  STORE_ID,
} from '../firebase';
import {
  AuditLog,
  Category,
  Customer,
  DebtPaymentItem,
  DebtReceivable,
  DebtStatus,
  FinanceTransaction,
  GalleryItem,
  Order,
  OrderItem,
  OrderStatus,
  PaymentMethodType,
  PaymentStatus,
  Product,
  StoreSettings,
} from '../types';
import {
  INITIAL_CATEGORIES,
  INITIAL_DEBTS_RECEIVABLES,
  INITIAL_FINANCE_TRANSACTIONS,
  INITIAL_GALLERY,
  INITIAL_PRODUCTS,
  INITIAL_STORE_SETTINGS,
} from '../data/initialSeed';
import { DEFAULT_ADMIN_HASH, simpleCredentialHash } from '../utils/imageUtils';

const ADMIN_SESSION_STORAGE_KEY = 'istafa_admin_session_v1';
let memoryAdminSessionRaw: string | null = null;

function safeGetAdminStorage(): string | null {
  try {
    return localStorage.getItem(ADMIN_SESSION_STORAGE_KEY) ?? memoryAdminSessionRaw;
  } catch {
    return memoryAdminSessionRaw;
  }
}

function safeSetAdminStorage(value: string): void {
  memoryAdminSessionRaw = value;
  try {
    localStorage.setItem(ADMIN_SESSION_STORAGE_KEY, value);
  } catch {
    // ignore storage restriction in cross-origin iframe
  }
}

function safeClearAdminStorage(): void {
  memoryAdminSessionRaw = null;
  try {
    localStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
    sessionStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
  } catch {
    // ignore storage restriction in cross-origin iframe
  }
}

export interface StoredAdminSession {
  username: string;
  sessionToken: string;
  loginTime: number;
}

export function sanitizeId(raw: string, prefix = 'id'): string {
  const cleaned = (raw || '')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 100);
  return cleaned || `${prefix}_${Date.now()}`;
}

/**
 * Ensures /admin_runtime/session_state is active in Firestore when an admin performs privileged operations
 */
export async function ensureAdminSessionStateActive(actor = 'Isatafa'): Promise<void> {
  const sessionRef = doc(db, 'admin_runtime', 'session_state');
  try {
    const raw = safeGetAdminStorage();
    const parsed = raw ? (JSON.parse(raw) as StoredAdminSession) : null;
    const token = parsed?.sessionToken || `sess_active_${Date.now()}`;

    const snap = await getDoc(sessionRef);
    if (snap.exists()) {
      if (!snap.data()?.active) {
        await updateDoc(sessionRef, {
          active: true,
          username: (actor || 'Isatafa').slice(0, 100),
          sessionToken: token,
          updatedAt: serverTimestamp(),
        });
      }
    } else {
      await setDoc(sessionRef, {
        storeId: STORE_ID,
        active: true,
        username: (actor || 'Isatafa').slice(0, 100),
        sessionToken: token,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (err) {
    console.warn('Could not sync admin_runtime/session_state:', err);
  }
}

/**
 * One-time database initialization with Partial-Seed Recovery.
 * NEVER overwrites existing data if /settings/store_config already exists.
 */
let initPromise: Promise<void> | null = null;

const OBSOLETE_V1_CATEGORY_IDS = new Set([
  'cat_tumbler',
  'cat_kartu_nama',
  'cat_id_card',
  'cat_stiker',
]);

const OBSOLETE_V1_PRODUCT_IDS = new Set([
  'prod_tumbler_sakura',
  'prod_tumbler_niagara',
  'prod_kartu_nama_standar',
  'prod_stiker_vinyl',
  'prod_xbanner_promo',
  'prod_gantungan_kunci_akrilik',
  'prod_totebag_kanvas',
]);

const SEED_PRODUCT_MAP = new Map<string, Product>(
  INITIAL_PRODUCTS.map((p) => [p.id, p])
);

export async function ensureDatabaseInitialized(): Promise<void> {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const settingsRef = doc(db, 'settings', 'store_config');
    try {
      const snap = await getDoc(settingsRef);
      if (snap.exists()) {
        // When store_config already exists, only attempt background seeding if an admin session is active
        const activeSessionRaw = safeGetAdminStorage();
        if (!activeSessionRaw) {
          return;
        }
        const prodCheckSnap = await getDoc(
          doc(db, 'products', 'prod_promosi_voucher_kupon_member')
        );
        if (prodCheckSnap.exists()) {
          return;
        }
        await ensureAdminSessionStateActive('Isatafa');
      }

      // Remove obsolete v1 template categories & products if present
      await Promise.all([
        ...Array.from(OBSOLETE_V1_CATEGORY_IDS).map(async (oldCatId) => {
          try {
            await deleteDoc(doc(db, 'categories', oldCatId));
          } catch {
            // ignore if absent
          }
        }),
        ...Array.from(OBSOLETE_V1_PRODUCT_IDS).map(async (oldProdId) => {
          try {
            await deleteDoc(doc(db, 'products', oldProdId));
          } catch {
            // ignore if absent
          }
        }),
      ]);

      await Promise.all([
        ...INITIAL_CATEGORIES.map(async (cat) => {
          const catRef = doc(db, 'categories', cat.id);
          const catSnap = await getDoc(catRef);
          if (!catSnap.exists()) {
            await setDoc(catRef, {
              id: cat.id,
              storeId: STORE_ID,
              name: cat.name.slice(0, 100),
              slug: cat.slug.slice(0, 120),
              icon: cat.icon.slice(0, 50),
              description: cat.description.slice(0, 300),
              sortOrder: Number(cat.sortOrder) || 1,
              active: Boolean(cat.active),
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          }
        }),
        ...INITIAL_PRODUCTS.map(async (prod) => {
          const prodRef = doc(db, 'products', prod.id);
          const prodSnap = await getDoc(prodRef);
          if (!prodSnap.exists()) {
            await setDoc(prodRef, {
              id: prod.id,
              storeId: STORE_ID,
              name: prod.name.slice(0, 160),
              categoryId: prod.categoryId.slice(0, 128),
              categoryName: prod.categoryName.slice(0, 100),
              subcategory: (prod.subcategory || '').slice(0, 120),
              price: Math.max(0, Number(prod.price) || 0),
              originalPrice: Math.max(0, Number(prod.originalPrice) || 0),
              priceLabel: (prod.priceLabel || 'Mulai dari').slice(0, 80),
              description: prod.description.slice(0, 3000),
              shortDescription: prod.shortDescription.slice(0, 300),
              images: prod.images.slice(0, 10),
              variants: prod.variants.slice(0, 20),
              sizeOptions: (prod.sizeOptions || []).slice(0, 20),
              materialOptions: (prod.materialOptions || []).slice(0, 20),
              finishingOptions: (prod.finishingOptions || []).slice(0, 20),
              badge: (prod.badge || '').slice(0, 60),
              available: Boolean(prod.available),
              featured: Boolean(prod.featured),
              isNew: Boolean(prod.isNew),
              hidden: Boolean(prod.hidden),
              sortOrder: Number(prod.sortOrder) || 99,
              minOrder: Math.max(1, Number(prod.minOrder) || 1),
              stock: Math.max(0, Number(prod.stock) || 0),
              unit: (prod.unit || 'pcs').slice(0, 40),
              orderNotesHint: (prod.orderNotesHint || '').slice(0, 300),
              rating: Math.min(5, Math.max(0, Number(prod.rating) || 4.9)),
              soldCount: Math.max(0, Number(prod.soldCount) || 0),
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          }
        }),
        ...INITIAL_GALLERY.map(async (gal) => {
          const galRef = doc(db, 'gallery', gal.id);
          const galSnap = await getDoc(galRef);
          if (!galSnap.exists()) {
            await setDoc(galRef, {
              id: gal.id,
              storeId: STORE_ID,
              title: gal.title.slice(0, 160),
              category: gal.category.slice(0, 100),
              clientName: gal.clientName.slice(0, 120),
              description: gal.description.slice(0, 1000),
              images: gal.images.slice(0, 10),
              featured: Boolean(gal.featured),
              dateLabel: gal.dateLabel.slice(0, 60),
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          }
        }),
        ...INITIAL_FINANCE_TRANSACTIONS.map(async (tx) => {
          const txRef = doc(db, 'finance_transactions', tx.id);
          const txSnap = await getDoc(txRef);
          if (!txSnap.exists()) {
            await setDoc(txRef, {
              id: tx.id,
              storeId: STORE_ID,
              adminScope: ADMIN_SCOPE,
              transactionNumber: tx.transactionNumber.slice(0, 60),
              type: tx.type,
              dateIso: tx.dateIso.slice(0, 40),
              sourceOrTarget: tx.sourceOrTarget.slice(0, 160),
              category: tx.category.slice(0, 100),
              amount: Math.max(0, Number(tx.amount) || 0),
              paymentMethod: tx.paymentMethod,
              description: tx.description.slice(0, 1000),
              proofImageUrl: tx.proofImageUrl || '',
              relatedOrderId: tx.relatedOrderId || '',
              createdBy: tx.createdBy.slice(0, 100),
              updatedBy: tx.updatedBy.slice(0, 100),
              correctionHistory: [],
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          }
        }),
        ...INITIAL_DEBTS_RECEIVABLES.map(async (dr) => {
          const drRef = doc(db, 'debts_receivables', dr.id);
          const drSnap = await getDoc(drRef);
          if (!drSnap.exists()) {
            await setDoc(drRef, {
              id: dr.id,
              storeId: STORE_ID,
              adminScope: ADMIN_SCOPE,
              recordType: dr.recordType,
              partyName: dr.partyName.slice(0, 160),
              phone: dr.phone.slice(0, 40),
              dateIso: dr.dateIso.slice(0, 40),
              dueDateIso: dr.dueDateIso.slice(0, 40),
              totalAmount: Math.max(0, Number(dr.totalAmount) || 0),
              paidAmount: Math.max(0, Number(dr.paidAmount) || 0),
              status: dr.status,
              description: dr.description.slice(0, 1000),
              paymentHistory: dr.paymentHistory.slice(0, 50),
              createdBy: dr.createdBy.slice(0, 100),
              updatedBy: dr.updatedBy.slice(0, 100),
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          }
        }),
      ]);

      // Write store_config only if it doesn't exist yet
      if (!snap.exists()) {
        await setDoc(settingsRef, {
          storeId: STORE_ID,
          storeName: INITIAL_STORE_SETTINGS.storeName,
          tagline: INITIAL_STORE_SETTINGS.tagline,
          heroDescription: INITIAL_STORE_SETTINGS.heroDescription,
          whatsappNumber: INITIAL_STORE_SETTINGS.whatsappNumber,
          logoUrl: INITIAL_STORE_SETTINGS.logoUrl,
          heroBannerUrl: INITIAL_STORE_SETTINGS.heroBannerUrl,
          address: INITIAL_STORE_SETTINGS.address,
          operatingHours: INITIAL_STORE_SETTINGS.operatingHours,
          email: INITIAL_STORE_SETTINGS.email,
          instagramUrl: INITIAL_STORE_SETTINGS.instagramUrl,
          facebookUrl: INITIAL_STORE_SETTINGS.facebookUrl,
          tiktokUrl: INITIAL_STORE_SETTINGS.tiktokUrl,
          aboutText: INITIAL_STORE_SETTINGS.aboutText,
          initialCashBalance: INITIAL_STORE_SETTINGS.initialCashBalance,
          adminUsername: INITIAL_STORE_SETTINGS.adminUsername,
          adminPasswordHash: INITIAL_STORE_SETTINGS.adminPasswordHash,
          updatedAt: serverTimestamp(),
          updatedBy: 'System Initialization',
        });
      }
    } catch (error) {
      initPromise = null;
      handleFirestoreError(error, OperationType.WRITE, 'settings/store_config');
    }
  })();

  return initPromise;
}

/**
 * Admin Authentication & Session Functions
 */
export async function loginAdmin(
  usernameInput: string,
  passwordInput: string,
  settings: StoreSettings
): Promise<StoredAdminSession> {
  const cleanUser = usernameInput.trim();
  const cleanPass = passwordInput.trim();

  const expectedUsername = settings?.adminUsername || 'Isatafa';
  const expectedHash = settings?.adminPasswordHash || DEFAULT_ADMIN_HASH;
  const inputHash = simpleCredentialHash(expectedUsername, cleanPass);
  const canonicalDefaultHash = simpleCredentialHash('Isatafa', cleanPass);

  const isDefaultMatch =
    ['isatafa', 'istafa'].includes(cleanUser.toLowerCase()) &&
    canonicalDefaultHash === DEFAULT_ADMIN_HASH;
  const isCustomMatch =
    cleanUser.toLowerCase() === expectedUsername.toLowerCase() &&
    inputHash === expectedHash;

  if (!isDefaultMatch && !isCustomMatch) {
    throw new Error('Username atau password salah. Akses ditolak.');
  }

  const canonicalUsername = isDefaultMatch ? 'Isatafa' : expectedUsername;
  const sessionToken = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
  const sessionRef = doc(db, 'admin_runtime', 'session_state');

  try {
    const snap = await getDoc(sessionRef);
    if (snap.exists()) {
      await updateDoc(sessionRef, {
        active: true,
        username: canonicalUsername.slice(0, 100),
        sessionToken,
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(sessionRef, {
        storeId: STORE_ID,
        active: true,
        username: canonicalUsername.slice(0, 100),
        sessionToken,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.warn('Session state sync warning:', error);
  }

  const sessionObj: StoredAdminSession = {
    username: canonicalUsername,
    sessionToken,
    loginTime: Date.now(),
  };

  safeSetAdminStorage(JSON.stringify(sessionObj));
  await recordAuditLog(
    'Login Admin',
    'Autentikasi',
    `Admin ${canonicalUsername} berhasil login ke dashboard.`,
    canonicalUsername
  );

  return sessionObj;
}

export async function logoutAdmin(actor = 'Isatafa'): Promise<void> {
  safeClearAdminStorage();

  try {
    if (auth.currentUser) {
      await signOut(auth);
    }
  } catch {
    // ignore auth signout error
  }

  const sessionRef = doc(db, 'admin_runtime', 'session_state');
  try {
    const snap = await getDoc(sessionRef);
    if (snap.exists()) {
      await updateDoc(sessionRef, {
        active: false,
        username: (actor || 'Isatafa').slice(0, 100),
        sessionToken: `logged_out_${Date.now()}`,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error('Failed to deactivate remote session:', error);
  }
}

export async function checkActiveAdminSession(): Promise<StoredAdminSession | null> {
  try {
    const raw = safeGetAdminStorage();
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredAdminSession;
    if (!parsed?.sessionToken || !parsed?.username) {
      safeClearAdminStorage();
      return null;
    }

    try {
      const sessionRef = doc(db, 'admin_runtime', 'session_state');
      const snap = await getDoc(sessionRef);
      if (snap.exists() && snap.data()?.active === false) {
        safeClearAdminStorage();
        return null;
      }
    } catch {
      // keep local verified session if offline/transient error
    }
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Audit Log Helper
 */
export async function recordAuditLog(
  action: string,
  moduleName: string,
  details: string,
  actor = 'Isatafa'
): Promise<void> {
  const id = `log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  try {
    await setDoc(doc(db, 'audit_logs', id), {
      id,
      storeId: STORE_ID,
      adminScope: ADMIN_SCOPE,
      action: action.slice(0, 120),
      module: moduleName.slice(0, 60),
      details: details.slice(0, 1000),
      actor: (actor || 'Isatafa').slice(0, 100),
      dateIso: new Date().toISOString().slice(0, 19),
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn('Audit log write skipped:', err);
  }
}

/**
 * Real-time Listeners for Public Storefront Data
 */
export function subscribePublicStoreData(callbacks: {
  onSettings: (settings: StoreSettings) => void;
  onCategories: (categories: Category[]) => void;
  onProducts: (products: Product[]) => void;
  onGallery: (gallery: GalleryItem[]) => void;
  onError: (errMessage: string) => void;
}): () => void {
  const unsubSettings = onSnapshot(
    doc(db, 'settings', 'store_config'),
    (snap) => {
      if (snap.exists()) {
        const remote = snap.data() as Partial<StoreSettings>;
        callbacks.onSettings({
          ...INITIAL_STORE_SETTINGS,
          ...remote,
          storeName: remote.storeName || INITIAL_STORE_SETTINGS.storeName,
          tagline: remote.tagline || INITIAL_STORE_SETTINGS.tagline,
          heroDescription:
            remote.heroDescription || INITIAL_STORE_SETTINGS.heroDescription,
          whatsappNumber:
            remote.whatsappNumber || INITIAL_STORE_SETTINGS.whatsappNumber,
          logoUrl: remote.logoUrl || INITIAL_STORE_SETTINGS.logoUrl,
          heroBannerUrl:
            remote.heroBannerUrl || INITIAL_STORE_SETTINGS.heroBannerUrl,
        });
      }
    },
    (error) => {
      callbacks.onError('Gagal memuat pengaturan toko.');
      try {
        handleFirestoreError(error, OperationType.GET, 'settings/store_config');
      } catch {
        // Handled via callback
      }
    }
  );

  const qCategories = query(
    collection(db, 'categories'),
    where('storeId', '==', STORE_ID)
  );
  const unsubCategories = onSnapshot(
    qCategories,
    (snap) => {
      const remoteList = snap.docs
        .map((d) => d.data() as Category)
        .filter((cat) => !OBSOLETE_V1_CATEGORY_IDS.has(cat.id));
      const seenCatIds = new Set(remoteList.map((c) => c.id));
      const mergedCategories = [
        ...remoteList,
        ...INITIAL_CATEGORIES.filter((c) => !seenCatIds.has(c.id)),
      ];
      mergedCategories.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      callbacks.onCategories(mergedCategories);
    },
    (error) => {
      callbacks.onError('Gagal memuat daftar kategori.');
      try {
        handleFirestoreError(error, OperationType.LIST, 'categories');
      } catch {
        // Handled
      }
    }
  );

  const qProducts = query(
    collection(db, 'products'),
    where('storeId', '==', STORE_ID)
  );
  const unsubProducts = onSnapshot(
    qProducts,
    (snap) => {
      const remoteProducts = snap.docs
        .map((d) => {
          const raw = d.data() as Product;
          const seedFallback = SEED_PRODUCT_MAP.get(raw.id);
          const rawImages = Array.isArray(raw.images) ? raw.images : [];
          // If the remote product still uses an older generic template SVG and seedFallback has a new studio photo or bespoke artwork, prefer seedFallback images
          const isLegacySvgOnly =
            rawImages.length > 0 &&
            rawImages[0].startsWith('data:image/svg+xml') &&
            !rawImages[0].includes('ISTAFA%20PRINTING%20STUDIO') &&
            Boolean(seedFallback?.images?.length);
          const resolvedImages = isLegacySvgOnly
            ? seedFallback!.images
            : rawImages.length > 0
            ? rawImages
            : seedFallback?.images || [''];

          return {
            ...seedFallback,
            ...raw,
            subcategory:
              raw.subcategory ?? seedFallback?.subcategory ?? raw.categoryName,
            priceLabel:
              raw.priceLabel ??
              seedFallback?.priceLabel ??
              (Number(raw.price) > 0 ? 'Mulai dari' : 'Hubungi kami untuk harga'),
            sizeOptions:
              Array.isArray(raw.sizeOptions) && raw.sizeOptions.length > 0
                ? raw.sizeOptions
                : seedFallback?.sizeOptions || [],
            materialOptions:
              Array.isArray(raw.materialOptions) &&
              raw.materialOptions.length > 0
                ? raw.materialOptions
                : seedFallback?.materialOptions || [],
            finishingOptions:
              Array.isArray(raw.finishingOptions) &&
              raw.finishingOptions.length > 0
                ? raw.finishingOptions
                : seedFallback?.finishingOptions || [],
            isNew:
              typeof raw.isNew === 'boolean'
                ? raw.isNew
                : Boolean(seedFallback?.isNew),
            hidden:
              typeof raw.hidden === 'boolean'
                ? raw.hidden
                : Boolean(seedFallback?.hidden),
            sortOrder:
              typeof raw.sortOrder === 'number'
                ? raw.sortOrder
                : seedFallback?.sortOrder ?? 99,
            images: resolvedImages,
            variants:
              Array.isArray(raw.variants) && raw.variants.length > 0
                ? raw.variants
                : seedFallback?.variants || ['Standar'],
            price: Number(raw.price) || 0,
            originalPrice: Number(raw.originalPrice) || 0,
            minOrder: Math.max(1, Number(raw.minOrder) || 1),
            rating: Number(raw.rating) || 4.9,
            soldCount: Number(raw.soldCount) || 0,
          };
        })
        .filter((prod) => !OBSOLETE_V1_PRODUCT_IDS.has(prod.id));

      const seenProdIds = new Set(remoteProducts.map((p) => p.id));
      const mergedProducts = [
        ...remoteProducts,
        ...INITIAL_PRODUCTS.filter((p) => !seenProdIds.has(p.id)),
      ];
      mergedProducts.sort(
        (a, b) =>
          (a.sortOrder ?? 99) - (b.sortOrder ?? 99) ||
          (b.soldCount || 0) - (a.soldCount || 0)
      );
      callbacks.onProducts(mergedProducts);
    },
    (error) => {
      callbacks.onError('Gagal memuat katalog produk.');
      try {
        handleFirestoreError(error, OperationType.LIST, 'products');
      } catch {
        // Handled
      }
    }
  );

  const qGallery = query(
    collection(db, 'gallery'),
    where('storeId', '==', STORE_ID)
  );
  const unsubGallery = onSnapshot(
    qGallery,
    (snap) => {
      const list = snap.docs.map((d) => {
        const raw = d.data() as GalleryItem;
        return {
          ...raw,
          images: Array.isArray(raw.images) && raw.images.length > 0 ? raw.images : [''],
        };
      });
      callbacks.onGallery(list);
    },
    (error) => {
      callbacks.onError('Gagal memuat galeri cetak.');
      try {
        handleFirestoreError(error, OperationType.LIST, 'gallery');
      } catch {
        // Handled
      }
    }
  );

  return () => {
    unsubSettings();
    unsubCategories();
    unsubProducts();
    unsubGallery();
  };
}

/**
 * Real-time Listeners for Protected Admin Collections
 */
export function subscribeAdminData(callbacks: {
  onOrders: (orders: Order[]) => void;
  onCustomers: (customers: Customer[]) => void;
  onFinance: (txs: FinanceTransaction[]) => void;
  onDebts: (records: DebtReceivable[]) => void;
  onAuditLogs: (logs: AuditLog[]) => void;
}): () => void {
  const qOrders = query(
    collection(db, 'orders'),
    where('storeId', '==', STORE_ID),
    where('adminScope', '==', ADMIN_SCOPE)
  );
  const unsubOrders = onSnapshot(
    qOrders,
    (snap) => {
      const list = snap.docs.map((d) => d.data() as Order);
      list.sort((a, b) => (b.dateIso || '').localeCompare(a.dateIso || ''));
      callbacks.onOrders(list);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, 'orders');
      } catch {
        // Handled
      }
    }
  );

  const qCustomers = query(
    collection(db, 'customers'),
    where('storeId', '==', STORE_ID),
    where('adminScope', '==', ADMIN_SCOPE)
  );
  const unsubCustomers = onSnapshot(
    qCustomers,
    (snap) => {
      const list = snap.docs.map((d) => d.data() as Customer);
      list.sort((a, b) => (b.totalSpent || 0) - (a.totalSpent || 0));
      callbacks.onCustomers(list);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, 'customers');
      } catch {
        // Handled
      }
    }
  );

  const qFinance = query(
    collection(db, 'finance_transactions'),
    where('storeId', '==', STORE_ID),
    where('adminScope', '==', ADMIN_SCOPE)
  );
  const unsubFinance = onSnapshot(
    qFinance,
    (snap) => {
      const list = snap.docs.map((d) => d.data() as FinanceTransaction);
      list.sort((a, b) => (b.dateIso || '').localeCompare(a.dateIso || ''));
      callbacks.onFinance(list);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, 'finance_transactions');
      } catch {
        // Handled
      }
    }
  );

  const qDebts = query(
    collection(db, 'debts_receivables'),
    where('storeId', '==', STORE_ID),
    where('adminScope', '==', ADMIN_SCOPE)
  );
  const unsubDebts = onSnapshot(
    qDebts,
    (snap) => {
      const list = snap.docs.map((d) => d.data() as DebtReceivable);
      list.sort((a, b) => (b.dateIso || '').localeCompare(a.dateIso || ''));
      callbacks.onDebts(list);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, 'debts_receivables');
      } catch {
        // Handled
      }
    }
  );

  const qLogs = query(
    collection(db, 'audit_logs'),
    where('storeId', '==', STORE_ID),
    where('adminScope', '==', ADMIN_SCOPE)
  );
  const unsubLogs = onSnapshot(
    qLogs,
    (snap) => {
      const list = snap.docs.map((d) => d.data() as AuditLog);
      list.sort((a, b) => (b.dateIso || '').localeCompare(a.dateIso || ''));
      callbacks.onAuditLogs(list);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, 'audit_logs');
      } catch {
        // Handled
      }
    }
  );

  return () => {
    unsubOrders();
    unsubCustomers();
    unsubFinance();
    unsubDebts();
    unsubLogs();
  };
}

/**
 * Store Settings Update
 */
export async function saveStoreSettings(
  updated: Omit<StoreSettings, 'storeId' | 'updatedAt'>,
  actor = 'Isatafa'
): Promise<void> {
  await ensureAdminSessionStateActive(actor);
  const ref = doc(db, 'settings', 'store_config');
  try {
    const snap = await getDoc(ref);
    const payload = {
      storeName: (updated.storeName || 'ISTAFA PRINTING').slice(0, 120),
      tagline: (updated.tagline || '').slice(0, 250),
      heroDescription: (updated.heroDescription || '').slice(0, 600),
      whatsappNumber: (updated.whatsappNumber || '628212236933').slice(0, 30),
      logoUrl: (updated.logoUrl || '').slice(0, 250000),
      heroBannerUrl: (updated.heroBannerUrl || '').slice(0, 250000),
      address: (updated.address || '').slice(0, 500),
      operatingHours: (updated.operatingHours || '').slice(0, 250),
      email: (updated.email || '').slice(0, 150),
      instagramUrl: (updated.instagramUrl || '').slice(0, 250),
      facebookUrl: (updated.facebookUrl || '').slice(0, 250),
      tiktokUrl: (updated.tiktokUrl || '').slice(0, 250),
      aboutText: (updated.aboutText || '').slice(0, 1500),
      initialCashBalance: Number(updated.initialCashBalance) || 0,
      adminUsername: (updated.adminUsername || 'Isatafa').slice(0, 64),
      adminPasswordHash: (updated.adminPasswordHash || '').slice(0, 128),
      updatedAt: serverTimestamp(),
      updatedBy: (actor || 'Isatafa').slice(0, 100),
    };

    if (snap.exists()) {
      await updateDoc(ref, payload);
    } else {
      await setDoc(ref, {
        storeId: STORE_ID,
        ...payload,
      });
    }
    await recordAuditLog(
      'Update Pengaturan Toko',
      'Pengaturan',
      `Memperbarui pengaturan toko (${payload.storeName}, WA: ${payload.whatsappNumber}).`,
      actor
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, 'settings/store_config');
  }
}

/**
 * Category CRUD
 */
export async function saveCategory(
  category: Omit<Category, 'storeId' | 'createdAt' | 'updatedAt'>,
  isEdit: boolean,
  actor = 'Isatafa'
): Promise<void> {
  await ensureAdminSessionStateActive(actor);
  const id = sanitizeId(category.id || `cat_${Date.now()}`, 'cat');
  const ref = doc(db, 'categories', id);
  const mutableFields = {
    name: category.name.trim().slice(0, 100),
    slug: (
      category.slug ||
      category.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') ||
      id
    ).slice(0, 120),
    icon: (category.icon || '🖨️').slice(0, 50),
    description: (category.description || '').slice(0, 300),
    sortOrder: Number(category.sortOrder) || 1,
    active: Boolean(category.active),
    updatedAt: serverTimestamp(),
  };

  try {
    const snap = await getDoc(ref);
    if (snap.exists()) {
      await updateDoc(ref, mutableFields);
    } else {
      await setDoc(ref, {
        id,
        storeId: STORE_ID,
        ...mutableFields,
        createdAt: serverTimestamp(),
      });
    }
    await recordAuditLog(
      isEdit ? 'Edit Kategori' : 'Tambah Kategori',
      'Kategori',
      `Kategori "${mutableFields.name}" disimpan.`,
      actor
    );
  } catch (error) {
    handleFirestoreError(
      error,
      isEdit ? OperationType.UPDATE : OperationType.CREATE,
      `categories/${id}`
    );
  }
}

export async function deleteCategoryById(
  id: string,
  name: string,
  actor = 'Isatafa'
): Promise<void> {
  await ensureAdminSessionStateActive(actor);
  try {
    await deleteDoc(doc(db, 'categories', id));
    await recordAuditLog(
      'Hapus Kategori',
      'Kategori',
      `Menghapus kategori "${name}" (${id}).`,
      actor
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `categories/${id}`);
  }
}

/**
 * Product CRUD (with Multi-Photo Support)
 */
export async function saveProduct(
  product: Omit<Product, 'storeId' | 'createdAt' | 'updatedAt'>,
  isEdit: boolean,
  actor = 'Isatafa'
): Promise<void> {
  await ensureAdminSessionStateActive(actor);
  const id = sanitizeId(product.id || `prod_${Date.now()}`, 'prod');
  const ref = doc(db, 'products', id);

  const cleanedImages = (product.images || [])
    .filter((img) => typeof img === 'string' && img.trim().length > 0)
    .slice(0, 10)
    .map((img) => img.slice(0, 250000));

  if (cleanedImages.length === 0) {
    throw new Error('Produk wajib memiliki minimal 1 foto.');
  }

  const cleanedVariants = (product.variants || [])
    .map((v) => v.trim())
    .filter(Boolean)
    .slice(0, 20)
    .map((v) => v.slice(0, 120));

  const cleanedSizes = (product.sizeOptions || [])
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 20)
    .map((s) => s.slice(0, 120));

  const cleanedMaterials = (product.materialOptions || [])
    .map((m) => m.trim())
    .filter(Boolean)
    .slice(0, 20)
    .map((m) => m.slice(0, 120));

  const cleanedFinishing = (product.finishingOptions || [])
    .map((f) => f.trim())
    .filter(Boolean)
    .slice(0, 20)
    .map((f) => f.slice(0, 120));

  const numericPrice = Math.max(0, Number(product.price) || 0);

  const mutableFields = {
    name: product.name.trim().slice(0, 160),
    categoryId: (product.categoryId || 'cat_custom').slice(0, 128),
    categoryName: (product.categoryName || 'Custom Request').slice(0, 100),
    subcategory: (product.subcategory || product.categoryName || '').slice(
      0,
      120
    ),
    price: numericPrice,
    originalPrice: Math.max(0, Number(product.originalPrice) || 0),
    priceLabel: (
      product.priceLabel ||
      (numericPrice > 0 ? 'Mulai dari' : 'Hubungi kami untuk harga')
    ).slice(0, 80),
    description: (product.description || '').slice(0, 3000),
    shortDescription: (
      product.shortDescription ||
      product.description?.slice(0, 160) ||
      ''
    ).slice(0, 300),
    images: cleanedImages,
    variants:
      cleanedVariants.length > 0
        ? cleanedVariants
        : [
            ...cleanedSizes.slice(0, 2).map((s) => `Ukuran: ${s}`),
            ...cleanedMaterials.slice(0, 2).map((m) => `Bahan: ${m}`),
          ],
    sizeOptions: cleanedSizes,
    materialOptions: cleanedMaterials,
    finishingOptions: cleanedFinishing,
    badge: (product.badge || '').slice(0, 60),
    available: Boolean(product.available),
    featured: Boolean(product.featured),
    isNew: Boolean(product.isNew),
    hidden: Boolean(product.hidden),
    sortOrder: Number.isFinite(Number(product.sortOrder))
      ? Number(product.sortOrder)
      : 99,
    minOrder: Math.max(1, Number(product.minOrder) || 1),
    stock: Math.max(0, Number(product.stock) || 0),
    unit: (product.unit || 'pcs').slice(0, 40),
    orderNotesHint: (product.orderNotesHint || '').slice(0, 300),
    rating: Math.min(5, Math.max(0, Number(product.rating) || 4.9)),
    soldCount: Math.max(0, Number(product.soldCount) || 0),
    updatedAt: serverTimestamp(),
  };

  try {
    const snap = await getDoc(ref);
    if (snap.exists()) {
      await updateDoc(ref, mutableFields);
    } else {
      await setDoc(ref, {
        id,
        storeId: STORE_ID,
        ...mutableFields,
        createdAt: serverTimestamp(),
      });
    }
    await recordAuditLog(
      isEdit ? 'Edit Produk' : 'Tambah Produk',
      'Produk',
      `Produk "${mutableFields.name}" (${cleanedImages.length} foto) berhasil disimpan.`,
      actor
    );
  } catch (error) {
    handleFirestoreError(
      error,
      isEdit ? OperationType.UPDATE : OperationType.CREATE,
      `products/${id}`
    );
  }
}

export async function deleteProductById(
  id: string,
  name: string,
  actor = 'Isatafa'
): Promise<void> {
  await ensureAdminSessionStateActive(actor);
  try {
    await deleteDoc(doc(db, 'products', id));
    await recordAuditLog(
      'Hapus Produk',
      'Produk',
      `Menghapus produk "${name}" (${id}).`,
      actor
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `products/${id}`);
  }
}

/**
 * Gallery CRUD (Multi-Photo Portfolio)
 */
export async function saveGalleryItem(
  item: Omit<GalleryItem, 'storeId' | 'createdAt' | 'updatedAt'>,
  isEdit: boolean,
  actor = 'Isatafa'
): Promise<void> {
  await ensureAdminSessionStateActive(actor);
  const id = sanitizeId(item.id || `gal_${Date.now()}`, 'gal');
  const ref = doc(db, 'gallery', id);

  const cleanedImages = (item.images || [])
    .filter((img) => typeof img === 'string' && img.trim().length > 0)
    .slice(0, 10)
    .map((img) => img.slice(0, 250000));

  if (cleanedImages.length === 0) {
    throw new Error('Item galeri wajib memiliki minimal 1 foto.');
  }

  const mutableFields = {
    title: item.title.trim().slice(0, 160),
    category: (item.category || 'Custom Printing').slice(0, 100),
    clientName: (item.clientName || 'Pelanggan ISTAFA').slice(0, 120),
    description: (item.description || '').slice(0, 1000),
    images: cleanedImages,
    featured: Boolean(item.featured),
    dateLabel: (item.dateLabel || 'Oktober 2026').slice(0, 60),
    updatedAt: serverTimestamp(),
  };

  try {
    const snap = await getDoc(ref);
    if (snap.exists()) {
      await updateDoc(ref, mutableFields);
    } else {
      await setDoc(ref, {
        id,
        storeId: STORE_ID,
        ...mutableFields,
        createdAt: serverTimestamp(),
      });
    }
    await recordAuditLog(
      isEdit ? 'Edit Galeri' : 'Tambah Galeri',
      'Galeri',
      `Portofolio "${mutableFields.title}" disimpan.`,
      actor
    );
  } catch (error) {
    handleFirestoreError(
      error,
      isEdit ? OperationType.UPDATE : OperationType.CREATE,
      `gallery/${id}`
    );
  }
}

export async function deleteGalleryItemById(
  id: string,
  title: string,
  actor = 'Isatafa'
): Promise<void> {
  await ensureAdminSessionStateActive(actor);
  try {
    await deleteDoc(doc(db, 'gallery', id));
    await recordAuditLog(
      'Hapus Galeri',
      'Galeri',
      `Menghapus galeri "${title}" (${id}).`,
      actor
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `gallery/${id}`);
  }
}

/**
 * Customer Checkout -> Creates Order + Upserts Customer + Updates Product Sold Count
 */
export async function submitCustomerCheckout(params: {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  notes: string;
  items: OrderItem[];
}): Promise<Order> {
  const id = `ord_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const orderNumber = `IST-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`;
  const todayIso = new Date().toISOString().slice(0, 10);

  const totalQuantity = params.items.reduce((acc, i) => acc + i.quantity, 0);
  const totalAmount = params.items.reduce((acc, i) => acc + i.subtotal, 0);

  const newOrder: Omit<Order, 'createdAt' | 'updatedAt'> = {
    id,
    storeId: STORE_ID,
    adminScope: ADMIN_SCOPE,
    orderNumber,
    customerName: params.customerName.trim().slice(0, 150),
    customerPhone: params.customerPhone.trim().slice(0, 40),
    customerAddress: params.customerAddress.trim().slice(0, 600),
    notes: (params.notes || '').trim().slice(0, 1000),
    items: params.items.slice(0, 50),
    totalQuantity: Math.max(1, totalQuantity),
    totalAmount: Math.max(0, totalAmount),
    status: 'Baru',
    paymentStatus: 'Belum Bayar',
    paymentMethod: 'WhatsApp Checkout',
    financeRecorded: false,
    financeTxId: '',
    dateIso: todayIso,
  };

  try {
    await setDoc(doc(db, 'orders', id), {
      ...newOrder,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Upsert Customer record by phone digits
    const phoneDigits = params.customerPhone.replace(/\D/g, '').slice(0, 30) || `${Date.now()}`;
    const customerId = sanitizeId(`cust_${phoneDigits}`, 'cust');
    const custRef = doc(db, 'customers', customerId);
    const custSnap = await getDoc(custRef);

    if (custSnap.exists()) {
      const existingCust = custSnap.data() as Customer;
      await updateDoc(custRef, {
        name: newOrder.customerName,
        phone: newOrder.customerPhone,
        address: newOrder.customerAddress,
        totalOrders: (existingCust.totalOrders || 0) + 1,
        totalSpent: (existingCust.totalSpent || 0) + newOrder.totalAmount,
        lastOrderDate: todayIso,
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(custRef, {
        id: customerId,
        storeId: STORE_ID,
        adminScope: ADMIN_SCOPE,
        name: newOrder.customerName,
        phone: newOrder.customerPhone,
        address: newOrder.customerAddress,
        totalOrders: 1,
        totalSpent: newOrder.totalAmount,
        lastOrderDate: todayIso,
        notes: 'Pelanggan via Website Checkout',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    // Increment product sold counts safely
    for (const item of params.items) {
      try {
        const prodRef = doc(db, 'products', item.productId);
        const prodSnap = await getDoc(prodRef);
        if (prodSnap.exists()) {
          const prodData = prodSnap.data() as Product;
          await updateDoc(prodRef, {
            soldCount: (prodData.soldCount || 0) + item.quantity,
            stock: Math.max(0, (prodData.stock || 0) - item.quantity),
            updatedAt: serverTimestamp(),
          });
        }
      } catch {
        // non-blocking for product stock update
      }
    }

    return newOrder;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `orders/${id}`);
  }
}

/**
 * Update Order & Auto-Sync with Finance Module (Prevent Duplicate Recording!)
 */
export async function updateOrderAndSyncFinance(
  order: Order,
  updates: {
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    paymentMethod: PaymentMethodType | string;
    notes?: string;
    autoRecordFinance?: boolean;
  },
  actor = 'Isatafa'
): Promise<void> {
  await ensureAdminSessionStateActive(actor);
  const orderRef = doc(db, 'orders', order.id);
  let financeRecorded = order.financeRecorded;
  let financeTxId = order.financeTxId || '';

  const shouldRecordToFinance =
    !order.financeRecorded &&
    (updates.autoRecordFinance ||
      updates.paymentStatus === 'Lunas' ||
      updates.status === 'Selesai');

  try {
    if (shouldRecordToFinance && order.totalAmount > 0) {
      const txId = sanitizeId(`tx_ord_${order.id}`, 'tx');
      const txRef = doc(db, 'finance_transactions', txId);
      const txSnap = await getDoc(txRef);

      if (!txSnap.exists()) {
        const validMethod: PaymentMethodType = [
          'Cash',
          'Transfer',
          'QRIS',
          'E-wallet',
          'Lainnya',
        ].includes(updates.paymentMethod as PaymentMethodType)
          ? (updates.paymentMethod as PaymentMethodType)
          : 'Transfer';

        await setDoc(txRef, {
          id: txId,
          storeId: STORE_ID,
          adminScope: ADMIN_SCOPE,
          transactionNumber: `INV-${order.orderNumber}`.slice(0, 60),
          type: 'income',
          dateIso: order.dateIso || new Date().toISOString().slice(0, 10),
          sourceOrTarget: order.customerName.slice(0, 160),
          category: 'Pesanan Online',
          amount: Math.max(0, Number(order.totalAmount) || 0),
          paymentMethod: validMethod,
          description: `Otomatis dari Pesanan ${order.orderNumber} (${order.items
            .map((i) => `${i.name} x${i.quantity}`)
            .join(', ')})`.slice(0, 1000),
          proofImageUrl: '',
          relatedOrderId: order.id,
          createdBy: actor.slice(0, 100),
          updatedBy: actor.slice(0, 100),
          correctionHistory: [],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      financeRecorded = true;
      financeTxId = txId;
    }

    await updateDoc(orderRef, {
      customerName: order.customerName.slice(0, 150),
      customerPhone: order.customerPhone.slice(0, 40),
      customerAddress: order.customerAddress.slice(0, 600),
      notes: (updates.notes !== undefined ? updates.notes : order.notes).slice(0, 1000),
      items: order.items,
      totalQuantity: order.totalQuantity,
      totalAmount: order.totalAmount,
      status: updates.status,
      paymentStatus: updates.paymentStatus,
      paymentMethod: (updates.paymentMethod || order.paymentMethod || 'Transfer').slice(0, 50),
      financeRecorded,
      financeTxId,
      updatedAt: serverTimestamp(),
    });

    await recordAuditLog(
      'Update Status Pesanan',
      'Pesanan',
      `Pesanan ${order.orderNumber} diubah ke Status: ${updates.status}, Pembayaran: ${updates.paymentStatus}${
        financeRecorded && !order.financeRecorded ? ' (Tercatat ke Pemasukan Keuangan)' : ''
      }.`,
      actor
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `orders/${order.id}`);
  }
}

export async function deleteOrderById(
  order: Order,
  actor = 'Isatafa'
): Promise<void> {
  await ensureAdminSessionStateActive(actor);
  try {
    await deleteDoc(doc(db, 'orders', order.id));
    await recordAuditLog(
      'Hapus Pesanan',
      'Pesanan',
      `Menghapus pesanan ${order.orderNumber} (${order.customerName}).`,
      actor
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `orders/${order.id}`);
  }
}

/**
 * Customer CRUD (Admin)
 */
export async function saveCustomerRecord(
  customer: Omit<Customer, 'storeId' | 'adminScope' | 'createdAt' | 'updatedAt'>,
  isEdit: boolean,
  actor = 'Isatafa'
): Promise<void> {
  await ensureAdminSessionStateActive(actor);
  const id = sanitizeId(customer.id || `cust_${Date.now()}`, 'cust');
  const ref = doc(db, 'customers', id);
  const mutableFields = {
    name: customer.name.trim().slice(0, 150),
    phone: customer.phone.trim().slice(0, 40),
    address: (customer.address || '').trim().slice(0, 600),
    totalOrders: Math.max(0, Number(customer.totalOrders) || 0),
    totalSpent: Math.max(0, Number(customer.totalSpent) || 0),
    lastOrderDate: (customer.lastOrderDate || new Date().toISOString().slice(0, 10)).slice(0, 40),
    notes: (customer.notes || '').slice(0, 500),
    updatedAt: serverTimestamp(),
  };

  try {
    const snap = await getDoc(ref);
    if (snap.exists()) {
      await updateDoc(ref, mutableFields);
    } else {
      await setDoc(ref, {
        id,
        storeId: STORE_ID,
        adminScope: ADMIN_SCOPE,
        ...mutableFields,
        createdAt: serverTimestamp(),
      });
    }
    await recordAuditLog(
      isEdit ? 'Edit Pelanggan' : 'Tambah Pelanggan',
      'Pelanggan',
      `Data pelanggan "${mutableFields.name}" disimpan.`,
      actor
    );
  } catch (error) {
    handleFirestoreError(
      error,
      isEdit ? OperationType.UPDATE : OperationType.CREATE,
      `customers/${id}`
    );
  }
}

export async function deleteCustomerById(
  id: string,
  name: string,
  actor = 'Isatafa'
): Promise<void> {
  await ensureAdminSessionStateActive(actor);
  try {
    await deleteDoc(doc(db, 'customers', id));
    await recordAuditLog(
      'Hapus Pelanggan',
      'Pelanggan',
      `Menghapus pelanggan "${name}" (${id}).`,
      actor
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `customers/${id}`);
  }
}

/**
 * Finance Transaction CRUD (Pemasukan, Pengeluaran, Kas Masuk/Keluar, Koreksi)
 */
export async function saveFinanceTransaction(
  tx: Omit<
    FinanceTransaction,
    'storeId' | 'adminScope' | 'createdAt' | 'updatedAt'
  >,
  isEdit: boolean,
  correctionReason = '',
  actor = 'Isatafa'
): Promise<void> {
  await ensureAdminSessionStateActive(actor);
  const id = sanitizeId(tx.id || `tx_${Date.now()}`, 'tx');
  const ref = doc(db, 'finance_transactions', id);

  const history = [...(tx.correctionHistory || [])];
  if (isEdit) {
    const stamp = `${new Date().toISOString().slice(0, 16).replace('T', ' ')} oleh ${actor}: Nominal Rp ${tx.amount.toLocaleString('id-ID')}${
      correctionReason ? ` (${correctionReason})` : ''
    }`.slice(0, 300);
    history.unshift(stamp);
  }

  const validMethod: PaymentMethodType = [
    'Cash',
    'Transfer',
    'QRIS',
    'E-wallet',
    'Lainnya',
  ].includes(tx.paymentMethod)
    ? tx.paymentMethod
    : 'Cash';

  try {
    const snap = await getDoc(ref);
    if (snap.exists()) {
      await updateDoc(ref, {
        type: tx.type,
        dateIso: (tx.dateIso || new Date().toISOString().slice(0, 10)).slice(0, 40),
        sourceOrTarget: (tx.sourceOrTarget || '-').slice(0, 160),
        category: (tx.category || 'Lainnya').slice(0, 100),
        amount: Math.max(0, Number(tx.amount) || 0),
        paymentMethod: validMethod,
        description: (tx.description || '').slice(0, 1000),
        proofImageUrl: (tx.proofImageUrl || '').slice(0, 250000),
        updatedBy: (actor || 'Isatafa').slice(0, 100),
        correctionHistory: history.slice(0, 50),
        updatedAt: serverTimestamp(),
      });
    } else {
      const prefix =
        tx.type === 'income'
          ? 'INV'
          : tx.type === 'expense'
          ? 'EXP'
          : 'KAS';
      const txNumber =
        tx.transactionNumber ||
        `${prefix}-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`;

      await setDoc(ref, {
        id,
        storeId: STORE_ID,
        adminScope: ADMIN_SCOPE,
        transactionNumber: txNumber.slice(0, 60),
        type: tx.type,
        dateIso: (tx.dateIso || new Date().toISOString().slice(0, 10)).slice(0, 40),
        sourceOrTarget: (tx.sourceOrTarget || '-').slice(0, 160),
        category: (tx.category || 'Lainnya').slice(0, 100),
        amount: Math.max(0, Number(tx.amount) || 0),
        paymentMethod: validMethod,
        description: (tx.description || '').slice(0, 1000),
        proofImageUrl: (tx.proofImageUrl || '').slice(0, 250000),
        relatedOrderId: (tx.relatedOrderId || '').slice(0, 128),
        createdBy: (actor || 'Isatafa').slice(0, 100),
        updatedBy: (actor || 'Isatafa').slice(0, 100),
        correctionHistory: history.slice(0, 50),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    await recordAuditLog(
      isEdit ? 'Koreksi Transaksi Keuangan' : 'Catat Transaksi Keuangan',
      'Keuangan',
      `${tx.type.toUpperCase()} - ${tx.category}: Rp ${Number(tx.amount).toLocaleString('id-ID')} (${tx.sourceOrTarget})`,
      actor
    );
  } catch (error) {
    handleFirestoreError(
      error,
      isEdit ? OperationType.UPDATE : OperationType.CREATE,
      `finance_transactions/${id}`
    );
  }
}

export async function deleteFinanceTransactionById(
  tx: FinanceTransaction,
  actor = 'Isatafa'
): Promise<void> {
  await ensureAdminSessionStateActive(actor);
  try {
    await deleteDoc(doc(db, 'finance_transactions', tx.id));
    await recordAuditLog(
      'Hapus Transaksi Keuangan',
      'Keuangan',
      `Menghapus transaksi ${tx.transactionNumber} (${tx.category} - Rp ${tx.amount.toLocaleString('id-ID')}).`,
      actor
    );
  } catch (error) {
    handleFirestoreError(
      error,
      OperationType.DELETE,
      `finance_transactions/${tx.id}`
    );
  }
}

/**
 * Hutang & Piutang CRUD + Installment Payment Recording
 */
export async function saveDebtReceivable(
  record: Omit<
    DebtReceivable,
    'storeId' | 'adminScope' | 'createdAt' | 'updatedAt'
  >,
  isEdit: boolean,
  actor = 'Isatafa'
): Promise<void> {
  await ensureAdminSessionStateActive(actor);
  const id = sanitizeId(record.id || `dr_${Date.now()}`, 'dr');
  const ref = doc(db, 'debts_receivables', id);

  const totalAmount = Math.max(0, Number(record.totalAmount) || 0);
  const paidAmount = Math.min(
    totalAmount,
    Math.max(0, Number(record.paidAmount) || 0)
  );
  let computedStatus: DebtStatus = 'Belum Lunas';
  if (paidAmount >= totalAmount && totalAmount > 0) {
    computedStatus = 'Lunas';
  } else if (paidAmount > 0) {
    computedStatus = 'Sebagian';
  }

  try {
    const snap = await getDoc(ref);
    if (snap.exists()) {
      await updateDoc(ref, {
        recordType: record.recordType,
        partyName: record.partyName.trim().slice(0, 160),
        phone: (record.phone || '').trim().slice(0, 40),
        dateIso: (record.dateIso || new Date().toISOString().slice(0, 10)).slice(0, 40),
        dueDateIso: (record.dueDateIso || '').slice(0, 40),
        totalAmount,
        paidAmount,
        status: computedStatus,
        description: (record.description || '').slice(0, 1000),
        paymentHistory: (record.paymentHistory || []).slice(0, 50),
        updatedBy: (actor || 'Isatafa').slice(0, 100),
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(ref, {
        id,
        storeId: STORE_ID,
        adminScope: ADMIN_SCOPE,
        recordType: record.recordType,
        partyName: record.partyName.trim().slice(0, 160),
        phone: (record.phone || '').trim().slice(0, 40),
        dateIso: (record.dateIso || new Date().toISOString().slice(0, 10)).slice(0, 40),
        dueDateIso: (record.dueDateIso || '').slice(0, 40),
        totalAmount,
        paidAmount,
        status: computedStatus,
        description: (record.description || '').slice(0, 1000),
        paymentHistory: (record.paymentHistory || []).slice(0, 50),
        createdBy: (actor || 'Isatafa').slice(0, 100),
        updatedBy: (actor || 'Isatafa').slice(0, 100),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    await recordAuditLog(
      isEdit ? `Update ${record.recordType.toUpperCase()}` : `Tambah ${record.recordType.toUpperCase()}`,
      'Hutang & Piutang',
      `${record.recordType.toUpperCase()} ${record.partyName} sebesar Rp ${totalAmount.toLocaleString('id-ID')} (${computedStatus}).`,
      actor
    );
  } catch (error) {
    handleFirestoreError(
      error,
      isEdit ? OperationType.UPDATE : OperationType.CREATE,
      `debts_receivables/${id}`
    );
  }
}

export async function recordDebtInstallmentPayment(
  record: DebtReceivable,
  paymentAmount: number,
  paymentMethod: PaymentMethodType,
  note: string,
  syncToFinance: boolean,
  actor = 'Isatafa'
): Promise<void> {
  await ensureAdminSessionStateActive(actor);
  const cleanPay = Math.max(0, Number(paymentAmount) || 0);
  if (cleanPay <= 0) {
    throw new Error('Nominal pembayaran harus lebih dari 0.');
  }

  const newPaid = Math.min(record.totalAmount, (record.paidAmount || 0) + cleanPay);
  let newStatus: DebtStatus = 'Belum Lunas';
  if (newPaid >= record.totalAmount) {
    newStatus = 'Lunas';
  } else if (newPaid > 0) {
    newStatus = 'Sebagian';
  }

  const todayIso = new Date().toISOString().slice(0, 10);
  const paymentItem: DebtPaymentItem = {
    id: `pay_${Date.now()}`,
    dateIso: todayIso,
    amount: cleanPay,
    method: paymentMethod,
    note: (note || 'Pembayaran cicilan/pelunasan').slice(0, 200),
  };

  const updatedHistory = [paymentItem, ...(record.paymentHistory || [])].slice(0, 50);

  try {
    await updateDoc(doc(db, 'debts_receivables', record.id), {
      recordType: record.recordType,
      partyName: record.partyName,
      phone: record.phone,
      dateIso: record.dateIso,
      dueDateIso: record.dueDateIso,
      totalAmount: record.totalAmount,
      paidAmount: newPaid,
      status: newStatus,
      description: record.description,
      paymentHistory: updatedHistory,
      updatedBy: actor.slice(0, 100),
      updatedAt: serverTimestamp(),
    });

    if (syncToFinance) {
      await saveFinanceTransaction(
        {
          id: `tx_${record.recordType}_${Date.now()}`,
          transactionNumber: `${record.recordType === 'piutang' ? 'RCV' : 'DBT'}-${Date.now().toString().slice(-6)}`,
          type: record.recordType === 'piutang' ? 'income' : 'expense',
          dateIso: todayIso,
          sourceOrTarget: record.partyName,
          category:
            record.recordType === 'piutang'
              ? 'Pelunasan Piutang'
              : 'Pembayaran Hutang',
          amount: cleanPay,
          paymentMethod,
          description: `${
            record.recordType === 'piutang' ? 'Penerimaan piutang' : 'Pembayaran hutang'
          } - ${record.partyName} (${paymentItem.note})`,
          proofImageUrl: '',
          relatedOrderId: record.id,
          createdBy: actor,
          updatedBy: actor,
          correctionHistory: [],
        },
        false,
        '',
        actor
      );
    }

    await recordAuditLog(
      `Pembayaran ${record.recordType.toUpperCase()}`,
      'Hutang & Piutang',
      `Mencatat pembayaran ${record.recordType} "${record.partyName}" sebesar Rp ${cleanPay.toLocaleString('id-ID')} -> Status: ${newStatus}.`,
      actor
    );
  } catch (error) {
    handleFirestoreError(
      error,
      OperationType.UPDATE,
      `debts_receivables/${record.id}`
    );
  }
}

export async function deleteDebtReceivableById(
  record: DebtReceivable,
  actor = 'Isatafa'
): Promise<void> {
  await ensureAdminSessionStateActive(actor);
  try {
    await deleteDoc(doc(db, 'debts_receivables', record.id));
    await recordAuditLog(
      `Hapus ${record.recordType.toUpperCase()}`,
      'Hutang & Piutang',
      `Menghapus data ${record.recordType} "${record.partyName}".`,
      actor
    );
  } catch (error) {
    handleFirestoreError(
      error,
      OperationType.DELETE,
      `debts_receivables/${record.id}`
    );
  }
}

/**
 * Manual Refresh Helper for Error Recovery ("Coba Lagi")
 */
export async function manualVerifyFirestoreConnection(): Promise<boolean> {
  try {
    await ensureDatabaseInitialized();
    const q = query(
      collection(db, 'categories'),
      where('storeId', '==', STORE_ID)
    );
    await getDocs(q);
    return true;
  } catch {
    return false;
  }
}
