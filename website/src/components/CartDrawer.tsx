import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { X, Minus, Plus, Trash2, ShoppingBag, Phone, MessageCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";

export default function CartDrawer() {
  const { items, count, total, isOpen, closeCart, removeItem, updateQty, clearCart } = useCart();
  const [, setLocation] = useLocation();

  const PHONE = "919042525110";

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
            className="fixed top-0 right-0 h-full w-full max-w-[480px] bg-white shadow-2xl z-[110] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-border/50">
              <div>
                <h2 className="font-serif text-2xl font-light text-foreground">Your Boutique Bag</h2>
                <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] mt-1">
                  {count} {count === 1 ? "Exquisite Piece" : "Treasured Pieces"}
                </p>
              </div>
              <button
                onClick={closeCart}
                className="p-3 rounded-full hover:bg-[#f9f7f4] transition-all text-muted-foreground hover:text-primary group"
              >
                <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-8 py-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                  <ShoppingBag size={40} strokeWidth={1} className="mb-6" />
                  <p className="font-serif text-xl mb-2">Your bag is empty</p>
                  <p className="text-sm">Add some heritage treasures to your collection</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {items.map((item, i) => (
                    <motion.div
                      key={item.productId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex gap-6 group"
                    >
                      <div className="w-24 h-32 rounded-xl overflow-hidden bg-[#f9f7f4] shrink-0 border border-border/30 shadow-sm">
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      </div>
                      <div className="flex-1 flex flex-col py-1">
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-[13px] font-bold text-foreground leading-tight">{item.name}</p>
                          <button onClick={() => removeItem(item.productId)} className="text-muted-foreground hover:text-primary transition-colors p-1">
                            <X size={14} />
                          </button>
                        </div>
                        <p className="text-[11px] text-muted-foreground italic mb-4">{item.categoryName || "Handcrafted Piece"}</p>
                        
                        <div className="mt-auto flex items-center justify-between">
                          <div className="flex items-center gap-4 bg-[#f9f7f4] px-4 py-1.5 rounded-full border border-border/50">
                            <button onClick={() => updateQty(item.productId, item.quantity - 1)} className="text-muted-foreground hover:text-primary transition-colors">
                              <Minus size={12} />
                            </button>
                            <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                            <button onClick={() => updateQty(item.productId, item.quantity + 1)} className="text-muted-foreground hover:text-primary transition-colors">
                              <Plus size={12} />
                            </button>
                          </div>
                          <div className="flex flex-col items-end gap-0.5">
                            {item.mrp && item.mrp > item.price && (
                              <div className="flex items-center gap-1.5">
                                <span className="text-[11px] text-muted-foreground/50 line-through">
                                  ₹{(item.mrp * item.quantity).toLocaleString("en-IN")}
                                </span>
                                <span className="text-[8px] font-black tracking-[0.1em] uppercase px-1.5 py-0.5 rounded-full bg-emerald-500 text-white">
                                  {Math.round(((item.mrp - item.price) / item.mrp) * 100)}% OFF
                                </span>
                              </div>
                            )}
                            <span className="text-[13px] font-bold text-primary">₹{(item.price * item.quantity).toLocaleString("en-IN")}</span>
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
              <div className="px-8 py-8 bg-gradient-to-b from-[#f9f7f4] to-[#f4f0ea] border-t border-border/50 rounded-t-[2rem]">


                <div className="flex justify-between items-end mb-6">
                  <span className="font-serif text-lg">Subtotal</span>
                  <span className="text-2xl font-serif text-primary">₹{total.toLocaleString("en-IN")}</span>
                </div>

                <div className="grid gap-3.5">
                  <Button
                    className="w-full py-5 h-auto bg-primary text-primary-foreground rounded-full text-[12px] font-bold tracking-[0.25em] uppercase hover:gap-4 transition-all group shadow-lg shadow-primary/20"
                    onClick={() => {
                      closeCart();
                      setLocation("/checkout");
                    }}
                  >
                    Proceed to Checkout <ArrowRight size={16} className="ml-2" />
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full py-5 h-auto border-primary/10 hover:border-primary/30 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-white transition-all"
                    onClick={handleWhatsApp}
                  >
                    Order via WhatsApp <MessageCircle size={14} className="ml-2 text-green-500" />
                  </Button>
                </div>
                <p className="text-[10px] text-center text-muted-foreground mt-4 italic">Worldwide heritage delivery available.</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

