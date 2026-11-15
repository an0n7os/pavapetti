import { Link, useLocation } from "wouter";
import { LayoutDashboard, Package, Grid3X3, Home, ChevronRight, Database, Sparkles } from "lucide-react";
import PavapettiLogo from "./PavapettiLogo";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/products", label: "Products Archive", icon: Package },
  { href: "/dashboard/categories", label: "Categories", icon: Grid3X3 },
  { href: "/dashboard/art-forms", label: "Art Forms", icon: Sparkles },
  { href: "/dashboard/backup", label: "Backup & Restore", icon: Database },
];


export default function DashboardLayout({ children, title, subtitle }: DashboardLayoutProps) {
  const [location] = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("admin_auth");
    window.location.href = "/admin";
  };

  return (
    <div className="min-h-screen bg-background flex font-sans">
      {/* Sidebar — Luxury Volcanic Dark Mode */}
      <aside className="w-64 bg-[#0a0a0a] border-r border-white/5 flex-shrink-0 hidden md:flex flex-col text-white/70">
        <div className="p-6 border-b border-white/5">
          <Link href="/">
            <PavapettiLogo size={32} variant="dark" className="!gap-3" />
          </Link>
          <p className="text-[9px] text-primary/80 mt-3 uppercase tracking-[0.25em] font-black">
            Administrative Vault
          </p>
        </div>

        <nav className="flex-1 py-6 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = location === href || (href !== "/dashboard" && location.startsWith(href));
            return (
              <Link key={href} href={href}>
                <div
                  className={`flex items-center gap-4 px-6 py-3.5 text-[13px] font-bold tracking-wide transition-all cursor-pointer border-l-4 ${
                    active
                      ? "bg-primary/10 text-white border-primary"
                      : "text-white/40 border-transparent hover:bg-white/5 hover:text-white/80"
                  }`}
                  data-testid={`nav-${label.toLowerCase()}`}
                >
                  <Icon size={16} className={active ? "text-primary" : "text-white/20 group-hover:text-white/40"} />
                  {label}
                  {active && <ChevronRight size={14} className="ml-auto text-primary" />}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5 bg-black/30 space-y-2">
          <Link href="/">
            <div className="flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-[11px] font-black tracking-widest uppercase bg-white/5 hover:bg-white/10 text-white transition-all cursor-pointer border border-white/5">
              <Home size={14} className="text-primary" />
              View Gallery Store
            </div>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-[11px] font-black tracking-widest uppercase bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all cursor-pointer border border-red-500/10"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0 max-w-full overflow-x-hidden">
        {/* Top bar — Elegant Sandalwood Header */}
        <header className="bg-gradient-to-r from-[#f9f7f4] to-white border-b border-primary/5 px-3 sm:px-8 py-3 sm:py-5 flex items-center justify-between shadow-xs min-w-0">
          <div className="min-w-0 pr-2">
            <h1 className="font-serif text-lg sm:text-2xl font-light text-foreground truncate">{title}</h1>
            {subtitle && <p className="text-[10px] sm:text-xs text-muted-foreground/80 mt-0.5 sm:mt-1 uppercase tracking-wider font-semibold truncate">{subtitle}</p>}
          </div>

          {/* Quick Header Actions: View Store + Logout */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <Link href="/">
              <div
                title="View Gallery Store"
                aria-label="View Gallery Store"
                className="h-8 sm:h-9 px-2 sm:px-3 rounded-xl flex items-center gap-1.5 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors border border-stone-200/60 cursor-pointer"
              >
                <Home size={14} className="text-primary shrink-0" />
                <span className="hidden sm:inline">Store</span>
              </div>
            </Link>

            <button
              onClick={handleLogout}
              title="Sign Out"
              aria-label="Sign out"
              className="h-8 sm:h-9 px-2 sm:px-3 rounded-xl flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200/60 transition-colors cursor-pointer"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </header>

        {/* Mobile Horizontal Navigation Tabs (Full Visibility & Easy Swiping) */}
        <nav
          aria-label="Mobile dashboard navigation"
          className="md:hidden flex items-center gap-1.5 px-2.5 py-2 bg-[#0e0c0a] border-b border-white/10 overflow-x-auto scrollbar-none sticky top-0 z-30 shadow-md w-full max-w-full"
        >
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = location === href || (href !== "/dashboard" && location.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                aria-label={label}
                aria-current={active ? "page" : undefined}
                className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 ${
                  active
                    ? "bg-primary text-white shadow-xs"
                    : "text-white/60 hover:text-white bg-white/5"
                }`}
              >
                <Icon size={14} className={active ? "text-white" : "text-primary/80"} />
                <span>{label.replace(" Archive", "").replace(" & Restore", "")}</span>
              </Link>
            );
          })}
        </nav>

        <main className="flex-1 p-3 sm:p-6 lg:p-8 bg-[#fdfcfb] min-w-0 max-w-full overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
