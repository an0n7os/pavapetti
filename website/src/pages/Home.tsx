import React from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, Sparkles, Star, Quote, 
  ShieldCheck, Globe, Heart, MessageCircle,
  ChevronLeft, ChevronRight
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import StorySection from "@/components/StorySection";
import Magnetic from "@/components/Magnetic";
import { 
  useGetFeaturedProducts, useListCategories, useListProducts,
  getGetFeaturedProductsQueryKey, getListCategoriesQueryKey, getListProductsQueryKey
} from "@workspace/api-client-react";

const MARQUEE_ITEMS = [
  "Wall Decor",
  "Statues & Idols",
  "Hanging Decor",
  "Keychains",
  "Lamps & Pooja Decor",
  "Jewellery & Spiritual Accessories",
  "Shadow Puppetry Crafts",
  "Car Statues",
  "Money Boxes",
  "Key Holders",
  "Miniatures & Mini Chenda",
  "Magnets"
];

const HERO_SLIDES = [
  {
    src: "/hero-dance-v2.webp",
    label: "Kathakali Vesham",
    tag: "Traditional Performing Art",
    headline: ["Authentic", "Kathakali", "Handicrafts"],
    sub: "Handcrafted Kathakali wooden masks, murals, and vibrant stage collectibles created by master Kerala artisans.",
  },
  {
    src: "/art-forms/tholpavakoothu.png",
    label: "Tholpavakoothu",
    tag: "Ancient Shadow Puppetry",
    headline: ["Ancient", "Tholpavakoothu", "Puppets"],
    sub: "Sacred temple shadow puppets handcrafted from treated leather by master Kerala puppeteers.",
  },
  {
    src: "/hero-mural-v2.webp",
    label: "Kerala Mural Art",
    tag: "Traditional Wall Art",
    headline: ["Handmade", "Kerala Mural", "Paintings"],
    sub: "Handpainted traditional Kerala murals made with rich natural mineral colors for home and sacred spaces.",
  },
  {
    src: "/hero-brass-v2.webp",
    label: "Brass Lamps & Pooja Decor",
    tag: "Bell-Metal & Brassware",
    headline: ["Hand-Cast", "Nilavilakku &", "Pooja Decor"],
    sub: "Traditional bell-metal brass lamps, Nilavilakku, and sacred pooja essentials for daily rituals.",
  },
  {
    src: "/hero-image-1.jpg",
    label: "Heritage Figurines",
    tag: "Sacred Temple Crafts",
    headline: ["Divine", "Illuminated", "Heritage"],
    sub: "Exquisite traditional wooden figurines and icons, crafted to bring divine energy to your living space.",
  },
  {
    src: "/aranmula-mirror.webp",
    label: "Aranmula Kannadi",
    tag: "Sacred Metal Mirror",
    headline: ["Sacred", "Aranmula", "Kannadi"],
    sub: "GI-tagged front-surface metal alloy mirror handcrafted by traditional master artisans of Aranmula.",
  },
];

const CATEGORY_OVERRIDE: Record<string, string> = {
  "Pooja Category":            "/hero-brass.webp",
  "Chains and Bracelets":      "/karungali_mala.webp",
  "Elephant Heritage":         "/elephant_head.webp",
  "Heritage Textiles":         "/hero-textile.webp",
  "Miniatures & Mini Chenda":  "/hero-dance.webp",
  "Fragrances & Organic Soap": "/kalabham_perfume.webp",
};

const TESTIMONIALS = [
  { name: "Priya Nair", place: "Kochi, Kerala", text: "Beautiful brass lamps! The quality is exactly like what you get from Kerala artisans. Very happy with the purchase.", stars: 5 },
  { name: "Arjun Menon", place: "Bangalore", text: "Ordered Kathakali masks as gifts — absolutely stunning. Fast delivery and great packaging.", stars: 5 },
  { name: "Deepa Krishnan", place: "Chennai", text: "The incense sticks are heavenly. Pavapetti Heritage Artifacts brings authentic Kerala home to us.", stars: 5 },
];

function MarqueeBand() {
  const { data: categories } = useListCategories();

  const categoryNames = React.useMemo(() => {
    if (Array.isArray(categories) && categories.length > 0) {
      return categories.map((c: any) => c.name);
    }
    return MARQUEE_ITEMS;
  }, [categories]);

  const items = [...categoryNames, ...categoryNames, ...categoryNames];

  return (
    <div className="overflow-hidden bg-secondary py-3 select-none w-full">
      <div className="flex whitespace-nowrap" style={{ animation: "marquee 32s linear infinite" }}>
        {items.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-2 text-secondary-foreground text-[11px] font-bold tracking-[0.22em] uppercase px-6">
            <span className="text-primary opacity-80">✦</span>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const [heroIdx, setHeroIdx] = React.useState(0);
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null);
  
  const resetSliderInterval = React.useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(() => {
      setHeroIdx(i => (i + 1) % HERO_SLIDES.length);
    }, 6500);
  }, []);

  const handleSlideSelect = (idx: number) => {
    setHeroIdx(idx);
    resetSliderInterval();
  };

  React.useEffect(() => {
    resetSliderInterval();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [resetSliderInterval]);

  const slide = HERO_SLIDES[heroIdx];
  const { data: featured = [], isLoading: featuredLoading, isSuccess: isFeaturedSuccess } = useGetFeaturedProducts({
    query: {
      queryKey: getGetFeaturedProductsQueryKey(),
      placeholderData: () => {
        try {
          const cached = localStorage.getItem("cached-featured");
          if (cached) return JSON.parse(cached);
        } catch {}
        return undefined;
      }
    }
  });
  const { data: newArrivals = [], isSuccess: isNewArrivalsSuccess } = useListProducts(
    { isNewArrival: "true" },
    {
      query: {
        queryKey: getListProductsQueryKey({ isNewArrival: "true" }),
        placeholderData: () => {
          try {
            const cached = localStorage.getItem("cached-new-arrivals");
            if (cached) return JSON.parse(cached);
          } catch {}
          return undefined;
        }
      }
    }
  );
  const { data: categories, isLoading: catLoading, isSuccess: isCategoriesSuccess } = useListCategories({
    query: {
      queryKey: getListCategoriesQueryKey(),
      placeholderData: () => {
        try {
          const cached = localStorage.getItem("cached-categories");
          if (cached) return JSON.parse(cached);
        } catch {}
        return undefined;
      }
    }
  });

  React.useEffect(() => {
    if (isFeaturedSuccess && featured) {
      localStorage.setItem("cached-featured", JSON.stringify(featured));
    }
  }, [featured, isFeaturedSuccess]);

  React.useEffect(() => {
    if (isNewArrivalsSuccess && newArrivals) {
      localStorage.setItem("cached-new-arrivals", JSON.stringify(newArrivals));
    }
  }, [newArrivals, isNewArrivalsSuccess]);

  React.useEffect(() => {
    if (isCategoriesSuccess && categories) {
      localStorage.setItem("cached-categories", JSON.stringify(categories));
    }
  }, [categories, isCategoriesSuccess]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="relative min-h-[72vh] sm:min-h-[75vh] md:min-h-[82vh] flex items-center overflow-hidden bg-[#070706]">
        {/* Heritage Side Accent - Desktop */}
        <div className="absolute left-8 lg:left-12 top-1/2 -translate-y-1/2 z-30 hidden lg:flex flex-col items-center gap-14 pointer-events-none">
          <span className="text-[9px] font-bold tracking-[0.8em] uppercase text-amber-200/40 rotate-180" style={{ writingMode: 'vertical-rl' }}>Kerala Heritage</span>
          <div className="w-[1px] h-20 bg-gradient-to-b from-transparent via-amber-500/40 to-transparent" />
          <span className="text-[9px] font-bold tracking-[0.8em] uppercase text-amber-200/40 rotate-180" style={{ writingMode: 'vertical-rl' }}>Handcrafted Parampara</span>
        </div>

        <AnimatePresence>
          <motion.div
            key={heroIdx}
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ 
              opacity: 1, 
              scale: 1.08,
            }}
            exit={{ opacity: 0, scale: 1.12 }}
            transition={{ 
              opacity: { duration: 1.4 },
              scale: { duration: 7.5, ease: "linear" },
            }}
            className="absolute inset-0 z-0"
          >
            {/* Multi-layered cinematic protective vignette for supreme text legibility across all screens */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/75 to-black/85 md:bg-gradient-to-r md:from-black/95 md:via-black/70 md:to-black/35 z-10" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(217,119,6,0.12)_0%,rgba(0,0,0,0.85)_100%)] z-10 pointer-events-none" />
            
            <div className="absolute inset-0">
              <img
                src={slide.src}
                alt={slide.label}
                className="w-full h-full object-cover object-center scale-105"
                style={{ filter: 'brightness(0.72) contrast(1.05)' }}
              />
            </div>
          </motion.div>
        </AnimatePresence>
        
        <div className="relative z-20 max-w-7xl mx-auto px-5 sm:px-10 lg:px-16 pt-16 pb-16 md:pt-24 md:pb-20 w-full flex flex-col lg:items-start items-center text-center lg:text-left">
          <div className="max-w-2xl sm:max-w-3xl w-full">
            {/* Luminous Tag Badge */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`tag-${heroIdx}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.6 }}
                className="flex items-center lg:justify-start justify-center mb-4 sm:mb-6"
              >
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-400/35 backdrop-blur-md text-amber-300 text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase shadow-md shadow-amber-950/40">
                  <Sparkles size={12} className="text-amber-400 animate-pulse shrink-0" />
                  <span>{slide.tag}</span>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Radiant High-Contrast Headline */}
            <AnimatePresence mode="wait">
              <motion.div key={`hero-h1-${heroIdx}`}>
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="font-serif font-light leading-[1.08] tracking-tight text-[#fefdfa] mb-4 sm:mb-6 text-3xl sm:text-5xl md:text-6xl lg:text-7xl drop-shadow-[0_4px_24px_rgba(0,0,0,0.85)]"
                >
                  {slide.headline[0]}{" "}
                  <span className="font-normal italic text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-300 to-amber-400 drop-shadow-[0_2px_14px_rgba(245,158,11,0.5)] block sm:inline my-1 sm:my-0">
                    {slide.headline[1]}
                  </span>{" "}
                  <br className="hidden sm:inline" />
                  {slide.headline[2]}
                </motion.h1>
              </motion.div>
            </AnimatePresence>

            {/* Clear Subtitle */}
            <AnimatePresence mode="wait">
              <motion.p
                key={`sub-${heroIdx}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="text-xs sm:text-base md:text-lg leading-relaxed mb-6 sm:mb-9 max-w-xl mx-auto lg:mx-0 font-light text-white/90 px-1 sm:px-0"
              >
                {slide.sub}
              </motion.p>
            </AnimatePresence>

            {/* High-Converting CTA Strip */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex flex-wrap lg:justify-start justify-center gap-3.5 sm:gap-4 items-center"
            >
              <Link href="/products">
                <button className="group relative overflow-hidden px-7 sm:px-9 h-12 sm:h-14 rounded-full bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 hover:from-amber-500 hover:to-amber-700 text-white font-bold text-xs sm:text-sm tracking-[0.2em] uppercase transition-all duration-300 shadow-xl shadow-amber-950/50 hover:shadow-amber-500/30 hover:scale-[1.02] active:scale-[0.98] border border-amber-300/35 flex items-center gap-3">
                  <span>Explore Collection</span>
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                    <ArrowRight size={14} className="text-white" />
                  </div>
                </button>
              </Link>
              <Link href="/art-forms">
                <button className="px-5 sm:px-6 h-12 sm:h-14 rounded-full bg-white/10 hover:bg-white/15 text-white/90 hover:text-white border border-white/20 text-xs font-bold tracking-[0.15em] uppercase transition-all backdrop-blur-md active:scale-[0.98]">
                  Book Performing Arts
                </button>
              </Link>
            </motion.div>

            {/* Mobile Touch Slider Navigation Controls */}
            <div className="flex lg:hidden items-center justify-center gap-3 mt-7 pt-2">
              <button
                onClick={() => handleSlideSelect((heroIdx - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
                aria-label="Previous slide"
                className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/25 text-white/90 active:scale-90 flex items-center justify-center"
              >
                <ChevronLeft size={16} />
              </button>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20">
                {HERO_SLIDES.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSlideSelect(idx)}
                    className={`transition-all duration-300 rounded-full ${
                      heroIdx === idx ? "w-5 h-1.5 bg-amber-400" : "w-1.5 h-1.5 bg-white/35"
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
              <button
                onClick={() => handleSlideSelect((heroIdx + 1) % HERO_SLIDES.length)}
                aria-label="Next slide"
                className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/25 text-white/90 active:scale-90 flex items-center justify-center"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Custom Hero Slider Indicators with Golden Timelines - Desktop */}
        <div className="absolute right-6 md:right-16 lg:right-24 bottom-10 z-30 hidden lg:flex items-center gap-6 text-white/60">
          <button
            onClick={() => handleSlideSelect((heroIdx - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
            aria-label="Previous slide"
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/15 border border-white/15 text-white/80 hover:text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95"
          >
            <ChevronLeft size={17} />
          </button>
          <div className="flex items-center gap-6">
            {HERO_SLIDES.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleSlideSelect(idx)}
                className="flex flex-col items-start gap-1 group/control outline-none"
              >
                <span className={`text-[10px] font-black tracking-widest transition-colors duration-500 ${heroIdx === idx ? "text-amber-400 font-bold" : "group-hover/control:text-white/80"}`}>
                  {`0${idx + 1}`}
                </span>
                <div className="w-12 h-[2px] bg-white/15 relative overflow-hidden rounded-full">
                  {heroIdx === idx && (
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      key={idx}
                      transition={{ duration: 6.5, ease: "linear" }}
                      className="absolute inset-y-0 left-0 bg-amber-400"
                    />
                  )}
                </div>
              </button>
            ))}
          </div>
          <button
            onClick={() => handleSlideSelect((heroIdx + 1) % HERO_SLIDES.length)}
            aria-label="Next slide"
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/15 border border-white/15 text-white/80 hover:text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95"
          >
            <ChevronRight size={17} />
          </button>
        </div>
      </section>

      <MarqueeBand />

      {/* ── Our Essence — Brand Mission Statement ── */}
      <section className="py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-6 lg:px-16">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
            >
              <span className="text-primary text-[10px] font-black tracking-[0.5em] uppercase mb-6 block">Our Craft & Heritage</span>
              <h2 className="font-serif text-5xl font-light leading-tight text-foreground">
                Authentic <span className="italic">Kerala Crafts</span>
              </h2>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.2 }}
              className="space-y-6"
            >
              <p className="text-xl text-muted-foreground font-light leading-relaxed">
                Pavapetti Heritage Artifacts brings authentic handcrafted Kerala products, traditional brassware, wall decor, and art form bookings directly from master artisans to your home.
              </p>
              <p className="text-sm text-muted-foreground/60 uppercase tracking-widest font-bold">
                Authentic Handcrafts • Brass & Pooja Decor • Performing Arts
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 border-y border-border/10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
            {[
              { icon: <ShieldCheck className="text-primary" size={32} />, title: "Authentic Heritage", desc: "100% Original Kerala Handcrafts" },
              { icon: <Sparkles className="text-primary" size={32} />, title: "Handcrafted Quality", desc: "Made by Master Artisans" },
              { icon: <Globe className="text-primary" size={32} />, title: "Global Shipping", desc: "Delivered safely worldwide" },
              { icon: <Heart className="text-primary" size={32} />, title: "Sustainably Sourced", desc: "Natural & traditional materials" }
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-primary/5 flex items-center justify-center mb-2">{item.icon}</div>
                <h4 className="font-serif text-xl font-light">{item.title}</h4>
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold opacity-60">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Collection — Immediate Discovery ── */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-6 lg:px-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12 md:mb-16">
          <div>
            <p className="text-primary text-[10px] tracking-[0.5em] uppercase font-black mb-3">Curated for you</p>
            <h2 className="font-serif text-4xl md:text-5xl font-light text-foreground">Featured <span className="italic text-primary">Products</span></h2>
          </div>
          <Link href="/products?featured=true" className="group flex items-center gap-3 text-[10px] md:text-[11px] font-black tracking-[0.3em] md:tracking-[0.4em] uppercase text-foreground/40 hover:text-primary transition-all duration-500 self-start sm:self-auto">
            Explore All Products
            <div className="w-8 md:w-12 h-px bg-foreground/10 group-hover:bg-primary group-hover:w-20 transition-all duration-500" />
          </Link>
        </div>

        {featuredLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-muted animate-pulse rounded-[2rem]" />
            ))}
          </div>
        ) : (Array.isArray(featured) ? featured : []).length === 0 ? (
          <div className="text-center py-20 bg-secondary/30 rounded-[3rem] border border-dashed border-primary/10">
            <p className="font-serif text-2xl text-muted-foreground mb-2 italic">Awaiting Products</p>
            <p className="text-xs uppercase tracking-widest opacity-40">Products are being selected for display</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8">
            {(Array.isArray(featured) ? featured : []).map((product: any, i: number) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}
      </section>

      <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-primary text-[10px] tracking-[0.5em] uppercase font-bold mb-4">Explore By Category</p>
          <h2 className="font-serif text-5xl font-light text-foreground">Featured <span className="italic">Categories</span></h2>
        </div>
        {catLoading ? <div className="grid grid-cols-2 md:grid-cols-4 gap-8">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="aspect-[3/4] bg-muted animate-pulse" />)}</div> : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10 items-stretch">
            {(Array.isArray(categories) ? categories : []).slice(0, 4).map((cat: any, i: number) => {
              const ROMAN_NUMERALS = ["I", "II", "III", "IV"];
              return (
                <motion.div 
                  key={cat.id} 
                  initial={{ opacity: 0, y: 50, scale: 0.95 }} 
                  whileInView={{ opacity: 1, y: 0, scale: 1 }} 
                  viewport={{ once: true, margin: "-100px" }} 
                  transition={{ delay: i * 0.15, duration: 1, ease: [0.16, 1, 0.3, 1] }} 
                  className="group relative flex flex-col h-full"
                >
                  <Link href={`/products?category=${encodeURIComponent(cat.name)}`} className="flex flex-col h-full">
                    <div className="relative aspect-[4/5] overflow-hidden bg-white mb-5 shadow-[0_20px_50px_rgba(0,0,0,0.06)] rounded-[2.5rem] border border-primary/5 group-hover:border-primary/15 transition-all duration-750 shrink-0">
                      <img 
                        src={CATEGORY_OVERRIDE[cat.name] || cat.imageUrl} 
                        alt={cat.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out" 
                      />
                      {/* Floating Royal Roman Badge */}
                      <div className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center border border-white/40 shadow-sm transition-transform duration-500 group-hover:scale-110">
                        <span className="text-[9px] font-black tracking-widest text-primary">{ROMAN_NUMERALS[i]}</span>
                      </div>
                      <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-all duration-500" />
                    </div>
                    <div className="text-center flex-1 flex flex-col justify-start px-2">
                      <h3 className="font-serif text-xl sm:text-2xl font-light text-foreground group-hover:text-primary transition-colors duration-500 min-h-[3.5rem] flex items-center justify-center leading-tight">
                        {cat.name}
                      </h3>
                      <p className="text-xs text-muted-foreground/75 font-light leading-relaxed max-w-[220px] mx-auto line-clamp-2 min-h-[2.5rem] flex items-center justify-center mt-1">
                        {cat.description || "Authentic Kerala handcrafted collection"}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>











      {/* ── Kerala Performing Arts Spotlight & WhatsApp Booking Banner ── */}
      <section className="py-20 md:py-28 bg-[#0a0a09] text-white relative overflow-hidden border-t border-b border-white/10">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 w-full relative z-10">
          <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-16">
            <div className="space-y-3">
              <span className="text-primary text-[10px] font-black tracking-[0.5em] uppercase block">
                Traditional Performing Arts &amp; Booking · കലാസന്ധ്യ
              </span>
              <h2 className="font-serif text-4xl md:text-6xl font-light text-[#f8f5ee]">
                Experience Kerala’s <span className="italic text-primary font-medium">Sacred Stage</span>
              </h2>
              <p className="text-white/80 text-sm md:text-base font-sans font-normal leading-relaxed max-w-2xl">
                Book authentic traditional troupes for Kathakali, Tholpavakoothu, Mohiniyattam, Ottamthullal, Mizhavu Melam, Bharatanatyam, Chakyar Koothu, and Kuchipudi recitals directly via WhatsApp.
              </p>
            </div>
            <Link href="/art-forms">
              <button className="px-8 py-4 rounded-2xl bg-primary text-white font-bold text-xs uppercase tracking-[0.2em] hover:bg-primary/90 transition-all hover:scale-105 shadow-xl shadow-primary/20 shrink-0">
                Explore All Art Forms
              </button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Tholpavakoothu",
                malayalam: "തോൽപാവകൂത്ത്",
                tag: "Shadow Puppetry",
                desc: "Ancient 2000-year-old temple shadow puppetry lit by coconut oil lamps.",
                img: "/art-forms/tholpavakoothu.png"
              },
              {
                title: "Kathakali",
                malayalam: "കഥകളി",
                tag: "Classical Dance Drama",
                desc: "World-famous dance-drama with grand face makeup, mudras & Chenda drums.",
                img: "/hero-dance-v2.webp"
              },
              {
                title: "Mohiniyattam",
                malayalam: "മോഹിനിയാട്ടം",
                tag: "Dance of Enchantress",
                desc: "Graceful classical solo dance in traditional white and gold Kerala Kasavu silk.",
                img: "/art-forms/mohiniyattam.png"
              }
            ].map((art, i) => (
              <motion.div
                key={art.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative rounded-[2rem] overflow-hidden bg-[#161513] border border-white/10 hover:border-primary/40 transition-all duration-500 flex flex-col justify-between"
              >
                <div className="aspect-[16/10] overflow-hidden relative">
                  <img src={art.img} alt={art.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-85 group-hover:opacity-100" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#161513] via-transparent to-transparent" />
                  <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-primary text-[10px] font-black uppercase tracking-wider border border-white/10">
                    {art.tag}
                  </span>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="font-serif text-2xl text-white font-medium">
                      {art.title} <span className="text-primary font-sans text-sm block md:inline">({art.malayalam})</span>
                    </h3>
                    <p className="text-xs text-white/75 font-sans font-normal mt-2 leading-relaxed">
                      {art.desc}
                    </p>
                  </div>
                  <Link href="/art-forms" className="block pt-2">
                    <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary group-hover:text-white transition-colors flex items-center gap-2">
                      Book Performers <ArrowRight size={14} />
                    </span>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <StorySection />

      {/* ── Craft Guilds & Heritage Traditions Trust Section ── */}
      <section className="py-12 md:py-16 border-y border-border/10 bg-secondary/20">
        <div className="container mx-auto px-4">
          <p className="text-center text-[10px] tracking-[0.4em] uppercase font-bold text-muted-foreground/70 mb-8">
            Traditional Craftsmanship &amp; Sacred Art Traditions
          </p>
          <div className="grid grid-cols-2 md:flex flex-wrap justify-center items-center gap-x-10 gap-y-6 lg:gap-16 text-muted-foreground/80 font-serif text-sm md:text-base font-medium">
            {[
              "Aranmula Bell-Metal Guild",
              "Valluvanad Puppetry Heritage",
              "Kerala Mural Artistry",
              "Traditional Bell-Metal Works",
              "Classical Performing Lineage"
            ].map((tradition, idx) => (
              <span 
                key={tradition} 
                className={`whitespace-nowrap text-center ${
                  idx === 4 ? "col-span-2 text-center md:col-span-1" : ""
                }`}
              >
                ✦ {tradition}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Testimonials ═══ */}
      <section className="py-20 md:py-32 bg-card">
        <div className="max-w-7xl mx-auto px-6 lg:px-16">
          <div className="text-center mb-20">
            <p className="text-primary text-[10px] tracking-[0.5em] uppercase font-black mb-4">Voices of the Connoisseur</p>
            <h2 className="font-serif text-5xl font-light text-foreground">Heritage <span className="italic">Impressions</span></h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ name, place, text, stars }, i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-background rounded-2xl p-6 border border-border hover:border-primary/30 hover:shadow-lg transition-all"
              >
                <Quote size={28} className="text-primary/30 mb-3" />
                <p className="text-foreground/80 text-sm leading-relaxed mb-5">{text}</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-foreground text-sm">{name}</p>
                    <p className="text-[11px] text-muted-foreground">{place}</p>
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: stars }).map((_, j) => (
                      <Star key={j} size={13} className="text-primary fill-primary" />
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Curatorial Sanctuary — Private Curator's Advisory ── */}
      <section className="bg-[#0d0d0d] py-20 md:py-32 px-6 overflow-hidden relative border-t border-white/5">
        {/* Volcanic Gold Glow Backdrops */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--primary-rgb),0.12),transparent_70%)] pointer-events-none" />
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none animate-pulse" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
            
            {/* Visual Column — Gold wireframe card with hover zoom */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-5 relative group"
            >
              {/* Double Gold-Line Frame */}
              <div className="absolute -inset-2 sm:-inset-4 border border-primary/20 pointer-events-none rounded-[2.5rem] sm:rounded-[3rem] transition-all duration-700 group-hover:scale-[1.02] group-hover:border-primary/45" />
              
              <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-black/40 border border-white/10 shadow-2xl">
                <img 
                  src="/hero-brass-v2.webp" 
                  alt="Curatorial Sanctum" 
                  className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110 brightness-[0.8]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-80" />
                
                <div className="absolute bottom-8 left-8 text-white z-10">
                  <span className="text-[8px] font-black tracking-[0.5em] uppercase text-primary mb-2 block">Handcrafted In Kerala</span>
                  <p className="font-serif text-lg italic text-[#FFF8E7]">"Authentic Quality & Direct Support"</p>
                </div>
              </div>
            </motion.div>

            {/* Narrative Column */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-7 space-y-10 text-left"
            >
              <div className="space-y-4">
                <span className="text-primary text-[10px] font-black tracking-[0.6em] uppercase block">Need Help Choosing?</span>
                <h3 className="font-serif text-4xl md:text-6xl font-light text-[#FFF8E7] leading-tight">
                  Direct WhatsApp <br />
                  <span className="italic text-primary">Support &amp; Assistance</span>
                </h3>
                {/* Gold scroll-drawn divider */}
                <div className="h-[1px] w-24 bg-gradient-to-r from-primary to-transparent mt-6" />
              </div>
              
              <p className="text-white/60 text-base md:text-lg font-light leading-relaxed max-w-xl">
                Have questions about our handcrafted products, brassware sizes, custom items, or bulk orders? Connect directly with our team on WhatsApp for instant guidance and friendly support.
              </p>
              
              <div className="pt-4">
                <Magnetic>
                  <a
                    href="https://wa.me/919292016901?text=Hi!%20I%20need%20help%20choosing%20a%20product."
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-4 bg-white text-[#0a0a0a] font-black px-10 py-5 rounded-full text-[11px] tracking-[0.3em] uppercase shadow-2xl hover:bg-primary hover:text-white hover:shadow-primary/20 transition-all duration-500 outline-none"
                  >
                    <MessageCircle size={16} className="text-primary group-hover:text-white" />
                    Chat on WhatsApp
                  </a>
                </Magnetic>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
