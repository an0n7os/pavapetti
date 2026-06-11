import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { X, Minus, Plus, Trash2, ShoppingBag, Phone, MessageCircle, ArrowRight, ArrowLeft, MoreVertical, Video, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";

export default function CartDrawer() {
  const { items, count, total, isOpen, closeCart, removeItem, updateQty, clearCart } = useCart();
  const [, setLocation] = useLocation();

  const PHONE = "919292016901";

  function buildWhatsAppMessage() {
    const lines = items.map(
      (item) => `• ${item.name} (×${item.quantity}) — ₹${(item.price * item.quantity).toLocaleString("en-IN")}`
    );
    const msg =
      `Hi! I'd like to place an order from Pavapetti:\n\n` +
      lines.join("\n") +
      `\n\n*Total: ₹${total.toLocaleString("en-IN")}*\n\nPlease confirm availability.`;
    return encodeURIComponent(msg);
  }

  function handleWhatsApp() {
    window.open(`https://wa.me/${PHONE}?text=${buildWhatsAppMessage()}`, "_blank");
  }

  function handleCall() {
    window.open(`tel:+${PHONE}`, "_self");
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-[100] backdrop-blur-[4px]"
            onClick={closeCart}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 h-full w-full max-w-[480px] bg-[#efeae2] shadow-2xl z-[110] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#008069] text-white shadow-md z-10">
              <div className="flex items-center gap-3">
                <button
                  onClick={closeCart}
                  className="p-1 rounded-full hover:bg-white/10 transition-colors text-white"
                >
                  <ArrowLeft size={20} />
                </button>
                
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center relative select-none">
                  <span className="font-serif font-black text-lg text-white">P</span>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#008069] animate-pulse" />
                </div>

                <div>
                  <h2 className="font-sans font-bold text-sm leading-tight">Pavapetti Boutique</h2>
                  <p className="text-[10px] text-emerald-100 font-medium">online</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-white/90">
                <button className="p-2 rounded-full hover:bg-white/10 transition-colors hidden sm:block">
                  <Video size={18} />
                </button>
                <button className="p-2 rounded-full hover:bg-white/10 transition-colors hidden sm:block" onClick={handleCall}>
                  <Phone size={16} />
                </button>
                <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
                  <MoreVertical size={18} />
                </button>
              </div>
            </div>

            {/* Items / Chat Area */}
            <div 
              className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
              style={{
                backgroundColor: "#efeae2",
                backgroundImage: "radial-gradient(#dfd9d0 1px, transparent 1px)",
                backgroundSize: "16px 16px"
              }}
            >
              {/* WhatsApp System Encrypted Notice */}
              <div className="mx-auto my-2 px-3 py-1.5 rounded-lg bg-[#ffe596]/30 border border-[#ffe596]/40 text-[10px] text-amber-800 text-center max-w-[85%] flex items-center gap-1 justify-center leading-normal">
                <span>🔒</span>
                <span>Items in your cart are temporarily reserved. Proceed to order via WhatsApp.</span>
              </div>

              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-70 py-12 px-6">
                  <div className="w-16 h-16 rounded-full bg-white/50 backdrop-blur-sm flex items-center justify-center text-slate-400 mb-4 shadow-sm border border-black/5">
                    <ShoppingBag size={28} strokeWidth={1.5} />
                  </div>
                  <p className="font-sans font-bold text-slate-700 text-lg mb-1">Your Boutique Bag is Empty</p>
                  <p className="text-xs text-slate-500 max-w-[280px]">
                    Browse our collection and add heritage treasures to start this chat.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item, i) => (
                    <motion.div
                      key={item.productId}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-[#d9fdd3] text-foreground rounded-2xl rounded-tr-none shadow-[0_1px_1px_rgba(0,0,0,0.1)] relative p-3.5 ml-6 mr-1"
                    >
                      {/* Tail SVG */}
                      <span className="absolute top-0 right-[-8px] text-[#d9fdd3] select-none pointer-events-none">
                        <svg width="9" height="12" viewBox="0 0 9 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M0 0C4.5 0 9 0 9 0V12C9 12 7 6 0 0Z" fill="currentColor"/>
                        </svg>
                      </span>

                      <div className="flex gap-4">
                        {/* Thumbnail */}
                        <div className="w-16 h-20 rounded-lg overflow-hidden bg-white shrink-0 border border-black/5 shadow-sm">
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        
                        <div className="flex-1 flex flex-col min-w-0">
                          {/* Name & Remove */}
                          <div className="flex justify-between items-start gap-2 mb-1">
                            <p className="text-[12.5px] font-bold text-slate-800 leading-tight truncate">{item.name}</p>
                            <button onClick={() => removeItem(item.productId)} className="text-slate-400 hover:text-red-500 transition-colors p-0.5">
                              <Trash2 size={13} />
                            </button>
                          </div>
                          
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">
                            {item.categoryName || "Handcrafted Piece"}
                          </p>
                          
                          {/* Controls & Price */}
                          <div className="mt-auto flex items-end justify-between gap-2">
                            <div className="flex items-center gap-3 bg-white/70 px-2.5 py-1 rounded-full border border-black/5 shadow-sm">
                              <button onClick={() => updateQty(item.productId, item.quantity - 1)} className="text-slate-500 hover:text-slate-800 transition-colors">
                                <Minus size={11} />
                              </button>
                              <span className="text-[11px] font-bold w-3.5 text-center text-slate-800">{item.quantity}</span>
                              <button onClick={() => updateQty(item.productId, item.quantity + 1)} className="text-slate-500 hover:text-slate-800 transition-colors">
                                <Plus size={11} />
                              </button>
                            </div>
                            
                            <div className="flex flex-col items-end">
                              {item.mrp && item.mrp > item.price && (
                                <div className="flex items-center gap-1 mb-0.5">
                                  <span className="text-[10px] text-slate-400/80 line-through">
                                    ₹{(item.mrp * item.quantity).toLocaleString("en-IN")}
                                  </span>
                                  <span className="text-[8px] font-black tracking-wider uppercase px-1.5 py-0.2 rounded-full bg-emerald-500 text-white leading-none">
                                    {Math.round(((item.mrp - item.price) / item.mrp) * 100)}% OFF
                                  </span>
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <span className="text-[13px] font-black text-slate-800">
                                  ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                                </span>
                                <CheckCheck size={14} className="text-[#34b7f1] shrink-0" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="px-5 py-4 bg-[#f0f2f5] border-t border-black/5 z-10 flex flex-col gap-3">
                {/* Order Summary styled as WhatsApp Invoice Card */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-black/5 space-y-2.5">
                  <div className="flex justify-between items-center text-xs border-b border-slate-100 pb-2">
                    <span className="font-bold text-slate-600 uppercase tracking-widest text-[9px]">Acquisitions Invoice</span>
                    <span className="text-[10px] text-slate-400 font-medium">🔒 Secure Checkout</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Treasures ({count})</span>
                    <span>₹{total.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Shipping</span>
                    <span className="text-emerald-600 font-bold uppercase tracking-wider text-[9px]">Calculated in Chat</span>
                  </div>
                  <div className="flex justify-between items-end pt-2 border-t border-dashed border-slate-200">
                    <span className="font-bold text-slate-800">Total Amount</span>
                    <span className="text-lg font-black text-[#008069]">₹{total.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                {/* Bottom Buttons */}
                <div className="flex flex-col gap-2">
                  <Button
                    className="w-full py-4 h-auto bg-[#25D366] hover:bg-[#1ebe5d] text-white rounded-xl text-xs font-black tracking-widest uppercase shadow-md shadow-green-500/20 flex items-center justify-center gap-2 border-none transition-all hover:scale-[1.01]"
                    onClick={handleWhatsApp}
                  >
                    <MessageCircle size={15} className="fill-white/10" />
                    Order via WhatsApp
                  </Button>
                  
                  <Button
                    className="w-full py-4 h-auto bg-[#008069] hover:bg-[#006e5a] text-white rounded-xl text-xs font-bold tracking-[0.25em] uppercase hover:gap-3 transition-all flex items-center justify-center gap-2 border-none shadow-sm"
                    onClick={() => {
                      closeCart();
                      setLocation("/checkout");
                    }}
                  >
                    Proceed to Checkout <ArrowRight size={14} />
                  </Button>
                </div>
                
                <p className="text-[9px] text-center text-slate-400 font-medium uppercase tracking-widest">
                  ⚡ Direct Support & UPI/Bank Transfer in Chat
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

