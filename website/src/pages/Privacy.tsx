import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { ShieldCheck, Lock, Eye, FileText, CheckCircle2 } from "lucide-react";

export default function Privacy() {
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
            <ShieldCheck size={14} />
            <span>Data Protection</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-serif text-4xl sm:text-5xl font-light text-[#fefdfa]"
          >
            Privacy Policy
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/60 text-sm max-w-xl mx-auto font-serif italic"
          >
            Your privacy and trust are sacred to us. Learn how we safeguard your personal information.
          </motion.p>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-16 space-y-12 flex-1">
        <div className="bg-white rounded-3xl p-8 md:p-12 border border-border/60 shadow-sm space-y-10">
          
          <div className="space-y-4">
            <h2 className="font-serif text-2xl font-semibold text-foreground flex items-center gap-3">
              <Lock className="text-primary shrink-0" size={22} />
              Information We Collect
            </h2>
            <p className="text-sm text-foreground/80 leading-relaxed font-sans font-normal">
              When you interact with Pavapetti Heritage Artifacts—whether placing an order, inquiring about performing arts on WhatsApp, or joining our newsletter—we may collect personal details such as:
            </p>
            <ul className="space-y-2 text-xs text-foreground/75 font-medium pl-4">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-primary shrink-0" />
                <span>Full Name &amp; Contact Details (Phone Number, Email Address, Delivery Address)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-primary shrink-0" />
                <span>Event details for custom Art Form troupe bookings (Venue, Proposed Date, Event Type)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-primary shrink-0" />
                <span>Device browser session data for seamless navigation and cart persistence</span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="font-serif text-2xl font-semibold text-foreground flex items-center gap-3">
              <Eye className="text-primary shrink-0" size={22} />
              How We Use Your Information
            </h2>
            <p className="text-sm text-foreground/80 leading-relaxed font-sans font-normal">
              We collect information strictly to provide authentic cultural products and services:
            </p>
            <ul className="space-y-2 text-xs text-foreground/75 font-medium pl-4">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-primary shrink-0" />
                <span>Processing &amp; delivering your handicraft orders with fragile-item logistics partners</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-primary shrink-0" />
                <span>Communicating order updates, custom dispatch tracking, and WhatsApp support inquiries</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-primary shrink-0" />
                <span>Sending occasional collection updates or cultural memoirs (only if you subscribe to Chronicles)</span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="font-serif text-2xl font-semibold text-foreground flex items-center gap-3">
              <FileText className="text-primary shrink-0" size={22} />
              Data Sharing &amp; Third Parties
            </h2>
            <p className="text-sm text-foreground/80 leading-relaxed font-sans font-normal">
              <strong>We NEVER sell, rent, or trade your personal information.</strong> We only share necessary delivery details with trusted courier partners (e.g., DHL, India Post, Blue Dart) solely to fulfill your package delivery safely.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="font-serif text-2xl font-semibold text-foreground flex items-center gap-3">
              <ShieldCheck className="text-primary shrink-0" size={22} />
              Security Commitment
            </h2>
            <p className="text-sm text-foreground/80 leading-relaxed font-sans font-normal">
              We maintain industry-standard administrative and technical safeguards to protect your personal information against unauthorized access, loss, or misuse.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#f8f6f0] border border-border/60 text-xs text-foreground/80 leading-relaxed">
            For any privacy concerns or request to delete your contact records, write to us at <strong>curator@pavapetti.com</strong>.
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
