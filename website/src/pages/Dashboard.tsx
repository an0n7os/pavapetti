import { Link } from "wouter";
import { motion } from "framer-motion";
import { Package, Grid3X3, Star, AlertTriangle, Plus, ArrowRight, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/DashboardLayout";
import { useGetDashboardStats } from "@workspace/api-client-react";

function StatCard({ title, value, icon: Icon }: { title: string; value: number; icon: any }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="bg-gradient-to-br from-[#f9f7f4] to-[#f4f0ea] p-8 rounded-[2rem] border border-primary/5 hover:border-primary/20 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-500 group relative overflow-hidden">
        {/* Subtle bottom accent line in gold */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-primary/10 group-hover:bg-primary transition-colors duration-500" />
        
        <div className="flex items-center justify-between mb-5">
          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 border border-primary/5">
            <Icon size={18} className="text-primary" />
          </div>
        </div>
        <p className="text-[9px] text-muted-foreground/80 font-black uppercase tracking-[0.25em] mb-2">{title}</p>
        <p className="text-5xl font-serif font-light text-primary tracking-tight leading-none" data-testid={`stat-${title.toLowerCase().replace(/\s/g, "-")}`}>
          {value}
        </p>
      </div>
    </motion.div>
  );
}

export default function Dashboard() {
  const { data: stats, isLoading } = useGetDashboardStats();

  return (
    <DashboardLayout title="Heritage Control" subtitle="Oversee your curated collections and store activity">
      <div className="mb-8 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Live Heritage Feed</span>
      </div>
      {/* Stats — Premium Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-44 bg-[#f9f7f4] rounded-[1.5rem] animate-pulse" />
          ))
        ) : (
          <>
            <StatCard title="Total Pieces" value={stats?.totalProducts ?? 0} icon={Package} />
            <StatCard title="Categories" value={stats?.totalCategories ?? 0} icon={Grid3X3} />
            <StatCard title="Featured Items" value={stats?.featuredProducts ?? 0} icon={Star} />
            <StatCard title="Restock Alert" value={stats?.lowStockProducts ?? 0} icon={AlertTriangle} />
          </>
        )}
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Quick actions — Left Panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-8 rounded-[2rem] border border-primary/5 shadow-sm hover:shadow-md transition-all duration-500">
            <h4 className="font-serif text-xl mb-6">Quick Management</h4>
            <div className="space-y-4">
              <Link href="/dashboard/products" className="group block">
                <div className="w-full flex items-center justify-between p-4 rounded-2xl border border-primary/5 bg-[#fdfcfb] hover:bg-primary/5 hover:border-primary/20 hover:shadow-md transition-all duration-300 cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white border border-primary/5 flex items-center justify-center text-primary transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm">
                      <Package size={16} />
                    </div>
                    <span className="text-[13px] font-bold text-foreground group-hover:text-primary transition-colors">Manage Inventory</span>
                  </div>
                  <ArrowRight size={14} className="text-primary/40 group-hover:text-primary group-hover:translate-x-1.5 transition-all duration-300" />
                </div>
              </Link>

              <Link href="/dashboard/categories" className="group block">
                <div className="w-full flex items-center justify-between p-4 rounded-2xl border border-primary/5 bg-[#fdfcfb] hover:bg-primary/5 hover:border-primary/20 hover:shadow-md transition-all duration-300 cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white border border-primary/5 flex items-center justify-center text-primary transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm">
                      <Grid3X3 size={16} />
                    </div>
                    <span className="text-[13px] font-bold text-foreground group-hover:text-primary transition-colors">Edit Categories</span>
                  </div>
                  <ArrowRight size={14} className="text-primary/40 group-hover:text-primary group-hover:translate-x-1.5 transition-all duration-300" />
                </div>
              </Link>

              <Link href="/dashboard/products" className="group block">
                <div className="w-full flex items-center justify-between p-4 rounded-2xl border border-primary bg-primary hover:bg-primary/95 text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white transition-all duration-500 group-hover:scale-110 shadow-inner">
                      <Plus size={16} />
                    </div>
                    <span className="text-[13px] font-black tracking-widest uppercase">Add New Treasure</span>
                  </div>
                  <ArrowRight size={14} className="text-white/60 group-hover:text-white group-hover:translate-x-1.5 transition-all duration-300" />
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Products — Right Panel */}
        <div className="lg:col-span-8">
          <div className="bg-white p-8 rounded-[2rem] border border-primary/5 shadow-sm hover:shadow-md transition-all duration-500">
            <div className="flex items-center justify-between mb-8">
              <h4 className="font-serif text-xl">Recent Additions</h4>
              <Link href="/dashboard/products">
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline cursor-pointer">View Entire Collection</span>
              </Link>
            </div>
            
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (stats?.recentProducts ?? []).length === 0 ? (
              <div className="text-center py-12 bg-[#f9f7f4] rounded-xl">
                <p className="text-sm text-muted-foreground italic">No products added recently</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {(stats?.recentProducts ?? []).map((p: any) => (
                  <div key={p.id} className="group flex items-center justify-between p-4 rounded-2xl hover:bg-[#f9f7f4] transition-all duration-300 border border-transparent hover:border-border/50" data-testid={`recent-product-${p.id}`}>
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl overflow-hidden shadow-sm">
                        <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{p.name}</p>
                        <p className="text-xs text-muted-foreground font-light">₹{p.price.toLocaleString("en-IN")}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {p.featured && <Badge className="bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-tighter px-3 py-1">Featured</Badge>}
                      <ChevronRight size={16} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-all" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
