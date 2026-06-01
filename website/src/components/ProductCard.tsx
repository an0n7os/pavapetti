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

            {/* Tags */}
            <div className="absolute top-6 left-6 flex flex-col gap-2">
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

            {/* Quick Add Overlay — More prominent Add to Cart */}
            <div className="absolute inset-x-0 bottom-0 p-4 md:p-8 translate-y-0 opacity-100 md:translate-y-6 md:opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700 ease-[0.16, 1, 0.3, 1]">
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

          {/* Info */}
          <div className="mt-8 px-2">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1 min-h-[4rem]">
                <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-primary/70 mb-2 group-hover:text-primary transition-colors duration-500">
                  {product.categoryName || "Pavapetti Heritage"}
                </p>
                <h3 className="font-serif text-2xl font-light text-foreground transition-all duration-500 leading-tight">
                  {product.name}
                </h3>
                {/* Heritage Note */}
                <p className="text-[10px] italic text-muted-foreground/60 mt-2 font-serif">
                  {product.categoryName === "Pooja Category" ? "Ritual brass hand-cast in the traditions of Mannar" :
                   product.categoryName === "Elephant Heritage" ? "Sacred ornamentation celebrating the spirit of the Gajam" :
                   product.categoryName === "Chains and Bracelets" ? "Protective talismans crafted with ancient geometry" :
                   product.categoryName === "Miniatures & Mini Chenda" ? "Small-scale masterpieces preserving temple rhythms" :
                   product.categoryName === "Fragrances & Organic Soap" ? "Natural essences derived from the sacred groves" :
                   "A curated piece of Kerala's living heritage"}
                </p>
              </div>
              <div className="flex flex-col items-end">
                {product.mrp && product.mrp > product.price && (
                  <span className="text-[14px] font-light text-foreground/20 line-through tracking-tighter mb-1">
                    ₹{product.mrp.toLocaleString("en-IN")}
                  </span>
                )}
                <p className="text-[18px] font-bold text-primary tracking-tight">
                  ₹{product.price.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
            
            <div className="h-px w-0 group-hover:w-full bg-primary/10 mt-6 transition-all duration-1000 ease-[0.16, 1, 0.3, 1]" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
