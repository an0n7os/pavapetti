import { motion } from "framer-motion";
import { useWishlist } from "@/context/WishlistContext";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Heart } from "lucide-react";
import { Link } from "wouter";

export default function Wishlist() {
  const { items } = useWishlist();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <header className="mb-16 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/5 mb-6"
          >
            <Heart className="w-8 h-8 text-primary fill-primary/10" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-serif text-5xl md:text-6xl font-light mb-6"
          >
            My <span className="italic">Collection</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-lg max-w-xl mx-auto"
          >
            A list of saved heritage pieces you've selected for your collection.
          </motion.p>
        </header>

        {items.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 border border-dashed border-border/60 rounded-[3rem] bg-muted/30"
          >
            <p className="text-muted-foreground mb-8 text-lg">Your collection is currently empty.</p>
            <Link href="/products">
              <button className="bg-primary text-primary-foreground px-10 py-4 rounded-full text-xs font-bold tracking-[0.2em] uppercase hover:bg-primary/90 transition-all shadow-xl shadow-primary/20">
                Explore Artifacts
              </button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-16">
            {items.map((item, i) => (
              <ProductCard 
                key={item.productId} 
                product={{
                  id: item.productId,
                  name: item.name,
                  price: item.price,
                  imageUrl: item.imageUrl,
                  categoryName: item.categoryName,
                  description: "",
                  stock: 99, // Stock is assumed available from wishlist
                  isVisible: true,
                  createdAt: ""
                } as any} 
                index={i}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
