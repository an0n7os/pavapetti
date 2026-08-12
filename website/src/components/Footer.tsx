import { useState } from "react";
import { Link } from "wouter";
import { Phone, MapPin, Mail, Instagram, Facebook, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import PavapettiLogo from "./PavapettiLogo";
import Magnetic from "./Magnetic";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail("");
  };

  return (
    <footer className="bg-[#0a0a0a] text-white/70 mt-24 border-t border-white/5">
      {/* Top strip — Luxury Volcanic Dark & Gold */}
      <div className="bg-[#0d0d0d] py-5 px-4 text-center border-b border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(var(--primary-rgb),0.05),transparent)] pointer-events-none" />
        <p className="text-primary text-[10px] font-black tracking-[0.4em] uppercase relative z-10">
          Sacred Artifacts — Handpicked with Devotion &amp; Delivered Worldwide
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-10 md:gap-16">
          {/* Brand Column */}
          <div className="md:col-span-2 lg:col-span-2 space-y-8">
            <Link href="/">
              <div className="cursor-pointer inline-block">
                <PavapettiLogo size={54} variant="dark" />
              </div>
            </Link>

            <p className="text-base text-white/60 leading-relaxed max-w-sm font-serif font-light italic">
              "Preserving the Sacred <span className="text-primary italic font-medium">Parampara</span> of the Malabar Coast—where every artifact is a whispered legacy of our ancestors."
            </p>

            <div className="flex gap-4">
              {[
                { icon: <Instagram size={16} />, href: "https://instagram.com/pavapetti" },
                { icon: <Facebook size={16} />, href: "https://facebook.com/pavapetti" },
                { icon: <MessageCircle size={16} />, href: "https://wa.me/919292016901" }
              ].map((social, i) => (
                <Magnetic key={i}>
                  <a 
                    href={social.href} 
                    target="_blank"
                    rel="noreferrer"
                    className="w-11 h-11 rounded-full border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-primary hover:border-primary transition-all duration-500 hover:scale-105 shadow-sm outline-none"
                  >
                    {social.icon}
                  </a>
                </Magnetic>
              ))}
            </div>

            <div className="space-y-4 text-xs tracking-widest uppercase font-bold text-white/50">
              <a href="tel:+919292016901" className="flex items-center gap-4 hover:text-primary transition-colors duration-300 group">
                <Phone size={13} className="text-primary group-hover:scale-110 transition-transform" />
                +91 92920 16901
              </a>
              <a href="tel:+919544816900" className="flex items-center gap-4 hover:text-primary transition-colors duration-300 group">
                <Phone size={13} className="text-primary group-hover:scale-110 transition-transform" />
                +91 95448 16900
              </a>
              <a href="mailto:curator@pavapetti.com" className="flex items-center gap-4 hover:text-primary transition-colors duration-300 group">
                <Mail size={13} className="text-primary group-hover:scale-110 transition-transform" />
                curator@pavapetti.com
              </a>
              <a 
                href="https://maps.google.com/?q=Vallathol+Museum+Cheruthuruthy+Thrissur+Kerala" 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-4 hover:text-primary transition-colors duration-300 group"
              >
                <MapPin size={13} className="text-primary group-hover:scale-110 transition-transform" />
                Pavapetti Heritage Artifacts, Near Vallathol Museum, Cheruthuruthy, Thrissur, Kerala
              </a>
            </div>
          </div>

          {/* Quick links Column */}
          <div className="lg:col-span-1">
            <h4 className="font-serif text-lg font-light mb-8 text-primary tracking-widest uppercase">The Archive</h4>
            <ul className="space-y-3.5 text-[11px] font-black tracking-[0.25em] uppercase text-white/40">
              {[
                { href: "/products", label: "All Artifacts" },
                { href: "/art-forms", label: "Art Forms" },
                { href: "/products?featured=true", label: "Featured" },
                { href: "/products?category=Pooja Category", label: "Ritual" },
                { href: "/contact", label: "Contact Us" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="hover:text-primary hover:opacity-100 transition-all flex items-center gap-3 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary scale-0 group-hover:scale-100 transition-all duration-300" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Governance & Policies Column */}
          <div className="lg:col-span-1">
            <h4 className="font-serif text-lg font-light mb-8 text-primary tracking-widest uppercase">Governance</h4>
            <ul className="space-y-3.5 text-[11px] font-black tracking-[0.25em] uppercase text-white/40">
              {[
                { href: "/terms", label: "Terms & Conditions" },
                { href: "/privacy", label: "Privacy Policy" },
                { href: "/shipping-returns", label: "Shipping & Returns" },
                { href: "/faq", label: "Heritage FAQ" },
                { href: "/contact", label: "Gallery Contact" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="hover:text-primary hover:opacity-100 transition-all flex items-center gap-3 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary scale-0 group-hover:scale-100 transition-all duration-300" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Chronicles Column — Newsletter */}
          <div className="lg:col-span-1">
            <h4 className="font-serif text-lg font-light mb-8 text-primary tracking-widest uppercase">Chronicles</h4>
            {!subscribed ? (
              <form onSubmit={handleSubscribe} className="space-y-4">
                <p className="text-[11px] font-serif text-white/50 leading-relaxed italic">
                  Subscribe to receive whispers of new collections &amp; historical memoirs of Malabar.
                </p>
                <div className="relative group border-b border-white/20 focus-within:border-primary transition-colors duration-500 pb-2">
                  <input 
                    type="email" 
                    placeholder="Your Email Address" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent text-white placeholder-white/20 text-xs tracking-wider outline-none border-none py-1 pr-10"
                    required
                  />
                  <button 
                    type="submit"
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-white/40 hover:text-primary transition-all duration-300 transform group-focus-within:translate-x-1 group-focus-within:text-primary"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </button>
                </div>
              </form>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-2xl bg-primary/5 border border-primary/20 text-center space-y-2"
              >
                <span className="text-primary text-base">✦</span>
                <h5 className="text-[10px] font-black tracking-widest uppercase text-white">Subscribed</h5>
                <p className="text-[9px] text-white/40 uppercase tracking-wider font-bold">Welcome to the Archive Chronicles</p>
              </motion.div>
            )}
          </div>

        </div>

        {/* Bottom tag strip */}
        <div className="border-t border-white/5 mt-20 pt-10 flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] text-white/30 tracking-[0.2em] uppercase font-bold">
          <span>© {new Date().getFullYear()} Pavapetti Heritage Artifacts®</span>
          <div className="flex flex-wrap items-center gap-4 text-white/40">
            <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
            <span>•</span>
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
            <span>•</span>
            <Link href="/shipping-returns" className="hover:text-primary transition-colors">Shipping</Link>
            <span>•</span>
            <Link href="/faq" className="hover:text-primary transition-colors">FAQ</Link>
            <span>•</span>
            <Link href="/contact" className="hover:text-primary transition-colors">Contact</Link>
          </div>
          <span className="flex items-center gap-1.5">
            Crafted by <a href="https://brandliftonline.in" target="_blank" rel="noreferrer" className="text-primary/60 hover:text-primary transition-colors duration-300 font-black tracking-[0.25em]">Brandlift</a>
          </span>
        </div>
      </div>
    </footer>
  );
}
