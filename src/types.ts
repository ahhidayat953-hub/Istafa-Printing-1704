export interface StoreSettings {
  storeId: 'istafa_printing';
  storeName: string;
  tagline: string;
  heroDescription: string;
  whatsappNumber: string;
  logoUrl: string;
  heroBannerUrl: string;
  address: string;
  operatingHours: string;
  email: string;
  instagramUrl: string;
  facebookUrl: string;
  tiktokUrl: string;
  aboutText: string;
  initialCashBalance: number;
  adminUsername: string;
  adminPasswordHash: string;
  updatedAt?: unknown;
  updatedBy: string;
}

export interface Category {
  id: string;
  storeId: 'istafa_printing';
  name: string;
  slug: string;
  icon: string;
  description: string;
  sortOrder: number;
  active: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface Product {
  id: string;
  storeId: 'istafa_printing';
  name: string;
  categoryId: string;
  categoryName: string;
  subcategory?: string;
  price: number;
  originalPrice: number;
  priceLabel?: string;
  description: string;
  shortDescription: string;
  images: string[];
  variants: string[];
  sizeOptions?: string[];
  materialOptions?: string[];
  finishingOptions?: string[];
  badge: string;
  available: boolean;
  featured: boolean;
  isNew?: boolean;
  hidden?: boolean;
  sortOrder?: number;
  minOrder: number;
  stock: number;
  unit: string;
  orderNotesHint: string;
  rating: number;
  soldCount: number;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface CartItem {
  cartItemId: string;
  productId: string;
  name: string;
  categoryName: string;
  price: number;
  image: string;
  quantity: number;
  minOrder: number;
  unit: string;
  selectedVariant: string;
  itemNotes: string;
}

export interface GalleryItem {
  id: string;
  storeId: 'istafa_printing';
  title: string;
  category: string;
  clientName: string;
  description: string;
  images: string[];
  featured: boolean;
  dateLabel: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface OrderItem {
  productId: string;
  name: string;
  variant: string;
  quantity: number;
  price: number;
  subtotal: number;
  unit: string;
  notes: string;
}

export type OrderStatus = 'Baru' | 'Diproses' | 'Selesai' | 'Dibatalkan';
export type PaymentStatus = 'Belum Bayar' | 'DP' | 'Lunas';

export interface Order {
  id: string;
  storeId: 'istafa_printing';
  adminScope: 'istafa_admin';
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  notes: string;
  items: OrderItem[];
  totalQuantity: number;
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  financeRecorded: boolean;
  financeTxId: string;
  dateIso: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface Customer {
  id: string;
  storeId: 'istafa_printing';
  adminScope: 'istafa_admin';
  name: string;
  phone: string;
  address: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  notes: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export type FinanceTxType = 'income' | 'expense' | 'cash_in' | 'cash_out' | 'correction';
export type PaymentMethodType = 'Cash' | 'Transfer' | 'QRIS' | 'E-wallet' | 'Lainnya';

export interface FinanceTransaction {
  id: string;
  storeId: 'istafa_printing';
  adminScope: 'istafa_admin';
  transactionNumber: string;
  type: FinanceTxType;
  dateIso: string;
  sourceOrTarget: string;
  category: string;
  amount: number;
  paymentMethod: PaymentMethodType;
  description: string;
  proofImageUrl: string;
  relatedOrderId: string;
  createdBy: string;
  updatedBy: string;
  correctionHistory: string[];
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface DebtPaymentItem {
  id: string;
  dateIso: string;
  amount: number;
  method: string;
  note: string;
}

export type DebtStatus = 'Belum Lunas' | 'Sebagian' | 'Lunas';

export interface DebtReceivable {
  id: string;
  storeId: 'istafa_printing';
  adminScope: 'istafa_admin';
  recordType: 'hutang' | 'piutang';
  partyName: string;
  phone: string;
  dateIso: string;
  dueDateIso: string;
  totalAmount: number;
  paidAmount: number;
  status: DebtStatus;
  description: string;
  paymentHistory: DebtPaymentItem[];
  createdBy: string;
  updatedBy: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface AuditLog {
  id: string;
  storeId: 'istafa_printing';
  adminScope: 'istafa_admin';
  action: string;
  module: string;
  details: string;
  actor: string;
  dateIso: string;
  createdAt?: unknown;
}

export type DateFilterPreset = 'today' | 'week' | 'month' | 'year' | 'all' | 'custom';
