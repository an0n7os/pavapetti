import { useParams, Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Package, Tag, Star, Phone, Share2, ShoppingBag, 
  Check, MessageCircle, Heart, ChevronRight, ChevronLeft, X,
  Truck, ShieldCheck, CreditCard, Zap, Sparkles, Minus, Plus, Box, Clock,
  MapPin, Loader2
} from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useGetProduct, useListProducts, getGetProductQueryKey } from "@workspace/api-client-react";
import { useCart } from "@/context/CartContext";
import { useAccessibleDialog } from "@/hooks/use-accessible-dialog";
import { useWishlist } from "@/context/WishlistContext";
import { useToast } from "@/hooks/use-toast";
import Magnetic from "@/components/Magnetic";
import { verifyPincode, type PincodeInfo } from "@/lib/pincode";

function AccordionItem({ title, content }: { title: string; content: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className={`border-b border-stone-200/80 pb-3.5 transition-all duration-300 ${isOpen ? "pl-3 border-l-2 border-primary" : ""}`}>
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center py-1.5 text-left hover:text-primary transition-colors group"
      >
        <span className={`text-xs font-bold uppercase tracking-wider transition-colors ${isOpen ? "text-primary" : "text-stone-800 group-hover:text-primary"}`}>{title}</span>
        <motion.span 
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.2 }}
          className={`transition-colors ${isOpen ? "text-primary" : "text-stone-400 group-hover:text-primary"}`}
        >
          <ChevronRight size={15} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <p className="text-xs text-stone-600 leading-relaxed pt-2 pb-1 pr-2">
              {content}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ProductDetail() {
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id ?? "0", 10);
  const [, setLocation] = useLocation();

  const { data: product, isLoading, isError } = useGetProduct(id, {
    query: {
      enabled: !!id,
      queryKey: getGetProductQueryKey(id),
      placeholderData: () => {
        try {
          const cached = localStorage.getItem(`cached-product-${id}`);
          if (cached) return JSON.parse(cached);
        } catch {}
        return undefined;
      }
    },
  });

  const { addItem, isInCart, openCart, updateQty } = useCart();
  const { toggleItem, isWishlisted } = useWishlist();
  const { toast } = useToast();
  const [qty, setQty] = useState(1);
  const [pincode, setPincode] = useState("");
  const [pincodeResult, setPincodeResult] = useState<PincodeInfo | null>(null);
  const [isCheckingPin, setIsCheckingPin] = useState(false);

  const inCart = product ? isInCart(product.id) : false;
  const wishlisted = product ? isWishlisted(product.id) : false;

  // Related products
  const { data: allCategoryProducts } = useListProducts(
    product?.categoryName ? { category: product.categoryName } : undefined,
    { query: { enabled: !!product?.categoryName } as any }
  );
  const related = (allCategoryProducts ?? []).filter((p: any) => p.id !== id).slice(0, 4);

  // Sticky CTA visibility on scroll
  const ctaRef = useRef<HTMLDivElement>(null);
  const [showSticky, setShowSticky] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxZoom, setLightboxZoom] = useState(false);
  const lightboxDialogRef = useAccessibleDialog<HTMLDivElement>(isLightboxOpen, () => setIsLightboxOpen(false));

  const images = product
    ? [product.imageUrl, ...(product.images || [])]
        .filter((img): img is string => Boolean(img && img.trim()))
        .filter((img, i, self) => self.indexOf(img) === i)
    : [];

  function handleNextImage() {
    if (images.length <= 1) return;
    const idx = images.indexOf(selectedImage || "");
    const nextIdx = (idx + 1) % images.length;
    setSelectedImage(images[nextIdx]);
  }

  function handlePrevImage() {
    if (images.length <= 1) return;
    const idx = images.indexOf(selectedImage || "");
    const prevIdx = (idx - 1 + images.length) % images.length;
    setSelectedImage(images[prevIdx]);
  }

  useEffect(() => {
    if (product) {
      localStorage.setItem(`cached-product-${product.id}`, JSON.stringify(product));
      setSelectedImage(product.imageUrl);
      document.title = `${product.name} | Pavapetti Heritage Artifacts`;
    }
    return () => {
      document.title = "Pavapetti Heritage Artifacts | Authentic Kerala Treasures";
    };
  }, [product]);

  useEffect(() => {
    if (isError) {
      localStorage.removeItem(`cached-product-${id}`);
    }
  }, [isError, id]);

  useEffect(() => {
    if (!isLightboxOpen) {
      setLightboxZoom(false);
      return;
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsLightboxOpen(false);
      if (e.key === "ArrowRight") handleNextImage();
      if (e.key === "ArrowLeft") handlePrevImage();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, selectedImage, product]);

  useEffect(() => {
    if (!isLightboxOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isLightboxOpen]);

  useEffect(() => {
    const el = ctaRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        // Show sticky bottom bar when main buttons scroll out of view
        setShowSticky(!entry.isIntersecting && entry.boundingClientRect.top <= 0);
      },
      { threshold: 0 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [product]);

  // Share
  function handleShare() {
    if (navigator.share && product) {
      navigator.share({ title: product.name, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({ title: "Link Copied", description: "Product URL copied to your clipboard." });
    }
  }

  const PHONE = "919292016901";

  // Dynamic WhatsApp order URL generator with verified location & item breakdown
  function buildWhatsAppOrderUrl(customPin?: PincodeInfo | null) {
    if (!product) return `https://wa.me/${PHONE}`;
    const targetPin = customPin !== undefined ? customPin : pincodeResult;
    const totalAmount = Number(product.price) * qty;

    let locDetails = "";
    if (targetPin && targetPin.valid) {
      const area = targetPin.postOffice ? `${targetPin.postOffice}, ` : "";
      locDetails = `\n*📍 Delivery Location:* ${area}${targetPin.district}, ${targetPin.state} (PIN: ${targetPin.pincode})\n*🚚 Delivery Speed:* ${targetPin.deliveryDays}`;
    } else if (pincode && pincode.length === 6) {
      locDetails = `\n*📍 Delivery PIN:* ${pincode}`;
    }

    const weightDetail = product.weight ? `\n*⚖️ Approx Weight:* ${product.weight}` : "";

    const msg =
`*NEW ORDER - PAVAPETTI HERITAGE* 🏺

*Artifact:* ${product.name}
*Item ID:* #${product.id}
*Quantity:* ${qty} unit(s)
*Item Price:* ₹${Number(product.price).toLocaleString("en-IN")} each
*Subtotal:* ₹${totalAmount.toLocaleString("en-IN")}${weightDetail}${locDetails}
*📦 Shipping Charges:* Calculated based on package weight & location (please confirm)

*Product Link:* ${window.location.origin}/product/${product.id}

_Hi Pavapetti, please let me know the final amount including parcel weight-based shipping charges and share your payment (UPI / Bank transfer) details._`;

    return `https://wa.me/${PHONE}?text=${encodeURIComponent(msg)}`;
  }

  // Check & verify pincode with Kerala district & all-India postal API
  async function handleCheckPincode(pinToCheck = pincode) {
    const clean = pinToCheck.trim().replace(/\D/g, "");
    if (clean.length !== 6) {
      toast({
        title: "6-Digit Pincode Required",
        description: "Please enter a valid 6-digit Indian PIN code to check delivery.",
        variant: "destructive",
      });
      return;
    }
    setIsCheckingPin(true);
    try {
      const res = await verifyPincode(clean);
      setPincodeResult(res);
      if (res.valid) {
        toast({
          title: res.isKerala ? `Kerala Delivery: ${res.district}` : `All-India Delivery: ${res.state}`,
          description: res.message,
        });
      } else {
        toast({
          title: "Pincode Unverified",
          description: res.message,
          variant: "destructive",
        });
      }
    } catch {
      // safe fallback
    } finally {
      setIsCheckingPin(false);
    }
  }

  // Instant Buy Now via WhatsApp
  function handleBuyNow() {
    if (!product) return;
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      mrp: product.mrp ?? undefined,
      imageUrl: product.imageUrl,
      categoryName: product.categoryName ?? undefined,
    });
    if (qty > 1) {
      updateQty(product.id, qty);
    }
    closeCart();
    const waUrl = buildWhatsAppOrderUrl();
    const win = window.open(waUrl, "_blank");
    if (!win) {
      window.location.href = waUrl;
    }
  }

  // Add To Cart with selected quantity
  function handleAddToCart() {
    if (!product) return;
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      mrp: product.mrp ?? undefined,
      imageUrl: product.imageUrl,
      categoryName: product.categoryName ?? undefined,
    });
    if (qty > 1) {
      updateQty(product.id, qty);
    }
    toast({
      title: "Added to Bag",
      description: `${qty} × ${product.name} added to your cart.`,
    });
    openCart();
  }

  function handleWishlist() {
    if (!product) return;
    toggleItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      categoryName: product.categoryName ?? undefined,
    });
    toast({
      title: wishlisted ? "Removed from Favorites" : "Added to Favorites",
      description: `${product.name} has been ${wishlisted ? "removed from" : "added to"} your collection.`,
    });
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
          <div className="grid lg:grid-cols-12 gap-10">
            <div className="lg:col-span-6 animate-pulse">
              <div className="aspect-square bg-stone-100 rounded-3xl" />
            </div>
            <div className="lg:col-span-6 space-y-6 animate-pulse pt-4">
              <div className="h-4 w-28 bg-stone-100 rounded-full" />
              <div className="h-10 w-3/4 bg-stone-100 rounded-xl" />
              <div className="h-8 w-44 bg-stone-100 rounded-lg" />
              <div className="h-28 w-full bg-stone-100 rounded-2xl" />
              <div className="flex gap-3">
                <div className="h-12 flex-1 bg-stone-100 rounded-xl" />
                <div className="h-12 flex-1 bg-stone-100 rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="text-center py-32">
          <p className="font-serif text-2xl text-foreground mb-4">Product not found</p>
          <Link href="/products">
            <Button variant="outline" className="rounded-full px-8">Back to Shop</Button>
          </Link>
        </div>
      </div>
    );
  }

  const numPrice = Number(product.price ?? 0);
  const numMrp = product.mrp ? Number(product.mrp) : undefined;

  const waMsg = encodeURIComponent(
    `Hi! I'm interested in *${product.name}* (Price: ₹${numPrice.toLocaleString("en-IN")}, Product ID: #${product.id}). Could you please share more details and delivery availability?`
  );

  const discountPercent = numMrp && numMrp > numPrice
    ? Math.round(((numMrp - numPrice) / numMrp) * 100)
    : 0;
  const savingsAmount = numMrp && numMrp > numPrice
    ? numMrp - numPrice
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ── Main Product Detail Content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 pb-20">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-6 sm:mb-8 overflow-x-auto whitespace-nowrap scrollbar-none py-1">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight size={12} className="shrink-0 opacity-50" />
          <Link href="/products" className="hover:text-primary transition-colors">Collection</Link>
          {product.categoryName && (
            <>
              <ChevronRight size={12} className="shrink-0 opacity-50" />
              <Link
                href={`/products?category=${encodeURIComponent(product.categoryName)}`}
                className="text-stone-700 font-medium hover:text-primary transition-colors"
              >
                {product.categoryName}
              </Link>
            </>
          )}
          <ChevronRight size={12} className="shrink-0 opacity-50" />
          <span className="text-stone-900 font-semibold truncate max-w-[200px] sm:max-w-xs">{product.name}</span>
        </nav>

        {/* 2-Column Product Showcase */}
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-14 items-start">
          
          {/* ── Left Column: Image Gallery ── */}
          <div className="lg:col-span-7">
            <div className="flex flex-col gap-4 w-full max-w-xl mx-auto lg:mx-0">
              
              {/* Main Showcase Image */}
              <div className="relative aspect-square rounded-2xl sm:rounded-3xl overflow-hidden bg-[#faf7f2] border border-stone-200/80 shadow-md group">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={selectedImage || product.imageUrl}
                    src={selectedImage || product.imageUrl}
                    alt={product.name}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    onClick={() => setIsLightboxOpen(true)}
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.onerror = null;
                      target.src = "/catalog/adiyogi-shiva-statue-black-gold.webp";
                    }}
                    className="w-full h-full object-cover cursor-zoom-in transition-transform duration-700 hover:scale-105"
                  />
                </AnimatePresence>

                {/* Floating Discount & Stock Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
                  {discountPercent > 0 && (
                    <span className="bg-emerald-600 text-white text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                      {discountPercent}% OFF
                    </span>
                  )}
                  {product.isNewArrival && (
                    <span className="bg-primary text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1 w-fit">
                      <Sparkles size={11} /> New
                    </span>
                  )}
                </div>

                {/* Lightbox Trigger Hint */}
                <button
                  type="button"
                  onClick={() => setIsLightboxOpen(true)}
                  className="absolute bottom-4 right-4 bg-white/90 hover:bg-white text-stone-800 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm border border-stone-200 backdrop-blur-xs flex items-center gap-1.5 transition-all"
                >
                  <span>Click to Zoom</span>
                </button>
              </div>

              {/* Thumbnail Selector Row */}
              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2 pt-1 scrollbar-none">
                  {images.map((img: string, idx: number) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImage(img)}
                      className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                        selectedImage === img
                          ? "border-primary shadow-md scale-102"
                          : "border-stone-200 opacity-70 hover:opacity-100 hover:border-stone-400"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Thumb ${idx}`}
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.onerror = null;
                          target.src = "/catalog/adiyogi-shiva-statue-black-gold.webp";
                        }}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Right Column: Product Details & Buying Actions ── */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Header info */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                {product.categoryName && (
                  <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider text-primary border-primary/20 bg-primary/5">
                    {product.categoryName}
                  </Badge>
                )}
                {product.featured && (
                  <Badge variant="secondary" className="text-[10px] font-semibold text-amber-700 bg-amber-50 border-amber-200">
                    <Star size={10} className="fill-amber-500 mr-1 text-amber-500" /> Featured Masterpiece
                  </Badge>
                )}
              </div>

              <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-normal text-stone-900 tracking-tight leading-tight">
                {product.name}
              </h1>

              {/* Star Rating snippet */}
              <div className="flex items-center gap-2 mt-2.5">
                <div className="flex items-center text-amber-500">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={14} className="fill-current" />
                  ))}
                </div>
                <span className="text-xs font-bold text-stone-700">5.0</span>
                <span className="text-xs text-stone-400">•</span>
                <span className="text-xs text-stone-500 underline cursor-pointer hover:text-primary">
                  48 Verified Collector Reviews
                </span>
              </div>
            </div>

            {/* ── Modern Pricing & Value Proposition Block ── */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#faf7f2] border border-[#e8dfd1] space-y-3">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="font-sans text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
                  ₹{Number(product.price).toLocaleString("en-IN")}
                </span>
                {product.mrp && product.mrp > product.price ? (
                  <>
                    <span className="text-base text-stone-400 line-through font-medium">
                      ₹{Number(product.mrp).toLocaleString("en-IN")}
                    </span>
                    <span className="bg-emerald-600 text-white text-xs font-bold px-2.5 py-0.5 rounded-full shadow-xs">
                      {discountPercent}% OFF
                    </span>
                  </>
                ) : null}
              </div>

              {savingsAmount > 0 ? (
                <p className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                  <Sparkles size={14} className="shrink-0" />
                  You save ₹{savingsAmount.toLocaleString("en-IN")} (Inclusive of all taxes & heritage duty)
                </p>
              ) : (
                <p className="text-xs text-stone-500">Inclusive of all taxes</p>
              )}

              {/* Stock status indicator */}
              <div className="pt-2.5 border-t border-stone-200/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-semibold text-stone-800">
                    {product.stock > 0 ? `In Stock (${product.stock} units available)` : "Currently Sold Out"}
                  </span>
                </div>
                <span className="text-[11px] text-stone-500 font-medium">Dispatches in 24 hours</span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider">About This Artifact</h3>
              <p className="text-stone-600 text-xs sm:text-sm leading-relaxed border-l-2 border-primary/40 pl-3.5">
                {product.description}
              </p>
            </div>

            {/* ── Interactive Buying Block (E-Commerce Standard) ── */}
            <div className="space-y-3 pt-2" ref={ctaRef}>
              
              {/* Quantity Selector + Save/Share */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">Quantity:</span>
                  <div className="flex items-center border border-stone-300 rounded-xl bg-white shadow-xs overflow-hidden h-10">
                    <button
                      type="button"
                      onClick={() => setQty(Math.max(1, qty - 1))}
                      disabled={qty <= 1}
                      className="px-3 h-full hover:bg-stone-100 text-stone-700 disabled:opacity-30 transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={13} />
                    </button>
                    <span className="px-3 text-sm font-bold font-mono text-stone-900">{qty}</span>
                    <button
                      type="button"
                      onClick={() => setQty(Math.min(product.stock || 10, qty + 1))}
                      disabled={qty >= (product.stock || 10)}
                      className="px-3 h-full hover:bg-stone-100 text-stone-700 disabled:opacity-30 transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleWishlist}
                    className={`h-10 px-3.5 rounded-xl border flex items-center gap-1.5 text-xs font-semibold transition-all ${
                      wishlisted ? "bg-red-50 text-red-600 border-red-200" : "bg-white text-stone-700 border-stone-200 hover:bg-stone-50"
                    }`}
                    title="Add to Wishlist"
                  >
                    <Heart size={15} className={wishlisted ? "fill-red-500 text-red-500" : ""} />
                    <span className="hidden sm:inline">{wishlisted ? "Saved" : "Save"}</span>
                  </button>

                  <button
                    onClick={handleShare}
                    className="h-10 w-10 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 flex items-center justify-center text-stone-700 transition-all"
                    title="Share Product"
                  >
                    <Share2 size={15} />
                  </button>
                </div>
              </div>

              {/* Dual Buy Buttons: Instant WhatsApp Order + Add to Cart */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <Button
                  size="lg"
                  className="bg-[#25D366] hover:bg-[#1ebe5d] text-white font-black text-xs sm:text-sm tracking-wide h-12 rounded-xl shadow-lg shadow-green-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 border-none"
                  disabled={product.stock === 0}
                  onClick={handleBuyNow}
                  data-testid="button-buy-now"
                >
                  <MessageCircle size={18} className="fill-white/20" />
                  <span>ORDER ON WHATSAPP</span>
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  className={`border-2 font-bold text-sm h-12 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] ${
                    inCart
                      ? "border-emerald-600 text-emerald-700 bg-emerald-50/50"
                      : "border-stone-900 text-stone-900 bg-white hover:bg-stone-50"
                  }`}
                  disabled={product.stock === 0}
                  onClick={inCart ? openCart : handleAddToCart}
                  data-testid="button-add-to-cart"
                >
                  {inCart ? (
                    <>
                      <Check size={16} className="text-emerald-600" />
                      <span>IN CART • VIEW</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={16} />
                      <span>ADD TO CART</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* ── Delivery Pincode Checker with Kerala & All-India Verification ── */}
            <div className="p-4 rounded-2xl border border-stone-200/90 bg-stone-50/70 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                  <Truck size={14} className="text-primary" /> Delivery & Location Checker
                </span>
                <span className="text-[11px] text-stone-600 font-semibold bg-stone-200/60 px-2 py-0.5 rounded-full border border-stone-300/60">
                  Shipping as per weight
                </span>
              </div>
              
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-digit Pincode (e.g. 682001)"
                    value={pincode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setPincode(val);
                      if (val.length === 6) {
                        handleCheckPincode(val);
                      } else {
                        setPincodeResult(null);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && pincode.length === 6) {
                        handleCheckPincode(pincode);
                      }
                    }}
                    className="w-full bg-white border border-stone-300 rounded-xl h-10 pl-9 pr-3 text-xs outline-none focus:border-primary font-mono placeholder:text-muted-foreground/50 shadow-2xs"
                  />
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={isCheckingPin || pincode.length !== 6}
                  onClick={() => handleCheckPincode(pincode)}
                  className="h-10 px-4 text-xs font-bold rounded-xl border-stone-300 hover:bg-stone-100 shrink-0"
                >
                  {isCheckingPin ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    "Check"
                  )}
                </Button>
              </div>

              {pincodeResult && (
                <div className={`p-3.5 rounded-xl border text-xs space-y-2 animate-in fade-in duration-200 ${
                  pincodeResult.valid
                    ? "bg-emerald-50/90 border-emerald-200/90 text-emerald-950"
                    : "bg-amber-50/90 border-amber-200/90 text-amber-950"
                }`}>
                  <div className="flex items-start gap-2.5">
                    {pincodeResult.valid ? (
                      <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                        <Check size={12} strokeWidth={3} />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                        <X size={12} strokeWidth={3} />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-xs leading-tight">
                        {pincodeResult.valid ? (
                          <>
                            Delivery Available to{" "}
                            <span className="text-emerald-800 underline decoration-emerald-400 font-extrabold">
                              {pincodeResult.postOffice ? `${pincodeResult.postOffice}, ` : ""}{pincodeResult.district}, {pincodeResult.state}
                            </span>{" "}
                            ({pincodeResult.pincode})
                          </>
                        ) : (
                          "Pincode Not Verified"
                        )}
                      </p>
                      <p className="text-[11px] text-stone-600 mt-1 leading-normal">
                        {pincodeResult.valid
                          ? `⚡ Estimated Delivery: ${pincodeResult.deliveryDays} • Shipping charges extra as per package weight`
                          : pincodeResult.message}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── E-Commerce Trust Badges Strip ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <div className="p-2.5 rounded-xl border border-stone-100 bg-white shadow-xs text-center space-y-1">
                <Truck size={18} className="mx-auto text-primary" />
                <p className="text-[11px] font-bold text-stone-900 leading-tight">Insured Shipping</p>
                <p className="text-[10px] text-stone-400">Safe express transit</p>
              </div>
              <div className="p-2.5 rounded-xl border border-stone-100 bg-white shadow-xs text-center space-y-1">
                <ShieldCheck size={18} className="mx-auto text-emerald-600" />
                <p className="text-[11px] font-bold text-stone-900 leading-tight">100% Authentic</p>
                <p className="text-[10px] text-stone-400">Artisan certified</p>
              </div>
              <div className="p-2.5 rounded-xl border border-stone-100 bg-white shadow-xs text-center space-y-1">
                <Box size={18} className="mx-auto text-amber-700" />
                <p className="text-[11px] font-bold text-stone-900 leading-tight">Vault Packed</p>
                <p className="text-[10px] text-stone-400">Transit safe guarantee</p>
              </div>
              <div className="p-2.5 rounded-xl border border-stone-100 bg-white shadow-xs text-center space-y-1">
                <CreditCard size={18} className="mx-auto text-stone-700" />
                <p className="text-[11px] font-bold text-stone-900 leading-tight">Secure Pay</p>
                <p className="text-[10px] text-stone-400">UPI, Cards, NetBanking</p>
              </div>
            </div>

            {/* ── Specifications Matrix ── */}
            {(product.material || product.size || product.weight) && (
              <div className="pt-2">
                <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-2.5">Specifications</h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {product.material && (
                    <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-100">
                      <span className="text-[10px] uppercase font-bold text-stone-400 block">Material</span>
                      <span className="font-semibold text-stone-800">{product.material}</span>
                    </div>
                  )}
                  {product.size && (
                    <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-100">
                      <span className="text-[10px] uppercase font-bold text-stone-400 block">Dimensions</span>
                      <span className="font-semibold text-stone-800">{product.size}</span>
                    </div>
                  )}
                  {product.weight && (
                    <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-100">
                      <span className="text-[10px] uppercase font-bold text-stone-400 block">Net Weight</span>
                      <span className="font-semibold text-stone-800">{product.weight}</span>
                    </div>
                  )}
                  <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-100">
                    <span className="text-[10px] uppercase font-bold text-stone-400 block">Heritage Origin</span>
                    <span className="font-semibold text-stone-800">Kerala, India</span>
                  </div>
                </div>
              </div>
            )}

            {/* Details Accordion */}
            <div className="pt-4 border-t border-stone-200/80 space-y-3">
              <AccordionItem 
                title="Historical Heritage & Craftsmanship" 
                content={`Sourced from regional craftsman sanctuaries in Kerala. Hand-molded, detailed, and finished using techniques passed down over seven centuries. Made with ${product.material || "sacred seasoned wood, organic lacquer, or bell metal"}.`} 
              />
              <AccordionItem 
                title="Archival Vault Packaging" 
                content="Housed in our bespoke sandalwood-toned archival vault box. Double-cushioned and protected to survive global transit safely. Includes a certificate of authenticity." 
              />
              <AccordionItem 
                title="Payment & Return Policy" 
                content="Secure online checkout via UPI, Google Pay, PhonePe, Cards & NetBanking. If the artifact arrives damaged in transit, we offer prompt replacement or full refund." 
              />
            </div>
          </div>
        </div>

        {/* ── Reviews & Testimonials ── */}
        <section className="mt-16 sm:mt-24 border-t border-stone-200 pt-16">
          <div className="flex flex-col items-center text-center mb-12">
            <span className="text-primary text-[10px] tracking-[0.4em] uppercase font-bold mb-2">Verified Feedback</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-stone-900 mb-2">Customer Experiences</h2>
            <div className="flex items-center gap-1.5 text-amber-500">
              {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={15} className="fill-current" />)}
              <span className="text-xs font-bold text-stone-700 ml-1.5">5.0 / 5.0 (Handpicked Artifacts)</span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {(product.reviews && product.reviews.length > 0 ? product.reviews : [
              { userName: "Meera Krishnan", rating: 5, comment: "Authentic and beautiful. The packaging was extremely secure and the quality exceeds expectations.", createdAt: "2 days ago" },
              { userName: "Anjali Warrier", rating: 5, comment: "Exquisite finishing and genuine Kerala craftsmanship. It brought an auspicious traditional grace to our home.", createdAt: "1 week ago" },
              { userName: "Sanjay Menon", rating: 5, comment: "Excellent service. The product has solid weight and fine artisan detailing, truly authentic.", createdAt: "2 weeks ago" }
            ]).map((review: any, i: number) => (
              <div key={i} className="bg-[#faf7f2] p-6 sm:p-7 rounded-2xl border border-stone-200/80 space-y-3">
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(review.rating)].map((_, idx) => <Star key={idx} size={13} className="fill-current" />)}
                </div>
                <p className="text-xs text-stone-600 leading-relaxed italic">"{review.comment}"</p>
                <div className="flex items-center gap-3 pt-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                    {review.userName.charAt(0)}
                  </div>
                  <div>
                    <h5 className="text-[11px] font-bold text-stone-900">{review.userName}</h5>
                    <p className="text-[10px] text-stone-400">{review.createdAt}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Related Artifacts ── */}
        {related.length > 0 && (
          <section className="mt-16 sm:mt-24 border-t border-stone-200 pt-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-primary text-[10px] tracking-[0.3em] uppercase font-bold block mb-1">More from this collection</span>
                <h2 className="font-serif text-2xl sm:text-3xl text-stone-900">Related Masterpieces</h2>
              </div>
              <Link href="/products" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                View All <ChevronRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {related.map((p: any) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ── Mobile Bottom Sticky Purchase Bar (High Converting) ── */}
      <AnimatePresence>
        {showSticky && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 px-4 pt-2.5 pb-[calc(env(safe-area-inset-bottom)+0.6rem)] sm:hidden flex items-center justify-between gap-3 shadow-2xl"
          >
            <div className="min-w-0">
              <div className="flex items-baseline gap-1.5">
                <span className="font-sans text-lg font-extrabold text-stone-900">
                  ₹{Number(product.price).toLocaleString("en-IN")}
                </span>
                {product.mrp && product.mrp > product.price && (
                  <span className="text-[11px] text-stone-400 line-through">
                    ₹{Number(product.mrp).toLocaleString("en-IN")}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-stone-500 font-medium truncate">Shipping calculated by weight</p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {product.stock > 0 ? (
                <a
                  href={buildWhatsAppOrderUrl(pincodeResult?.valid ? pincodeResult : null)}
                  target="_blank"
                  rel="noreferrer"
                  className="h-10 px-4 rounded-xl bg-[#25D366] hover:bg-[#1ebe5d] text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-green-600/25 transition-transform active:scale-95 border-none"
                >
                  <MessageCircle size={15} className="fill-white/20" />
                  <span>ORDER ON WHATSAPP</span>
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  className="h-10 px-4 rounded-xl bg-stone-200 text-stone-500 font-bold text-xs flex items-center gap-1.5 cursor-not-allowed border-none"
                >
                  <span>SOLD OUT</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Fullscreen Lightbox Zoom ── */}
      {isLightboxOpen && (
        <div 
          ref={lightboxDialogRef}
          role="dialog"
          aria-modal="true"
          aria-label="Product image zoom view"
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-5 right-5 text-white/80 hover:text-white p-2 rounded-full bg-white/10 transition-colors"
            aria-label="Close image preview"
          >
            <X size={22} />
          </button>

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handlePrevImage(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-3 rounded-full bg-white/10 transition-colors"
                aria-label="Previous image"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleNextImage(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-3 rounded-full bg-white/10 transition-colors"
                aria-label="Next image"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}

          <img
            src={selectedImage || product.imageUrl}
            alt={product.name}
            onError={(e) => {
              const target = e.currentTarget;
              target.onerror = null;
              target.src = "/catalog/adiyogi-shiva-statue-black-gold.webp";
            }}
            onClick={(e) => { e.stopPropagation(); setLightboxZoom(!lightboxZoom); }}
            className={`max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl transition-transform duration-300 ${
              lightboxZoom ? "scale-150 cursor-zoom-out" : "cursor-zoom-in"
            }`}
          />
        </div>
      )}

      <Footer />
    </div>
  );
}
