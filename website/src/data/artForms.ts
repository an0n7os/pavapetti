import { useState, useEffect } from "react";

export interface ArtForm {
  id: string;
  name: string;
  malayalamName: string;
  category: "Classical Dance" | "Solo Performance" | "Percussion & Music" | "Theater & Puppetry";
  shortDesc: string;
  fullDesc: string;
  history: string;
  troopSize: string;
  duration: string;
  idealOccasions: string[];
  highlights: string[];
  instruments: string[];
  imageUrl: string;
  linkUrl?: string;
  bgGradient?: string;
}

export const INITIAL_ART_FORMS: ArtForm[] = [
  {
    id: "tholpavakoothu",
    name: "Tholpavakoothu",
    malayalamName: "തോൽപാവകൂത്ത്",
    category: "Theater & Puppetry",
    shortDesc: "Ancient shadow puppetry of Kerala performed with leather puppets lit by oil lamps behind a white screen.",
    fullDesc: "Tholpavakoothu is a sacred, ancient shadow puppetry form native to the Bhadrakali temples of Malabar (Palakkad, Thrissur, Malappuram). Intricately carved deerskin leather puppets cast dramatic shadows onto a illuminated white cloth (Koothumadam), bringing ancient epics to life with chanted poetic verses and traditional percussion.",
    history: "Dating back over 2,000 years, Tholpavakoothu was traditionally performed for 7 to 21 nights in temple sanctums as an offering to Goddess Bhadrakali.",
    troopSize: "4 - 8 Artists (Master Puppeteers & Vocalists)",
    duration: "1.5 to 4 Hours (Customizable stage recitals or temple duration)",
    idealOccasions: ["Temple Festivals", "Cultural Expositions", "Heritage Galas", "Stage Dramas", "International Cultural Events"],
    highlights: [
      "Over 100 handcrafted deerskin shadow puppets",
      "Lit by 21 traditional coconut shell oil lamps",
      "Live vocal chanting of Kamba Ramayana verses",
      "Traditional Ezhupara percussion and Ilathalam beat"
    ],
    instruments: ["Ezhupara (Temple Drum)", "Ilathalam (Cymbals)", "Maddalam", "Shankhu (Conch Shell)"],
    imageUrl: "/art-forms/tholpavakoothu.png"
  },
  {
    id: "kathakali",
    name: "Kathakali",
    malayalamName: "കഥകളി",
    category: "Classical Dance",
    shortDesc: "World-renowned classical dance-drama of Kerala with elaborate facial makeup, grand costumes, and mudra storytelling.",
    fullDesc: "Kathakali is the iconic classical art form of Kerala combining literature (Sahithyam), music (Sangeetham), painting (Chithram), acting (Natyam), and dance (Nritham). Performers use stylized face paint (Chutti), towering headgear (Kireetam), and expressive eye movements along with 24 main hand mudras to portray mythological heroes and demons.",
    history: "Originating in 17th century Kerala under the patronage of the Raja of Kottarakkara, Kathakali evolved from Ramanattam and Krishnanattam into a sophisticated world-class performance art.",
    troopSize: "6 - 15 Artists (Dancers, Vocalists, Chenda & Maddalam Drummers, Makeup Masters)",
    duration: "1 to 3 Hours (Highlight recitals or full night dramas)",
    idealOccasions: ["Cultural Conventions", "Grand Weddings", "International Festivals", "Stage Recitals", "VIP Welcome Ceremonies"],
    highlights: [
      "Traditional 4-hour face makeup transformation (Chutti)",
      "Expressive facial emotion storytelling (Navarasas)",
      "Live Chenda and Maddalam drum dialogues",
      "Elaborate multi-layered traditional costumes & wooden headgear"
    ],
    instruments: ["Chenda", "Maddalam", "Chengila (Gong)", "Elathalam"],
    imageUrl: "/hero-dance-v2.webp"
  },
  {
    id: "mohiniyattam",
    name: "Mohiniyattam",
    malayalamName: "മോഹിനിയാട്ടം",
    category: "Classical Dance",
    shortDesc: "The Dance of the Enchantress — graceful classical dance in off-white Kasavu attire with soft rhythmic sway.",
    fullDesc: "Mohiniyattam is the classical solo dance form of Kerala, executed exclusively by women. Defined by gentle sway of the torso, delicate hand gestures, expressive eye movements, and melodious Sopanam music, Mohiniyattam evokes the enchanting beauty of Lord Vishnu's Mohini avatar.",
    history: "Codified and elevated to royal prominence in the 19th century by Swathi Thirunal Rama Varma, Mohiniyattam remains a jewel of Indian classical dance heritage.",
    troopSize: "1 Solo Dancer to Group of 8 Dancers",
    duration: "45 Minutes to 2 Hours",
    idealOccasions: ["Opening Ceremonies", "Cultural Evenings", "Weddings & Receptions", "Festivals", "Stage Showcases"],
    highlights: [
      "Iconic white and gold Kerala Kasavu silk attire",
      "Soft circular hip and torso movements reminiscent of palm fronds and palm breezes",
      "Abhinaya storytelling set to Sopana Sangeetham vocal music",
      "Delicate jasmine flower hair adornments and traditional temple jewelry"
    ],
    instruments: ["Maddalam", "Edakka", "Veena", "Flute", "Elathalam"],
    imageUrl: "/art-forms/mohiniyattam.png"
  },
  {
    id: "ottamthullal",
    name: "Ottamthullal",
    malayalamName: "ഓട്ടൻതുള്ളൽ",
    category: "Solo Performance",
    shortDesc: "Lively, satirical solo dance-drama combining humor, quick footwork, colorful face paint, and witty poetic verse.",
    fullDesc: "Ottamthullal is a unique solo performing art invented by legendary 18th-century Malayalam poet Kunchan Nambiar. The artist wears vibrant green face paint, colorful waist skirts, and sings fast-paced humorous verses that satirize social hypocrisy while dancing dynamically to Maddalam rhythms.",
    history: "Legend says Kunchan Nambiar created Thullal spontaneously after being criticized by a Mizhavu drummer during a Chakyar Koothu performance, inventing a populist art form for everyone.",
    troopSize: "3 Artists (Lead Thullal Performer, Maddalam Player, Cymbalist/Vocalist)",
    duration: "45 Minutes to 1.5 Hours",
    idealOccasions: ["Stage Shows", "College & School Cultural Events", "Community Gatherings", "Festival Programs", "Public Receptions"],
    highlights: [
      "Witty, humorous social commentary accessible to all audiences",
      "Fast-paced energetic footwork synchronized with vocal recitations",
      "Vibrant green facial makeup and wooden breastplate ornaments",
      "Direct interactive rapport with the audience"
    ],
    instruments: ["Maddalam", "Elathalam (Cymbals)"],
    imageUrl: "/art-forms/ottamthullal.png"
  },
  {
    id: "mizhavmelam",
    name: "Mizhavu Melam",
    malayalamName: "മിഴാവ് മേളം",
    category: "Percussion & Music",
    shortDesc: "Electrifying temple percussion ensemble featuring the resonant copper Mizhavu drum played with bare hands.",
    fullDesc: "Mizhavu Melam is a grand percussion symphony centered around the Mizhavu — a huge copper vessel drum played exclusively with bare palms. When played in ensemble with Edakka, Elathalam, and Kurumkuzhal pipe, Mizhavu Melam generates a deep, thrilling acoustic soundscape that reverberates with cosmic energy.",
    history: "Mizhavu is an ancient sacred drum of Kerala temple theaters (Koothambalam), historically consecrated with rituals like a temple deity.",
    troopSize: "5 - 12 Master Percussionists",
    duration: "30 Minutes to 1.5 Hours",
    idealOccasions: ["Event Inaugurations", "Temple Celebrations", "Cultural Conventions", "VIP Receptions", "Music Festivals"],
    highlights: [
      "Handcrafted copper vessel drums (Mizhavu) played with acoustic palm strikes",
      "Rhythmic progression from slow hypnotic tempos to exhilarating crescendo",
      "Accompanied by sweet melodies of Edakka and Kurumkuzhal pipe",
      "Traditional Kerala dhoti attire with golden kasavu borders"
    ],
    instruments: ["Mizhavu (Copper Drum)", "Edakka", "Elathalam", "Kurumkuzhal (Pipe)", "Kombu"],
    imageUrl: "/art-forms/mizhavmelam.png"
  },
  {
    id: "barathanatyam",
    name: "Bharatanatyam",
    malayalamName: "ഭരതനാട്യം",
    category: "Classical Dance",
    shortDesc: "Classical Indian dance form of geometric precision, rhythmic footwork, and rich emotional expressions (Abhinaya).",
    fullDesc: "Bharatanatyam is one of the most celebrated classical dance traditions of South India. Renowned for its sculpted bent-knee posture (Araimandi), crisp rhythmic footwork (Tattadavu), hand gestures (Hastas), and deep facial expressions (Abhinaya), it brings epic narratives and devotional poetry to vibrant stage life.",
    history: "Rooted in the Natya Shastra by sage Bharata Muni, Bharatanatyam evolved from devadasi temple dancers of Tamil Nadu into a global classical jewel.",
    troopSize: "1 Solo Dancer to Ensemble of 10 Dancers",
    duration: "45 Minutes to 2 Hours",
    idealOccasions: ["Stage Recitals", "Cultural Galas", "Grand Weddings", "Award Ceremonies", "Festival Stages"],
    highlights: [
      "Sculpted geometric postures and precise footwork",
      "Vibrant pleated silk costumes and ornate temple jewelry",
      "Rich emotional storytelling (Natyabhinaya)",
      "Accompaniment by Nattuvangam, Carnatic vocal, and Mridangam"
    ],
    instruments: ["Mridangam", "Nattuvangam (Cymbals)", "Violin", "Flute", "Veena"],
    imageUrl: "/art-forms/bharatanatyam.png"
  },
  {
    id: "chakyarkoothu",
    name: "Chakyar Koothu",
    malayalamName: "ചാക്യാർ കൂത്ത്",
    category: "Theater & Puppetry",
    shortDesc: "Satirical solo monologue storytelling by Chakyar artists inside traditional temple theaters with Mizhavu accompaniment.",
    fullDesc: "Chakyar Koothu is an ancient solo theatrical monologue where a single Chakyar performer wearing colorful makeup and a unique winged headpiece narrates stories from epics like Ramayana and Mahabharata. Combining Sanskrit verses, Malayalam commentary, spontaneous wit, and facial mime, the performer humorously critiques societal flaws and engages directly with audience members.",
    history: "Dating back over 1,000 years to the ancient Chera kingdom, Chakyar Koothu was exclusively performed inside temple theaters called Koothambalams.",
    troopSize: "2 Artists (Chakyar Narrator + Mizhavu Drummer)",
    duration: "1 to 2 Hours",
    idealOccasions: ["Heritage Expositions", "Literary & Theater Festivals", "Cultural Symposia", "Temple Events"],
    highlights: [
      "Uncensored witty humor and witty interaction with live audience",
      "Intricate facial mime and ancient Sanskrit verse narration",
      "Distinctive traditional headgear (Ambalavasi Kireetam) and chest motifs",
      "Accompanied by live Mizhavu drum rhythms"
    ],
    instruments: ["Mizhavu (Copper Drum)", "Ilathalam"],
    imageUrl: "/art-forms/chakyarkoothu.png"
  },
  {
    id: "classicaldance",
    name: "Classical Dance",
    malayalamName: "ക്ലാസിക്കൽ ഡാൻസ്",
    category: "Classical Dance",
    shortDesc: "Grand heritage classical dance recitals blending Mohiniyattam, Bharatanatyam, and Indian dance traditions.",
    fullDesc: "Our Classical Dance Troupe showcases magnificent choreography blending the grace of Mohiniyattam, the precision of Bharatanatyam, and the vivid storytelling of Indian dance heritage. Designed for large stage productions, these showcases captivate audiences with synchronized group formations, colorful costumes, and evocative lighting.",
    history: "Curated by master choreographers with decades of training at Kerala Kalamandalam and premier fine art academies.",
    troopSize: "6 - 20 Performers (Dancers & Musicians)",
    duration: "1 to 3 Hours",
    idealOccasions: ["Corporate Conferences", "Tourism Celebrations", "Grand Weddings", "International Cultural Galas"],
    highlights: [
      "Synchronized multi-dancer formations and solos",
      "Rich repertoire ranging from devotional pushpanjali to thillana",
      "Live or high-definition master sound ensemble",
      "Customizable theme-based dance productions"
    ],
    instruments: ["Live Carnatic Ensemble (Mridangam, Violin, Flute, Vocal) or Master Audio"],
    imageUrl: "/art-forms/classicaldance.png"
  },
  {
    id: "kuchipudi",
    name: "Kuchipudi",
    malayalamName: "കുച്ചിപ്പുഡി",
    category: "Classical Dance",
    shortDesc: "Vibrant classical dance-drama known for fluid movements, expressive eyes, and the famous brass plate Tarangam dance.",
    fullDesc: "Kuchipudi is a high-energy Indian classical dance form originating from Kuchelapuram village. Renowned for its blend of brisk footwork, dramatic storytelling (Laya and Abhinaya), and extraordinary feats like Tarangam — where the dancer balances gracefully on the rim of a brass plate holding a water brass pot on her head.",
    history: "Founded in the 17th century by Siddhendra Yogi as a sacred dance-drama tradition, Kuchipudi is today cherished worldwide.",
    troopSize: "1 Solo Performer to Troupe of 8 Dancers",
    duration: "45 Minutes to 2 Hours",
    idealOccasions: ["Stage Performances", "Cultural Galas", "Wedding Celebrations", "Festival Concerts"],
    highlights: [
      "Spectacular Tarangam brass-plate dance balancing climax",
      "Vibrant pleated traditional silk dance attire",
      "Dynamic dramatic eye movements and footwork rhythms",
      "Vocal storytelling and Carnatic live music"
    ],
    instruments: ["Mridangam", "Violin", "Flute", "Kanjira", "Nattuvangam"],
    imageUrl: "/art-forms/kuchipudi.png"
  }
];

export const ART_FORMS_STORAGE_KEY = "pavapetti_art_forms_data";
export const ART_FORMS_EVENT = "pavapetti_art_forms_updated";

export function getStoredArtForms(): ArtForm[] {
  if (typeof window === "undefined") return INITIAL_ART_FORMS;
  try {
    const raw = localStorage.getItem(ART_FORMS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Sync default items with updated image URLs if needed
        return parsed.map((item: ArtForm) => {
          const initialMatch = INITIAL_ART_FORMS.find(init => init.id === item.id);
          if (initialMatch && item.imageUrl.startsWith("http")) {
            return { ...item, imageUrl: initialMatch.imageUrl };
          }
          return item;
        });
      }
    }
  } catch (e) {
    console.error("Failed to parse stored art forms:", e);
  }
  // Initialize default
  localStorage.setItem(ART_FORMS_STORAGE_KEY, JSON.stringify(INITIAL_ART_FORMS));
  return INITIAL_ART_FORMS;
}

export function saveStoredArtForms(artForms: ArtForm[]): void {
  try {
    localStorage.setItem(ART_FORMS_STORAGE_KEY, JSON.stringify(artForms));
    window.dispatchEvent(new Event(ART_FORMS_EVENT));
  } catch (e) {
    console.error("Failed to save art forms:", e);
  }
}

export function addArtForm(newForm: Omit<ArtForm, "id">): ArtForm {
  const current = getStoredArtForms();
  const generatedId = newForm.name.toLowerCase().replace(/[^a-z0-9]/g, "-") + "-" + Date.now();
  const artForm: ArtForm = { ...newForm, id: generatedId };
  const updated = [artForm, ...current];
  saveStoredArtForms(updated);
  return artForm;
}

export function updateArtForm(updatedForm: ArtForm): void {
  const current = getStoredArtForms();
  const updated = current.map(item => item.id === updatedForm.id ? updatedForm : item);
  saveStoredArtForms(updated);
}

export function deleteArtForm(id: string): void {
  const current = getStoredArtForms();
  const updated = current.filter(item => item.id !== id);
  saveStoredArtForms(updated);
}

export function resetArtFormsToDefault(): void {
  saveStoredArtForms(INITIAL_ART_FORMS);
}

export function useArtForms() {
  const [artForms, setArtForms] = useState<ArtForm[]>(() => getStoredArtForms());

  useEffect(() => {
    const handleUpdate = () => {
      setArtForms(getStoredArtForms());
    };

    window.addEventListener(ART_FORMS_EVENT, handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener(ART_FORMS_EVENT, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  return {
    artForms,
    addArtForm,
    updateArtForm,
    deleteArtForm,
    resetArtFormsToDefault
  };
}

export const WHATSAPP_PHONE = "91965816900";

export function generateArtBookingWhatsAppUrl(artForm: ArtForm, customDetails?: {
  name?: string;
  date?: string;
  location?: string;
  eventType?: string;
  notes?: string;
}): string {
  let text = `*NEW ART FORM BOOKING INQUIRY* 🎭\n\n`;
  text += `*Art Form:* ${artForm.name} (${artForm.malayalamName})\n`;
  text += `*Category:* ${artForm.category}\n`;
  text += `*Typical Troupe:* ${artForm.troopSize}\n`;
  
  if (customDetails?.name) text += `*Customer Name:* ${customDetails.name}\n`;
  if (customDetails?.eventType) text += `*Event Type:* ${customDetails.eventType}\n`;
  if (customDetails?.date) text += `*Event Date:* ${customDetails.date}\n`;
  if (customDetails?.location) text += `*Venue / Location:* ${customDetails.location}\n`;
  if (customDetails?.notes) text += `*Special Requirements:* ${customDetails.notes}\n`;

  text += `\n_Namaskaram Pavapetti Heritage! I would like to check availability and booking rates for this performance. Please guide me._`;

  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(text)}`;
}
