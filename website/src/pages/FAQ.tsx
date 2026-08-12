import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, ChevronDown, Sparkles, MessageCircle } from "lucide-react";
import { WHATSAPP_PHONE } from "@/data/artForms";

interface FAQItem {
  question: string;
  answer: string;
  category: "Artifacts" | "Aranmula Mirror" | "Art Form Booking" | "Shipping";
}

const FAQS: FAQItem[] = [
  {
    category: "Aranmula Mirror",
    question: "What makes Aranmula Kannadi (ആറന്മുളക്കണ്ണാടി) unique compared to regular glass mirrors?",
    answer: "Aranmula Kannadi is a front-surface metal alloy mirror made from a secret traditional combination of copper and tin by family artisans in Aranmula, Kerala. Unlike glass mirrors that create reflection through a silver coating behind glass (causing double reflections), Aranmula mirror reflects directly from the polished metal surface with zero distortion, making it a sacred GI-tagged heritage treasure."
  },
  {
    category: "Aranmula Mirror",
    question: "How do I clean and care for my Aranmula Metal Mirror?",
    answer: "Keep your mirror away from moisture and direct finger touches on the metal. Wipe gently in a single direction with the soft velvet cloth provided. If tarnishing occurs over months, apply a tiny drop of brasso/special polishing paste or coconut oil with a soft cotton cloth and polish gently."
  },
  {
    category: "Artifacts",
    question: "Are all products handcrafted and authentic?",
    answer: "Yes, 100%. Every item listed on Pavapetti is sourced directly from master craft guilds, bell-metal artisans, and traditional wooden sculptors across Kerala, ensuring pure heritage lineage."
  },
  {
    category: "Art Form Booking",
    question: "How do I book traditional troupes like Kathakali or Tholpavakoothu for events?",
    answer: "Browse our 'Art Forms' page, select the desired troupe, and click 'Book on WhatsApp' or 'Customize'. You can specify your event date, venue city, and stage type. Our cultural curator will coordinate performance schedule, artist troupe travel, and confirmation."
  },
  {
    category: "Shipping",
    question: "How are fragile items shipped safely?",
    answer: "We use 5-tier shock-absorbing packaging (velvet sleeve + foam blocks + bubble cushioning + wooden/cardboard crate). Every fragile order includes full transit damage coverage."
  },
  {
    category: "Shipping",
    question: "Do you ship internationally?",
    answer: "Yes! We ship heritage artifacts to over 40 countries worldwide via air express cargo. International delivery typically takes 7–12 business days."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [selectedCat, setSelectedCat] = useState<string>("All");

  const categories = ["All", "Aranmula Mirror", "Artifacts", "Art Form Booking", "Shipping"];

  const filteredFaqs = FAQS.filter(
    faq => selectedCat === "All" || faq.category === selectedCat
  );

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
            <HelpCircle size={14} />
            <span>Heritage Knowledge</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-serif text-4xl sm:text-5xl font-light text-[#fefdfa]"
          >
            Frequently Asked Questions
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/60 text-sm max-w-xl mx-auto font-serif italic"
          >
            Everything you need to know about our authentic Kerala artifacts, care guides, and art form bookings.
          </motion.p>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-16 space-y-8 flex-1 w-full">
        
        {/* Category Pill Filters */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => { setSelectedCat(cat); setOpenIndex(null); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedCat === cat
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "bg-white border border-border/60 text-foreground/70 hover:bg-[#f6f4ee]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-4">
          {filteredFaqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl border border-border/60 overflow-hidden transition-all shadow-sm"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 font-serif text-lg font-medium text-foreground hover:text-primary transition-colors"
                >
                  <span>{faq.question}</span>
                  <div className={`w-8 h-8 rounded-full bg-[#f8f6f0] flex items-center justify-center transition-transform duration-300 shrink-0 ${isOpen ? "rotate-180 bg-primary/10 text-primary" : "text-muted-foreground"}`}>
                    <ChevronDown size={18} />
                  </div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 pt-0 text-sm text-foreground/80 font-sans leading-relaxed border-t border-border/30 mt-2 pt-4">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* WhatsApp Support Callout */}
        <div className="mt-12 bg-[#0c0c0a] text-white rounded-3xl p-8 text-center space-y-4 relative overflow-hidden border border-amber-500/20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(184,134,11,0.15),transparent)] pointer-events-none" />
          <Sparkles className="mx-auto text-amber-400 animate-pulse" size={24} />
          <h3 className="font-serif text-2xl">Still Have Questions?</h3>
          <p className="text-xs text-white/70 max-w-md mx-auto leading-relaxed">
            Our heritage curators are available to assist you with custom orders, Aranmula mirror sizing, or troupe bookings directly on WhatsApp.
          </p>
          <a
            href={`https://wa.me/${WHATSAPP_PHONE}?text=Hello%2C%20I%20have%20a%20question%20regarding%20Pavapetti%20Artifacts.`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-[#20bd5a] transition-all hover:scale-105 shadow-lg shadow-green-500/20"
          >
            <MessageCircle size={16} />
            Chat with Curator on WhatsApp
          </a>
        </div>

      </main>

      <Footer />
    </div>
  );
}
