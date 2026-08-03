import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, X, Check, Package, Upload, Star, Eye, EyeOff, Sparkles } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import DashboardLayout from "@/components/DashboardLayout";
import {
  useListProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useListCategories,
  getListProductsQueryKey,
  getListCategoriesQueryKey,
  getGetDashboardStatsQueryKey,
  type Product,
  type CreateProductBody,
} from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { uploadImageToStorage } from "@/lib/supabase";

const emptyForm: CreateProductBody = {
  name: "",
  description: "",
  price: 0,
  mrp: 0,
  imageUrl: "",
  images: [],
  categoryId: 0,
  additionalCategoryIds: [],
  stock: 0,
  featured: false,
  isVisible: true,
  isNewArrival: false,
  material: "",
  size: "",
  weight: "",
};

const inputCls = "bg-white border border-primary/10 hover:border-primary/25 rounded-xl py-2.5 px-4 text-sm tracking-wide focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all shadow-sm outline-none placeholder:text-muted-foreground/35 h-auto";
const labelCls = "text-[10px] font-black tracking-[0.22em] uppercase text-primary/75";

export default function DashboardProducts() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState<CreateProductBody>(emptyForm);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [uploadingMain, setUploadingMain] = useState(false);
  const [uploadingExtra, setUploadingExtra] = useState(false);

  const { data: products, isLoading } = useListProducts(undefined, {
    query: { queryKey: getListProductsQueryKey() },
  });
  const { data: categories } = useListCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const invalidate = () => {
    try {
      localStorage.removeItem("cached-products");
      localStorage.removeItem("cached-categories");
    } catch {}
    queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetDashboardStatsQueryKey() });
  };

  const openAdd = () => {
    setEditProduct(null);
    setForm(emptyForm);
    setDiscountPercent(0);
    setShowForm(true);
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 50);
  };

  const openEdit = (product: Product) => {
    setEditProduct(product);
    const initialPrice = product.price;
    const initialMrp = (product.mrp && product.mrp > 0) ? product.mrp : product.price;
    const discount = initialMrp > initialPrice ? Math.round(((initialMrp - initialPrice) / initialMrp) * 100) : 0;
    setDiscountPercent(discount);
    setForm({
      name: product.name,
      description: product.description,
      price: initialPrice,
      mrp: initialMrp,
      imageUrl: product.imageUrl,
      images: product.images || [product.imageUrl],
      categoryId: product.categoryId,
      additionalCategoryIds: (product as any).additionalCategoryIds || [],
      stock: product.stock,
      featured: product.featured,
      isVisible: product.isVisible !== undefined ? product.isVisible : true,
      isNewArrival: product.isNewArrival || false,
      material: product.material || "",
      size: product.size || "",
      weight: product.weight || "",
    });
    setShowForm(true);
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 50);
  };

  const handlePriceChange = (newPrice: number) => {
    const mrp = form.mrp || 0;
    let newDiscount = 0;
    if (mrp > newPrice) newDiscount = Math.round(((mrp - newPrice) / mrp) * 100);
    setDiscountPercent(newDiscount);
    setForm(prev => ({ ...prev, price: newPrice }));
  };

  const handleMrpChange = (newMrp: number) => {
    let newPrice = form.price;
    if (newMrp > 0 && discountPercent > 0) {
      newPrice = Math.round(newMrp * (1 - discountPercent / 100) * 100) / 100;
    } else if (newMrp > form.price && form.price > 0) {
      setDiscountPercent(Math.round(((newMrp - form.price) / newMrp) * 100));
    } else if (newMrp <= form.price) {
      setDiscountPercent(0);
    }
    setForm(prev => ({ ...prev, mrp: newMrp, price: newPrice }));
  };

  const handleDiscountChange = (newDiscount: number) => {
    const mrp = form.mrp || 0;
    let newPrice = form.price;
    if (mrp > 0) newPrice = Math.round(mrp * (1 - newDiscount / 100) * 100) / 100;
    setDiscountPercent(newDiscount);
    setForm(prev => ({ ...prev, price: newPrice }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sanitizedForm = {
      ...form,
      price: Number(form.price) || 0,
      mrp: form.mrp ? Number(form.mrp) : undefined,
      stock: parseInt(String(form.stock), 10) || 0,
      imageUrl: form.imageUrl || "",
      description: form.description || "",
    };
    if (editProduct) {
      updateProduct.mutate(
        { id: editProduct.id, data: sanitizedForm },
        {
          onSuccess: () => { toast({ title: "✅ Product updated successfully" }); setShowForm(false); invalidate(); },
          onError: (error: any) => toast({ title: "Failed to update product", description: error.message, variant: "destructive" }),
        }
      );
    } else {
      createProduct.mutate(
        { data: sanitizedForm },
        {
          onSuccess: () => { toast({ title: "✅ Product created successfully" }); setShowForm(false); invalidate(); },
          onError: (error: any) => toast({ title: "Failed to create product", description: error.message, variant: "destructive" }),
        }
      );
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isMain: boolean = true) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (isMain) setUploadingMain(true); else setUploadingExtra(true);
    try {
      const publicUrl = await uploadImageToStorage(file);
      if (isMain) { setForm(prev => ({ ...prev, imageUrl: publicUrl })); toast({ title: "✅ Image uploaded to CDN" }); }
      else { setForm(prev => ({ ...prev, images: [...(prev.images || []), publicUrl] })); toast({ title: "✅ Extra image uploaded" }); }
    } catch (err: any) {
      toast({ title: "Image upload failed", description: err?.message, variant: "destructive" });
    } finally {
      if (isMain) setUploadingMain(false); else setUploadingExtra(false);
    }
  };

  const handleDelete = () => {
    if (deleteId == null) return;
    deleteProduct.mutate(
      { id: deleteId },
      {
        onSuccess: () => { toast({ title: "Product deleted" }); setDeleteId(null); invalidate(); },
        onError: () => toast({ title: "Failed to delete product", variant: "destructive" }),
      }
    );
  };

  const isPending = createProduct.isPending || updateProduct.isPending;

  return (
    <DashboardLayout title="Products Archive" subtitle="Manage your complete product catalog">
      {/* Header row */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-sm text-muted-foreground">{(products ?? []).length} products total</p>
        </div>
        <Button
          onClick={openAdd}
          className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl px-6 py-3 h-auto text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 transition-all"
          data-testid="button-add-product"
        >
          <Plus size={18} /> Add Product
        </Button>
      </div>

      {/* Add/Edit Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="mb-8"
          >
            <Card className="border border-primary/10 rounded-[2rem] bg-[#fdfbf7] shadow-2xl shadow-primary/8 overflow-hidden">
              {/* Form Header */}
              <CardHeader className="pb-4 pt-6 px-8 border-b border-primary/5 flex-row items-center justify-between bg-gradient-to-r from-[#faf7f2] to-[#fdfbf7]">
                <div>
                  <span className="text-[9px] tracking-[0.4em] text-primary/70 uppercase font-black block mb-1">
                    {editProduct ? "✏️ Editing Record" : "➕ New Entry"}
                  </span>
                  <CardTitle className="font-serif text-2xl font-light text-foreground">
                    {editProduct ? "Modify Product Details" : "Add New Product"}
                  </CardTitle>
                </div>
                <Button
                  size="sm" variant="ghost"
                  className="rounded-full hover:bg-primary/8 text-muted-foreground hover:text-foreground p-2 h-auto"
                  onClick={() => setShowForm(false)}
                  data-testid="button-close-form"
                >
                  <X size={18} />
                </Button>
              </CardHeader>

              <CardContent className="p-7">
                <form onSubmit={handleSubmit}>

                  {/* ── Section 1: Basic Info ── */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-black">1</div>
                      <span className="text-[10px] font-black tracking-[0.3em] uppercase text-primary/70">Basic Information</span>
                      <div className="flex-1 h-px bg-primary/8" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1.5 md:col-span-2">
                        <Label htmlFor="name" className={labelCls}>Product Name *</Label>
                        <Input id="name" className={inputCls} placeholder="e.g. Nataraja Dancing Shiva Copper Statue" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required data-testid="input-product-name" />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="category" className={labelCls}>Primary Category *</Label>
                        <Select value={form.categoryId ? String(form.categoryId) : ""} onValueChange={(v) => setForm({ ...form, categoryId: parseInt(v, 10) })}>
                          <SelectTrigger className={`${inputCls} flex`} data-testid="select-category">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            {(categories ?? []).map((cat: any) => (
                              <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <Label className={labelCls}>Also Show In</Label>
                        <div className="bg-white border border-primary/10 rounded-xl p-2.5 max-h-[7.5rem] overflow-y-auto shadow-sm space-y-1">
                          {(categories ?? []).filter((cat: any) => cat.id !== form.categoryId).map((cat: any) => {
                            const checked = (form.additionalCategoryIds || []).includes(cat.id);
                            return (
                              <label key={cat.id} className="flex items-center gap-2 cursor-pointer group">
                                <div
                                  className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center transition-all duration-200 shrink-0 ${checked ? "bg-primary border-primary" : "border-primary/20 bg-white group-hover:border-primary/50"}`}
                                  onClick={() => {
                                    const curr = form.additionalCategoryIds || [];
                                    setForm({ ...form, additionalCategoryIds: checked ? curr.filter(id => id !== cat.id) : [...curr, cat.id] });
                                  }}
                                >
                                  {checked && <Check size={8} className="text-white" strokeWidth={3} />}
                                </div>
                                <span className={`text-xs transition-colors ${checked ? "text-primary font-medium" : "text-muted-foreground group-hover:text-foreground"}`}>{cat.name}</span>
                              </label>
                            );
                          })}
                          {(categories ?? []).length <= 1 && (
                            <p className="text-xs text-muted-foreground/50 italic py-1">No other categories available</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1.5 md:col-span-2">
                        <Label htmlFor="description" className={labelCls}>Product Description</Label>
                        <Textarea
                          id="description"
                          placeholder="Describe the product — heritage, materials, craftsmanship..."
                          value={form.description}
                          onChange={(e) => setForm({ ...form, description: e.target.value })}
                          rows={3}
                          className="bg-white border border-primary/10 hover:border-primary/25 rounded-xl py-2.5 px-4 text-sm focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all shadow-sm outline-none resize-none placeholder:text-muted-foreground/35"
                          data-testid="input-description"
                        />
                      </div>
                    </div>
                  </div>

                  {/* ── Section 2: Pricing & Stock ── */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-black">2</div>
                      <span className="text-[10px] font-black tracking-[0.3em] uppercase text-primary/70">Pricing & Inventory</span>
                      <div className="flex-1 h-px bg-primary/8" />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="mrp" className={labelCls}>MRP (₹)</Label>
                        <Input id="mrp" type="number" min="0" step="0.01" placeholder="0" className={inputCls} value={form.mrp || ""} onChange={(e) => handleMrpChange(parseFloat(e.target.value) || 0)} data-testid="input-mrp" />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="discount" className={labelCls}>Discount %</Label>
                        <Input id="discount" type="number" min="0" max="100" placeholder="0" className={inputCls} value={discountPercent || ""} onChange={(e) => handleDiscountChange(parseFloat(e.target.value) || 0)} data-testid="input-discount" />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="price" className={labelCls}>Sale Price (₹) *</Label>
                        <Input id="price" type="number" min="0" step="0.01" placeholder="0" className={`${inputCls} font-semibold text-primary`} value={form.price || ""} onChange={(e) => handlePriceChange(parseFloat(e.target.value) || 0)} required data-testid="input-price" />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="stock" className={labelCls}>Stock Qty</Label>
                        <Input id="stock" type="number" min="0" placeholder="0" className={inputCls} value={form.stock || ""} onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value, 10) || 0 })} data-testid="input-stock" />
                      </div>
                    </div>
                    {form.mrp > 0 && form.price > 0 && (
                      <div className="mt-3 flex items-center gap-3 px-4 py-2.5 bg-gradient-to-r from-primary/5 to-amber-50/60 rounded-xl border border-primary/8">
                        <span className="text-xs text-muted-foreground">Preview:</span>
                        <span className="font-bold text-primary">₹{Number(form.price).toLocaleString("en-IN")}</span>
                        <span className="text-sm line-through text-muted-foreground">₹{Number(form.mrp).toLocaleString("en-IN")}</span>
                        {discountPercent > 0 && (
                          <span className="text-xs font-black text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">{discountPercent}% OFF</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* ── Section 3: Product Specs ── */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-black">3</div>
                      <span className="text-[10px] font-black tracking-[0.3em] uppercase text-primary/70">Specifications</span>
                      <div className="flex-1 h-px bg-primary/8" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="material" className={labelCls}>Material</Label>
                        <Input id="material" placeholder="e.g. Pure Teak Wood & Brass" className={inputCls} value={form.material || ""} onChange={(e) => setForm({ ...form, material: e.target.value })} data-testid="input-material" />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="size" className={labelCls}>Dimensions / Size</Label>
                        <Input id="size" placeholder="e.g. 14 x 10 inches" className={inputCls} value={form.size || ""} onChange={(e) => setForm({ ...form, size: e.target.value })} data-testid="input-size" />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="weight" className={labelCls}>Net Weight</Label>
                        <Input id="weight" placeholder="e.g. 1.2 kg" className={inputCls} value={form.weight || ""} onChange={(e) => setForm({ ...form, weight: e.target.value })} data-testid="input-weight" />
                      </div>
                    </div>
                  </div>

                  {/* ── Section 4: Images ── */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-black">4</div>
                      <span className="text-[10px] font-black tracking-[0.3em] uppercase text-primary/70">Product Images</span>
                      <div className="flex-1 h-px bg-primary/8" />
                    </div>

                    {/* Main Image row */}
                    <div className="flex gap-3 items-center mb-3">
                      <div className="flex-1">
                        <Label className={`${labelCls} mb-1.5 block`}>Main Image</Label>
                        <input type="file" id="image-upload" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, true)} />
                        <button
                          type="button" disabled={uploadingMain}
                          className="w-full border border-dashed border-primary/25 bg-white/70 hover:bg-white hover:border-primary/40 rounded-xl px-4 py-2.5 flex flex-row h-auto items-center gap-2.5 cursor-pointer transition-all group disabled:opacity-60 text-left"
                          onClick={() => document.getElementById("image-upload")?.click()}
                        >
                          {uploadingMain
                            ? <svg className="animate-spin text-primary shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeOpacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/></svg>
                            : <Upload size={14} className="text-primary/50 group-hover:text-primary transition-colors shrink-0" />
                          }
                          <span className="text-sm text-muted-foreground group-hover:text-primary/80 transition-colors">
                            {uploadingMain ? "Uploading…" : "Click to upload — PNG, JPG, WEBP"}
                          </span>
                        </button>
                      </div>
                      {form.imageUrl && (
                        <div className="relative group w-16 h-16 rounded-xl overflow-hidden border-2 border-primary/15 shadow-md shrink-0">
                          <img src={form.imageUrl} alt="Main" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button type="button" onClick={() => setForm({ ...form, imageUrl: "" })} className="bg-red-500 text-white p-1 rounded-full">
                              <X size={9} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Gallery row */}
                    <div>
                      <Label className={`${labelCls} mb-1.5 block`}>Gallery Images</Label>
                      <div className="flex flex-wrap gap-2">
                        {(form.images || []).filter(img => img && !img.startsWith('data:')).map((img, idx) => (
                          <div key={idx} className="relative group w-16 h-16 rounded-xl overflow-hidden border-2 border-primary/10 shadow-sm transition-all hover:scale-[1.05]">
                            <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button type="button" onClick={() => setForm({ ...form, images: form.images?.filter((_, i) => i !== idx) })} className="bg-red-500 text-white p-1 rounded-full">
                                <X size={9} />
                              </button>
                            </div>
                          </div>
                        ))}
                        <label className="flex flex-col items-center justify-center w-16 h-16 rounded-xl border-2 border-dashed border-primary/20 bg-white/80 hover:border-primary/40 cursor-pointer transition-all group">
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, false)} />
                          <Plus size={16} className="text-primary/50 group-hover:text-primary transition-colors" />
                          <span className="text-[8px] font-black tracking-widest uppercase text-muted-foreground/60 mt-0.5">Add</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* ── Section 5: Settings ── */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-black">5</div>
                      <span className="text-[10px] font-black tracking-[0.3em] uppercase text-primary/70">Visibility & Status</span>
                      <div className="flex-1 h-px bg-primary/8" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Featured */}
                      <div className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-all cursor-pointer ${form.featured ? "border-primary/30 bg-primary/5" : "border-primary/10 bg-white hover:border-primary/20"}`}
                        onClick={() => setForm({ ...form, featured: !form.featured })}>
                        <Switch id="featured" checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} data-testid="switch-featured" onClick={(e) => e.stopPropagation()} />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <Star size={13} className={form.featured ? "text-primary fill-primary" : "text-muted-foreground"} />
                            <Label htmlFor="featured" className="cursor-pointer text-sm font-semibold">Featured</Label>
                          </div>
                          <p className="text-[11px] text-muted-foreground">Show on homepage</p>
                        </div>
                      </div>
                      {/* Visible */}
                      <div className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-all cursor-pointer ${form.isVisible ? "border-green-300/50 bg-green-50/50" : "border-primary/10 bg-white hover:border-primary/20"}`}
                        onClick={() => setForm({ ...form, isVisible: !form.isVisible })}>
                        <Switch id="isVisible" checked={form.isVisible} onCheckedChange={(v) => setForm({ ...form, isVisible: v })} data-testid="switch-visible" onClick={(e) => e.stopPropagation()} />
                        <div>
                          <div className="flex items-center gap-1.5">
                            {form.isVisible ? <Eye size={13} className="text-green-600" /> : <EyeOff size={13} className="text-muted-foreground" />}
                            <Label htmlFor="isVisible" className="cursor-pointer text-sm font-semibold">Visible</Label>
                          </div>
                          <p className="text-[11px] text-muted-foreground">Show in store</p>
                        </div>
                      </div>
                      {/* New Arrival */}
                      <div className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-all cursor-pointer ${form.isNewArrival ? "border-amber-300/50 bg-amber-50/50" : "border-primary/10 bg-white hover:border-primary/20"}`}
                        onClick={() => setForm({ ...form, isNewArrival: !form.isNewArrival })}>
                        <Switch id="isNewArrival" checked={form.isNewArrival} onCheckedChange={(v) => setForm({ ...form, isNewArrival: v })} data-testid="switch-new-arrival" onClick={(e) => e.stopPropagation()} />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <Sparkles size={13} className={form.isNewArrival ? "text-amber-600" : "text-muted-foreground"} />
                            <Label htmlFor="isNewArrival" className="cursor-pointer text-sm font-semibold">New Arrival</Label>
                          </div>
                          <p className="text-[11px] text-muted-foreground">Show "New" badge</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ── Form Actions ── */}
                  <div className="flex gap-4 justify-end pt-4 border-t border-primary/8">
                    <Button type="button" variant="outline" className="rounded-2xl border border-primary/15 text-sm font-semibold px-8 py-3 h-auto bg-white hover:bg-[#faf7f2] transition-all" onClick={() => setShowForm(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isPending} className="bg-primary text-primary-foreground hover:bg-primary/95 shadow-xl shadow-primary/20 rounded-2xl text-sm font-semibold px-10 py-3 h-auto transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50" data-testid="button-submit-product">
                      {isPending ? (
                        <span className="flex items-center gap-2"><svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeOpacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/></svg> Saving…</span>
                      ) : (
                        <span className="flex items-center gap-2"><Check size={16} /> {editProduct ? "Save Changes" : "Add Product"}</span>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Products Table ── */}
      <Card className="border border-border/60 rounded-3xl overflow-hidden shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-muted rounded-2xl animate-pulse shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
                    <div className="h-3 bg-muted rounded animate-pulse w-1/3" />
                  </div>
                  <div className="w-24 h-8 bg-muted rounded-xl animate-pulse" />
                </div>
              ))}
            </div>
          ) : (products ?? []).length === 0 ? (
            <div className="text-center py-24 text-muted-foreground">
              <Package size={52} className="mx-auto mb-4 opacity-30" />
              <p className="font-serif text-xl mb-2">No products yet</p>
              <p className="text-sm mb-6">Add your first product to get started</p>
              <Button onClick={openAdd} className="gap-2 bg-primary text-primary-foreground rounded-2xl px-6 py-3 h-auto">
                <Plus size={16} /> Add Product
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/20">
                    <th className="text-left px-6 py-4 font-semibold text-muted-foreground text-xs uppercase tracking-widest">Product</th>
                    <th className="text-left px-6 py-4 font-semibold text-muted-foreground text-xs uppercase tracking-widest hidden lg:table-cell">Category</th>
                    <th className="text-left px-6 py-4 font-semibold text-muted-foreground text-xs uppercase tracking-widest">Price</th>
                    <th className="text-center px-6 py-4 font-semibold text-muted-foreground text-xs uppercase tracking-widest hidden md:table-cell">Stock</th>
                    <th className="text-left px-6 py-4 font-semibold text-muted-foreground text-xs uppercase tracking-widest hidden sm:table-cell">Status</th>
                    <th className="text-right px-6 py-4 font-semibold text-muted-foreground text-xs uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {[...(products ?? [])].reverse().map((product: any, idx: number) => (
                    <motion.tr
                      key={product.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(idx * 0.02, 0.3) }}
                      className="border-b border-border/50 last:border-0 hover:bg-primary/[0.02] transition-colors group"
                      data-testid={`row-product-${product.id}`}
                    >
                      {/* Product cell */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="relative shrink-0">
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-16 h-16 rounded-2xl object-cover border border-border/60 shadow-sm group-hover:shadow-md transition-shadow"
                            />
                            {product.isNewArrival && (
                              <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center shadow">
                                <Sparkles size={10} className="text-white" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground text-base leading-snug line-clamp-1">{product.name}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1 lg:hidden">{product.categoryName}</p>
                            {product.material && (
                              <p className="text-[11px] text-muted-foreground/60 mt-0.5 hidden sm:block">{product.material}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category cell */}
                      <td className="px-6 py-4 hidden lg:table-cell">
                        <div className="flex flex-wrap gap-1.5 items-center">
                          <span className="text-sm text-foreground/80">{product.categoryName ?? "—"}</span>
                          {(product.additionalCategoryNames || []).map((name: string) => (
                            <span key={name} className="text-[9px] font-black tracking-widest uppercase bg-primary/8 text-primary/70 border border-primary/15 px-2 py-0.5 rounded-full">{name}</span>
                          ))}
                        </div>
                      </td>

                      {/* Price cell */}
                      <td className="px-6 py-4">
                        <div>
                          <span className="font-bold text-primary text-base">₹{product.price.toLocaleString("en-IN")}</span>
                          {product.mrp && product.mrp > product.price ? (
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-xs text-muted-foreground line-through">₹{product.mrp.toLocaleString("en-IN")}</span>
                              <span className="text-[9px] font-black text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">
                                {Math.round(((product.mrp - product.price) / product.mrp) * 100)}% OFF
                              </span>
                            </div>
                          ) : null}
                        </div>
                      </td>

                      {/* Stock cell */}
                      <td className="px-6 py-4 text-center hidden md:table-cell">
                        <span className={`text-base font-bold ${product.stock <= 3 ? "text-red-500" : product.stock <= 10 ? "text-amber-600" : "text-foreground"}`}>
                          {product.stock}
                        </span>
                        {product.stock <= 3 && <p className="text-[9px] text-red-400 font-semibold mt-0.5">Low stock</p>}
                      </td>

                      {/* Status cell */}
                      <td className="px-6 py-4 hidden sm:table-cell">
                        <div className="flex flex-col gap-1.5">
                          {product.featured && <Badge className="bg-primary/10 text-primary text-[10px] font-semibold w-fit gap-1"><Star size={9} className="fill-primary" />Featured</Badge>}
                          {product.isNewArrival && <Badge className="bg-amber-100 text-amber-700 text-[10px] font-semibold w-fit gap-1"><Sparkles size={9} />New</Badge>}
                          {!product.isVisible
                            ? <Badge variant="outline" className="text-[10px] opacity-50 w-fit"><EyeOff size={9} className="mr-1" />Hidden</Badge>
                            : <Badge className="bg-green-50 text-green-700 text-[10px] font-semibold w-fit gap-1"><Eye size={9} />Active</Badge>
                          }
                        </div>
                      </td>

                      {/* Actions cell */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm" variant="ghost"
                            onClick={() => openEdit(product)}
                            className="h-9 w-9 p-0 rounded-xl text-muted-foreground hover:text-foreground hover:bg-primary/8 transition-all"
                            data-testid={`button-edit-${product.id}`}
                          >
                            <Pencil size={16} />
                          </Button>
                          <Button
                            size="sm" variant="ghost"
                            onClick={() => setDeleteId(product.id)}
                            className="h-9 w-9 p-0 rounded-xl text-red-400 hover:text-red-600 hover:bg-red-50 transition-all"
                            data-testid={`button-delete-${product.id}`}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete confirmation */}
      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif text-xl">Delete Product?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm leading-relaxed">
              This action cannot be undone. The product will be permanently removed from your store and all categories.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-2xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white rounded-2xl px-6"
              data-testid="button-confirm-delete"
            >
              Delete Product
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
