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
      ([entry]) => setShowSticky(!entry.isIntersecting),
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
                  className="hidden md:flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe5c] text-white text-sm font-bold px-6 py-3 rounded-full transition-all hover:scale-105 shadow-lg shadow-green-500/20"
                >
                  <MessageCircle size={16} /> Order on WhatsApp
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
              
              {/* Main Image Slider — Horizontal on Mobile */}
              <div className="md:hidden -mx-4">
                <div className="flex overflow-x-auto scroll-snap-x mandatory scrollbar-hide gap-4 px-4 pb-4">
                  {[product.imageUrl, ...(product.images || [])].filter((img, i, self) => self.indexOf(img) === i).map((img, idx) => (
                    <div key={idx} className="flex-shrink-0 w-full scroll-snap-align-start aspect-square rounded-[2rem] overflow-hidden bg-[#f9f7f4] shadow-lg border border-border/50">
                      <img src={img} alt={`${product.name} ${idx}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                {/* Scroll Indicator */}
                <div className="flex justify-center gap-1.5 mt-2">
                  {[product.imageUrl, ...(product.images || [])].filter((img, i, self) => self.indexOf(img) === i).map((_, i) => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary/20" />
                  ))}
                </div>
              </div>

              {/* Desktop Main Image */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="hidden md:block relative aspect-square rounded-[3rem] overflow-hidden bg-[#f9f7f4] shadow-2xl group cursor-zoom-in"
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

              {/* Heritage Note — New Editorial Component */}
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="p-10 border-l border-primary/20 bg-primary/5 rounded-r-[3rem]"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Star size={14} className="text-primary" />
                  <span className="text-[10px] font-black tracking-[0.3em] uppercase text-primary">Heritage Legacy</span>
                </div>
                <p className="font-serif text-lg italic text-foreground/80 leading-relaxed">
                  "This piece represents generations of Kerala's artisanal wisdom. Each curve and detail is a testament to the master craftsmen who have preserved these techniques for centuries."
                </p>
              </motion.div>

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

            {/* Specifications Section — Premium Grid */}
            <div className="grid grid-cols-3 gap-6 bg-[#f9f7f4] p-10 rounded-[3rem]">
              <div>
                <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary mb-3">Material</h4>
                <p className="text-lg font-serif font-light">{product.material || "Traditional Brass"}</p>
              </div>
              <div className="border-x border-border/40 px-6">
                <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary mb-3">Dimensions</h4>
                <p className="text-lg font-serif font-light">{product.size || "Standard Size"}</p>
              </div>
              <div className="pl-6">
                <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary mb-3">Weight</h4>
                <p className="text-lg font-serif font-light">{product.weight || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Info Section — Sticky */}
          <div className="lg:col-span-6 lg:sticky lg:top-32 space-y-10">
            <div>
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="flex items-center gap-4 mb-6"
              >
                {product.categoryName && (
                  <span className="text-primary text-[10px] tracking-[0.4em] uppercase font-bold opacity-60">
                    {product.categoryName}
                  </span>
                )}
                <div className="h-[1px] flex-1 bg-border/40" />
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="font-serif text-5xl md:text-6xl font-light text-foreground mb-6 leading-[1.1]"
              >
                {product.name}
              </motion.h1>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="flex items-center gap-6 mb-8" 
                ref={ctaRef}
              >
                <div className="flex flex-col">
                  {product.mrp && product.mrp > product.price && (
                    <span className="text-sm text-muted-foreground line-through mb-1">
                      ₹{product.mrp.toLocaleString("en-IN")}
                    </span>
                  )}
                  <span className="text-4xl md:text-5xl font-light text-primary tracking-tight">
                    ₹{product.price.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="h-10 w-[1px] bg-border/40" />
                <span className="text-xs uppercase tracking-[0.2em] font-bold text-muted-foreground">
                  {product.stock > 0 ? `${product.stock} In Collection` : "Awaiting Restoration"}
                </span>
              </motion.div>

              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-muted-foreground font-light leading-relaxed text-lg mb-10 border-l-2 border-primary/10 pl-6"
              >
                {product.description}
              </motion.p>
            </div>

            {/* CTAs */}
            <div className="space-y-4">
              <div className="flex gap-4">
                <Button
                  size="lg"
                  className={`flex-1 rounded-full font-bold text-sm py-5 transition-all duration-500 shadow-xl ${
                    inCart
                      ? "bg-secondary text-secondary-foreground shadow-secondary/20"
                      : "bg-primary text-primary-foreground shadow-primary/30 hover:scale-[1.02]"
                  }`}
                  disabled={product.stock === 0}
                  onClick={handleAddToCart}
                >
                  {product.stock === 0 ? "Awaiting Restock" : inCart ? <><Check size={20} className="mr-2" /> View in Cart</> : <><ShoppingBag size={20} className="mr-2" /> ADD TO CART</>}
                </Button>
                <button
                  onClick={handleWishlist}
                  className={`w-16 h-16 rounded-full border border-border flex items-center justify-center transition-all duration-500 hover:scale-105 ${
                    wishlisted ? "bg-primary/5 border-primary/20" : "bg-white hover:border-primary/40"
                  }`}
                >
                  <Heart size={20} className={wishlisted ? "fill-primary text-primary" : "text-muted-foreground"} />
                </button>
              </div>

              <Button
                size="lg"
                className="w-full rounded-full py-5 text-sm font-bold gap-3 bg-[#25D366] hover:bg-[#1ebe5c] text-white shadow-xl shadow-green-500/10 hover:scale-[1.02] transition-all"
                onClick={() => window.open(`https://wa.me/${PHONE}?text=${waMsg}`, "_blank")}
              >
                <MessageCircle size={20} /> Order via WhatsApp
              </Button>
            </div>

            {/* Premium Details Accordion style */}
            <div className="pt-10 border-t border-border/50 space-y-6">
              {[
                { icon: Package, title: "Authentic Packaging", desc: "Each piece comes in a premium gift box with an authenticity card." },
                { icon: Star, title: "Artisan Quality", desc: "Verified and certified for traditional craftsmanship excellence." },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#f9f7f4] flex items-center justify-center shrink-0">
                    <Icon size={16} className="text-primary" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-widest mb-1">{title}</h5>
                    <p className="text-xs text-muted-foreground font-light leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Reviews & Testimonials — Premium Trust Building ── */}
        <section className="mt-40 border-t border-border/50 pt-24">
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
        <section className="mt-40 bg-[#f9f7f4] rounded-[3rem] overflow-hidden">
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
          <section className="mt-40">
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
