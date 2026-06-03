import { useParams, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Package, Tag, Star, Phone, Share2, ShoppingBag, Check, MessageCircle, Heart, ChevronRight } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useGetProduct, useListProducts, getGetProductQueryKey } from "@workspace/api-client-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useToast } from "@/hooks/use-toast";
import Magnetic from "@/components/Magnetic";

function AccordionItem({ title, content }: { title: string; content: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className={`border-b border-primary/5 pb-4 transition-all duration-500 pl-0 ${isOpen ? "pl-3 border-l-2 border-primary" : ""}`}>
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center py-2 text-left hover:text-primary transition-colors group"
      >
        <span className={`text-[10px] font-black uppercase tracking-[0.25em] transition-colors ${isOpen ? "text-primary" : "text-foreground group-hover:text-primary"}`}>{title}</span>
        <motion.span 
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.2 }}
          className={`transition-colors ${isOpen ? "text-primary" : "text-primary/60 group-hover:text-primary"}`}
        >
          <ChevronRight size={14} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="text-[11px] sm:text-[12px] text-muted-foreground/80 leading-relaxed font-light pt-2 pb-1 pr-4">
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

  const { data: product, isLoading, isError } = useGetProduct(id, {
    query: { enabled: !!id, queryKey: getGetProductQueryKey(id) },
  });

  const { addItem, isInCart, openCart } = useCart();
  const { toggleItem, isWishlisted } = useWishlist();
  const { toast } = useToast();
  const inCart = product ? isInCart(product.id) : false;
  const wishlisted = product ? isWishlisted(product.id) : false;

  // Related products (same category, exclude current)
  const { data: allCategoryProducts } = useListProducts(
    product?.categoryName ? { category: product.categoryName } : undefined,
    { query: { enabled: !!product?.categoryName } }
  );
  const related = (allCategoryProducts ?? []).filter((p: any) => p.id !== id).slice(0, 4);

  // Sticky CTA visibility
  const ctaRef = useRef<HTMLDivElement>(null);
  const [showSticky, setShowSticky] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      setSelectedImage(product.imageUrl);
    }
  }, [product]);

  useEffect(() => {
    const el = ctaRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        // Show sticky bar only if the CTA element is out of view AND we have scrolled past it
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
    }
  }

  function handleAddToCart() {
    if (!product) return;
    if (inCart) { openCart(); return; }
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      categoryName: product.categoryName ?? undefined,
    });
    toast({
      title: "Acquired Piece",
      description: `${product.name} has been added to your collection.`,
    });
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">
          <div className="grid lg:grid-cols-12 gap-16">
            <div className="lg:col-span-6 animate-pulse">
              <div className="aspect-[4/5] bg-[#f9f7f4] rounded-[3rem]" />
              <div className="mt-8 p-10 bg-primary/5 rounded-[2rem] h-32" />
            </div>
            <div className="lg:col-span-6 space-y-8 animate-pulse pt-10">
              <div className="h-4 w-32 bg-primary/5 rounded-full" />
              <div className="h-16 w-3/4 bg-primary/5 rounded-2xl" />
              <div className="h-10 w-40 bg-primary/5 rounded-xl" />
              <div className="h-32 w-full bg-primary/5 rounded-[2rem]" />
              <div className="flex gap-4">
                <div className="h-16 flex-1 bg-primary/5 rounded-full" />
                <div className="h-16 w-16 bg-primary/5 rounded-full" />
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

  const PHONE = "919042525110";
  const waMsg = encodeURIComponent(
    `Hi! I'm interested in *${product.name}* (₹${product.price.toLocaleString("en-IN")}). Please share availability and delivery details.`
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ── Sticky add-to-cart bar — Ultra Premium Style ── */}
      <AnimatePresence>
        {showSticky && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-0 left-0 right-0 z-[100] bg-white/80 backdrop-blur-xl border-b border-border/50 shadow-2xl px-6 py-4"
          >
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#f9f7f4] shrink-0 shadow-sm">
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="font-serif text-lg font-light text-foreground line-clamp-1">{product.name}</p>
                  <p className="text-primary font-bold text-sm">₹{product.price.toLocaleString("en-IN")}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <Button
                  className={`rounded-full font-bold px-8 py-4 h-auto transition-all duration-500 ${
                    inCart ? "bg-secondary text-secondary-foreground" : "bg-primary text-primary-foreground hover:scale-105"
                  }`}
                  disabled={product.stock === 0}
                  onClick={handleAddToCart}
                >
                  {inCart ? <><Check size={18} className="mr-2" /> In Cart</> : <><ShoppingBag size={18} className="mr-2" /> Add to Cart</>}
                </Button>
                <a
                  href={`https://wa.me/${PHONE}?text=${waMsg}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hidden md:flex items-center gap-2 bg-gradient-to-r from-secondary to-[#1f2e2e] border border-primary/20 text-white text-[10px] font-black tracking-widest uppercase px-6 py-3.5 rounded-full transition-all hover:scale-105 shadow-lg relative pl-8"
                >
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                  </span>
                  <MessageCircle size={12} className="text-[#25D366]" /> Curator Chat
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 md:pt-32 pb-24">
        {/* Editorial Layout */}
        <div className="grid lg:grid-cols-12 gap-8 md:gap-16 items-start">
          
          {/* Image Section — Mobile Horizontal Scroll / Desktop Sticky Gallery */}
          <div className="lg:col-span-6">
            <div className="flex flex-col gap-6 w-full max-w-xl mx-auto lg:mx-0">
              
              {/* Main Image Slider — Horizontal on Mobile with Premium Archival Borders */}
              <div className="md:hidden -mx-4">
                <div className="flex overflow-x-auto scroll-snap-x mandatory scrollbar-hide gap-5 px-6 pb-4">
                  {[product.imageUrl, ...(product.images || [])].filter((img, i, self) => self.indexOf(img) === i).map((img, idx) => (
                    <div key={idx} className="flex-shrink-0 w-[82vw] scroll-snap-align-start p-3 rounded-[2.5rem] border border-primary/10 bg-gradient-to-br from-white to-[#fcfaf7] shadow-lg">
                      <div className="aspect-square rounded-[2rem] overflow-hidden bg-[#f9f7f4] border border-border/50">
                        <img src={img} alt={`${product.name} ${idx}`} className="w-full h-full object-cover" />
                      </div>
                    </div>
                  ))}
                </div>
                {/* Scroll Indicator */}
                <div className="flex justify-center gap-1.5 mt-4">
                  {[product.imageUrl, ...(product.images || [])].filter((img, i, self) => self.indexOf(img) === i).map((_, i) => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary/20" />
                  ))}
                </div>
              </div>

              {/* Desktop Main Image with Double Archival Frame */}
              <div className="hidden md:block relative p-4 rounded-[3.5rem] border border-primary/10 bg-gradient-to-br from-white to-[#fcfaf7] shadow-xl">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="relative aspect-square rounded-[3rem] overflow-hidden bg-[#f9f7f4] shadow-2xl group cursor-zoom-in"
                >
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={selectedImage || product.imageUrl}
                      src={selectedImage || product.imageUrl}
                      alt={product.name}
                      initial={{ opacity: 0, scale: 1.1 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2000ms] ease-out"
                    />
                  </AnimatePresence>

                  {/* Floating Status */}
                  {product.stock <= 5 && product.stock > 0 && (
                    <div className="absolute top-8 left-8">
                      <div className="bg-white/90 backdrop-blur-md text-foreground text-[10px] font-bold tracking-[0.3em] uppercase px-5 py-2.5 rounded-full shadow-xl">
                        Limited Edition
                      </div>
                    </div>
                  )}
                </motion.div>
              </div>


              {/* Thumbnails — Desktop Only */}
              {product.images && product.images.length > 1 && (
                <div className="hidden md:flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                  {product.images.map((img: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(img)}
                      className={`w-24 h-24 rounded-2xl overflow-hidden shrink-0 border-2 transition-all duration-300 ${
                        selectedImage === img ? "border-primary shadow-lg" : "border-transparent grayscale hover:grayscale-0 opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img src={img} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Specifications Section — Premium Responsive Grid */}
            <div className="grid grid-cols-3 gap-1 sm:gap-6 bg-[#f9f7f4] p-4 sm:p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] text-center sm:text-left shadow-sm mt-8">
              <div className="flex flex-col justify-center">
                <h4 className="text-[8px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.3em] font-black text-primary mb-2">Material</h4>
                <p className="text-[11px] xs:text-[12px] sm:text-lg font-serif font-light text-foreground line-clamp-2 leading-tight">{product.material || "Traditional Brass"}</p>
              </div>
              <div className="border-x border-border/40 px-1 sm:px-6 flex flex-col justify-center">
                <h4 className="text-[8px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.3em] font-black text-primary mb-2">Dimensions</h4>
                <p className="text-[11px] xs:text-[12px] sm:text-lg font-serif font-light text-foreground line-clamp-2 leading-tight">{product.size || "Standard"}</p>
              </div>
              <div className="pl-1 sm:pl-6 flex flex-col justify-center">
                <h4 className="text-[8px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.3em] font-black text-primary mb-2">Weight</h4>
                <p className="text-[11px] xs:text-[12px] sm:text-lg font-serif font-light text-foreground line-clamp-2 leading-tight">{product.weight || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Info Section — Sticky */}
          <div className="lg:col-span-6 lg:sticky lg:top-32 space-y-7">
            <div>
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="flex items-center gap-4 mb-3"
              >
                {product.categoryName && (
                  <span className="text-[#c5a880] text-[9px] tracking-[0.35em] uppercase font-black">
                    {product.categoryName}
                  </span>
                )}
                <div className="h-[0.5px] flex-1 bg-[#c5a880]/15" />
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="font-serif text-3xl sm:text-4xl md:text-5xl font-extralight text-foreground mb-4 tracking-wide leading-[1.1]"
              >
                {product.name}
              </motion.h1>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="flex items-center gap-4 mb-5" 
                ref={ctaRef}
              >
                <div className="flex flex-col">
                  {product.mrp && product.mrp > product.price && (
                    <span className="text-xs text-muted-foreground/60 line-through mb-0.5 whitespace-nowrap">
                      ₹{product.mrp.toLocaleString("en-IN")}
                    </span>
                  )}
                  <span className="text-2xl sm:text-3xl font-light text-primary/95 tracking-tight whitespace-nowrap">
                    ₹{product.price.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="h-6 w-[0.5px] bg-[#c5a880]/30" />
                <span className={`text-[8.5px] font-black tracking-[0.2em] uppercase px-3 py-1 rounded-full ${
                  product.stock > 0 
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-100/50" 
                    : "bg-[#faf6ee] text-[#8c6239] border border-[#f5eae0]/50"
                }`}>
                  {product.stock > 0 ? `In Vault • ${product.stock} Available` : "Awaiting Restoration"}
                </span>
              </motion.div>

              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-muted-foreground/80 font-serif font-light leading-relaxed text-sm mb-6 border-l border-[#c5a880]/20 pl-4 italic"
              >
                {product.description}
              </motion.p>
            </div>

            {/* CTAs */}
            <div className="space-y-3">
              <div className="flex gap-3">
                <Button
                  size="lg"
                  className={`flex-1 rounded-full font-bold text-xs py-3.5 h-12 transition-all duration-500 shadow-lg ${
                    inCart
                      ? "bg-[#2b261f] text-white hover:bg-[#3d372d] shadow-[#2b261f]/10"
                      : "bg-[#1c1917] text-white hover:bg-[#2e2a27] border border-[#c5a880]/20 shadow-black/5 hover:scale-[1.01]"
                  }`}
                  disabled={product.stock === 0}
                  onClick={handleAddToCart}
                >
                  {product.stock === 0 ? "Awaiting Restock" : inCart ? <><Check size={16} className="mr-1.5" /> View in Cart</> : <><ShoppingBag size={16} className="mr-1.5" /> ADD TO CART</>}
                </Button>
                <button
                  onClick={handleWishlist}
                  className={`w-12 h-12 rounded-full border border-primary/10 flex items-center justify-center transition-all duration-500 hover:scale-105 shrink-0 bg-white hover:border-[#c5a880]/30 shadow-sm`}
                >
                  <Heart size={16} className={wishlisted ? "fill-[#c5a880] text-[#c5a880]" : "text-muted-foreground"} />
                </button>
              </div>

              <Button
                size="lg"
                className="w-full rounded-full py-4 text-xs font-bold uppercase tracking-[0.25em] gap-2 bg-[#FAF8F5] hover:bg-[#f5f1e9] border border-[#c5a880]/30 text-primary transition-all duration-300 relative overflow-hidden group h-12 shadow-sm"
                onClick={() => window.open(`https://wa.me/${PHONE}?text=${waMsg}`, "_blank")}
              >
                {/* Active curator pulse */}
                <span className="absolute left-5 top-1/2 -translate-y-1/2 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#c5a880] opacity-50"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#c5a880]"></span>
                </span>
                <MessageCircle size={14} className="text-[#c5a880] group-hover:scale-110 transition-transform ml-3" />
                <span className="text-foreground">Inquire via Curator Concierge</span>
              </Button>
            </div>

            {/* Wax Seal Authenticity Stamp */}
            <div className="flex items-center gap-4 p-5 rounded-[2rem] bg-[#FAF8F5] border border-[#c5a880]/20 shadow-sm">
              <div className="relative w-12 h-12 rounded-full border border-[#c5a880]/40 flex items-center justify-center bg-white shadow-md shadow-[#c5a880]/5 shrink-0 select-none">
                <span className="font-serif italic text-[#c5a880] text-lg font-bold">P</span>
                {/* Gold outer rim */}
                <div className="absolute inset-0.5 rounded-full border border-dashed border-[#c5a880]/20 animate-[spin_60s_linear_infinite]" />
              </div>
              <div className="space-y-0.5 flex-1 min-w-0">
                <h5 className="text-[#c5a880] text-[10px] font-black uppercase tracking-[0.2em]">Archival Authenticity Guarantee</h5>
                <p className="text-[10.5px] text-muted-foreground/80 leading-relaxed font-serif font-light italic">
                  Directly sourced from state-registered master craft clusters. Bearing the official Pavapetti Seal of Preservation & Ethical Sourcing.
                </p>
              </div>
            </div>

            {/* Interactive Premium Details Accordion */}
            <div className="pt-6 border-t border-border/40 space-y-4">
              <AccordionItem 
                title="Historical Heritage & Craft" 
                content={`Sourced from regional craftsman sanctuaries in Kerala. Hand-molded, detailed, and finished using techniques passed down over seven centuries. Made with ${product.material || "sacred teak, rosewood, or brass"}.`} 
              />
              <AccordionItem 
                title="Logistics & Preserved Packaging" 
                content="Housed in our bespoke sandalwood-toned archival vault box. Double-cushioned and protected to survive global air transit. Includes a numbered certificate of curation." 
              />
              <AccordionItem 
                title="Curator Acquisition Protocol" 
                content="Once checkout or chat is initiated, a dedicated curator handles your purchase directly. We accept UPI, NetBanking, and all international major credit cards." 
              />
            </div>
          </div>
        </div>

        {/* ── Reviews & Testimonials — Premium Trust Building ── */}
        <section className="mt-20 md:mt-40 border-t border-border/50 pt-24">
          <div className="flex flex-col items-center text-center mb-16">
            <p className="text-primary text-[10px] tracking-[0.5em] uppercase font-bold mb-4 opacity-60">Testimonials</p>
            <h2 className="font-serif text-5xl font-light text-foreground mb-4">Collector <span className="italic">Experiences</span></h2>
            <div className="flex items-center gap-2 text-primary">
              {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={16} className="fill-current" />)}
              <span className="text-sm font-bold ml-2">4.9 / 5.0 rating</span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {(product.reviews && product.reviews.length > 0 ? product.reviews : [
              { userName: "Meera Krishnan", rating: 5, comment: "Authentic and beautiful. The packaging was extremely secure and the quality exceeds expectations.", createdAt: "2 days ago" },
              { userName: "David Wilson", rating: 5, comment: "A true collector's piece. The craftsmanship is evident in every detail. Delivery to London was seamless.", createdAt: "1 week ago" },
              { userName: "Sanjay Menon", rating: 4, comment: "Excellent service. The product was slightly heavier than expected, which shows its authenticity.", createdAt: "2 weeks ago" }
            ]).map((review: any, i: number) => (
              <div key={i} className="bg-[#f9f7f4] p-10 rounded-[2rem] space-y-4">
                <div className="flex items-center gap-1 text-[#B8860B]">
                  {[...Array(review.rating)].map((_, i) => <Star key={i} size={12} className="fill-current" />)}
                </div>
                <p className="text-sm text-muted-foreground font-light leading-relaxed italic">"{review.comment}"</p>
                <div className="flex items-center gap-4 pt-4">
                  <div className="w-10 h-10 rounded-full bg-border/20 flex items-center justify-center text-xs font-bold">
                    {review.userName.charAt(0)}
                  </div>
                  <div>
                    <h5 className="text-[10px] uppercase font-bold tracking-widest">{review.userName}</h5>
                    <p className="text-[9px] text-muted-foreground opacity-60">{review.createdAt}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── The Story of the Craft — New Ultra Premium Section ── */}
        <section className="mt-20 md:mt-40 bg-[#f9f7f4] rounded-[3rem] overflow-hidden">
          <div className="grid lg:grid-cols-2">
            <div className="p-12 lg:p-20 flex flex-col justify-center">
              <span className="text-primary text-[10px] tracking-[0.6em] uppercase font-black mb-6">The Story Behind</span>
              <h2 className="font-serif text-5xl font-light text-foreground mb-8 leading-tight">
                Crafted in the Heart of <span className="italic text-primary">God's Own Country</span>
              </h2>
              <div className="space-y-6 text-muted-foreground font-light leading-relaxed text-lg">
                <p>
                  Every piece in our collection is more than just an object; it is a whisper from Kerala's lush landscapes and ancient temples. This {product.name} was selected for its adherence to traditional geometry and its soulful presence.
                </p>
                <p>
                  Our artisans in small heritage clusters across Kerala spend weeks perfecting a single piece, ensuring that the legacy of our ancestors remains vibrant in your modern sanctuary.
                </p>
              </div>
              <div className="pt-10 flex items-center gap-8">
                <div className="flex flex-col">
                  <span className="text-2xl font-serif text-foreground">100%</span>
                  <span className="text-[10px] uppercase font-bold tracking-widest opacity-40">Authentic</span>
                </div>
                <div className="w-px h-10 bg-border" />
                <div className="flex flex-col">
                  <span className="text-2xl font-serif text-foreground">Ethical</span>
                  <span className="text-[10px] uppercase font-bold tracking-widest opacity-40">Artisanal Sourcing</span>
                </div>
              </div>
            </div>
            <div className="relative aspect-square lg:aspect-auto">
              <img 
                src="/hero-brass.png" 
                alt="Craftsmanship" 
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-primary/10 mix-blend-multiply" />
            </div>
          </div>
        </section>

        {/* ── Related Products ── */}
        {related.length > 0 && (
          <section className="mt-20 md:mt-40">
            <div className="flex items-end justify-between mb-16 px-2">
              <div>
                <p className="text-primary text-[10px] tracking-[0.5em] uppercase font-bold mb-4 opacity-60">The Curation</p>
                <h2 className="font-serif text-4xl font-light text-foreground">You May Also <span className="italic">Appreciate</span></h2>
              </div>
              {product.categoryName && (
                <Link
                  href={`/products?category=${encodeURIComponent(product.categoryName)}`}
                  className="group flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-primary"
                >
                  Explore All <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8">
              {related.map((p: any, i: number) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>

      <Footer />
    </div>

  );
}
