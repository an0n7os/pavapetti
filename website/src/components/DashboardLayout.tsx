import { Link, useLocation } from "wouter";
import { LayoutDashboard, Package, Grid3X3, Home, ChevronRight } from "lucide-react";
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
];

export default function DashboardLayout({ children, title, subtitle }: DashboardLayoutProps) {
  const [location] = useLocation();

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

        <div className="p-4 border-t border-white/5 bg-black/30">
          <Link href="/">
            <div className="flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-[11px] font-black tracking-widest uppercase bg-white/5 hover:bg-white/10 text-white transition-all cursor-pointer border border-white/5">
              <Home size={14} className="text-primary" />
              View Gallery Store
            </div>
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar — Elegant Sandalwood Header */}
        <header className="bg-gradient-to-r from-[#f9f7f4] to-white border-b border-primary/5 px-8 py-5 flex items-center justify-between shadow-sm">
          <div>
            <h1 className="font-serif text-2xl font-light text-foreground">{title}</h1>
            {subtitle && <p className="text-xs text-muted-foreground/80 mt-1 uppercase tracking-wider font-semibold">{subtitle}</p>}
          </div>
          {/* Mobile nav */}
          <div className="flex md:hidden gap-2 bg-[#0a0a0a] p-1.5 rounded-full border border-white/5 shadow-md">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = location === href;
              return (
                <Link key={href} href={href}>
                  <div 
                    title={label}
                    className={`p-2.5 rounded-full transition-all ${active ? "text-primary bg-primary/10" : "text-white/40 hover:text-white/70"}`}
                  >
                    <Icon size={16} />
                  </div>
                </Link>
              );
            })}
          </div>
        </header>

        <main className="flex-1 p-8 bg-[#fdfcfb]">
          {children}
        </main>
      </div>
    </div>
  );
}
