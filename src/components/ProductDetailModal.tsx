import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Expand,
  MessageCircle,
  Minus,
  Plus,
  ShoppingBag,
  X,
} from 'lucide-react';
import { Product } from '../types';
import {
  buildWhatsAppDirectProductOrderUrl,
  formatRupiah,
  SmartImage,
} from '../utils/imageUtils';

interface ProductDetailModalProps {
  product: Product;
  allProducts?: Product[];
  whatsappNumber: string;
  onClose: () => void;
  onSelectProduct?: (product: Product) => void;
  onAddToCart: (params: {
    product: Product;
    quantity: number;
    selectedVariant: string;
    itemNotes: string;
    openCheckoutImmediately: boolean;
  }) => void;
  onOpenLightbox: (images: string[], startIndex: number, title: string) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  allProducts = [],
  whatsappNumber,
  onClose,
  onSelectProduct,
  onAddToCart,
  onOpenLightbox,
}) => {
  const images =
    product.images && product.images.length > 0 ? product.images : [''];
  const sizeOptions = product.sizeOptions || [];
  const materialOptions = product.materialOptions || [];
  const finishingOptions = product.finishingOptions || [];
  const hasStructuredSpecs =
    sizeOptions.length > 0 ||
    materialOptions.length > 0 ||
    finishingOptions.length > 0;

  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState(sizeOptions[0] || '');
  const [selectedMaterial, setSelectedMaterial] = useState(
    materialOptions[0] || ''
  );
  const [selectedFinishing, setSelectedFinishing] = useState(
    finishingOptions[0] || ''
  );
  const [selectedVariant, setSelectedVariant] = useState(
    product.variants && product.variants.length > 0
      ? product.variants[0]
      : 'Standar'
  );
  const [quantity, setQuantity] = useState(Math.max(1, product.minOrder || 1));
  const [itemNotes, setItemNotes] = useState('');
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const minOrder = Math.max(1, product.minOrder || 1);

  // Reset internal selections when switching to a related product
  useEffect(() => {
    setActivePhotoIndex(0);
    setSelectedSize((product.sizeOptions || [])[0] || '');
    setSelectedMaterial((product.materialOptions || [])[0] || '');
    setSelectedFinishing((product.finishingOptions || [])[0] || '');
    setSelectedVariant(
      product.variants && product.variants.length > 0
        ? product.variants[0]
        : 'Standar'
    );
    setQuantity(Math.max(1, product.minOrder || 1));
    setItemNotes('');
  }, [
    product.id,
    product.minOrder,
    product.variants,
    product.sizeOptions,
    product.materialOptions,
    product.finishingOptions,
  ]);

  // Keyboard Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const relatedProducts = useMemo(() => {
    const others = allProducts.filter(
      (p) => p.id !== product.id && p.available !== false && !p.hidden
    );
    const sameCategory = others.filter(
      (p) => p.categoryId === product.categoryId
    );
    const diffCategory = others.filter(
      (p) => p.categoryId !== product.categoryId
    );
    return [...sameCategory, ...diffCategory].slice(0, 3);
  }, [allProducts, product.id, product.categoryId]);

  const combinedSpecLabel = useMemo(() => {
    if (hasStructuredSpecs) {
      const parts: string[] = [];
      if (selectedSize) parts.push(`Ukuran: ${selectedSize}`);
      if (selectedMaterial) parts.push(`Bahan: ${selectedMaterial}`);
      if (selectedFinishing) parts.push(`Finishing: ${selectedFinishing}`);
      return parts.join(' | ') || 'Standar';
    }
    return selectedVariant || 'Standar';
  }, [
    hasStructuredSpecs,
    selectedSize,
    selectedMaterial,
    selectedFinishing,
    selectedVariant,
  ]);

  const handlePrevPhoto = () => {
    setActivePhotoIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextPhoto = () => {
    setActivePhotoIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(delta) > 40) {
      if (delta > 0) handlePrevPhoto();
      else handleNextPhoto();
    }
    setTouchStartX(null);
  };

  const subtotal = product.price * quantity;
  const directWhatsappOrderUrl = buildWhatsAppDirectProductOrderUrl({
    storeWhatsapp: whatsappNumber,
    productName: product.name,
    variant: combinedSpecLabel,
    selectedSize: hasStructuredSpecs ? selectedSize : undefined,
    selectedMaterial: hasStructuredSpecs ? selectedMaterial : undefined,
    selectedFinishing: hasStructuredSpecs ? selectedFinishing : undefined,
    quantity,
    unit: product.unit || 'pcs',
    price: product.price,
    priceLabel: product.priceLabel,
    notes: itemNotes,
  });

  return (
    <div
      className="fixed inset-0 z-50 bg-[#141413]/75 backdrop-blur-sm flex items-start sm:items-center justify-center p-0 sm:p-4 md:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label={`Detail Produk ${product.name}`}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#FAF9F6] sm:border border-neutral-200 sm:rounded-2xl max-w-5xl w-full min-h-screen sm:min-h-0 sm:max-h-[92vh] overflow-y-auto shadow-2xl relative animate-fade-up"
      >
        {/* Top Breadcrumb & Back Navigation Bar */}
        <div className="sticky top-0 z-20 bg-[#FAF9F6]/95 backdrop-blur-md border-b border-neutral-200/80 px-4 sm:px-7 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-neutral-500 min-w-0">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 font-medium text-[#141413] hover:text-[#9A7237] transition-colors cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Katalog</span>
            </button>
            <span aria-hidden="true" className="text-neutral-300">
              /
            </span>
            <span className="hidden sm:inline text-neutral-500 shrink-0">
              {product.categoryName}
            </span>
            <span
              aria-hidden="true"
              className="hidden sm:inline text-neutral-300"
            >
              /
            </span>
            <span className="truncate text-neutral-700 font-medium">
              {product.name}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white hover:bg-[#141413] text-neutral-700 hover:text-white border border-neutral-200 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            aria-label="Tutup halaman detail produk"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Main Product Section */}
        <div className="bg-white grid grid-cols-1 lg:grid-cols-12 border-b border-neutral-200/80">
          {/* Left Column: Large Main Photo & Multi-Photo Gallery */}
          <div className="lg:col-span-6 bg-[#F3F1EC] p-5 sm:p-7 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-neutral-200/80">
            <div>
              <div
                className="relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-[#181817] border border-neutral-200/80 group"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                <SmartImage
                  src={images[activePhotoIndex]}
                  alt={`${product.name} - Foto ${activePhotoIndex + 1}`}
                  fallbackTitle={product.name}
                  onClick={() =>
                    onOpenLightbox(images, activePhotoIndex, product.name)
                  }
                  className="w-full h-full object-cover cursor-zoom-in transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                />

                {/* Expand Lightbox Trigger */}
                <button
                  type="button"
                  onClick={() =>
                    onOpenLightbox(images, activePhotoIndex, product.name)
                  }
                  className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-[#141413]/85 hover:bg-[#141413] text-white text-xs font-medium flex items-center gap-1.5 backdrop-blur-sm transition-colors cursor-pointer"
                >
                  <Expand className="w-3.5 h-3.5" />
                  <span>
                    Perbesar ({activePhotoIndex + 1}/{images.length})
                  </span>
                </button>

                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={handlePrevPhoto}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/95 hover:bg-[#141413] text-neutral-900 hover:text-white flex items-center justify-center shadow-sm transition-colors cursor-pointer"
                      aria-label="Foto sebelumnya"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextPhoto}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/95 hover:bg-[#141413] text-neutral-900 hover:text-white flex items-center justify-center shadow-sm transition-colors cursor-pointer"
                      aria-label="Foto berikutnya"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>

              {/* Multi-Photo Thumbnail Strip (Foto Utama, Foto 2, Foto 3, Foto 4, Foto 5...) */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-neutral-500 mb-2.5">
                  <span>
                    Galeri Foto Produk ({images.length} Foto — Klik untuk ganti
                    tampilan)
                  </span>
                  <span>Foto #{activePhotoIndex + 1}</span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {images.map((imgUrl, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setActivePhotoIndex(index)}
                      className={`relative aspect-[4/3] rounded-lg overflow-hidden border transition-all cursor-pointer ${
                        index === activePhotoIndex
                          ? 'border-[#141413] ring-2 ring-[#141413]/15'
                          : 'border-neutral-200 opacity-65 hover:opacity-100'
                      }`}
                    >
                      <SmartImage
                        src={imgUrl}
                        alt={`${product.name} foto ${index + 1}`}
                        fallbackTitle={`${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-neutral-200/70 text-[11px] text-neutral-500 flex items-center justify-between">
              <span>Kategori: {product.categoryName}</span>
              {product.subcategory && (
                <span className="truncate max-w-[60%] text-right">
                  {product.subcategory}
                </span>
              )}
            </div>
          </div>

          {/* Right Column: Contiguous Purchase & Specification Module */}
          <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              {/* Clean Unboxed Metadata Row */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500 mb-2">
                <span className="font-medium text-[#9A7237]">
                  {product.categoryName}
                </span>
                {product.subcategory && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="text-neutral-600">
                      {product.subcategory}
                    </span>
                  </>
                )}
                <span aria-hidden="true">·</span>
                <span
                  className={`inline-flex items-center gap-1 font-medium ${
                    product.available ? 'text-emerald-700' : 'text-rose-600'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {product.available ? 'Tersedia' : 'Tidak Tersedia'}
                </span>
              </div>

              <h1 className="font-display font-semibold text-xl sm:text-2xl text-[#141413] leading-snug">
                {product.name}
              </h1>

              {/* Price Starting From Block */}
              <div className="mt-3 pb-4 border-b border-neutral-200/80">
                <span className="block text-[11px] text-neutral-500 mb-0.5">
                  {product.price > 0
                    ? product.priceLabel || 'Mulai dari'
                    : 'Informasi Harga'}
                </span>
                {product.price > 0 ? (
                  <div className="flex items-baseline gap-2.5">
                    <span className="font-semibold text-2xl text-[#141413] tabular-nums">
                      {formatRupiah(product.price)}
                    </span>
                    <span className="text-xs text-neutral-500">
                      / {product.unit} (Min. order {minOrder} {product.unit})
                    </span>
                    {product.originalPrice > product.price && (
                      <span className="text-sm text-neutral-400 line-through tabular-nums">
                        {formatRupiah(product.originalPrice)}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="font-semibold text-lg text-[#9A7237]">
                    {product.priceLabel || 'Hubungi kami untuk harga'}
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="mt-4 space-y-1.5">
                <h2 className="text-xs font-semibold text-neutral-800">
                  Deskripsi Produk
                </h2>
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>

              {/* Structured Printing Specifications: Ukuran, Bahan, Finishing */}
              {hasStructuredSpecs ? (
                <div className="mt-5 space-y-4">
                  {/* Pilihan Ukuran */}
                  {sizeOptions.length > 0 && (
                    <div>
                      <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                        Pilihan Ukuran
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {sizeOptions.map((sz) => (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => setSelectedSize(sz)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                              selectedSize === sz
                                ? 'bg-[#141413] text-white border-[#141413]'
                                : 'bg-[#FAF9F6] text-neutral-700 border-neutral-200 hover:border-neutral-400'
                            }`}
                          >
                            {sz}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pilihan Bahan */}
                  {materialOptions.length > 0 && (
                    <div>
                      <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                        Pilihan Bahan
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {materialOptions.map((mat) => (
                          <button
                            key={mat}
                            type="button"
                            onClick={() => setSelectedMaterial(mat)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                              selectedMaterial === mat
                                ? 'bg-[#141413] text-white border-[#141413]'
                                : 'bg-[#FAF9F6] text-neutral-700 border-neutral-200 hover:border-neutral-400'
                            }`}
                          >
                            {mat}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pilihan Finishing */}
                  {finishingOptions.length > 0 && (
                    <div>
                      <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                        Pilihan Finishing
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {finishingOptions.map((fin) => (
                          <button
                            key={fin}
                            type="button"
                            onClick={() => setSelectedFinishing(fin)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                              selectedFinishing === fin
                                ? 'bg-[#141413] text-white border-[#141413]'
                                : 'bg-[#FAF9F6] text-neutral-700 border-neutral-200 hover:border-neutral-400'
                            }`}
                          >
                            {fin}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                product.variants &&
                product.variants.length > 0 && (
                  <div className="mt-5">
                    <label className="block text-xs font-semibold text-neutral-800 mb-2">
                      Pilih Variasi / Spesifikasi
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {product.variants.map((variant) => (
                        <button
                          key={variant}
                          type="button"
                          onClick={() => setSelectedVariant(variant)}
                          className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                            selectedVariant === variant
                              ? 'bg-[#141413] text-white border-[#141413]'
                              : 'bg-[#FAF9F6] text-neutral-700 border-neutral-200 hover:border-neutral-400'
                          }`}
                        >
                          {variant}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              )}

              {/* Quantity & Subtotal */}
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div>
                  <label
                    htmlFor="detail-qty-input"
                    className="block text-xs font-semibold text-neutral-800 mb-1.5"
                  >
                    Jumlah ({product.unit})
                  </label>
                  <div className="inline-flex items-center border border-neutral-300 rounded-xl bg-[#FAF9F6] p-1">
                    <button
                      type="button"
                      onClick={() =>
                        setQuantity((q) => Math.max(minOrder, q - 1))
                      }
                      className="w-10 h-10 rounded-lg hover:bg-white text-neutral-700 flex items-center justify-center transition-colors cursor-pointer"
                      aria-label="Kurangi jumlah pesanan"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <input
                      id="detail-qty-input"
                      type="number"
                      min={minOrder}
                      value={quantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        setQuantity(
                          Number.isFinite(val) && val >= minOrder
                            ? val
                            : minOrder
                        );
                      }}
                      className="w-16 text-center font-semibold text-sm text-[#141413] bg-transparent focus:outline-none tabular-nums"
                    />
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => q + 1)}
                      className="w-10 h-10 rounded-lg hover:bg-white text-neutral-700 flex items-center justify-center transition-colors cursor-pointer"
                      aria-label="Tambah jumlah pesanan"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="bg-[#FAF9F6] border border-neutral-200/90 rounded-xl p-3.5">
                  <span className="block text-xs text-neutral-500">
                    Estimasi Total ({quantity} {product.unit})
                  </span>
                  <span className="font-semibold text-base sm:text-lg text-[#141413] tabular-nums">
                    {product.price > 0
                      ? formatRupiah(subtotal)
                      : 'Sesuai Spesifikasi'}
                  </span>
                </div>
              </div>

              {/* Order Notes */}
              <div className="mt-4">
                <label
                  htmlFor="detail-notes-input"
                  className="block text-xs font-semibold text-neutral-800 mb-1.5"
                >
                  Catatan Pesanan
                </label>
                <input
                  id="detail-notes-input"
                  type="text"
                  value={itemNotes}
                  onChange={(e) => setItemNotes(e.target.value)}
                  placeholder={
                    product.orderNotesHint ||
                    'Cantumkan detail ukuran, warna, jumlah, atau keterangan file desain...'
                  }
                  className="ds-input"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 pt-5 border-t border-neutral-200/80 space-y-2.5">
              {/* Primary Action: Direct to WhatsApp with Selected Product Info */}
              <a
                href={directWhatsappOrderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ds-btn-primary w-full py-3.5 text-sm"
              >
                <MessageCircle className="w-4 h-4 text-[#C59B5F]" />
                <span>Pesan Sekarang (Langsung ke WhatsApp)</span>
              </a>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  disabled={!product.available}
                  onClick={() =>
                    onAddToCart({
                      product,
                      quantity,
                      selectedVariant: combinedSpecLabel,
                      itemNotes,
                      openCheckoutImmediately: false,
                    })
                  }
                  className="ds-btn-secondary w-full text-xs disabled:opacity-40"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Tambah ke Keranjang</span>
                </button>

                <button
                  type="button"
                  disabled={!product.available}
                  onClick={() =>
                    onAddToCart({
                      product,
                      quantity,
                      selectedVariant: combinedSpecLabel,
                      itemNotes,
                      openCheckoutImmediately: true,
                    })
                  }
                  className="ds-btn-secondary w-full text-xs disabled:opacity-40"
                >
                  <span>Isi Form Pengiriman</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Section ("Produk Terkait") */}
        {relatedProducts.length > 0 && (
          <div className="p-6 sm:p-8 bg-[#FAF9F6]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display font-semibold text-base sm:text-lg text-[#141413]">
                  Produk Terkait Lainnya
                </h3>
                <p className="text-xs text-neutral-500">
                  Pilihan produk percetakan & custom lain yang mungkin Anda
                  butuhkan
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedProducts.map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => {
                    if (onSelectProduct) onSelectProduct(rel);
                  }}
                  className="ds-card ds-card-interactive p-3.5 flex sm:flex-col gap-3.5 cursor-pointer"
                >
                  <div className="w-24 sm:w-full aspect-[4/3] rounded-lg overflow-hidden bg-[#181817] shrink-0">
                    <SmartImage
                      src={rel.images?.[0]}
                      alt={rel.name}
                      fallbackTitle={rel.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <span className="text-[11px] font-medium text-[#9A7237] block">
                        {rel.categoryName}
                      </span>
                      <h4 className="font-display font-semibold text-sm text-[#141413] line-clamp-1 mt-0.5">
                        {rel.name}
                      </h4>
                    </div>
                    <div className="mt-2 flex items-baseline justify-between">
                      {rel.price > 0 ? (
                        <>
                          <span className="font-semibold text-sm text-[#141413] tabular-nums">
                            {formatRupiah(rel.price)}
                          </span>
                          <span className="text-[11px] text-neutral-500">
                            /{rel.unit}
                          </span>
                        </>
                      ) : (
                        <span className="font-medium text-xs text-[#9A7237]">
                          {rel.priceLabel || 'Hubungi kami untuk harga'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
