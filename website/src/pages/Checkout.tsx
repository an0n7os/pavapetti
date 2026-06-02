import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Check, ShoppingBag, ArrowLeft, MessageCircle, MapPin, Phone, User, CreditCard } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";

const PHONE = "919042525110";

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { items, total, clearCart } = useCart();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isOrdered, setIsOrdered] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zip: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleConfirmOrder = () => {
    if (!formData.name || !formData.phone || !formData.address) {
      toast({
        title: "Missing Information",
        description: "Please fill in your name, phone, and delivery address to secure your acquisition.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    // Construct WhatsApp Message
    const orderSummary = items.map(item => `• ${item.name} (x${item.quantity}) - ₹${item.price.toLocaleString("en-IN")}`).join("\n");
    const message = encodeURIComponent(
      `*NEW ORDER - PAVAPETTI HERITAGE*\n\n` +
      `*Order Details:*\n${orderSummary}\n\n` +
      `*Total Amount:* ₹${total.toLocaleString("en-IN")}\n\n` +
      `*Customer Information:*\n` +
      `Name: ${formData.name}\n` +
      `Phone: ${formData.phone}\n` +
      `Email: ${formData.email || "N/A"}\n\n` +
      `*Shipping Address:*\n` +
      `${formData.address}, ${formData.city} - ${formData.zip}\n\n` +
      `_Please confirm my order and let me know the payment details._`
    );

    window.open(`https://wa.me/${PHONE}?text=${message}`, "_blank");
    
    setTimeout(() => {
      setLoading(false);
      setIsOrdered(true);
      clearCart();
    }, 1000);
  };

  if (isOrdered) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <Navbar />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-[#f9f7f4] p-10 rounded-[2.5rem] border border-primary/10 shadow-2xl text-center space-y-6 mt-20"
        >
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto text-[#25D366]">
            <Check size={40} />
          </div>
          <h2 className="font-serif text-3xl text-foreground">Order Initiated</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Your collection has been sent to our curator on WhatsApp! We will confirm your delivery and share secure payment details (UPI/Bank Transfer) in the chat shortly.
          </p>
          <div className="bg-white p-6 rounded-2xl border border-primary/5 text-left text-xs space-y-2">
            <p className="text-primary font-bold uppercase tracking-widest text-[9px]">Acquisitions Department</p>
            <p><strong>Curator:</strong> Pavapetti Heritage Boutique</p>
            <p><strong>Delivery Time:</strong> 3-5 Business Days</p>
            <p><strong>Payment Mode:</strong> WhatsApp Secured UPI / NetBanking</p>
          </div>
          <Button onClick={() => setLocation("/")} className="w-full rounded-full py-6 bg-primary text-primary-foreground font-black text-xs tracking-[0.2em] uppercase shadow-xl hover:scale-[1.02] transition-all">
            Return to Gallery
          </Button>
        </motion.div>
        <div className="mt-auto w-full">
          <Footer />
        </div>
      </div>
    );
  }

  if (items.length === 0 && !loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <Navbar />
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag size={32} className="text-muted-foreground/40" />
          </div>
          <h2 className="font-serif text-3xl mb-4">Your collection is empty</h2>
          <p className="text-muted-foreground mb-8">Add some heritage pieces to your collection before checking out.</p>
          <Button onClick={() => setLocation("/products")} variant="outline" className="rounded-full px-8 py-6">
            Explore Collection
          </Button>
        </motion.div>
        <div className="mt-auto w-full">
          <Footer />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 pt-32 pb-24">
        <div className="flex items-center gap-4 mb-12">
          <button onClick={() => setLocation("/")} className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="font-serif text-4xl font-light">Confirm <span className="italic">Collection</span></h1>
            <p className="text-muted-foreground text-sm uppercase tracking-widest mt-1">Finalize your heritage acquisition</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-16">
          {/* Shipping Form */}
          <div className="lg:col-span-7 space-y-12 order-2 lg:order-1">
            <section>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User size={14} className="text-primary" />
                </div>
                <h2 className="text-lg font-serif">Personal Details</h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground ml-1">Full Name *</label>
                  <Input 
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name" 
                    className="rounded-xl border-border/60 focus:border-primary/40 py-6" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground ml-1">Phone Number *</label>
                  <Input 
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+91 00000 00000" 
                    className="rounded-xl border-border/60 focus:border-primary/40 py-6" 
                  />
                </div>
                <div className="sm:col-span-2 space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground ml-1">Email Address (Optional)</label>
                  <Input 
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="name@example.com" 
                    className="rounded-xl border-border/60 focus:border-primary/40 py-6" 
                  />
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <MapPin size={14} className="text-primary" />
                </div>
                <h2 className="text-lg font-serif">Shipping Address</h2>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground ml-1">Delivery Address *</label>
                  <Textarea 
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="House name, Street, Landmark..." 
                    className="rounded-xl border-border/60 focus:border-primary/40 min-h-[120px] p-4" 
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground ml-1">City</label>
                    <Input 
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="e.g. Kochi" 
                      className="rounded-xl border-border/60 focus:border-primary/40 py-6" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground ml-1">ZIP / Postal Code</label>
                    <Input 
                      name="zip"
                      value={formData.zip}
                      onChange={handleInputChange}
                      placeholder="000 000" 
                      className="rounded-xl border-border/60 focus:border-primary/40 py-6" 
                    />
                  </div>
                </div>
              </div>
            </section>

            <div className="bg-primary/5 p-8 rounded-[2rem] border border-primary/10">
              <div className="flex gap-4">
                <CreditCard className="text-primary shrink-0" size={24} />
                <div>
                  <h4 className="font-serif text-lg mb-1">Direct Order Fulfillment</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Once you confirm, we will connect you directly with our curator on WhatsApp to finalize payment and shipping. We accept UPI, Bank Transfer, and International wire.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-5 order-1 lg:order-2">
            <div className="bg-[#f9f7f4] p-10 rounded-[2.5rem] border border-border/40 sticky top-32">
              <h3 className="font-serif text-2xl mb-8">Summary</h3>
              
              <div className="space-y-6 mb-10 max-h-[300px] overflow-y-auto pr-4 scrollbar-thin">
                {items.map((item) => (
                  <div key={item.productId} className="flex gap-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-white shrink-0 shadow-sm">
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold truncate mb-1">{item.name}</h4>
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                        <p className="text-sm font-bold text-primary">₹{(item.price * item.quantity).toLocaleString("en-IN")}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-6 border-t border-border/40 mb-10">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold">Subtotal</span>
                  <span className="font-medium">₹{total.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold">Shipping</span>
                  <span className="text-primary font-bold text-[10px] tracking-widest uppercase">Calculated in Chat</span>
                </div>
                <div className="flex justify-between items-end pt-4 border-t border-border/40">
                  <span className="font-serif text-xl">Grand Total</span>
                  <span className="text-3xl font-light text-primary">₹{total.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <Button 
                onClick={handleConfirmOrder}
                disabled={loading}
                className="w-full rounded-full py-8 bg-primary text-primary-foreground font-black text-xs tracking-[0.3em] uppercase shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all gap-3"
              >
                {loading ? (
                  "Processing..."
                ) : (
                  <>
                    <MessageCircle size={18} />
                    Confirm & Order via WhatsApp
                  </>
                )}
              </Button>
              
              <div className="flex items-center justify-center gap-2 mt-6 text-[#25D366]">
                <Check size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Safe & Secure Curator Chat</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
