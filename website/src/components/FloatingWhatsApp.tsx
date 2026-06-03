import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useLocation } from "wouter";
import { X, MessageCircle } from "lucide-react";

const PHONE = "919042525110";

export default function FloatingWhatsApp() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);

  // Hide on dashboard
  if (location.startsWith("/dashboard")) return null;

  const defaultMsg = encodeURIComponent(
    "Hi! I'm interested in your Kerala traditional products. Can you help me?"
  );

  return (
    <div 
      className="fixed right-6 z-[100] flex flex-col items-end gap-3"
      style={{ bottom: `calc(env(safe-area-inset-bottom) + 1.5rem)` }}
    >
      {/* Popup card */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 30 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="glass-premium rounded-[2.5rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.2)] w-80 overflow-hidden border border-white/40 mb-4"
          >
            {/* Header */}
            <div className="bg-primary/95 px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
                  <span className="text-white font-serif font-black text-lg">P</span>
                </div>
                <div>
                  <p className="text-white font-bold text-sm tracking-tight leading-tight">Pavapetti Heritage</p>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    <p className="text-white/70 text-[10px] font-bold tracking-wider uppercase">Live Curator</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* Chat bubble */}
            <div className="px-6 py-8">
              <div className="bg-white/50 backdrop-blur-sm rounded-2xl rounded-tl-none px-5 py-4 shadow-sm border border-white/20">
                <p className="text-sm text-foreground/80 leading-relaxed font-medium">
                  👋 <span className="italic font-serif">Namaskaram!</span> <br />
                  I'm your heritage curator. <br />
                  How can I assist your collection today?
                </p>
                <p className="text-[9px] text-muted-foreground/50 mt-3 text-right font-bold uppercase tracking-widest">Just Now</p>
              </div>
            </div>

            {/* CTA */}
            <div className="px-6 pb-6 pt-0">
              <a
                href={`https://wa.me/${PHONE}?text=${defaultMsg}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-3 w-full bg-primary text-primary-foreground font-black text-[11px] tracking-[0.2em] uppercase py-4 rounded-xl transition-all hover:shadow-xl hover:scale-[1.02]"
              >
                <MessageCircle size={16} />
                Connect Now
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating button */}
      <motion.button
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="w-14 h-14 rounded-full bg-[#25D366] shadow-xl shadow-green-500/30 flex items-center justify-center relative"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X size={22} className="text-white" />
            </motion.div>
          ) : (
            <motion.div key="msg" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <MessageCircle size={24} className="text-white" />
            </motion.div>
          )}
        </AnimatePresence>
        {/* Pulse ring */}
        {!open && (
          <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-25" />
        )}
      </motion.button>
    </div>
  );
}
