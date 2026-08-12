import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, MessageCircle, Send, CheckCircle2, Sparkles } from "lucide-react";
import { WHATSAPP_PHONE } from "@/data/artForms";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("General Inquiry");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !message) return;
    
    // Construct WhatsApp message URL for direct submit option
    const text = `*NEW CONTACT FORM INQUIRY*\n\n*Name:* ${name}\n*Email:* ${email || "N/A"}\n*Phone:* ${phone || "N/A"}\n*Subject:* ${subject}\n\n*Message:* ${message}`;
    window.open(`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(text)}`, "_blank");
    setSubmitted(true);
  };

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
            <Mail size={14} />
            <span>Connect with Curators</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-serif text-4xl sm:text-5xl font-light text-[#fefdfa]"
          >
            Contact &amp; Gallery Location
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/60 text-sm max-w-xl mx-auto font-serif italic"
          >
            Visit our physical gallery in Cheruthuruthy, Kerala, or connect with our curator team for custom artifact commissions.
          </motion.p>
        </div>
      </section>

      {/* Main Grid */}
      <main className="max-w-7xl mx-auto px-6 lg:px-12 py-16 flex-1 w-full space-y-16">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Contact Info Cards */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-white rounded-3xl p-8 border border-border/60 shadow-sm space-y-6">
              <h3 className="font-serif text-2xl text-foreground font-medium border-b border-border/40 pb-4">
                Gallery &amp; Curator Desk
              </h3>

              <div className="space-y-6 text-sm">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Gallery Address</h4>
                    <p className="text-foreground font-serif text-base mt-0.5">
                      Pavapetti Heritage Artifacts
                    </p>
                    <p className="text-muted-foreground text-xs leading-relaxed mt-0.5">
                      Near Vallathol Museum, Cheruthuruthy, Thrissur District, Kerala - 679531, India
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Phone size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Phone &amp; WhatsApp Desk</h4>
                    <a href="tel:+919292016901" className="block text-foreground hover:text-primary font-medium text-sm mt-0.5 transition-colors">
                      +91 92920 16901 (Curator Line)
                    </a>
                    <a href="tel:+919544816900" className="block text-foreground hover:text-primary font-medium text-sm transition-colors">
                      +91 95448 16900 (Gallery Desk)
                    </a>
                    <a href="tel:+91965816900" className="block text-foreground hover:text-primary font-medium text-sm transition-colors">
                      +91 96581 6900 (Art Forms Desk)
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Mail size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Official Email</h4>
                    <a href="mailto:curator@pavapetti.com" className="text-foreground hover:text-primary font-medium text-sm mt-0.5 transition-colors">
                      curator@pavapetti.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Clock size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Gallery Timings</h4>
                    <p className="text-foreground text-xs mt-0.5 font-medium">
                      Monday – Saturday: 9:30 AM – 7:00 PM IST
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Sunday: By Prior Appointment
                    </p>
                  </div>
                </div>
              </div>

              {/* Direct WhatsApp Callout */}
              <div className="pt-4 border-t border-border/40">
                <a
                  href={`https://wa.me/${WHATSAPP_PHONE}?text=Hello%20Pavapetti%20Curator%2C%20I%20would%20like%20to%20inquire%20about%20your%20heritage%20artifacts.`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-[#25D366] text-white py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider hover:bg-[#20bd5a] shadow-md shadow-green-500/20 transition-all hover:scale-[1.02]"
                >
                  <MessageCircle size={16} />
                  Instant WhatsApp Message
                </a>
              </div>
            </div>

          </div>

          {/* Right Interactive Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-8 md:p-10 border border-border/60 shadow-sm space-y-6">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Inquiry Form</span>
                <h3 className="font-serif text-3xl font-medium text-foreground mt-1">
                  Send a Note to Our Curator
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Fill out the form below to submit your inquiry directly to our curators on WhatsApp.
                </p>
              </div>

              {submitted ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-8 rounded-2xl bg-primary/5 border border-primary/20 text-center space-y-4 py-12"
                >
                  <CheckCircle2 size={44} className="mx-auto text-primary" />
                  <h4 className="font-serif text-2xl font-medium">Inquiry Dispatched</h4>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                    Thank you for connecting with Pavapetti Heritage Artifacts. Our team has received your message on WhatsApp and will respond shortly.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="px-6 py-2.5 rounded-xl bg-primary text-white text-xs font-bold uppercase tracking-wider hover:bg-primary/90 transition-all"
                  >
                    Send Another Note
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-foreground/70 mb-1">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Radhika Menon"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-[#f8f6f0] border border-border/60 rounded-xl px-4 py-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-foreground/70 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-[#f8f6f0] border border-border/60 rounded-xl px-4 py-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-foreground/70 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        placeholder="radhika@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-[#f8f6f0] border border-border/60 rounded-xl px-4 py-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-foreground/70 mb-1">
                        Subject
                      </label>
                      <select
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full bg-[#f8f6f0] border border-border/60 rounded-xl px-4 py-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="General Inquiry">General Inquiry</option>
                        <option value="Custom Artifact Commission">Custom Artifact Commission</option>
                        <option value="Aranmula Mirror Inquiry">Aranmula Mirror Inquiry</option>
                        <option value="Art Troupe Booking">Art Troupe Booking</option>
                        <option value="International Shipping Question">International Shipping Question</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-foreground/70 mb-1">
                      Your Message *
                    </label>
                    <textarea
                      rows={5}
                      required
                      placeholder="Please share details about your inquiry or specific heritage artifact requirements..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full bg-[#f8f6f0] border border-border/60 rounded-xl p-4 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none leading-relaxed"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 bg-primary text-white py-4 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-primary/90 shadow-md shadow-primary/20 transition-all hover:scale-[1.01]"
                  >
                    <Send size={15} />
                    Send Inquiry to Curator
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>

        {/* Embedded Gallery Google Map */}
        <div className="space-y-4">
          <h3 className="font-serif text-2xl font-medium text-foreground">
            Visit Our Heritage Gallery in Cheruthuruthy
          </h3>
          <div className="relative rounded-[2.5rem] overflow-hidden h-80 border border-border/60 shadow-md">
            <iframe 
              src="https://maps.google.com/maps?q=Vallathol%20Museum%20Cheruthuruthy%20Thrissur&t=&z=15&ie=UTF8&iwloc=&output=embed" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen={true} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
