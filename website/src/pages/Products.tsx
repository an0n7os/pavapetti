import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, X, Star } from "lucide-react";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import Magnetic from "@/components/Magnetic";
import { useListProducts, useListCategories, getListProductsQueryKey } from "@workspace/api-client-react";

export default function Products() {
  const [currentSearchStr, setCurrentSearchStr] = useState(
    () => typeof window !== "undefined" ? window.location.search : ""
  );

  useEffect(() => {
    const handleUrlChange = () => {
      setCurrentSearchStr(window.location.search);
    };

    window.addEventListener("popstate", handleUrlChange);

    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function (...args) {
      originalPushState.apply(this, args);
      handleUrlChange();
    };

    history.replaceState = function (...args) {
      originalReplaceState.apply(this, args);
      handleUrlChange();
    };

    return () => {
      window.removeEventListener("popstate", handleUrlChange);
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
    };
  }, []);

  const searchParams = new URLSearchParams(currentSearchStr);
  const initialCategory = searchParams.get("category") ?? "";
  const initialSearch = searchParams.get("search") ?? "";
  const initialFeatured = searchParams.get("featured") === "true" ? true : undefined;

  const [search, setSearch] = useState(initialSearch);
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [featuredOnly, setFeaturedOnly] = useState(initialFeatured);
  const [inputValue, setInputValue] = useState(initialSearch);

  // Sync state with URL search parameters on location or search query changes
  useEffect(() => {
    const params = new URLSearchParams(currentSearchStr);
    const category = params.get("category") ?? "";
    const searchVal = params.get("search") ?? "";
    const featured = params.get("featured") === "true" ? true : undefined;

    setActiveCategory(category);
    setSearch(searchVal);
    setInputValue(searchVal);
    setFeaturedOnly(featured);
  }, [currentSearchStr]);

  // Sync state changes back to the browser URL for deep-linking & smooth browser navigation
  useEffect(() => {
    const params = new URLSearchParams();
    if (activeCategory) params.set("category", activeCategory);
    if (search) params.set("search", search);
    if (featuredOnly) params.set("featured", "true");

    const newSearch = params.toString();
    const currentSearch = window.location.search.replace(/^\?/, "");
    if (newSearch !== currentSearch) {
      const newUrl = window.location.pathname + (newSearch ? `?${newSearch}` : "");
      window.history.replaceState(null, "", newUrl);
    }
  }, [activeCategory, search, featuredOnly]);



  const { data: categories } = useListCategories();
  const params = {
    ...(activeCategory ? { category: activeCategory } : {}),
    ...(search ? { search } : {}),
    ...(featuredOnly ? { featured: featuredOnly } : {}),
  };
  const { data: products, isLoading } = useListProducts(
    Object.keys(params).length > 0 ? params : undefined,
    { query: { queryKey: getListProductsQueryKey(Object.keys(params).length > 0 ? params : undefined) } }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(inputValue);
  };

  const clearFilters = () => {
    setSearch("");
    setInputValue("");
    setActiveCategory("");
    setFeaturedOnly(undefined);
  };

  const hasFilters = search || activeCategory || featuredOnly;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Page header — Editorial Sandalwood Gradient */}
      <div className="bg-gradient-to-b from-[#f9f7f4] to-[#f4f0ea] pt-28 pb-20 px-6 border-b border-primary/5">
        <div className="max-w-7xl mx-auto text-center relative">
          {/* Decorative Subtle Accent */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
            <span className="font-serif text-[12vw] text-primary/5 italic select-none">Heritage</span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10"
          >
            <p className="text-primary text-[10px] tracking-[0.6em] uppercase font-black mb-4">
              Our Collection
            </p>
            <h1 className="font-serif text-5xl md:text-7xl font-light text-foreground mb-6 tracking-tight leading-[1.15]">
              Explore <span className="italic text-primary">Masterpieces</span>
            </h1>
            <p className="text-muted-foreground/80 text-sm md:text-base font-light tracking-wide max-w-2xl mx-auto leading-relaxed">
              {isLoading ? "Loading collection..." : (
                <>
                  A handpicked collection of <strong className="text-foreground font-semibold">{products?.length ?? 0} authentic Kerala artifacts</strong>. 
                  Each piece represents generations of master-craftsman devotion and ancient geometries.
                </>
              )}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16">
        {/* Search + filters — Ultra Premium Layout */}
        <div className="flex flex-col gap-8 md:gap-12 mb-16">
          {/* Main Search Row */}
          <div className="flex flex-col lg:flex-row items-center gap-4 lg:gap-6 w-full">
            <form onSubmit={handleSearch} className="relative flex-1 w-full group">
              <Search size={16} className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-primary opacity-40 group-focus-within:opacity-80 transition-opacity" />
              <input
                placeholder="Search the archives..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full bg-[#f9f7f4] border border-primary/5 group-hover:border-primary/10 rounded-2xl py-4 md:py-5 pl-12 md:pl-14 pr-24 md:pr-32 text-xs md:text-sm tracking-wide focus:border-primary/30 focus:ring-1 focus:ring-primary/10 transition-all outline-none shadow-sm"
                data-testid="input-search"
              />
              <div className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2">
                <Magnetic>
                  <Button type="submit" className="bg-primary text-primary-foreground text-[9px] md:text-[10px] font-black tracking-widest uppercase px-4 md:px-6 py-2 md:py-2.5 rounded-xl h-auto hover:bg-primary/90 transition-all">
                    Search
                  </Button>
                </Magnetic>
              </div>
            </form>

            <div className="flex items-center gap-4 shrink-0 w-full lg:w-auto justify-end">
              <Magnetic>
                <Button
                  variant="outline"
                  onClick={() => setFeaturedOnly(featuredOnly ? undefined : true)}
                  className={`rounded-2xl border-primary/10 hover:border-primary/35 py-4 md:py-5 px-5 md:px-6 text-[9px] md:text-[10px] font-black tracking-widest uppercase transition-all shadow-sm h-auto ${featuredOnly ? "bg-primary text-primary-foreground border-primary" : "bg-white hover:bg-[#f9f7f4]"}`}
                  data-testid="button-filter-featured"
                >
                  <Star size={12} className={featuredOnly ? "fill-current mr-2" : "mr-2 text-primary"} />
                  {featuredOnly ? "Featured Pieces" : "Featured Only"}
                </Button>
              </Magnetic>
              
              {hasFilters && (
                <Magnetic>
                  <Button
                    variant="ghost"
                    onClick={clearFilters}
                    className="text-[9px] md:text-[10px] font-black tracking-widest uppercase text-muted-foreground hover:text-destructive py-4 md:py-5 px-4 h-auto"
                    data-testid="button-clear-filters"
                  >
                    Reset Archive
                  </Button>
                </Magnetic>
              )}
            </div>
          </div>

          {/* Category Navigation — Horizontal Luxury Pills with dissolving edge gradients */}
          <div className="relative w-full border-b border-primary/5 pb-4">
            {/* Left Edge Dissolve */}
            <div className="absolute left-0 top-0 bottom-4 w-12 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none opacity-40 md:opacity-100" />
            
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar scroll-smooth w-full px-6 md:px-0">
              <button
                onClick={() => setActiveCategory("")}
                className={`text-[9px] md:text-[10px] font-black tracking-[0.25em] uppercase whitespace-nowrap transition-all px-5 md:px-6 py-2.5 md:py-3 rounded-full ${
                  activeCategory === "" 
                    ? "bg-secondary text-secondary-foreground shadow-lg shadow-secondary/15" 
                    : "bg-[#f9f7f4] text-muted-foreground/60 hover:text-primary border border-primary/5 hover:border-primary/15"
                }`}
              >
                All Archive
              </button>
              {(Array.isArray(categories) ? categories : []).map((cat: any) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.name)}
                  className={`text-[9px] md:text-[10px] font-black tracking-[0.25em] uppercase whitespace-nowrap transition-all px-5 md:px-6 py-2.5 md:py-3 rounded-full ${
                    activeCategory === cat.name 
                      ? "bg-secondary text-secondary-foreground shadow-lg shadow-secondary/15" 
                      : "bg-[#f9f7f4] text-muted-foreground/60 hover:text-primary border border-primary/5 hover:border-primary/15"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Right Edge Dissolve */}
            <div className="absolute right-0 top-0 bottom-4 w-16 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
          </div>
        </div>

        {/* Active filter badges */}
        {hasFilters && (
          <motion.div 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-2 flex-wrap mb-10"
          >
            {search && (
              <Badge variant="secondary" className="gap-2 rounded-full px-4 py-2 border border-primary/10 bg-primary/5 text-primary text-xs font-medium">
                Search: <strong className="font-bold">"{search}"</strong>
              </Badge>
            )}
            {activeCategory && (
              <Badge variant="secondary" className="gap-2 rounded-full px-4 py-2 border border-primary/10 bg-primary/5 text-primary text-xs font-medium">
                Collection: <strong className="font-bold">{activeCategory}</strong>
              </Badge>
            )}
            {featuredOnly && (
              <Badge variant="secondary" className="gap-2 rounded-full px-4 py-2 border border-primary/10 bg-primary/5 text-primary text-xs font-medium">
                ⭐ <strong className="font-bold">Featured Items</strong>
              </Badge>
            )}
          </motion.div>
        )}

        {/* Products Grid — Luxury Spacing */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-16">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-6 animate-pulse">
                <div className="aspect-[4/5] bg-[#f9f7f4] rounded-[2rem] border border-primary/5" />
                <div className="px-2 space-y-3">
                  <div className="h-2 w-20 bg-primary/5 rounded-full" />
                  <div className="h-6 w-full bg-primary/5 rounded-lg" />
                  <div className="h-4 w-24 bg-primary/5 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : (Array.isArray(products) ? products : []).length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-32 bg-[#f9f7f4]/40 rounded-[3rem] border border-dashed border-primary/10 max-w-xl mx-auto"
          >
            <SlidersHorizontal size={40} className="mx-auto text-primary/30 mb-6" />
            <p className="font-serif text-2xl text-foreground mb-3 italic">Awaiting Restoration</p>
            <p className="text-xs text-muted-foreground/80 uppercase tracking-widest leading-relaxed max-w-xs mx-auto mb-8">
              No matching masterpieces are currently available in this section of our collection.
            </p>
            <Button onClick={clearFilters} variant="outline" className="rounded-full px-8 py-5 border-primary/10 hover:border-primary/30 hover:bg-[#f9f7f4] transition-all">
              Return to Main Archive
            </Button>
          </motion.div>
        ) : (
          <motion.div 
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.08
                }
              }
            }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-16"
          >
            {(Array.isArray(products) ? products : []).map((product: any, i: number) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </motion.div>
        )}
      </div>

      <Footer />
    </div>
  );
}
