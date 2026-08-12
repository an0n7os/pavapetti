import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Scale, AlertCircle } from "lucide-react";

export default function Terms() {
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
            <Scale size={14} />
            <span>Legal Framework</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-serif text-4xl sm:text-5xl font-light text-[#fefdfa]"
          >
            Terms &amp; Conditions
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/60 text-sm max-w-xl mx-auto font-serif italic"
          >
            Please read these terms carefully before exploring or placing orders with Pavapetti Heritage Artifacts.
          </motion.p>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-16 space-y-12 flex-1">
        <div className="bg-white rounded-3xl p-8 md:p-12 border border-border/60 shadow-sm space-y-10">
          
          <div className="space-y-4">
            <h2 className="font-serif text-2xl font-semibold text-foreground flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center">1</span>
              Acceptance of Terms
            </h2>
            <p className="text-sm text-foreground/80 leading-relaxed font-sans font-normal">
              By accessing, browsing, or purchasing from Pavapetti Heritage Artifacts ("Pavapetti", "we", "us", or "our"), you agree to be bound by these Terms &amp; Conditions. If you do not agree to these terms, please do not use our web portal or services.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="font-serif text-2xl font-semibold text-foreground flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center">2</span>
              Handicrafts &amp; Heritage Art Authenticity
            </h2>
            <p className="text-sm text-foreground/80 leading-relaxed font-sans font-normal">
              All artifacts displayed on our store—including Aranmula Metal Mirrors, Nettoor Caskets, Hand-cast Brassware, and Wooden Idols—are handcrafted by traditional master artisans across Kerala. Due to their authentic handmade nature, slight natural variations in color, grain, hand-chiseling marks, and dimensions are inherently unique features of genuine heritage crafts, not defects.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="font-serif text-2xl font-semibold text-foreground flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center">3</span>
              Orders &amp; Custom Performance Bookings
            </h2>
            <p className="text-sm text-foreground/80 leading-relaxed font-sans font-normal">
              - <strong>Artifact Purchases:</strong> Orders placed via our checkout or direct WhatsApp desk are subject to stock confirmation and custom crafting lead times where specified.
              <br /><br />
              - <strong>Performing Art Troupes (Kathakali, Tholpavakoothu, etc.):</strong> Bookings requested through our Art Forms desk are confirmed upon mutual agreement on performance date, stage dimensions, venue logistics, and advance reservation payments.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="font-serif text-2xl font-semibold text-foreground flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center">4</span>
              Pricing &amp; International Currency
            </h2>
            <p className="text-sm text-foreground/80 leading-relaxed font-sans font-normal">
              Prices are listed in Indian Rupees (INR ₹) inclusive of applicable GST unless stated otherwise. International shipments are subject to local customs duties, tariffs, or import taxes levied by the destination country, which remain the responsibility of the recipient.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="font-serif text-2xl font-semibold text-foreground flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center">5</span>
              Intellectual Property Rights
            </h2>
            <p className="text-sm text-foreground/80 leading-relaxed font-sans font-normal">
              All content, photography, branding logos, Malayalam cultural descriptions, and website design are intellectual property of Pavapetti Heritage Artifacts. Unauthorized reproduction, scraping, or commercial use is strictly prohibited.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="font-serif text-2xl font-semibold text-foreground flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center">6</span>
              Governing Law &amp; Jurisdiction
            </h2>
            <p className="text-sm text-foreground/80 leading-relaxed font-sans font-normal">
              These terms shall be governed by and construed in accordance with the laws of India. Any disputes arising out of or related to our website or purchases shall be subject to the exclusive jurisdiction of the courts in Thrissur, Kerala, India.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#f8f6f0] border border-border/60 flex items-start gap-4">
            <AlertCircle size={20} className="text-primary shrink-0 mt-0.5" />
            <p className="text-xs text-foreground/75 leading-relaxed">
              If you have any questions regarding these terms, please contact our administrative desk at <strong>curator@pavapetti.com</strong> or WhatsApp <strong>+91 92920 16901</strong>.
            </p>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
