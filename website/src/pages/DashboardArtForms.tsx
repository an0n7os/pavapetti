import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Edit, Trash2, Search, X, Check, RefreshCw, Image, 
  Sparkles, Music, Users, Clock, Eye, AlertTriangle
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  ArtForm, useArtForms, addArtForm, updateArtForm, deleteArtForm, resetArtFormsToDefault 
} from "@/data/artForms";

export default function DashboardArtForms() {
  const { artForms } = useArtForms();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingArt, setEditingArt] = useState<ArtForm | null>(null);
  const [deletingArt, setDeletingArt] = useState<ArtForm | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Lock background window scroll when any modal is open
  const isAnyModalOpen = isAddOpen || !!editingArt || !!deletingArt || isResetConfirmOpen;

  useEffect(() => {
    if (isAnyModalOpen) {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    } else {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    }
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [isAnyModalOpen]);

  // Form State
  const [formData, setFormData] = useState<Partial<ArtForm>>({
    name: "",
    malayalamName: "",
    category: "Classical Dance",
    shortDesc: "",
    fullDesc: "",
    history: "",
    troopSize: "",
    duration: "",
    linkUrl: ""
  });

  const categories = ["All", "Classical Dance", "Solo Performance", "Percussion & Music", "Traditional Theater & Puppetry"];

  const filteredArtForms = artForms.filter(art => {
    const matchesCat = categoryFilter === "All" || art.category === categoryFilter;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || 
      art.name.toLowerCase().includes(query) || 
      art.malayalamName.toLowerCase().includes(query) ||
      art.category.toLowerCase().includes(query);
    return matchesCat && matchesSearch;
  });

  const handleOpenAdd = () => {
    setFormData({
      name: "",
      malayalamName: "",
      category: "Classical Dance",
      shortDesc: "",
      fullDesc: "",
      imageUrl: "/hero-dance-v2.webp",
      linkUrl: ""
    });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (art: ArtForm) => {
    setEditingArt(art);
    setFormData({ ...art });
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.malayalamName) return;

    addArtForm({
      name: formData.name || "New Art Form",
      malayalamName: formData.malayalamName || "കലാരൂപം",
      category: (formData.category as any) || "Classical Dance",
      shortDesc: formData.shortDesc || "",
      fullDesc: formData.fullDesc || formData.shortDesc || "",
      history: formData.history || "Traditional heritage performing art of Kerala.",
      troopSize: formData.troopSize || "2 - 6 Performers",
      duration: formData.duration || "1 to 2 Hours",
      idealOccasions: ["Stage Shows", "Cultural Events", "Festivals"],
      highlights: ["Authentic Performance"],
      instruments: [],
      imageUrl: formData.imageUrl || "/hero-dance-v2.webp",
      linkUrl: formData.linkUrl || ""
    });

    setIsAddOpen(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArt || !formData.name) return;

    updateArtForm({
      ...editingArt,
      name: formData.name,
      malayalamName: formData.malayalamName || editingArt.malayalamName,
      category: (formData.category as any) || editingArt.category,
      shortDesc: formData.shortDesc || "",
      fullDesc: formData.fullDesc || formData.shortDesc || "",
      imageUrl: formData.imageUrl || editingArt.imageUrl,
      linkUrl: formData.linkUrl !== undefined ? formData.linkUrl : editingArt.linkUrl
    });

    setEditingArt(null);
  };

  const handleConfirmDelete = () => {
    if (deletingArt) {
      deleteArtForm(deletingArt.id);
      setDeletingArt(null);
    }
  };

  const handleConfirmReset = () => {
    resetArtFormsToDefault();
    setIsResetConfirmOpen(false);
  };

  return (
    <DashboardLayout 
      title="Art Forms & Performing Arts" 
      subtitle="Manage, Edit, Create & Delete Traditional Art Form Bookings"
    >
      <div className="space-y-6">

        {/* ── TOP ACTION BAR ── */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-border/50 shadow-sm">
          
          {/* Left Controls */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search art forms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#f8f6f0] border border-border/60 rounded-xl pl-9 pr-4 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full sm:w-auto bg-[#f8f6f0] border border-border/60 rounded-xl px-3 py-2 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <button
              onClick={() => setIsResetConfirmOpen(true)}
              className="px-3.5 py-2.5 rounded-xl border border-border hover:bg-[#f6f4ee] text-xs font-bold text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-all"
              title="Reset Art Forms to Default 9 Items"
            >
              <RefreshCw size={14} />
              Reset Defaults
            </button>

            <button
              onClick={handleOpenAdd}
              className="px-5 py-2.5 rounded-xl bg-primary text-white hover:bg-primary/90 text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md shadow-primary/20 transition-all hover:scale-[1.02]"
            >
              <Plus size={16} />
              Add New Art Form
            </button>
          </div>
        </div>

        {/* ── ART FORMS LIST / TABLE ── */}
        <div className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border/40 flex items-center justify-between">
            <h3 className="font-serif text-lg font-medium text-foreground">
              Total Listed Art Forms ({filteredArtForms.length})
            </h3>
            <span className="text-xs text-muted-foreground">
              Changes reflect live on <a href="/art-forms" target="_blank" className="text-primary underline font-bold">Public Art Forms Page</a>
            </span>
          </div>

          <div className="divide-y divide-border/40">
            {filteredArtForms.map((art) => (
              <div 
                key={art.id} 
                className="p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#faf8f5] transition-colors"
              >
                {/* Left Info & Image */}
                <div className="flex items-start md:items-center gap-4 flex-1">
                  <div className="w-20 h-16 rounded-xl overflow-hidden bg-[#111] shrink-0 border border-border/60">
                    <img 
                      src={art.imageUrl} 
                      alt={art.name} 
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as any).src = "/hero-dance-v2.webp"; }}
                    />
                  </div>

                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-serif text-lg font-bold text-foreground">
                        {art.name}
                      </h4>
                      <span className="px-2.5 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-bold">
                        {art.malayalamName}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-[#f0ede6] text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        {art.category}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground/80 line-clamp-1 italic font-serif">
                      "{art.shortDesc}"
                    </p>

                    <div className="flex items-center gap-4 text-[11px] text-muted-foreground font-medium pt-0.5">
                      <span className="flex items-center gap-1">
                        <Users size={12} className="text-primary" /> {art.troopSize}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} className="text-primary" /> {art.duration}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div className="flex items-center gap-2 shrink-0 justify-end pt-2 md:pt-0 border-t md:border-t-0 border-border/30">
                  <button
                    onClick={() => handleOpenEdit(art)}
                    className="px-4 py-2 rounded-xl bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                  >
                    <Edit size={14} />
                    Edit
                  </button>
                  <button
                    onClick={() => setDeletingArt(art)}
                    className="px-4 py-2 rounded-xl bg-red-500/10 text-red-600 hover:bg-red-500/20 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── ADD / EDIT MODAL ── */}
      <AnimatePresence>
        {(isAddOpen || editingArt) && (
          <div data-lenis-prevent className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overscroll-contain">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2rem] overflow-hidden max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-white/20 overscroll-contain"
              data-lenis-prevent
            >
              {/* Modal Header */}
              <div className="bg-[#0a0a09] text-white p-6 flex items-center justify-between relative">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                    {editingArt ? "Edit Existing Art Form" : "Add New Performing Art Form"}
                  </span>
                  <h3 className="font-serif text-2xl text-[#f8f5ee]">
                    {editingArt ? `Editing ${editingArt.name}` : "Create New Listing"}
                  </h3>
                </div>
                <button
                  onClick={() => { setIsAddOpen(false); setEditingArt(null); }}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={editingArt ? handleSaveEdit : handleSaveAdd} className="p-6 overflow-y-auto space-y-4 flex-1">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-foreground/70 mb-1">
                      Art Form Name (English) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Theyyam"
                      value={formData.name || ""}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-[#f8f6f0] border border-border/60 rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-foreground/70 mb-1">
                      Malayalam Name (മലയാളത്തിൽ) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. തെയ്യം"
                      value={formData.malayalamName || ""}
                      onChange={(e) => setFormData({ ...formData, malayalamName: e.target.value })}
                      className="w-full bg-[#f8f6f0] border border-border/60 rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-foreground/70 mb-1">
                      Category *
                    </label>
                    <select
                      value={formData.category || "Classical Dance"}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                      className="w-full bg-[#f8f6f0] border border-border/60 rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="Classical Dance">Classical Dance</option>
                      <option value="Solo Performance">Solo Performance</option>
                      <option value="Percussion & Music">Percussion &amp; Music</option>
                      <option value="Traditional Theater & Puppetry">Traditional Theater &amp; Puppetry</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-foreground/70 mb-1">
                      Image URL / Asset Path *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="/hero-dance-v2.webp or https://..."
                      value={formData.imageUrl || ""}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      className="w-full bg-[#f8f6f0] border border-border/60 rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-foreground/70 mb-1">
                    Description *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Enter detailed description of the art form..."
                    value={formData.shortDesc || ""}
                    onChange={(e) => setFormData({ ...formData, shortDesc: e.target.value, fullDesc: e.target.value })}
                    className="w-full bg-[#f8f6f0] border border-border/60 rounded-xl p-3.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-foreground/70 mb-1">
                    Attach Link / Video URL (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://youtube.com/... or https://wa.me/..."
                    value={formData.linkUrl || ""}
                    onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                    className="w-full bg-[#f8f6f0] border border-border/60 rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="pt-4 border-t border-border/40 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => { setIsAddOpen(false); setEditingArt(null); }}
                    className="px-5 py-2.5 rounded-xl border border-border text-xs font-bold uppercase tracking-wider hover:bg-[#f6f4ee]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-primary text-white font-bold text-xs uppercase tracking-wider hover:bg-primary/90 shadow-md shadow-primary/20"
                  >
                    {editingArt ? "Save Changes" : "Create Art Form"}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── DELETE CONFIRMATION MODAL ── */}
      <AnimatePresence>
        {deletingArt && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2rem] overflow-hidden max-w-md w-full p-6 space-y-5 shadow-2xl border border-red-500/20 text-center"
            >
              <div className="w-14 h-14 rounded-full bg-red-500/10 text-red-600 mx-auto flex items-center justify-center">
                <AlertTriangle size={28} />
              </div>

              <div>
                <h3 className="font-serif text-2xl font-bold text-foreground">
                  Delete {deletingArt.name}?
                </h3>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  Are you sure you want to delete <span className="font-bold text-foreground">{deletingArt.name} ({deletingArt.malayalamName})</span>? This action will remove it from the public Art Forms page immediately.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setDeletingArt(null)}
                  className="w-1/2 py-3 rounded-xl border border-border text-xs font-bold uppercase tracking-wider hover:bg-[#f6f4ee]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="w-1/2 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-red-600/20"
                >
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── RESET CONFIRMATION MODAL ── */}
      <AnimatePresence>
        {isResetConfirmOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2rem] overflow-hidden max-w-md w-full p-6 space-y-5 shadow-2xl border border-primary/20 text-center"
            >
              <div className="w-14 h-14 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center">
                <RefreshCw size={26} />
              </div>

              <div>
                <h3 className="font-serif text-2xl font-bold text-foreground">
                  Reset Default Art Forms?
                </h3>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  This will restore the original 9 Kerala performing art forms (Kathakali, Tholpavakoothu, Mohiniyattam, etc.).
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setIsResetConfirmOpen(false)}
                  className="w-1/2 py-3 rounded-xl border border-border text-xs font-bold uppercase tracking-wider hover:bg-[#f6f4ee]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmReset}
                  className="w-1/2 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-primary/20"
                >
                  Reset Defaults
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </DashboardLayout>
  );
}
