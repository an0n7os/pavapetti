import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Truck, ShieldCheck, RefreshCw, PackageCheck, AlertTriangle, Clock } from "lucide-react";

export default function ShippingReturns() {
  return (
    <div className="min-h-screen bg-[#fcfbfa] text-foreground flex flex-col font-sans">
      <Navbar />

      {/* Hero Header */}
      <section className="bg-[#0c0b0a] text-white pt-16 pb-16 md:pt-24 md:pb-20 relative overflow-hidden border-b border-amber-500/10">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[350px] rounded-full bg-amber-500/10 blur-[140px]" />
        </div>
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-widest"
          >
            <Truck size={14} />
            <span>Fragile Care &amp; Delivery</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-serif text-4xl sm:text-5xl font-light text-[#fefdfa]"
          >
            Shipping &amp; Return Policy
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/60 text-sm max-w-xl mx-auto font-serif italic"
          >
            Delivering delicate Kerala heritage artifacts worldwide with custom multi-layer velvet and wooden crate packaging.
          </motion.p>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-16 space-y-12 flex-1">
        <div className="bg-white rounded-3xl p-8 md:p-12 border border-border/60 shadow-sm space-y-10">
          
          {/* Packaging standard */}
          <div className="space-y-4">
            <h2 className="font-serif text-2xl font-semibold text-foreground flex items-center gap-3">
              <PackageCheck className="text-primary shrink-0" size={24} />
              Heritage Packaging &amp; Transit Protection
            </h2>
            <p className="text-sm text-foreground/80 leading-relaxed font-sans font-normal">
              Every artifact at Pavapetti—especially sensitive metallic <strong>Aranmula Metal Mirrors (ആറന്മുളക്കണ്ണാടി)</strong>, teakwood <strong>Nettoor Boxes</strong>, and hand-cast <strong>Nilavilakku lamps</strong>—is packaged with 5-tier protective layers:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="bg-[#f8f6f0] p-4 rounded-2xl border border-border/50 text-xs font-medium space-y-1">
                <span className="text-primary font-bold">1. Inner Velvet Wrap</span>
                <p className="text-muted-foreground">Scratches &amp; dust protection</p>
              </div>
              <div className="bg-[#f8f6f0] p-4 rounded-2xl border border-border/50 text-xs font-medium space-y-1">
                <span className="text-primary font-bold">2. High-density Foam Shock-Absorbers</span>
                <p className="text-muted-foreground">Custom molded corner blocks</p>
              </div>
              <div className="bg-[#f8f6f0] p-4 rounded-2xl border border-border/50 text-xs font-medium space-y-1">
                <span className="text-primary font-bold">3. Multi-layer Bubble Cushioning</span>
                <p className="text-muted-foreground">Impact resistance</p>
              </div>
              <div className="bg-[#f8f6f0] p-4 rounded-2xl border border-border/50 text-xs font-medium space-y-1">
                <span className="text-primary font-bold">4. Heavy Corrugated / Wooden Crate</span>
                <p className="text-muted-foreground">Exterior structural armor</p>
              </div>
            </div>
          </div>

          {/* Delivery Timelines */}
          <div className="space-y-4">
            <h2 className="font-serif text-2xl font-semibold text-foreground flex items-center gap-3">
              <Clock className="text-primary shrink-0" size={24} />
              Shipping Timelines &amp; Charges
            </h2>
            <div className="space-y-3 text-sm text-foreground/80 leading-relaxed font-sans">
              <p>
                - <strong>Domestic India Shipping:</strong> Dispatched within 2-3 business days. Delivery typically takes 4–7 business days via express courier.
              </p>
              <p>
                - <strong>International Shipping:</strong> We ship to USA, UK, UAE, Australia, and 40+ countries. Delivery takes 7–12 business days via air cargo.
              </p>
              <p>
                - <strong>Custom Masterpieces:</strong> Custom carved wooden idols or bespoke Nettoor boxes may require 10–14 days crafting time prior to dispatch.
              </p>
            </div>
          </div>

          {/* Damages & Replacement Policy */}
          <div className="space-y-4">
            <h2 className="font-serif text-2xl font-semibold text-foreground flex items-center gap-3">
              <RefreshCw className="text-primary shrink-0" size={24} />
              Transit Damage Guarantee &amp; Replacement
            </h2>
            <p className="text-sm text-foreground/80 leading-relaxed font-sans">
              In the rare event that your artifact arrives damaged during transit:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-xs text-foreground/80 font-medium pl-2">
              <li>Please record an <strong>unboxing video</strong> when opening the package.</li>
              <li>Notify our team within <strong>48 hours</strong> of delivery via WhatsApp (+91 92920 16901) or email (curator@pavapetti.com).</li>
              <li>We will issue a <strong>free replacement</strong> or immediate full refund upon verification.</li>
            </ol>
          </div>

          {/* Non-returnable items */}
          <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-4">
            <AlertTriangle size={22} className="text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs text-foreground/85">
              <span className="font-bold text-amber-800 uppercase tracking-wider">Note on Returns:</span>
              <p>
                Because our items are handcrafted heirloom pieces, returns due to minor natural handmade variations or change of mind are not accepted. However, damaged or defective shipments are 100% covered under our replacement guarantee.
              </p>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
