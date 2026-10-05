import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  MessageCircle,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  X,
} from 'lucide-react';
import { CartItem, Order, OrderItem } from '../types';
import {
  buildWhatsAppOrderUrl,
  formatRupiah,
  SmartImage,
} from '../utils/imageUtils';
import { submitCustomerCheckout } from '../services/dbService';

interface CartCheckoutDrawerProps {
  isOpen: boolean;
  initialMode?: 'cart' | 'checkout';
  cart: CartItem[];
  whatsappNumber: string;
  onClose: () => void;
  onUpdateQuantity: (cartItemId: string, newQuantity: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onClearCart: () => void;
  onShowToast: (message: string, type?: 'success' | 'error') => void;
}

export const CartCheckoutDrawer: React.FC<CartCheckoutDrawerProps> = ({
  isOpen,
  initialMode = 'cart',
  cart,
  whatsappNumber,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onShowToast,
}) => {
  const [step, setStep] = useState<'cart' | 'checkout' | 'success'>(
    initialMode === 'checkout' && cart.length > 0 ? 'checkout' : 'cart'
  );
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [shakeError, setShakeError] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [whatsappRedirectUrl, setWhatsappRedirectUrl] = useState('');

  React.useEffect(() => {
    if (isOpen) {
      if (confirmedOrder) {
        return;
      }
      setStep(initialMode === 'checkout' && cart.length > 0 ? 'checkout' : 'cart');
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const totalItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const grandTotal = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const triggerShake = (msg: string) => {
    setErrorMsg(msg);
    setShakeError(false);
    setTimeout(() => setShakeError(true), 10);
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      triggerShake('Keranjang pesanan masih kosong.');
      return;
    }
    if (!customerName.trim()) {
      triggerShake('Mohon isi Nama Lengkap Anda.');
      return;
    }
    if (!customerPhone.trim() || customerPhone.replace(/\D/g, '').length < 8) {
      triggerShake('Mohon isi Nomor WhatsApp aktif yang valid.');
      return;
    }
    if (!customerAddress.trim()) {
      triggerShake('Mohon isi Alamat pengiriman / pengambilan pesanan.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    const orderItems: OrderItem[] = cart.map((c) => ({
      productId: c.productId,
      name: c.name,
      variant: c.selectedVariant || 'Standar',
      quantity: c.quantity,
      price: c.price,
      subtotal: c.price * c.quantity,
      unit: c.unit || 'pcs',
      notes: c.itemNotes || '',
    }));

    try {
      const savedOrder = await submitCustomerCheckout({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerAddress: customerAddress.trim(),
        notes: orderNotes.trim(),
        items: orderItems,
      });

      const waUrl = buildWhatsAppOrderUrl({
        storeWhatsapp: whatsappNumber || '628212236933',
        orderNumber: savedOrder.orderNumber,
        customerName: savedOrder.customerName,
        customerPhone: savedOrder.customerPhone,
        customerAddress: savedOrder.customerAddress,
        items: savedOrder.items,
        totalAmount: savedOrder.totalAmount,
        notes: savedOrder.notes,
      });

      setConfirmedOrder(savedOrder);
      setWhatsappRedirectUrl(waUrl);
      onClearCart();
      setStep('success');
      onShowToast('Pesanan berhasil dibuat dan disimpan!', 'success');

      // Trigger WhatsApp link via anchor click for cross-browser compatibility
      const linkEl = document.createElement('a');
      linkEl.href = waUrl;
      linkEl.target = '_blank';
      linkEl.rel = 'noopener noreferrer';
      document.body.appendChild(linkEl);
      linkEl.click();
      document.body.removeChild(linkEl);
    } catch (err) {
      console.error('Checkout error:', err);
      triggerShake(
        'Gagal menyimpan pesanan. Periksa koneksi internet Anda dan silakan coba lagi.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="Keranjang dan Checkout"
    >
      <div className="bg-white w-full max-w-lg h-full flex flex-col justify-between shadow-2xl border-l border-slate-200 overflow-hidden">
        {/* Top Drawer Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            {step === 'checkout' && (
              <button
                type="button"
                onClick={() => setStep('cart')}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
                aria-label="Kembali ke keranjang"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="font-display font-bold text-base">
                {step === 'cart'
                  ? 'Keranjang Pesanan'
                  : step === 'checkout'
                  ? 'Checkout & Kirim WhatsApp'
                  : 'Pesanan Berhasil Dibuat'}
              </h2>
              <p className="text-xs text-slate-400 font-mono tabular-nums">
                {step === 'success'
                  ? confirmedOrder?.orderNumber
                  : `${cart.length} produk (${totalItemsCount} item)`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setConfirmedOrder(null);
              setStep('cart');
              onClose();
            }}
            className="p-2 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Tutup keranjang"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {step === 'cart' && (
            <>
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 mb-4">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <h3 className="font-display font-bold text-lg text-slate-900">
                    Keranjang Anda Masih Kosong
                  </h3>
                  <p className="text-sm text-slate-500 max-w-xs mt-1">
                    Pilih produk percetakan atau merchandise custom favorit Anda
                    dari katalog ISTAFA PRINTING.
                  </p>
                  <button
                    type="button"
                    onClick={onClose}
                    className="mt-5 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Lihat Katalog Produk
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => {
                    const itemSubtotal = item.price * item.quantity;
                    return (
                      <div
                        key={item.cartItemId}
                        className="p-3.5 rounded-xl border border-slate-200 bg-[#FAF8F5] flex gap-3.5 items-start"
                      >
                        <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-900 shrink-0 border border-slate-200">
                          <SmartImage
                            src={item.image}
                            alt={item.name}
                            fallbackTitle={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-semibold text-sm text-slate-900 leading-snug line-clamp-2">
                              {item.name}
                            </h4>
                            <button
                              type="button"
                              onClick={() => onRemoveItem(item.cartItemId)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                              aria-label={`Hapus ${item.name}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="text-xs text-slate-500 mt-0.5">
                            <span>Variasi: {item.selectedVariant}</span>
                            {item.itemNotes && (
                              <span className="block text-slate-600 italic mt-0.5">
                                Catatan: "{item.itemNotes}"
                              </span>
                            )}
                          </div>

                          <div className="mt-3 flex items-center justify-between gap-2">
                            <div className="inline-flex items-center border border-slate-300 rounded-lg bg-white">
                              <button
                                type="button"
                                onClick={() =>
                                  onUpdateQuantity(
                                    item.cartItemId,
                                    Math.max(1, item.quantity - 1)
                                  )
                                }
                                className="w-7 h-7 flex items-center justify-center text-slate-700 hover:bg-slate-100 cursor-pointer"
                                aria-label="Kurangi jumlah"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <input
                                type="number"
                                min={1}
                                value={item.quantity}
                                onChange={(e) => {
                                  const v = parseInt(e.target.value, 10);
                                  if (Number.isFinite(v) && v >= 1) {
                                    onUpdateQuantity(item.cartItemId, v);
                                  }
                                }}
                                className="w-11 text-center font-mono text-xs font-semibold text-slate-900 focus:outline-none tabular-nums"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  onUpdateQuantity(
                                    item.cartItemId,
                                    item.quantity + 1
                                  )
                                }
                                className="w-7 h-7 flex items-center justify-center text-slate-700 hover:bg-slate-100 cursor-pointer"
                                aria-label="Tambah jumlah"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="text-right">
                              <span className="block text-[11px] text-slate-400 font-mono tabular-nums">
                                {formatRupiah(item.price)} / {item.unit}
                              </span>
                              <span className="font-mono font-bold text-sm text-slate-900 tabular-nums">
                                {formatRupiah(itemSubtotal)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {step === 'checkout' && (
            <form
              id="checkout-form"
              onSubmit={handleCheckoutSubmit}
              className={`space-y-4 ${shakeError ? 'animate-shake' : ''}`}
            >
              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                  {errorMsg}
                </div>
              )}

              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80">
                <h3 className="text-xs font-bold text-slate-900 mb-2">
                  Ringkasan Pesanan ({cart.length} Produk)
                </h3>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div
                      key={item.cartItemId}
                      className="flex items-start justify-between text-xs gap-2 border-b border-amber-200/50 pb-1.5 last:border-none"
                    >
                      <div className="text-slate-700">
                        <span className="font-semibold text-slate-900">
                          {item.name}
                        </span>{' '}
                        ({item.selectedVariant}) × {item.quantity} {item.unit}
                      </div>
                      <span className="font-mono font-semibold text-slate-900 shrink-0 tabular-nums">
                        {formatRupiah(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-2 border-t border-amber-300 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    Total Pembayaran
                  </span>
                  <span className="font-mono font-bold text-base text-slate-900 tabular-nums">
                    {formatRupiah(grandTotal)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap Pelanggan / Instansi *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Contoh: Budi Santoso / PT Maju Jaya"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor WhatsApp Aktif *
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Contoh: 081234567890"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-slate-900 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Alamat Lengkap Pengiriman / Pengambilan *
                </label>
                <textarea
                  rows={3}
                  required
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="Tulis alamat lengkap beserta kecamatan, kota, dan kode pos..."
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan Pesanan / Instruksi File Desain
                </label>
                <textarea
                  rows={2}
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Contoh: File logo akan saya kirim via chat WhatsApp, deadline hari Jumat..."
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-slate-900 focus:outline-none"
                />
              </div>
            </form>
          )}

          {step === 'success' && confirmedOrder && (
            <div className="py-6 text-center space-y-5">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="text-xs font-mono font-semibold text-emerald-700">
                  PESANAN TERKONFIRMASI · {confirmedOrder.orderNumber}
                </span>
                <h3 className="font-display font-bold text-xl text-slate-900 mt-1">
                  Terima Kasih, {confirmedOrder.customerName}!
                </h3>
                <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto leading-relaxed">
                  Data pesanan Anda telah tersimpan di sistem ISTAFA PRINTING.
                  Silakan lanjutkan konfirmasi otomatis melalui WhatsApp di bawah
                  ini.
                </p>
              </div>

              <div className="text-left bg-[#FAF8F5] border border-slate-200 rounded-xl p-4 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">ID Pesanan:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {confirmedOrder.orderNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">WhatsApp:</span>
                  <span className="font-mono text-slate-800">
                    {confirmedOrder.customerPhone}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Item:</span>
                  <span className="font-mono text-slate-800">
                    {confirmedOrder.totalQuantity} item
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-bold">
                  <span className="text-slate-900">Total Pesanan:</span>
                  <span className="font-mono text-amber-700 tabular-nums">
                    {formatRupiah(confirmedOrder.totalAmount)}
                  </span>
                </div>
              </div>

              <a
                href={whatsappRedirectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-5 rounded-xl bg-[#141413] hover:bg-neutral-800 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-sm transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-[#C59B5F]" />
                <span>Lanjutkan Pesanan ke WhatsApp</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                type="button"
                onClick={() => {
                  setConfirmedOrder(null);
                  setStep('cart');
                  onClose();
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-medium transition-colors cursor-pointer"
              >
                Kembali ke Beranda
              </button>
            </div>
          )}
        </div>

        {/* Bottom Sticky Footer */}
        {step !== 'success' && cart.length > 0 && (
          <div className="p-4 bg-[#FAF9F6] border-t border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="block text-xs text-slate-500">
                  Total Pesanan ({totalItemsCount} item)
                </span>
                <span className="font-semibold text-xl text-[#141413] tabular-nums">
                  {formatRupiah(grandTotal)}
                </span>
              </div>

              {step === 'cart' && (
                <button
                  type="button"
                  onClick={onClearCart}
                  className="text-xs text-rose-600 hover:underline cursor-pointer"
                >
                  Kosongkan
                </button>
              )}
            </div>

            {step === 'cart' ? (
              <button
                type="button"
                onClick={() => setStep('checkout')}
                className="w-full py-3.5 px-5 rounded-xl bg-[#141413] hover:bg-neutral-800 text-white font-medium text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span>Lanjutkan Pemesanan</span>
              </button>
            ) : (
              <button
                type="submit"
                form="checkout-form"
                disabled={submitting}
                className="w-full py-3.5 px-5 rounded-xl bg-[#141413] hover:bg-neutral-800 text-white font-medium text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 text-[#C59B5F]" />
                <span>
                  {submitting
                    ? 'Memproses Pesanan...'
                    : 'Pesan Sekarang via WhatsApp'}
                </span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
