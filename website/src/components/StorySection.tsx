import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Link } from "wouter";

export default function StorySection() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 100]);

  return (
    <section ref={containerRef} className="py-32 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          
          {/* Left: Visual Storytelling — Responsively Cushioned & Scaled */}
          <div className="relative pb-12 sm:pb-0">
            <motion.div 
              style={{ y: y1 }}
              className="aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl relative z-10"
            >
              <img 
                src="/hero-brass-v2.webp" 
                alt="Traditional Ritual Essentials" 
                className="w-full h-full object-cover group-hover:scale-105 transition-all duration-1000"
              />
              <div className="absolute inset-0 bg-black/5" />
            </motion.div>
            
            <motion.div 
              style={{ y: y2 }}
              className="absolute -bottom-8 -right-4 sm:-bottom-16 sm:-right-12 w-1/2 sm:w-2/3 aspect-square rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden shadow-2xl z-20 border-[6px] sm:border-[12px] border-white"
            >
              <img 
                src="/aranmula-mirror.webp" 
                alt="Sacred Heirlooms" 
                className="w-full h-full object-cover"
              />
            </motion.div>

            {/* Decorative Elements */}
            <div className="absolute top-1/2 -left-20 w-40 h-40 border border-primary/10 rounded-full animate-pulse" />
          </div>

          {/* Right: Narrative */}
          <div className="space-y-10">
            <div className="space-y-4">
              <motion.span 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="text-primary text-[10px] font-bold tracking-[0.5em] uppercase block"
              >
                Our Legacy
              </motion.span>
              <motion.h2 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="font-serif text-5xl md:text-7xl font-light text-foreground leading-[1.1]"
              >
                The Art of <br />
                <span className="italic">Heritage</span> Craft
              </motion.h2>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="space-y-6 text-muted-foreground font-light leading-relaxed text-lg max-w-lg"
            >
              <p>
                Every artifact within the Pavapetti Heritage Artifacts archives is more than a possession—it is a vessel for Kerala's ancient spirit. From the primordial resonance of hand-cast bell metal to the rhythmic precision of loom-woven heirlooms, we safeguard the <span className="italic text-primary/80 font-medium">Samskaram</span> of a thousand-year-old civilization.
              </p>
              <p>
                Our curators seek the sacred workshops tucked away in the emerald valleys of the Malabar Coast, handpicking pieces that represent the zenith of <span className="italic text-primary/80 font-medium">Parampara</span>. We do not merely offer objects; we curate the bridge between the timeless wisdom of the past and the soul of the modern home.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="pt-6"
            >
              <Link href="/products">
                <button className="group flex items-center gap-6 text-left">
                  <div className="w-16 h-16 rounded-full border border-primary flex items-center justify-center group-hover:bg-primary transition-all duration-500">
                    <svg 
                      width="24" height="24" viewBox="0 0 24 24" fill="none" 
                      className="text-primary group-hover:text-primary-foreground transition-colors duration-500"
                    >
                      <path d="M5 12h14M13 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold tracking-widest uppercase text-primary">Discover</span>
                    <span className="font-serif text-xl">The Maker's Story</span>
                  </div>
                </button>
              </Link>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
