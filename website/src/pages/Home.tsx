import React from "react";
import { Link } from "wouter";
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { 
  ArrowRight, Sparkles, Star, Quote, 
  ShieldCheck, Globe, Heart, MessageCircle 
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import StorySection from "@/components/StorySection";
import Magnetic from "@/components/Magnetic";
import { 
  useGetFeaturedProducts, useListCategories, useListProducts 
} from "@workspace/api-client-react";

const MARQUEE_ITEMS = [
  "Ancient Parampara", "Tharavadu Heritage", "Vishuddha Art",
  "Malabar Whispers", "Ancestral Heirlooms", "Hand-cast Legacies",
  "God's Own Soul", "Sacred Geometries", "Timeless Craft", "Est. 2020",
];

const HERO_SLIDES = [
  {
    src: "/hero-dance-v2.png",
    label: "Kathakali Vesham",
    tag: "Divine Dramaturgy",
    headline: ["Echoes", "of the", "Sacred"],
    sub: "Kathakali masks and dance artifacts — preserving the primordial rhythms and sacred colors of Kerala's soul.",
  },
  {
    src: "/hero-mural-v2.png",
    label: "Sacred Mural Art",
    tag: "Temple Sanctum Art",
    headline: ["Whispers", "of the", "Sanctum"],
    sub: "Ancient Kerala mural paintings — handcrafted using natural pigments, breathing life into stories of a thousand years.",
  },
  {
    src: "/hero-box-v2.png",
    label: "Nettoor Petti",
    tag: "Ancestral Caskets",
    headline: ["Legacy", "of the", "Ancestors"],
    sub: "The legendary jewellery caskets of Kerala — handcrafted rosewood boxes, each a silent witness to a royal past.",
  },
  {
    src: "/hero-brass-v2.png",
    label: "Sacred Brass Lamps",
    tag: "Eternal Light",
    headline: ["Glow", "of the", "Parampara"],
    sub: "Hand-cast Nilavilakku and brass lamps — carrying the warmth of ancient devotion across generations.",
  },
];

const CATEGORY_OVERRIDE: Record<string, string> = {
  "Pooja Category":            "/hero-brass.png",
  "Chains and Bracelets":      "/karungali_mala.png",
  "Elephant Heritage":         "/elephant_head.png",
  "Heritage Textiles":         "/hero-textile.png",
  "Miniatures & Mini Chenda":  "/hero-dance.png",
  "Fragrances & Organic Soap": "/kalabham_perfume.png",
};

const TESTIMONIALS = [
  { name: "Priya Nair", place: "Kochi, Kerala", text: "Beautiful brass lamps! The quality is exactly like what you get from Kerala artisans. Very happy with the purchase.", stars: 5 },
  { name: "Arjun Menon", place: "Bangalore", text: "Ordered Kathakali masks as gifts — absolutely stunning. Fast delivery and great packaging.", stars: 5 },
  { name: "Deepa Krishnan", place: "Chennai", text: "The incense sticks are heavenly. Pavapetti brings authentic Kerala home to us.", stars: 5 },
];

function MarqueeBand() {
  const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
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
  
  // High-performance GPU-accelerated motion values for mouse parallax (no state re-renders!)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const springX = useSpring(mouseX, { damping: 40, stiffness: 40 });
  const springY = useSpring(mouseY, { damping: 40, stiffness: 40 });

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
    const handleMouseMove = (e: MouseEvent) => {
      const xVal = (e.clientX / window.innerWidth - 0.5) * 20 * -0.3;
      const yVal = (e.clientY / window.innerHeight - 0.5) * 20 * -0.3;
      mouseX.set(xVal);
      mouseY.set(yVal);
    };
    window.addEventListener("mousemove", handleMouseMove);
    resetSliderInterval();
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [mouseX, mouseY, resetSliderInterval]);

  const slide = HERO_SLIDES[heroIdx];
  const { data: featured = [], isLoading: featuredLoading } = useGetFeaturedProducts();
  const { data: newArrivals = [] } = useListProducts({ isNewArrival: "true" });
  const { data: categories, isLoading: catLoading } = useListCategories();

  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);


  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="relative min-h-[50vh] md:min-h-[55vh] flex items-center overflow-hidden bg-[#0a0a0a]">
        {/* Editorial Side Text — Integrated closer for better visual connection */}
        <div className="absolute left-20 top-1/2 -translate-y-1/2 z-30 hidden lg:flex flex-col items-center gap-24">
          <span className="text-[9px] font-black tracking-[1.2em] uppercase text-white/30 hover:text-white/80 transition-all duration-700 cursor-default rotate-180" style={{ writingMode: 'vertical-rl' }}>Editorial Edition</span>
          <div className="w-[1px] h-32 bg-gradient-to-b from-transparent via-primary/30 to-transparent" />
          <span className="text-[9px] font-black tracking-[1.2em] uppercase text-white/30 hover:text-white/80 transition-all duration-700 cursor-default rotate-180" style={{ writingMode: 'vertical-rl' }}>Vol. MMXXVI</span>
        </div>

        <AnimatePresence>
          <motion.div
            key={heroIdx}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ 
              opacity: 1, 
              scale: 1.10,
            }}
            exit={{ opacity: 0, scale: 1.15 }}
            transition={{ 
              opacity: { duration: 1.8 },
              scale: { duration: 7.5, ease: "linear" },
            }}
            style={{ x: springX, y: springY }}
            className="absolute inset-0 z-0"
          >
            {/* Enhanced Side Gradient for text protection */}
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent z-10" />
            
            <motion.div
              style={{ y: y1 }}
              className="absolute inset-0"
            >
              <img
                src={slide.src}
                alt={slide.label}
                className="w-full h-full object-cover object-[75%_center] scale-110"
                style={{ filter: 'brightness(0.85)' }}
              />
            </motion.div>
          </motion.div>
        </AnimatePresence>

        <div className="absolute inset-0 z-10 bg-black/10" />
        
        <div className="relative z-20 max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pt-20 pb-12 md:pt-24 md:pb-20 w-full flex flex-col lg:items-start items-center text-center lg:text-left">
          <div className="max-w-3xl w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={`tag-${heroIdx}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center lg:justify-start justify-center gap-6 mb-6"
              >
                <span className="text-[10px] font-black tracking-[1em] uppercase text-primary/80">{slide.tag}</span>
              </motion.div>
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.div
                key={`parallax-h1-${heroIdx}`}
                style={{ y: y2 }}
              >
                <motion.h1
                  initial={{ opacity: 0, y: 40, skewY: 2 }}
                  animate={{ opacity: 1, y: 0, skewY: 0 }}
                  exit={{ opacity: 0, y: -30, skewY: -1 }}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                  className="font-serif font-light leading-[1] mb-6 md:mb-8 tracking-tighter"
                  style={{ 
                    fontSize: 'clamp(2rem, 8vw, 5.5rem)', 
                    color: '#FFF8E7', 
                    textShadow: '0 20px 80px rgba(0,0,0,0.5)' 
                  }}
                >
                  {slide.headline[0]}<br />
                  <span className="italic text-primary block my-2 md:my-3">{slide.headline[1]}</span>
                  {slide.headline[2]}
                </motion.h1>
              </motion.div>
            </AnimatePresence>

            <AnimatePresence mode="wait">
                <motion.p
                  key={`sub-${heroIdx}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="text-sm md:text-lg leading-relaxed mb-8 md:mb-10 max-w-xl mx-auto lg:mx-0 font-light text-white/70"
                >
                  {slide.sub}
                </motion.p>
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-wrap lg:justify-start justify-center gap-6 items-center"
            >
              <Link href="/products">
                <button className="group relative overflow-hidden px-10 h-14 bg-primary text-primary-foreground font-black text-[12px] tracking-[0.3em] uppercase transition-all duration-700 hover:shadow-[0_20px_50px_rgba(128,64,18,0.4)]">
                  <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                  <span className="relative flex items-center gap-4">
                    The Collection
                    <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform duration-500" />
                  </span>
                </button>
              </Link>
              
              <Link href="/products">
                <button className="px-6 h-14 border border-white/20 text-white font-bold text-[11px] tracking-[0.3em] uppercase hover:bg-white hover:text-black transition-all duration-500">
                  Virtual Tour
                </button>
              </Link>
            </motion.div>
          </div>

        </div>

        {/* Custom Hero Slider Indicators with Golden Timelines */}
        <div className="absolute right-6 md:right-16 bottom-10 z-30 hidden md:flex items-center gap-8 text-white/50">
          {HERO_SLIDES.map((s, idx) => (
            <button
              key={idx}
              onClick={() => handleSlideSelect(idx)}
              className="flex flex-col items-start gap-1 group/control outline-none"
            >
              <span className={`text-[10px] font-black tracking-widest transition-colors duration-500 ${heroIdx === idx ? "text-primary font-bold" : "group-hover/control:text-white/80"}`}>
                {`0${idx + 1}`}
              </span>
              <div className="w-16 h-[2px] bg-white/10 relative overflow-hidden rounded-full">
                {heroIdx === idx && (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    key={idx}
                    transition={{ duration: 6.5, ease: "linear" }}
                    className="absolute inset-y-0 left-0 bg-primary"
                  />
                )}
              </div>
            </button>
          ))}
        </div>
      </section>

      <MarqueeBand />

      {/* ── Our Essence — Brand Mission Statement ── */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-6 lg:px-16">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
            >
              <span className="text-primary text-[10px] font-black tracking-[0.5em] uppercase mb-6 block">Our Essence</span>
              <h2 className="font-serif text-5xl font-light leading-tight text-foreground">
                Curators of the <span className="italic">Malabar Legacy</span>
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
                Pavapetti is an editorial boutique dedicated to the preservation of Kerala’s sacred artistic traditions. We serve as a direct bridge between master artisans and global collectors.
              </p>
              <p className="text-sm text-muted-foreground/60 uppercase tracking-widest font-bold">
                Authentic Handcrafts • Sacred Artifacts • Timeless Mural Art
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-24 border-y border-border/10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
            {[
              { icon: <ShieldCheck className="text-primary" size={32} />, title: "Authentic Heritage", desc: "100% Original Kerala Artifacts" },
              { icon: <Sparkles className="text-primary" size={32} />, title: "Handcrafted", desc: "Made by Master Artisans" },
              { icon: <Globe className="text-primary" size={32} />, title: "Global Shipping", desc: "Securely delivered worldwide" },
              { icon: <Heart className="text-primary" size={32} />, title: "Eco-Friendly", desc: "Sustainably sourced materials" }
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
      <section className="py-24 max-w-7xl mx-auto px-6 lg:px-16">
        <div className="flex items-end justify-between mb-16">
          <div>
            <p className="text-primary text-[10px] tracking-[0.5em] uppercase font-black mb-4">Curated for you</p>
            <h2 className="font-serif text-5xl font-light text-foreground">Featured <span className="italic text-primary">Masterpieces</span></h2>
          </div>
          <Link href="/products?featured=true" className="group flex items-center gap-4 text-[11px] font-black tracking-[0.4em] uppercase text-foreground/40 hover:text-primary transition-all duration-500">
            Explore All Artifacts
            <div className="w-12 h-px bg-foreground/10 group-hover:bg-primary group-hover:w-20 transition-all duration-500" />
          </Link>
        </div>

        {featuredLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-muted animate-pulse rounded-[2rem]" />
            ))}
          </div>
        ) : (featured ?? []).length === 0 ? (
          <div className="text-center py-20 bg-secondary/30 rounded-[3rem] border border-dashed border-primary/10">
            <p className="font-serif text-2xl text-muted-foreground mb-2 italic">Awaiting Curation</p>
            <p className="text-xs uppercase tracking-widest opacity-40">Artifacts are being selected for the gallery</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8">
            {(featured ?? []).map((product: any, i: number) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}
      </section>

      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-primary text-[10px] tracking-[0.5em] uppercase font-bold mb-4">Curated Collections</p>
          <h2 className="font-serif text-5xl font-light text-foreground">Curated <span className="italic">Parampara</span></h2>
        </div>
        {catLoading ? <div className="grid grid-cols-2 md:grid-cols-4 gap-8">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="aspect-[3/4] bg-muted animate-pulse" />)}</div> : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10">
            {(categories ?? []).slice(0, 4).map((cat: any, i: number) => {
              const ROMAN_NUMERALS = ["I", "II", "III", "IV"];
              return (
                <motion.div 
                  key={cat.id} 
                  initial={{ opacity: 0, y: 50, scale: 0.95 }} 
                  whileInView={{ opacity: 1, y: 0, scale: 1 }} 
                  viewport={{ once: true, margin: "-100px" }} 
                  transition={{ delay: i * 0.15, duration: 1, ease: [0.16, 1, 0.3, 1] }} 
                  className="group relative"
                >
                  <Link href={`/products?category=${encodeURIComponent(cat.name)}`}>
                    <div className="relative aspect-[4/5] overflow-hidden bg-white mb-6 shadow-[0_20px_50px_rgba(0,0,0,0.06)] rounded-[2.5rem] border border-primary/5 group-hover:border-primary/15 transition-all duration-750">
                      <img 
                        src={CATEGORY_OVERRIDE[cat.name] || cat.imageUrl} 
                        alt={cat.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2000ms] ease-out" 
                      />
                      {/* Floating Royal Roman Badge */}
                      <div className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center border border-white/40 shadow-sm transition-transform duration-500 group-hover:scale-110">
                        <span className="text-[9px] font-black tracking-widest text-primary">{ROMAN_NUMERALS[i]}</span>
                      </div>
                      <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-all duration-500" />
                    </div>
                    <div className="text-center space-y-2">
                      <h3 className="font-serif text-2xl font-light text-foreground group-hover:text-primary transition-colors duration-500">
                        {cat.name}
                      </h3>
                      {cat.description && (
                        <p className="text-[10px] text-muted-foreground/75 font-medium leading-relaxed tracking-wider uppercase max-w-[200px] mx-auto opacity-70 group-hover:opacity-100 transition-opacity duration-500">
                          {cat.description.split(",")[0]}
                        </p>
                      )}
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>









      {/* ── Heritage Gallery — Ultra Premium Grid ── */}
      <section className="py-32 bg-white w-full overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 w-full">
          <div className="flex flex-col items-center text-center mb-20">
            <motion.span 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-primary text-[10px] font-black tracking-[0.5em] uppercase mb-4"
            >
              The Curated Gallery
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-serif text-5xl md:text-7xl font-light text-foreground"
            >
              Captured <span className="italic">Heritage</span>
            </motion.h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 w-full">
            {/* Main Featured Piece */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-2 lg:row-span-2 relative group overflow-hidden rounded-[2.5rem] shadow-2xl aspect-[4/5] lg:aspect-auto border border-primary/5 hover:border-primary/20 transition-all duration-700"
            >
              <img src="/netipattam.png" alt="Netipattam" className="w-full h-full object-cover transition-transform duration-[2500ms] ease-out group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent transition-opacity duration-700 group-hover:from-black/75" />
              <div className="absolute bottom-10 left-10 text-white z-10">
                <span className="text-[10px] font-black tracking-[0.4em] uppercase text-primary/90 mb-3 block">The Golden Ornament</span>
                <h4 className="font-serif text-3xl md:text-4xl font-light tracking-tight text-[#FFF8E7]">Netipattam</h4>
              </div>
            </motion.div>

            {/* Smaller Gallery Pieces */}
            {[
              { img: "/aranmula-mirror.png", title: "Aranmula Kannadi", tag: "The Metal Mirror" },
              { img: "/elephant_head.png", title: "Temple Artifacts", tag: "Sacred Decor" },
              { img: "/kasavu-textile.png", title: "Heirloom Kasavu", tag: "Traditional Weaves" },
              { img: "/hero-box-v2.png", title: "Nettoor Petti", tag: "Royal Caskets" }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative group overflow-hidden rounded-[2rem] shadow-lg hover:shadow-xl aspect-[4/5] border border-primary/5 hover:border-primary/20 transition-all duration-700 bg-[#f9f7f4]"
              >
                <img src={item.img} alt={item.title} className="w-full h-full object-cover transition-transform duration-[2500ms] ease-out group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="absolute bottom-8 left-8 text-white z-10 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                  <p className="text-[9px] font-black tracking-[0.3em] uppercase text-primary/90 mb-2">{item.tag}</p>
                  <h4 className="font-serif text-xl font-light tracking-tight text-[#FFF8E7]">{item.title}</h4>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <StorySection />

      {/* ── As Seen In — Premium Trust Section ── */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <p className="text-center text-[10px] tracking-[0.4em] uppercase font-bold opacity-30 mb-10">As Seen In & Recognized By</p>
          <div className="grid grid-cols-2 md:flex flex-wrap justify-center items-center gap-x-12 gap-y-8 lg:gap-24 opacity-40 grayscale contrast-150">
            {["Architectural Digest", "Vogue Living", "Heritage India", "The Hindu", "Deccan Chronicle"].map((brand) => (
              <span key={brand} className="font-serif text-lg md:text-xl font-black tracking-tighter whitespace-nowrap text-center">{brand}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Testimonials ═══ */}
      <section className="py-32 bg-card">
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
      <section className="bg-[#0d0d0d] py-32 px-6 overflow-hidden relative border-t border-white/5">
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
              <div className="absolute -inset-4 border border-primary/20 pointer-events-none rounded-[3rem] transition-all duration-700 group-hover:scale-[1.02] group-hover:border-primary/45" />
              
              <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-black/40 border border-white/10 shadow-2xl">
                <img 
                  src="/hero-brass-v2.png" 
                  alt="Curatorial Sanctum" 
                  className="w-full h-full object-cover transition-transform duration-[4000ms] ease-out group-hover:scale-110 brightness-[0.8]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-80" />
                
                <div className="absolute bottom-8 left-8 text-white z-10">
                  <span className="text-[8px] font-black tracking-[0.5em] uppercase text-primary mb-2 block">The Archives Sanctum</span>
                  <p className="font-serif text-lg italic text-[#FFF8E7]">"Wisdom is preserved in silence."</p>
                </div>
              </div>
            </motion.div>

            {/* Narrative Column */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-7 space-y-10 text-left"
            >
              <div className="space-y-4">
                <span className="text-primary text-[10px] font-black tracking-[0.6em] uppercase block">Private Curatorial Advisory</span>
                <h3 className="font-serif text-4xl md:text-6xl font-light text-[#FFF8E7] leading-tight">
                  Request Curatorial <br />
                  <span className="italic text-primary">Assistance</span>
                </h3>
                {/* Gold scroll-drawn divider */}
                <div className="h-[1px] w-24 bg-gradient-to-r from-primary to-transparent mt-6" />
              </div>
              
              <p className="text-white/60 text-base md:text-lg font-light leading-relaxed max-w-xl">
                Our master curators are available to guide you through the sacred geometries, provenance, and material lineages of our ancient collections. Connect directly via WhatsApp to receive dedicated, private consultation.
              </p>
              
              <div className="pt-4">
                <Magnetic>
                  <a
                    href="https://wa.me/919042525110?text=Hi!%20I%20need%20help%20choosing%20a%20product."
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-4 bg-white text-[#0a0a0a] font-black px-10 py-5 rounded-full text-[11px] tracking-[0.3em] uppercase shadow-2xl hover:bg-primary hover:text-white hover:shadow-primary/20 transition-all duration-500 outline-none"
                  >
                    <MessageCircle size={16} className="text-primary group-hover:text-white" />
                    Speak with a Curator
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
