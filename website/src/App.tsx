import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactLenis } from 'lenis/react';
import { motion, AnimatePresence, useScroll, useSpring as useFramerSpring } from "framer-motion";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import CartDrawer from "@/components/CartDrawer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Products from "@/pages/Products";
import ProductDetail from "@/pages/ProductDetail";
import Dashboard from "@/pages/Dashboard";
import DashboardProducts from "@/pages/DashboardProducts";
import DashboardCategories from "@/pages/DashboardCategories";
import Wishlist from "@/pages/Wishlist";
import Checkout from "@/pages/Checkout";
import MobileNav from "@/components/MobileNav";
import { useState, useEffect } from "react";
import PavapettiLogo from "./components/PavapettiLogo";

const queryClient = new QueryClient();
// Page Wrapper for smooth transitions

function PageWrapper({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();


  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <motion.div
      key={location}
      initial={{ opacity: 0, y: 10, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 1.01 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (localStorage.getItem("admin_auth") === "true") {
      setLocation("/dashboard");
    }
  }, [setLocation]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.toLowerCase() === "admin" && password === "pavapetti2026") {
      localStorage.setItem("admin_auth", "true");
      setLocation("/dashboard");
    } else {
      setError("Invalid administrative credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-[#111] p-10 rounded-[2.5rem] border border-white/5 shadow-2xl text-center"
      >
        <div className="mb-8 flex justify-center">
          <PavapettiLogo size={48} variant="dark" />
        </div>
        <h2 className="font-serif text-3xl text-white mb-2">Private Access</h2>
        <p className="text-white/40 text-[10px] tracking-[0.4em] uppercase font-black mb-8">Administrative Vault</p>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2 text-left">
            <label className="text-[9px] font-black tracking-[0.2em] uppercase text-white/30 ml-4">Curator ID</label>
            <input 
              type="text" 
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white placeholder:text-white/10 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
          <div className="space-y-2 text-left">
            <label className="text-[9px] font-black tracking-[0.2em] uppercase text-white/30 ml-4">Access Key</label>
            <input 
              type="password" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white placeholder:text-white/10 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all tracking-[0.3em]"
            />
          </div>
          
          {error && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-500 text-[10px] font-black uppercase tracking-widest pt-2"
            >
              {error}
            </motion.p>
          )}

          <button 
            type="submit"
            className="w-full mt-6 py-4 bg-primary text-white rounded-2xl font-black text-[11px] tracking-[0.4em] uppercase hover:bg-primary/90 transition-all shadow-xl shadow-primary/20"
          >
            Authorize Entry
          </button>
        </form>
      </motion.div>
    </div>
  );
}

function AdminGate({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  const isAuth = localStorage.getItem("admin_auth") === "true";

  useEffect(() => {
    if (!isAuth) {
      setLocation("/admin");
    }
  }, [isAuth, setLocation]);

  if (!isAuth) return null;
  return <>{children}</>;
}

function Router() {
  return (
    <AnimatePresence mode="wait">
      <Switch>
        <Route path="/">
          <PageWrapper><Home /></PageWrapper>
        </Route>
        <Route path="/products">
          <PageWrapper><Products /></PageWrapper>
        </Route>
        <Route path="/product/:id">
          <PageWrapper><ProductDetail /></PageWrapper>
        </Route>
        <Route path="/checkout">
          <PageWrapper><Checkout /></PageWrapper>
        </Route>
        <Route path="/admin">
          <PageWrapper><AdminLogin /></PageWrapper>
        </Route>
        
        {/* Protected Dashboard Routes */}
        <Route path="/dashboard">
          <AdminGate><PageWrapper><Dashboard /></PageWrapper></AdminGate>
        </Route>
        <Route path="/dashboard/products">
          <AdminGate><PageWrapper><DashboardProducts /></PageWrapper></AdminGate>
        </Route>
        <Route path="/dashboard/categories">
          <AdminGate><PageWrapper><DashboardCategories /></PageWrapper></AdminGate>
        </Route>

        <Route path="/wishlist">
          <PageWrapper><Wishlist /></PageWrapper>
        </Route>
        <Route>
          <PageWrapper><NotFound /></PageWrapper>
        </Route>
      </Switch>
    </AnimatePresence>
  );
}

function App() {
  return (
    <ReactLenis root options={{ lerp: 0.15, smoothWheel: true, wheelMultiplier: 1.2, touchMultiplier: 1.5 }}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WishlistProvider>
            <CartProvider>
              <div className="relative font-sans antialiased">
                {/* Ultra Premium Overlays */}
                <div className="noise-overlay" />
                
                <WouterRouter>
                  <Router />
                  <CartDrawer />
                  <FloatingWhatsApp />
                  <MobileNav />
                </WouterRouter>
                
                <Toaster />
              </div>
            </CartProvider>
          </WishlistProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ReactLenis>
  );
}

export default App;

