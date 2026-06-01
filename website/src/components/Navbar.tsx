import { Link, useLocation } from "wouter";
import { motion, AnimatePresence, useScroll } from "framer-motion";
import { ShoppingBag, Search, Menu, X, Phone, Mail, Instagram, Facebook, Youtube, Heart } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useListCategories } from "@workspace/api-client-react";
import PavapettiLogo from "./PavapettiLogo";
import Magnetic from "./Magnetic";

export default function Navbar() {
  const [location, setLocation] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const { count, openCart } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { data: categories } = useListCategories();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [menuOpen]);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  const isActive = (path: string) => location === path;
  const isDashboard = location.startsWith("/dashboard");

  const NAV_LINKS = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Shop" },
  ];

  return (
    <>
      <header className={`sticky top-0 z-50 transition-shadow duration-500 w-full ${scrolled ? "shadow-md" : ""}`}>


      {/* ── Main navbar ── */}
      <nav className={`relative transition-[background-color,border-color,box-shadow] duration-500 border-b h-16 flex items-center ${
        scrolled 
          ? "bg-white/95 backdrop-blur-md border-border/40 shadow-sm" 
          : "bg-white border-transparent"
      }`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12 w-full">
          <div className="flex items-center justify-between h-16 gap-8">
            {/* Logo with Secret Dashboard Trigger */}
            <div 
              onDoubleClick={() => setLocation("/admin")}
              onClick={() => {
                window.location.href = "/";
              }}
              className="cursor-pointer"
            >
              <PavapettiLogo size={36} />
            </div>


            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
              {NAV_LINKS.map(({ href, label }) => {
                const active = href === "/dashboard" ? isDashboard : isActive(href);
                return (
                  <Magnetic key={href}>
                    <Link
                      href={href}
                      className={`relative px-4 py-2 text-[13px] font-bold tracking-wide rounded-lg transition-all ${
                        active
                          ? "text-primary"
                          : "text-foreground hover:text-primary"
                      }`}
                    >
                      {label}
                      {active && (
                        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                      )}
                    </Link>
                  </Magnetic>
                );
              })}

              {/* Categories — Immersive Overlay */}
              <div 
                className="h-full flex items-center" 
                onMouseEnter={() => setCatOpen(true)} 
                onMouseLeave={() => setCatOpen(false)}
              >
                <button className={`px-4 py-2 text-[13px] font-bold tracking-wide rounded-lg transition-all flex items-center gap-1 ${catOpen ? "text-primary" : "text-foreground hover:text-primary"}`}>
                  Collections
                  <svg width="10" height="10" viewBox="0 0 12 12" className={`transition-transform duration-300 ${catOpen ? "rotate-180" : ""}`}>
                    <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
                  </svg>
                </button>
                
                {/* Immersive Category Overlay */}
                <AnimatePresence>
                  {catOpen && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[95vw] max-w-5xl z-[100] pointer-events-auto">
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="bg-white border border-border/50 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.18)] rounded-[2.5rem] overflow-y-auto max-h-[85vh] p-8 md:p-10"
                      >
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
                          {(categories ?? []).map((cat: any, i: number) => (
                            <motion.div
                              key={cat.id}
                              initial={{ opacity: 0, y: 15 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.05 + 0.1 }}
                            >
                              <Link
                                href={`/products?category=${encodeURIComponent(cat.name)}`}
                                className="group block space-y-3 text-center"
                                onClick={() => setCatOpen(false)}
                              >
                                <div className="aspect-[4/5] rounded-[2rem] overflow-hidden bg-[#f9f7f4] border border-primary/5 group-hover:border-primary/20 transition-all duration-700 relative shadow-sm group-hover:shadow-md">
                                  <img 
                                    src={cat.imageUrl} 
                                    alt={cat.name} 
                                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" 
                                  />
                                  <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-all duration-500" />
                                </div>
                                <div className="px-1">
                                  <span className="block text-[11px] font-black tracking-[0.2em] uppercase text-foreground group-hover:text-primary transition-colors leading-tight">
                                    {cat.name}
                                  </span>
                                  {cat.description && (
                                    <p className="text-[9px] text-muted-foreground/70 line-clamp-2 mt-1 leading-relaxed max-w-[130px] mx-auto group-hover:text-muted-foreground transition-colors font-medium">
                                      {cat.description}
                                    </p>
                                  )}
                                </div>
                              </Link>
                            </motion.div>
                          ))}
                        </div>
                        
                        <div className="mt-10 pt-8 border-t border-border/40 flex items-center justify-between">
                          <div className="max-w-md">
                            <p className="text-[11px] text-muted-foreground/80 italic font-serif leading-relaxed">
                              Pavapetti is an editorial boutique dedicated to the preservation of Kerala’s sacred artistic traditions. We serve as a direct bridge between master artisans and global collectors.
                            </p>
                          </div>
                          <Link href="/products" className="text-[10px] font-bold tracking-[0.25em] uppercase text-primary hover:text-primary/80 transition-colors border-b border-primary/20 pb-0.5 hover:border-primary">
                            Browse All Collections
                          </Link>
                        </div>
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>
              </div>

            </div>

            <div className="flex items-center gap-1 shrink-0">
              {/* Expandable search */}
              <div className="hidden md:flex items-center relative mr-2">
                <motion.div
                  initial={false}
                  animate={{ width: searchOpen ? 200 : 0, opacity: searchOpen ? 1 : 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden flex items-center"
                >
                  <input
                    ref={searchRef}
                    type="text"
                    placeholder="Search artifacts..."
                    value={searchVal}
                    onChange={(e) => setSearchVal(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        if (searchVal.trim()) {
                          setLocation(`/products?search=${encodeURIComponent(searchVal.trim())}`);
                          setSearchOpen(false);
                        }
                      }
                    }}
                    className="w-full bg-[#f9f7f4] border border-border/40 rounded-xl px-4 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/20 placeholder:text-muted-foreground/50 mr-2"
                  />
                </motion.div>
                <Magnetic>
                  <button
                    onClick={() => {
                      if (searchOpen && searchVal.trim()) {
                        setLocation(`/products?search=${encodeURIComponent(searchVal.trim())}`);
                        setSearchOpen(false);
                      } else {
                        setSearchOpen(!searchOpen);
                      }
                    }}
                    className="p-2.5 hover:text-primary hover:bg-primary/8 rounded-xl transition-all text-muted-foreground"
                  >
                    {searchOpen && !searchVal.trim() ? <X size={18} /> : <Search size={18} />}
                  </button>
                </Magnetic>
              </div>

              {/* Wishlist - Hidden on mobile because it's in MobileNav */}
              <div className="hidden md:block">
                <Magnetic>
                  <Link href="/wishlist">
                    <button className="relative p-2.5 hover:text-primary hover:bg-primary/8 rounded-xl transition-all text-muted-foreground">
                      <Heart size={18} />
                      {wishlistCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[9px] font-black min-w-[14px] min-h-[14px] rounded-full flex items-center justify-center shadow-sm">
                          {wishlistCount}
                        </span>
                      )}
                    </button>
                  </Link>
                </Magnetic>
              </div>

              {/* Cart */}
              <Magnetic>
                <button
                  onClick={openCart}
                  className="relative p-2.5 hover:text-primary hover:bg-primary/8 rounded-xl transition-all text-muted-foreground"
                  data-testid="button-cart"
                >
                  <ShoppingBag size={18} />
                  {count > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[9px] font-black min-w-[14px] min-h-[14px] rounded-full flex items-center justify-center shadow-sm">
                      {count}
                    </span>
                  )}
                </button>
              </Magnetic>

              {/* Cinematic Menu Trigger */}
              <button
                className="md:hidden p-2.5 hover:text-primary hover:bg-primary/8 rounded-xl transition-all text-muted-foreground"
                onClick={() => setMenuOpen(true)}
              >
                <Menu size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>
    </header>

      {/* Immersive Mobile Menu Overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] md:hidden bg-white flex flex-col p-8 sm:p-10"
          >
            <div className="flex justify-between items-center mb-16">
              <PavapettiLogo size={32} />
              <button 
                onClick={() => setMenuOpen(false)}
                className="w-12 h-12 rounded-full border border-border/50 flex items-center justify-center text-foreground"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="space-y-10">
              {NAV_LINKS.map(({ href, label }, i) => (
                <motion.div
                  key={href}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link
                    href={href}
                    onClick={() => setMenuOpen(false)}
                    className="group flex items-end gap-4"
                  >
                    <span className="text-primary text-[10px] font-black tracking-widest mb-2 opacity-40">0{i + 1}</span>
                    <span className="text-5xl font-serif font-light text-foreground group-hover:text-primary transition-colors italic">
                      {label}
                    </span>
                  </Link>
                </motion.div>
              ))}
              
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <button 
                  onClick={() => { setMenuOpen(false); setCatOpen(true); }}
                  className="group flex items-end gap-4"
                >
                  <span className="text-primary text-[10px] font-black tracking-widest mb-2 opacity-40">03</span>
                  <span className="text-5xl font-serif font-light text-foreground group-hover:text-primary transition-colors italic">
                    Collections
                  </span>
                </button>
              </motion.div>
            </nav>

            <div className="mt-auto pt-10 border-t border-border/50 space-y-6">
              <div className="flex items-center gap-6">
                <a href="#" className="text-foreground hover:text-primary transition-colors"><Instagram size={20} /></a>
                <a href="#" className="text-foreground hover:text-primary transition-colors"><Facebook size={20} /></a>
                <a href="#" className="text-foreground hover:text-primary transition-colors"><Youtube size={20} /></a>
              </div>
              <p className="text-[9px] text-muted-foreground uppercase tracking-[0.4em] font-black leading-relaxed">
                Authentic Heritage · Curated for the Connoisseur
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
