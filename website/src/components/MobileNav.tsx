import { Link, useLocation } from "wouter";
import { Home, ShoppingBag, Heart, User, Search, LayoutDashboard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

export default function MobileNav() {
  const [location] = useLocation();
  const { count } = useCart();
  const { count: wishlistCount } = useWishlist();

  const isDashboard = location.startsWith("/dashboard");
  const isAuth = localStorage.getItem("admin_auth") === "true";

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/products", label: "Shop", icon: ShoppingBag },
    { href: "/wishlist", label: "Favorites", icon: Heart, badge: wishlistCount },
    { href: isAuth ? "/dashboard" : "/admin", label: isAuth ? "Admin" : "Login", icon: isAuth ? LayoutDashboard : User },
  ];

  if (isDashboard) return null;

  return (
    <div 
      className="md:hidden fixed left-1/2 -translate-x-1/2 z-[60] w-[92%] max-w-sm"
      style={{ bottom: `calc(env(safe-area-inset-bottom) + 2.5rem)` }}
    >
      <div className="glass-premium rounded-full border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.1)] px-3 py-2 flex items-center justify-between">
        {navItems.map(({ href, label, icon: Icon, badge }) => {
          const active = location === href || (href !== "/" && location.startsWith(href));
          return (
            <Link key={href} href={href}>
              <div className="relative flex flex-col items-center justify-center min-w-[64px] py-1">
                <motion.div
                  animate={active ? { scale: 1.1, y: -2 } : { scale: 1, y: 0 }}
                  className={`p-2 rounded-full transition-colors ${
                    active ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-primary"
                  }`}
                >
                  <Icon size={20} strokeWidth={active ? 2.5 : 2} />
                  
                  {badge !== undefined && badge > 0 && !active && (
                    <span className="absolute top-1 right-3 bg-primary text-white text-[9px] font-black min-w-[14px] min-h-[14px] rounded-full flex items-center justify-center shadow-sm">
                      {badge}
                    </span>
                  )}
                </motion.div>
                <AnimatePresence>
                  {active && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      className="text-[9px] font-black uppercase tracking-widest mt-1 text-primary"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
