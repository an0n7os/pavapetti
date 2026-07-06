import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gavel, Clock, ShieldCheck, Sparkles, Send, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Bidding() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  
  // Calculate dynamic target date: 45 days from today
  const [timeLeft, setTimeLeft] = useState({
    days: 45,
    hours: 12,
    minutes: 30,
    seconds: 0
  });

  useEffect(() => {
    // Generate target timestamp: 45 days from now
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 45);
    
    const interval = setInterval(() => {
      const difference = targetDate.getTime() - new Date().getTime();
      
      if (difference <= 0) {
        clearInterval(interval);
        return;
      }
      
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      
      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) return;
    
    // Simulate API registration
    setSubmitted(true);
    setEmail("");
    setName("");
  };

  const features = [
    {
      icon: <Gavel className="w-6 h-6 text-primary" />,
      title: "Live Bid Rooms",
      description: "Direct real-time bidding on rare, single-edition temple artifacts and heritage heirlooms."
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-primary" />,
      title: "Authenticated Pedigree",
      description: "Every item is certified by traditional Kerala master artisans with complete lineage documentation."
    },
    {
      icon: <Sparkles className="w-6 h-6 text-primary" />,
      title: "Collector's Circle",
      description: "Private digital preview galleries, custom reserve pricing, and direct curator consulting."
    }
  ];

  return (
    <div className="min-h-screen bg-[#070705] text-white/90 flex flex-col relative overflow-hidden">
      {/* Ambient Radial Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[60vh] bg-[radial-gradient(circle_at_50%_0%,rgba(184,134,11,0.08),transparent_60%)] pointer-events-none z-0" />
      <div className="absolute bottom-0 right-0 w-[40vw] h-[40vh] bg-[radial-gradient(circle_at_100%_100%,rgba(184,134,11,0.03),transparent_50%)] pointer-events-none z-0" />

      <Navbar />

      <main className="flex-1 relative z-10 max-w-7xl mx-auto px-6 lg:px-12 py-16 md:py-24 flex flex-col items-center w-full">
        {/* Header Section */}
        <div className="text-center max-w-3xl space-y-6 mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/20 backdrop-blur-md mb-2"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-black tracking-[0.3em] uppercase text-primary leading-none">
              Coming Soon
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="font-serif text-5xl md:text-7xl font-extralight tracking-tight text-[#f5f0e8] leading-tight"
          >
            Sacred Heritage <br />
            <span className="italic text-primary font-light">Auctions</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-white/60 text-sm md:text-base leading-relaxed max-w-2xl mx-auto font-serif font-light italic"
          >
            "A digital sanctuary for high-value collectors. Place your bids on authenticated Kerala antiquities, teak caskets, and holy temple brassware."
          </motion.p>
        </div>

        {/* Countdown Timer */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-4 gap-4 md:gap-8 max-w-2xl w-full mb-20 px-4"
        >
          {[
            { label: "Days", value: timeLeft.days },
            { label: "Hours", value: timeLeft.hours },
            { label: "Minutes", value: timeLeft.minutes },
            { label: "Seconds", value: timeLeft.seconds }
          ].map((item, idx) => (
            <div 
              key={idx} 
              className="relative group bg-[#0e0e0c]/80 border border-white/5 rounded-3xl p-6 text-center backdrop-blur-md shadow-xl"
            >
              <div className="text-3xl md:text-5xl font-light font-serif text-primary mb-1">
                {String(item.value).padStart(2, '0')}
              </div>
              <div className="text-[9px] font-black tracking-widest uppercase text-white/40">
                {item.label}
              </div>
              {/* Gold Hover Glow Border */}
              <div className="absolute inset-0 border border-primary/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </div>
          ))}
        </motion.div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl mb-24">
          {features.map((feat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 + idx * 0.1 }}
              className="bg-[#0e0e0c]/50 border border-white/5 rounded-[2rem] p-8 space-y-6 hover:border-primary/20 hover:bg-[#0f0f0d]/80 transition-all duration-500 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center border border-primary/10 group-hover:bg-primary/10 group-hover:border-primary/20 transition-all duration-500">
                {feat.icon}
              </div>
              <div className="space-y-3">
                <h3 className="font-serif text-xl font-light text-[#f5f0e8] group-hover:text-primary transition-colors">
                  {feat.title}
                </h3>
                <p className="text-xs text-white/50 leading-relaxed font-light">
                  {feat.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Form and Waitlist Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="w-full max-w-lg bg-[#0e0e0c]/70 border border-white/5 rounded-[2.5rem] p-8 md:p-10 backdrop-blur-md relative shadow-2xl overflow-hidden"
        >
          {/* Subtle gold radial shimmer inside form */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(184,134,11,0.04),transparent_50%)] pointer-events-none" />

          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.div
                key="form"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <h3 className="font-serif text-2xl font-light text-[#f5f0e8] text-center">
                    Request Auction Invitation
                  </h3>
                  <p className="text-[11px] font-serif text-white/50 text-center leading-relaxed italic max-w-sm mx-auto">
                    Provide your curatorial profile details to receive an invitation to the private opening.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black tracking-widest uppercase text-white/45 pl-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Aswin Kumar"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xs text-white placeholder-white/20 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all font-medium"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black tracking-widest uppercase text-white/45 pl-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. collector@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xs text-white placeholder-white/20 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all font-medium"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold tracking-[0.2em] uppercase py-4 rounded-2xl transition-all duration-300 shadow-xl shadow-primary/10 flex items-center justify-center gap-2 mt-4 hover:scale-[1.01] active:scale-[0.99]"
                  >
                    Submit Invitation Request
                    <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-6 space-y-4"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto text-primary text-xl">
                  ✦
                </div>
                <h4 className="font-serif text-2xl font-light text-[#f5f0e8]">
                  Invitation Requested
                </h4>
                <p className="text-xs text-white/50 leading-relaxed font-serif italic max-w-xs mx-auto">
                  Thank you. Our curatorial council will review your registration profile and dispatch your private invitation once verification is complete.
                </p>
                <div className="pt-4">
                  <Link href="/products">
                    <button className="text-[10px] font-black tracking-widest uppercase text-primary hover:text-primary/80 transition-colors border-b border-primary/20 pb-0.5 hover:border-primary">
                      Return to the Gallery
                    </button>
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
