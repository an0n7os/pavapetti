import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, Calendar, MapPin, User, MessageCircle, X, Search, 
  ChevronRight, Info, Music, Users, Clock, ShieldCheck, CheckCircle2,
  Award, PlayCircle, Star, ExternalLink
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Magnetic from "@/components/Magnetic";
import { ArtForm, useArtForms, generateArtBookingWhatsAppUrl, WHATSAPP_PHONE } from "@/data/artForms";

export default function ArtForms() {
  const { artForms } = useArtForms();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDetailArt, setActiveDetailArt] = useState<ArtForm | null>(null);
  const [bookingArt, setBookingArt] = useState<ArtForm | null>(null);

  // Custom booking form state
  const [customerName, setCustomerName] = useState("");
  const [eventType, setEventType] = useState("Wedding / Ceremony");
  const [eventDate, setEventDate] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [specialNotes, setSpecialNotes] = useState("");

  // Lock background window scroll when any modal is open
  const isAnyModalOpen = !!activeDetailArt || !!bookingArt;

  useEffect(() => {
    if (isAnyModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isAnyModalOpen]);

  const categories = useMemo(() => {
    return ["All", "Classical Dance", "Solo Performance", "Percussion & Music", "Traditional Theater & Puppetry"];
  }, []);

  const filteredArtForms = useMemo(() => {
    return artForms.filter(art => {
      const matchesCategory = selectedCategory === "All" || art.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query || 
        art.name.toLowerCase().includes(query) || 
        art.malayalamName.toLowerCase().includes(query) ||
        art.shortDesc.toLowerCase().includes(query) ||
        art.category.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [artForms, selectedCategory, searchQuery]);

  const handleOpenBooking = (art: ArtForm) => {
    setBookingArt(art);
  };

  const handleConfirmWhatsAppBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingArt) return;

    const url = generateArtBookingWhatsAppUrl(bookingArt, {
      name: customerName,
      eventType: eventType,
      date: eventDate,
      location: eventLocation,
      notes: specialNotes
    });

    window.open(url, "_blank");
    setBookingArt(null);
  };

  return (
    <div className="min-h-screen bg-[#fcfbfa] text-foreground flex flex-col font-sans">
      <Navbar />

      {/* ── HERO BANNER ── */}
      <section className="relative bg-[#090908] text-white pt-20 pb-24 md:pt-28 md:pb-32 overflow-hidden">
        {/* Subtle Ambient Glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 left-1/4 w-96 h-96 rounded-full bg-primary/20 blur-[120px]" />
          <div className="absolute bottom-0 right-10 w-80 h-80 rounded-full bg-amber-600/10 blur-[100px]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.03)_0%,transparent_70%)]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
          <div className="max-w-3xl space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-primary text-[10px] font-black tracking-[0.3em] uppercase"
            >
              <Sparkles size={13} className="text-primary animate-pulse" />
              Kerala Heritage Performing Arts · കലാസാംസ്കാരിക സന്ധ്യ
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal leading-[1.15] text-[#f8f5ee]"
            >
              Book Authentic <br />
              <span className="italic text-primary font-medium">Traditional Performing Arts</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-base md:text-lg text-white/70 font-serif italic font-light leading-relaxed max-w-2xl"
            >
              From the sacred shadow puppets of <span className="text-primary font-normal">Tholpavakoothu</span> to the dramatic gestures of <span className="text-primary font-normal">Kathakali</span> and the rhythmic grace of <span className="text-primary font-normal">Mohiniyattam</span> — invite master performers directly to your stage, cultural events, and celebrations.
            </motion.p>

            {/* Quick stats counter */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="pt-6 grid grid-cols-2 sm:grid-cols-3 gap-6 border-t border-white/10"
            >
              <div>
                <p className="text-2xl font-serif text-primary font-bold">9+ Legend Arts</p>
                <p className="text-[10px] uppercase font-bold tracking-widest text-white/50">Traditional Masterworks</p>
              </div>
              <div>
                <p className="text-2xl font-serif text-primary font-bold">100% Authentic</p>
                <p className="text-[10px] uppercase font-bold tracking-widest text-white/50">Kalamandalam Lineage</p>
              </div>
              <div>
                <p className="text-2xl font-serif text-primary font-bold">Instant WhatsApp</p>
                <p className="text-[10px] uppercase font-bold tracking-widest text-white/50">Direct Artist Booking</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── FILTER & SEARCH SECTION ── */}
      <section className="sticky top-16 z-30 bg-white/90 backdrop-blur-md border-b border-border/40 py-4 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Categories */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
            {categories.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all whitespace-nowrap ${
                    active 
                      ? "bg-primary text-white shadow-md shadow-primary/25 scale-[1.02]" 
                      : "bg-[#f5f2ed] text-foreground/70 hover:bg-[#eae5dd] hover:text-foreground"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-72">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
            <input
              type="text"
              placeholder="Search Kathakali, Puppetry, Dance..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#f8f6f0] border border-border/50 rounded-xl pl-9 pr-4 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X size={14} />
              </button>
            )}
          </div>

        </div>
      </section>

      {/* ── ART FORMS GRID ── */}
      <main className="max-w-7xl mx-auto px-6 lg:px-12 py-12 flex-1 w-full">
        {filteredArtForms.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-border p-8 space-y-4">
            <Music size={40} className="mx-auto text-primary/40" />
            <h3 className="font-serif text-2xl">No Art Form Found</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              We couldn't find any performing art form matching your search "{searchQuery}". Try selecting another category.
            </p>
            <button 
              onClick={() => { setSelectedCategory("All"); setSearchQuery(""); }}
              className="px-5 py-2.5 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-primary/90 transition-all"
            >
              Show All Art Forms
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArtForms.map((art, index) => (
              <motion.div
                key={art.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="group bg-white rounded-[2rem] overflow-hidden border border-border/60 hover:border-primary/40 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col"
              >
                {/* Image & Overlay */}
                <div className="relative aspect-[16/10] overflow-hidden bg-[#111]">
                  <img
                    src={art.imageUrl}
                    alt={art.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  {/* Category Badge */}
                  <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-[10px] font-black uppercase tracking-wider">
                    {art.category}
                  </span>

                  {/* Malayalam Title Badge */}
                  <span className="absolute top-4 right-4 px-3 py-1 rounded-full bg-primary/90 text-white text-xs font-bold tracking-tight shadow-md">
                    {art.malayalamName}
                  </span>

                  {/* Name overlay */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="font-serif text-2xl text-white font-medium leading-tight">
                      {art.name}
                    </h3>
                  </div>
                </div>

                {/* Content & Action Buttons */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <p className="text-xs sm:text-sm text-foreground/85 font-sans font-normal leading-relaxed line-clamp-3">
                    {art.shortDesc}
                  </p>

                  <div className="space-y-2 pt-3 border-t border-border/40">
                    {art.linkUrl && (
                      <a
                        href={art.linkUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full flex items-center justify-center gap-2 bg-primary/10 hover:bg-primary text-primary hover:text-white py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all"
                      >
                        <ExternalLink size={14} />
                        View Attached Link
                      </a>
                    )}

                    {/* Direct WhatsApp booking */}
                    <a
                      href={generateArtBookingWhatsAppUrl(art)}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full flex items-center justify-center gap-2 bg-[#25D366] text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-[#20bd5a] shadow-md shadow-green-500/20 transition-all hover:scale-[1.02]"
                    >
                      <MessageCircle size={16} />
                      Book on WhatsApp
                    </a>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleOpenBooking(art)}
                        className="w-full py-2.5 px-3 rounded-xl border border-primary/30 text-primary hover:bg-primary/5 text-[11px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1"
                      >
                        <Calendar size={13} />
                        Customize
                      </button>
                      <button
                        onClick={() => setActiveDetailArt(art)}
                        className="w-full py-2.5 px-3 rounded-xl bg-[#f5f2eb] hover:bg-[#eae5db] text-foreground text-[11px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1"
                      >
                        <Info size={13} />
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>



      {/* ── DETAIL MODAL ── */}
      <AnimatePresence>
        {activeDetailArt && (
          <div data-lenis-prevent className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overscroll-contain">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[2.5rem] overflow-hidden max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20 relative flex flex-col overscroll-contain"
              data-lenis-prevent
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveDetailArt(null)}
                className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/50 hover:bg-black text-white flex items-center justify-center transition-colors"
              >
                <X size={18} />
              </button>

              {/* Top Hero Image */}
              <div className="relative aspect-[16/9] bg-black">
                <img 
                  src={activeDetailArt.imageUrl} 
                  alt={activeDetailArt.name} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
                  <div>
                    <span className="px-3 py-1 rounded-full bg-primary text-white text-[10px] font-black uppercase tracking-wider">
                      {activeDetailArt.category}
                    </span>
                    <h2 className="font-serif text-3xl text-white font-medium mt-1">
                      {activeDetailArt.name} <span className="text-primary font-sans text-xl ml-2">({activeDetailArt.malayalamName})</span>
                    </h2>
                  </div>
                </div>
              </div>

              {/* Content Body */}
              <div className="p-6 md:p-8 space-y-6 flex-1">
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-widest text-primary">Overview &amp; Cultural Description</h4>
                  <p className="text-sm text-foreground/90 font-sans font-normal leading-relaxed">
                    {activeDetailArt.fullDesc || activeDetailArt.shortDesc}
                  </p>
                </div>

                {activeDetailArt.history && (
                  <div className="space-y-3 bg-[#f8f6f0] p-4 rounded-2xl border border-border/50">
                    <h4 className="text-xs font-black uppercase tracking-widest text-primary">Historical Origin</h4>
                    <p className="text-xs text-foreground/75 leading-relaxed font-sans font-normal">
                      {activeDetailArt.history}
                    </p>
                  </div>
                )}

                {/* Specs */}
                {(activeDetailArt.troopSize || activeDetailArt.duration) && (
                  <div className="grid grid-cols-2 gap-4">
                    {activeDetailArt.troopSize && (
                      <div className="bg-[#fcfbfa] border border-border/60 p-4 rounded-2xl space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Troupe Size</p>
                        <p className="text-xs font-bold text-foreground">{activeDetailArt.troopSize}</p>
                      </div>
                    )}
                    {activeDetailArt.duration && (
                      <div className="bg-[#fcfbfa] border border-border/60 p-4 rounded-2xl space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Standard Duration</p>
                        <p className="text-xs font-bold text-foreground">{activeDetailArt.duration}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Highlights */}
                {activeDetailArt.highlights && activeDetailArt.highlights.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-black uppercase tracking-widest text-primary">Key Features</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {activeDetailArt.highlights.map((hl, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-foreground/80 font-sans">
                          <CheckCircle2 size={14} className="text-primary shrink-0" />
                          <span>{hl}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Instruments */}
                {activeDetailArt.instruments && activeDetailArt.instruments.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-black uppercase tracking-widest text-primary">Accompanying Instruments</h4>
                    <div className="flex flex-wrap gap-2">
                      {activeDetailArt.instruments.map((inst, i) => (
                        <span key={i} className="px-3 py-1 rounded-lg bg-primary/10 text-primary text-xs font-bold">
                          {inst}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer CTA */}
              <div className="p-6 bg-[#f8f6f0] border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setActiveDetailArt(null)}
                    className="px-5 py-2.5 rounded-xl border border-border text-xs font-bold uppercase tracking-wider hover:bg-white transition-colors"
                  >
                    Close
                  </button>
                  {activeDetailArt.linkUrl && (
                    <a
                      href={activeDetailArt.linkUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2.5 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                    >
                      <ExternalLink size={14} />
                      View Link
                    </a>
                  )}
                </div>
                <a
                  href={generateArtBookingWhatsAppUrl(activeDetailArt)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 w-full sm:w-auto flex items-center justify-center gap-2 bg-[#25D366] text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-[#20bd5a] shadow-md transition-all"
                >
                  <MessageCircle size={16} />
                  Book Performance on WhatsApp
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── CUSTOMIZE BOOKING MODAL ── */}
      <AnimatePresence>
        {bookingArt && (
          <div data-lenis-prevent className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overscroll-contain">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[2.5rem] overflow-hidden max-w-lg w-full shadow-2xl border border-white/20 relative overscroll-contain"
              data-lenis-prevent
            >
              {/* Header */}
              <div className="bg-[#0c0c0b] text-white p-6 relative">
                <button
                  onClick={() => setBookingArt(null)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                >
                  <X size={16} />
                </button>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Customize Booking Request</p>
                <h3 className="font-serif text-2xl mt-1 text-[#f8f5ee]">
                  Book {bookingArt.name} <span className="text-primary">({bookingArt.malayalamName})</span>
                </h3>
              </div>

              {/* Form */}
              <form onSubmit={handleConfirmWhatsAppBooking} className="p-6 space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-foreground/70 mb-1">
                    Your Name / Contact Person
                  </label>
                  <div className="relative">
                    <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Anjali Nair"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-[#f8f6f0] border border-border/60 rounded-xl pl-9 pr-4 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-foreground/70 mb-1">
                      Event Type
                    </label>
                    <select
                      value={eventType}
                      onChange={(e) => setEventType(e.target.value)}
                      className="w-full bg-[#f8f6f0] border border-border/60 rounded-xl px-3 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="Wedding / Reception">Wedding / Reception</option>
                      <option value="Temple Festival (ഉത്സവം)">Temple Festival</option>
                      <option value="Stage Show / Cultural Gala">Stage Show / Cultural Gala</option>
                      <option value="Corporate / VIP Event">Corporate / VIP Event</option>
                      <option value="Private Function">Private Function</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-foreground/70 mb-1">
                      Proposed Date
                    </label>
                    <div className="relative">
                      <Calendar size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="date"
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        className="w-full bg-[#f8f6f0] border border-border/60 rounded-xl pl-9 pr-3 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-foreground/70 mb-1">
                    Event Location / City &amp; Venue
                  </label>
                  <div className="relative">
                    <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="e.g. Thrissur / Kochi / Bangalore"
                      value={eventLocation}
                      onChange={(e) => setEventLocation(e.target.value)}
                      className="w-full bg-[#f8f6f0] border border-border/60 rounded-xl pl-9 pr-4 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-foreground/70 mb-1">
                    Special Requirements or Notes (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Stage dimensions, specific scenes, sound requirements..."
                    value={specialNotes}
                    onChange={(e) => setSpecialNotes(e.target.value)}
                    className="w-full bg-[#f8f6f0] border border-border/60 rounded-xl p-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  />
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setBookingArt(null)}
                    className="w-1/3 py-3 rounded-xl border border-border text-xs font-bold uppercase tracking-wider hover:bg-[#f5f2eb] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-2/3 flex items-center justify-center gap-2 bg-[#25D366] text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-[#20bd5a] shadow-md shadow-green-500/20 transition-all hover:scale-[1.02]"
                  >
                    <MessageCircle size={16} />
                    Send Inquiry on WhatsApp
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
