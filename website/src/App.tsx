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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Cache queries for 5 minutes
      refetchOnWindowFocus: false, // Prevent refetching when window is focused
      retry: 1, // Limit retries to prevent long hangs on network errors
    },
  },
});
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

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 10 * 60 * 1000; // 10 minutes
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

function getLoginLockout(): { count: number; lockedUntil: number } {
  try {
    const raw = localStorage.getItem("_login_guard");
    if (raw) return JSON.parse(raw);
  } catch {}
  return { count: 0, lockedUntil: 0 };
}
function setLoginLockout(data: { count: number; lockedUntil: number }) {
  localStorage.setItem("_login_guard", JSON.stringify(data));
}

function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [lockRemaining, setLockRemaining] = useState(0);
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (localStorage.getItem("admin_auth") === "true") {
      setLocation("/dashboard");
    }
    // Check if currently locked out
    const guard = getLoginLockout();
    if (guard.lockedUntil > Date.now()) {
      const remaining = Math.ceil((guard.lockedUntil - Date.now()) / 1000);
      setLockRemaining(remaining);
    }
  }, [setLocation]);

  // Countdown timer for lockout
  useEffect(() => {
    if (lockRemaining <= 0) return;
    const timer = setInterval(() => {
      setLockRemaining(prev => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [lockRemaining]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const guard = getLoginLockout();
    // Check lockout
    if (guard.lockedUntil > Date.now()) {
      const mins = Math.ceil((guard.lockedUntil - Date.now()) / 60000);
      setError(`Too many attempts. Try again in ${mins} minute${mins > 1 ? "s" : ""}.`);
      return;
    }
    setLoading(true);
    setError("");
    setTimeout(() => {
      if (username.toLowerCase() === "admin" && password === "pavapetti2026") {
        setLoginLockout({ count: 0, lockedUntil: 0 });
        localStorage.setItem("admin_auth", "true");
        localStorage.setItem("admin_session_start", Date.now().toString());
        setLocation("/dashboard");
      } else {
        const newCount = guard.count + 1;
        const lockedUntil = newCount >= MAX_ATTEMPTS ? Date.now() + LOCKOUT_MS : 0;
        setLoginLockout({ count: newCount, lockedUntil });
        if (lockedUntil > 0) {
          setLockRemaining(Math.ceil(LOCKOUT_MS / 1000));
          setError(`Account locked for 10 minutes after ${MAX_ATTEMPTS} failed attempts.`);
        } else {
          setError(`Invalid credentials. ${MAX_ATTEMPTS - newCount} attempt${MAX_ATTEMPTS - newCount !== 1 ? "s" : ""} remaining.`);
        }
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen flex bg-[#060604]" style={{ fontFamily: "'Manrope', sans-serif" }}>
      {/* Left – Brand Panel */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="hidden lg:flex flex-col justify-between w-1/2 relative overflow-hidden px-16 py-14"
        style={{
          background: "linear-gradient(135deg, #0e0b07 0%, #1a1208 50%, #0e0c08 100%)",
          borderRight: "1px solid rgba(255,255,255,0.04)"
        }}
      >
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div style={{
            position: "absolute", top: "20%", left: "30%",
            width: 400, height: 400, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(193,131,38,0.12) 0%, transparent 70%)",
            filter: "blur(60px)"
          }} />
          <div style={{
            position: "absolute", bottom: "15%", right: "10%",
            width: 300, height: 300, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(193,131,38,0.06) 0%, transparent 70%)",
            filter: "blur(80px)"
          }} />
        </div>

        {/* Decorative lines */}
        <div className="absolute left-0 top-0 h-full w-px" style={{ background: "linear-gradient(to bottom, transparent, rgba(193,131,38,0.3), transparent)" }} />

        {/* Top logo */}
        <div className="relative z-10">
          <PavapettiLogo size={52} variant="dark" />
        </div>

        {/* Middle – brand story */}
        <div className="relative z-10 space-y-8">
          <div>
            <p className="text-[10px] tracking-[0.5em] uppercase font-black mb-4" style={{ color: "rgba(193,131,38,0.7)" }}>
              Curator's Vault
            </p>
            <h1 className="font-serif text-5xl xl:text-6xl leading-tight" style={{ color: "#f5f0e8" }}>
              The Archive<br />
              <span className="italic" style={{ color: "rgba(193,131,38,0.9)" }}>Awaits</span>
            </h1>
          </div>
          <p className="text-sm leading-relaxed max-w-sm" style={{ color: "rgba(255,255,255,0.35)", fontWeight: 300 }}>
            This is the private administrative vault of Pavapetti Heritage Artifacts — where every artifact, category, and story is curated with devotion.
          </p>
          <div className="flex items-center gap-3">
            <div className="h-px w-8" style={{ background: "rgba(193,131,38,0.5)" }} />
            <span className="text-[9px] tracking-[0.4em] uppercase font-black" style={{ color: "rgba(193,131,38,0.5)" }}>
              Authorized Personnel Only
            </span>
          </div>
        </div>

        {/* Bottom tagline */}
        <div className="relative z-10">
          <p className="text-[9px] tracking-[0.3em] uppercase font-bold" style={{ color: "rgba(255,255,255,0.15)" }}>
            Pavapetti Heritage Artifacts · Cheruthuruthy, Kerala
          </p>
        </div>
      </motion.div>

      {/* Right – Login Card */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        className="flex-1 flex items-center justify-center px-6 py-14"
        style={{ background: "#060604" }}
      >
        <div className="w-full max-w-md space-y-10">

          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-2">
            <PavapettiLogo size={44} variant="dark" />
          </div>

          {/* Header */}
          <div className="space-y-2">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-[9px] tracking-[0.5em] uppercase font-black"
              style={{ color: "rgba(193,131,38,0.7)" }}
            >
              Administrative Access
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="font-serif text-4xl"
              style={{ color: "#f5f0e8" }}
            >
              Sign In
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-sm"
              style={{ color: "rgba(255,255,255,0.3)", fontWeight: 300 }}
            >
              Enter your credentials to access the curator's dashboard.
            </motion.p>
          </div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            onSubmit={handleLogin}
            className="space-y-5"
          >
            {/* Username */}
            <div className="space-y-2">
              <label className="block text-[9px] font-black tracking-[0.3em] uppercase" style={{ color: "rgba(255,255,255,0.3)" }}>
                Curator ID
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  placeholder="admin"
                  value={username}
                  autoComplete="username"
                  onChange={(e) => setUsername(e.target.value)}
                  style={{
                    width: "100%", boxSizing: "border-box",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 16, padding: "16px 20px",
                    color: "#f5f0e8", fontSize: 14,
                    outline: "none", transition: "all 0.2s",
                    fontFamily: "'Manrope', sans-serif"
                  }}
                  onFocus={(e) => { e.target.style.borderColor = "rgba(193,131,38,0.5)"; e.target.style.background = "rgba(193,131,38,0.05)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; e.target.style.background = "rgba(255,255,255,0.04)"; }}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="block text-[9px] font-black tracking-[0.3em] uppercase" style={{ color: "rgba(255,255,255,0.3)" }}>
                Access Key
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••••••"
                  value={password}
                  autoComplete="current-password"
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: "100%", boxSizing: "border-box",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 16, padding: "16px 56px 16px 20px",
                    color: "#f5f0e8", fontSize: 14, letterSpacing: showPass ? "normal" : "0.25em",
                    outline: "none", transition: "all 0.2s",
                    fontFamily: "'Manrope', sans-serif"
                  }}
                  onFocus={(e) => { e.target.style.borderColor = "rgba(193,131,38,0.5)"; e.target.style.background = "rgba(193,131,38,0.05)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; e.target.style.background = "rgba(255,255,255,0.04)"; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer",
                    color: "rgba(255,255,255,0.3)", fontSize: 12, fontWeight: 700,
                    letterSpacing: "0.1em", textTransform: "uppercase"
                  }}
                >
                  {showPass ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Lockout countdown */}
            {lockRemaining > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.2)",
                  borderRadius: 12, padding: "12px 16px",
                  color: "#f87171", fontWeight: 700,
                  textAlign: "center"
                }}
              >
                <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>🔒 Account Temporarily Locked</p>
                <p style={{ fontSize: 22, fontWeight: 900, fontFamily: "monospace", letterSpacing: "0.1em" }}>
                  {String(Math.floor(lockRemaining / 60)).padStart(2, "0")}:{String(lockRemaining % 60).padStart(2, "0")}
                </p>
                <p style={{ fontSize: 10, color: "rgba(248,113,113,0.6)", marginTop: 4 }}>Try again when the timer expires</p>
              </motion.div>
            )}

            {/* Error */}
            {error && lockRemaining === 0 && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.2)",
                  borderRadius: 12, padding: "10px 16px",
                  color: "#f87171", fontSize: 11, fontWeight: 700,
                  textTransform: "uppercase", letterSpacing: "0.1em", textAlign: "center"
                }}
              >
                {error}
              </motion.div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || lockRemaining > 0}
              style={{
                width: "100%", padding: "18px",
                background: loading ? "rgba(193,131,38,0.4)" : "linear-gradient(135deg, #c18326, #e6a832)",
                border: "none", borderRadius: 16,
                color: loading ? "rgba(255,255,255,0.5)" : "#0a0a0a",
                fontSize: 11, fontWeight: 900,
                letterSpacing: "0.35em", textTransform: "uppercase",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.3s",
                boxShadow: loading ? "none" : "0 8px 32px rgba(193,131,38,0.3)",
                fontFamily: "'Manrope', sans-serif"
              }}
              onMouseEnter={(e) => { if (!loading) (e.target as HTMLButtonElement).style.transform = "translateY(-1px)"; }}
              onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.transform = "translateY(0)"; }}
            >
              {loading ? "Verifying..." : "Authorize Entry"}
            </button>
          </motion.form>

          {/* Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center text-[9px] tracking-[0.3em] uppercase font-bold"
            style={{ color: "rgba(255,255,255,0.1)" }}
          >
            Pavapetti Heritage Artifacts · Private Access
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}

function AdminGate({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  const isAuth = localStorage.getItem("admin_auth") === "true";

  // Session timeout — auto-logout after 30 min inactivity
  useEffect(() => {
    if (!isAuth) return;

    const checkSession = () => {
      const sessionStart = parseInt(localStorage.getItem("admin_session_start") || "0");
      const lastActive = parseInt(localStorage.getItem("admin_last_active") || sessionStart.toString());
      if (Date.now() - lastActive > SESSION_TIMEOUT_MS) {
        localStorage.removeItem("admin_auth");
        localStorage.removeItem("admin_session_start");
        localStorage.removeItem("admin_last_active");
        setLocation("/admin");
      }
    };

    const updateActivity = () => {
      localStorage.setItem("admin_last_active", Date.now().toString());
    };

    // Update activity on any user interaction
    window.addEventListener("mousemove", updateActivity);
    window.addEventListener("keydown", updateActivity);
    window.addEventListener("click", updateActivity);
    window.addEventListener("touchstart", updateActivity);

    // Check session every 60 seconds
    const interval = setInterval(checkSession, 60 * 1000);
    checkSession(); // check immediately on mount

    return () => {
      window.removeEventListener("mousemove", updateActivity);
      window.removeEventListener("keydown", updateActivity);
      window.removeEventListener("click", updateActivity);
      window.removeEventListener("touchstart", updateActivity);
      clearInterval(interval);
    };
  }, [isAuth, setLocation]);

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

