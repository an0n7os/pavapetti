import { Link } from "wouter";
import { motion } from "framer-motion";
import { ShoppingBag, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@workspace/api-client-react";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addItem: addToCart, isInCart, openCart } = useCart();
  const { toggleItem, isWishlisted } = useWishlist();
  const { toast } = useToast();
  const inCart = isInCart(product.id);
  const wishlisted = isWishlisted(product.id);

  if (!product) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ 
        duration: 0.8, 
        delay: index * 0.1,
        ease: [0.16, 1, 0.3, 1]
      }}
      className="group relative"
      data-testid={`product-card-${product.id}`}
    >
      <Link href={`/product/${product.id}`}>
        <div className="relative flex flex-col cursor-pointer">
          {/* Image Container — Refined with subtle border instead of heavy shadow */}
          <div 
            className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-[#f9f7f4] border border-primary/5 group-hover:border-primary/20 transition-colors duration-700 spotlight-card"
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;
              e.currentTarget.style.setProperty("--mouse-x", `${x}px`);
              e.currentTarget.style.setProperty("--mouse-y", `${y}px`);
            }}
          >
            {/* Spotlight Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_var(--mouse-x)_var(--mouse-y),rgba(var(--primary-rgb),0.1),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            
            {/* Soft Ambient Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(var(--primary-rgb),0.03),transparent)] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <motion.img
              src={product.imageUrl}
              alt={product.name}
              onLoad={(e) => (e.currentTarget.style.opacity = "1")}
              onError={(e) => {
                e.currentTarget.src = "https://images.unsplash.com/photo-1582234372483-42174d568bc5?auto=format&fit=crop&q=80&w=800"; // Fallback: Kerala boat/culture
                e.currentTarget.style.opacity = "1";
              }}
              style={{ opacity: 0 }}
              className="h-full w-full object-cover transition-all duration-[1.5s] ease-[0.16, 1, 0.3, 1] group-hover:scale-110"
            />

            {/* Hover Overlay — Darkens slightly to make buttons pop */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-700 pointer-events-none flex items-center justify-center">
              <span className="text-white text-[10px] font-black tracking-[1em] uppercase opacity-0 group-hover:opacity-100 transition-all duration-1000 translate-y-4 group-hover:translate-y-0">View Piece</span>
            </div>

            {/* Favorite Button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
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
              }}
              className="absolute top-6 right-6 z-20 p-2.5 rounded-full bg-white/80 backdrop-blur-md border border-white/40 shadow-sm hover:scale-110 active:scale-95 transition-all duration-300 group/fav"
            >
              <Heart 
                className={`w-4 h-4 transition-colors duration-300 ${wishlisted ? "fill-primary text-primary" : "text-primary/40 group-hover/fav:text-primary"}`} 
              />
            </button>

            {/* Tags — Responsive (Hidden on mobile for pure clean visual catalog look) */}
            <div className="hidden md:flex absolute top-6 left-6 flex-col gap-2">
              {product.isNewArrival && (
                <div className="bg-white/90 backdrop-blur-md px-4 py-1 rounded-full border border-white/40 shadow-sm">
                  <p className="text-[9px] font-black tracking-[0.3em] uppercase text-primary">New Arrival</p>
                </div>
              )}
              {product.featured && (
                <div className="bg-white/90 px-4 py-1 rounded-full shadow-lg backdrop-blur-md border border-white/20">
                  <p className="text-[9px] font-black tracking-[0.3em] uppercase text-black">Curated Piece</p>
                </div>
              )}
            </div>

            {/* Quick Add Overlay — More prominent Add to Cart on Desktop */}
            <div className="hidden md:block absolute inset-x-0 bottom-0 p-8 translate-y-6 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700 ease-[0.16, 1, 0.3, 1]">
              <Button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!inCart) {
                    addToCart({
                      productId: product.id,
                      name: product.name,
                      price: product.price,
                      imageUrl: product.imageUrl,
                      categoryName: product.categoryName ?? undefined,
                    });
                    toast({
                      title: "Added to Cart",
                      description: `${product.name} is now in your collection.`,
                    });
                  } else {
                    openCart(); // Open cart if already in cart
                  }
                }}
                data-cursor="cart"
                className={`w-full ${inCart ? "bg-primary text-white" : "bg-white text-foreground"} hover:scale-[1.02] active:scale-[0.98] rounded-full py-4 text-[11px] font-bold tracking-[0.25em] uppercase shadow-2xl transition-all duration-500 flex items-center justify-center gap-2`}
              >
                <ShoppingBag size={14} className={inCart ? "animate-bounce" : ""} />
                {inCart ? "In Your Cart" : "Add to Cart"}
              </Button>
            </div>
          </div>

          {/* Info — Premium Responsive Layout */}
          <div className="mt-4 md:mt-8 px-1 md:px-2">
            <p className="text-[8px] md:text-[10px] font-bold tracking-[0.2em] md:tracking-[0.4em] uppercase text-primary/70 mb-1 md:mb-2 group-hover:text-primary transition-colors duration-500">
              {product.categoryName || "Pavapetti Heritage"}
            </p>
            
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-1 md:gap-4">
              <h3 className="font-serif text-base md:text-2xl font-light text-foreground transition-all duration-500 leading-tight flex-1">
                {product.name}
              </h3>
              
              <div className="flex flex-row md:flex-col items-baseline md:items-end gap-1.5 md:gap-1 mt-1 md:mt-0 shrink-0">
                {product.mrp && product.mrp > product.price && (
                  <span className="text-[11px] md:text-[14px] font-light text-foreground/20 line-through tracking-tighter">
                    ₹{product.mrp.toLocaleString("en-IN")}
                  </span>
                )}
                <p className="text-[14px] md:text-[18px] font-bold text-primary tracking-tight">
                  ₹{product.price.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
            
            <div className="h-px w-0 group-hover:w-full bg-primary/10 mt-4 md:mt-6 transition-all duration-1000 ease-[0.16, 1, 0.3, 1]" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
