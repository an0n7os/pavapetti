import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, X, Check, Package, Upload, Star, Eye, EyeOff, Sparkles, Search } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
import { useAccessibleDialog } from "@/hooks/use-accessible-dialog";

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

// Compact modern inputs & labels
const inputCls = "bg-white border border-stone-200 hover:border-stone-300 focus:border-primary/50 focus:ring-2 focus:ring-primary/10 rounded-lg h-9 px-3 text-xs transition-all shadow-none outline-none placeholder:text-muted-foreground/40";
const labelCls = "text-[11px] font-semibold text-stone-700 tracking-tight flex items-center justify-between";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("all");

  // Lock background scroll when modal is open
  const isModalOpen = showForm || deleteId !== null;
  const productDialogRef = useAccessibleDialog<HTMLDivElement>(showForm, () => setShowForm(false));

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [isModalOpen]);

  const { data: products, isLoading } = useListProducts(undefined, {
    query: { queryKey: getListProductsQueryKey() },
  });
  const { data: categories } = useListCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const filteredProducts = (products ?? []).filter((product: any) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      (product.name && product.name.toLowerCase().includes(query)) ||
      (product.categoryName && product.categoryName.toLowerCase().includes(query)) ||
      (product.material && product.material.toLowerCase().includes(query)) ||
      (product.description && product.description.toLowerCase().includes(query));

    const matchesCategory =
      selectedCategoryFilter === "all" ||
      String(product.categoryId) === selectedCategoryFilter ||
      ((product as any).additionalCategoryIds || []).map(String).includes(selectedCategoryFilter);

    return matchesSearch && matchesCategory;
  });

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
    const defaultCatId = (categories && categories.length > 0) ? Number(categories[0].id) : 1;
    setForm({
      ...emptyForm,
      categoryId: defaultCatId,
    });
    setDiscountPercent(0);
    setShowForm(true);
  };

  const openEdit = (product: Product) => {
    setEditProduct(product);
    const initialPrice = product.price ?? 0;
    const initialMrp = (product.mrp && product.mrp > 0) ? product.mrp : initialPrice;
    const discount = initialMrp > initialPrice ? Math.round(((initialMrp - initialPrice) / initialMrp) * 100) : 0;
    setDiscountPercent(discount);
    
    const rawAddIds = (product as any).additionalCategoryIds ?? (product as any).additional_category_ids;
    const parsedAddIds = Array.isArray(rawAddIds)
      ? rawAddIds.map(Number)
      : typeof rawAddIds === "string"
        ? (() => { try { return JSON.parse(rawAddIds).map(Number); } catch { return []; } })()
        : [];

    setForm({
      name: product.name,
      description: product.description,
      price: initialPrice,
      mrp: initialMrp,
      imageUrl: product.imageUrl,
      images: product.images || [product.imageUrl],
      categoryId: product.categoryId,
      additionalCategoryIds: parsedAddIds,
      stock: product.stock ?? 0,
      featured: product.featured,
      isVisible: product.isVisible !== undefined ? product.isVisible : true,
      isNewArrival: product.isNewArrival || false,
      material: product.material || "",
      size: product.size || "",
      weight: product.weight || "",
    });
    setShowForm(true);
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
    if (!form.name || !form.name.trim()) {
      toast({ title: "Product name is required", variant: "destructive" });
      return;
    }
    const finalCatId = form.categoryId && form.categoryId !== 0
      ? Number(form.categoryId)
      : (categories && categories.length > 0 ? Number(categories[0].id) : 1);

    const sanitizedForm = {
      ...form,
      name: form.name.trim(),
      price: typeof form.price === "number" ? form.price : (Number(form.price) || 0),
      mrp: form.mrp !== undefined && form.mrp !== null && String(form.mrp) !== "" ? Number(form.mrp) : undefined,
      stock: parseInt(String(form.stock), 10) || 0,
      imageUrl: form.imageUrl || "",
      description: form.description || "",
      categoryId: finalCatId,
      additionalCategoryIds: (form.additionalCategoryIds || []).map(Number),
    };
    if (editProduct) {
      updateProduct.mutate(
        { id: editProduct.id, data: sanitizedForm },
        {
          onSuccess: () => { toast({ title: "✅ Product updated successfully" }); setShowForm(false); invalidate(); },
          onError: (error: any) => toast({ title: "Failed to update product", description: error?.message || "Database update failed", variant: "destructive" }),
        }
      );
    } else {
      createProduct.mutate(
        { data: sanitizedForm },
        {
          onSuccess: () => { toast({ title: "✅ Product created successfully" }); setShowForm(false); invalidate(); },
          onError: (error: any) => toast({ title: "Failed to create product", description: error?.message || "Database creation failed", variant: "destructive" }),
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
      if (isMain) { setForm(prev => ({ ...prev, imageUrl: publicUrl })); toast({ title: "✅ Main image uploaded" }); }
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
      {/* ── Toolbar: Header with Count + Prominent Add Product CTA ── */}
      <div className="bg-[#faf7f2]/80 backdrop-blur-xs p-3.5 sm:p-4 rounded-2xl border border-primary/10 shadow-xs mb-5 space-y-3">
        {/* Row 1: Products Count Badge + Add Product Button (Always side-by-side on all screens!) */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="font-mono text-xs px-2.5 py-1 bg-stone-100 text-stone-700 border-stone-200">
              {filteredProducts.length} {filteredProducts.length === 1 ? "Product" : "Products"}
            </Badge>
            {filteredProducts.length !== (products ?? []).length && (
              <span className="text-[11px] text-muted-foreground hidden xs:inline">
                (of {(products ?? []).length})
              </span>
            )}
          </div>

          <Button
            onClick={openAdd}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-4 h-10 text-xs font-bold shadow-sm shadow-primary/20 shrink-0"
            data-testid="button-add-product"
          >
            <Plus size={16} /> <span>Add Product</span>
          </Button>
        </div>

        {/* Row 2: Search Bar + Category Filter */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {/* Search Bar */}
          <div className="relative w-full lg:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" size={15} />
            <Input
              type="text"
              placeholder="Search products by title, material..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-8 bg-white border-stone-200 rounded-xl h-10 text-xs focus:border-primary/50 focus:ring-1 focus:ring-primary/20 placeholder:text-muted-foreground/45 w-full shadow-xs"
              data-testid="input-search-products"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                title="Clear search"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <Select value={selectedCategoryFilter} onValueChange={setSelectedCategoryFilter}>
            <SelectTrigger className="w-full bg-white border-stone-200 rounded-xl h-10 text-xs shadow-xs" data-testid="select-category-filter">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {(categories ?? []).map((cat: any) => (
                <SelectItem key={cat.id} value={String(cat.id)}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ── Add / Edit Modal: Minimal, Compact & Fast ── */}
      <AnimatePresence>
        {showForm && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              ref={productDialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="product-form-title"
              tabIndex={-1}
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <form id="product-modal-form" onSubmit={handleSubmit} className="flex flex-col h-full min-h-0 overflow-hidden">
                {/* 1. Sticky Modal Header */}
                <div className="px-5 py-3 border-b border-stone-100 flex items-center justify-between bg-stone-50/90 shrink-0">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                      {editProduct ? <Pencil size={13} /> : <Plus size={14} />}
                    </div>
                    <div>
                      <h3 id="product-form-title" className="font-semibold text-sm text-stone-900 leading-tight">
                        {editProduct ? "Modify Product Details" : "Add New Product"}
                      </h3>
                      <p className="text-[11px] text-muted-foreground">
                        {editProduct ? `Editing ID: #${editProduct.id} — ${editProduct.name}` : "Fill in the details to add an artifact to your catalog"}
                      </p>
                    </div>
                  </div>
                  <Button
                    aria-label="Close product editor"
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="rounded-lg h-8 w-8 p-0 text-muted-foreground hover:text-stone-900 hover:bg-stone-200/50"
                    onClick={() => setShowForm(false)}
                    data-testid="button-close-form"
                  >
                    <X size={16} />
                  </Button>
                </div>

                {/* 2. Scrollable Body: min-h-0 and overscroll-contain ensures smooth scrolling */}
                <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-5 space-y-4">
                  {/* 1. Basic Info */}
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2 space-y-1">
                        <Label htmlFor="name" className={labelCls}>
                          <span>Product Name *</span>
                        </Label>
                        <Input
                          id="name"
                          className={inputCls}
                          placeholder="e.g. Kathakali Headgear Wall Hanging"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          required
                          data-testid="input-product-name"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="category" className={labelCls}>
                          <span>Primary Category *</span>
                        </Label>
                        <Select
                          value={form.categoryId ? String(form.categoryId) : ""}
                          onValueChange={(v) => setForm({ ...form, categoryId: parseInt(v, 10) })}
                        >
                          <SelectTrigger className={inputCls} data-testid="select-category">
                            <SelectValue placeholder="Select Category" />
                          </SelectTrigger>
                          <SelectContent>
                            {(categories ?? []).map((cat: any) => (
                              <SelectItem key={cat.id} value={String(cat.id)} className="text-xs">
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Also Show In - Compact Pill Tags */}
                    {(categories ?? []).length > 1 && (
                      <div className="space-y-1.5 pt-1">
                        <Label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider block">
                          Also Show In Additional Categories (Optional)
                        </Label>
                        <div className="flex flex-wrap gap-1.5 p-1 bg-stone-50/60 rounded-lg border border-stone-100">
                          {(categories ?? [])
                            .filter((cat: any) => cat.id !== form.categoryId)
                            .map((cat: any) => {
                              const isChecked = (form.additionalCategoryIds || []).includes(cat.id);
                              return (
                                <button
                                  key={cat.id}
                                  type="button"
                                  onClick={() => {
                                    const curr = form.additionalCategoryIds || [];
                                    setForm({
                                      ...form,
                                      additionalCategoryIds: isChecked
                                        ? curr.filter((id) => id !== cat.id)
                                        : [...curr, cat.id],
                                    });
                                  }}
                                  className={`text-[11px] px-2.5 py-1 rounded-md border font-medium transition-all flex items-center gap-1 ${
                                    isChecked
                                      ? "bg-primary text-white border-primary shadow-xs"
                                      : "bg-white text-stone-600 border-stone-200 hover:border-stone-400 hover:bg-stone-50"
                                  }`}
                                >
                                  {isChecked && <Check size={11} strokeWidth={3} />}
                                  {cat.name}
                                </button>
                              );
                            })}
                        </div>
                      </div>
                    )}

                    {/* Description */}
                    <div className="space-y-1">
                      <Label htmlFor="description" className={labelCls}>
                        <span>Description</span>
                      </Label>
                      <Textarea
                        id="description"
                        placeholder="Brief details regarding heritage, craftsmanship and significance..."
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        rows={2}
                        className="bg-white border border-stone-200 hover:border-stone-300 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 rounded-lg p-2.5 text-xs outline-none resize-none placeholder:text-muted-foreground/40"
                        data-testid="input-description"
                      />
                    </div>
                  </div>

                  {/* 2. Pricing & Inventory - Sleek 4 Col Grid */}
                  <div className="p-3 bg-stone-50/70 rounded-xl border border-stone-100 space-y-2">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      <div className="space-y-1">
                        <Label htmlFor="mrp" className={labelCls}>MRP (₹)</Label>
                        <Input
                          id="mrp"
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0"
                          className={inputCls}
                          value={form.mrp !== undefined && form.mrp !== null ? form.mrp : ""}
                          onChange={(e) => handleMrpChange(parseFloat(e.target.value) || 0)}
                          data-testid="input-mrp"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="discount" className={labelCls}>Discount %</Label>
                        <Input
                          id="discount"
                          type="number"
                          min="0"
                          max="100"
                          placeholder="0"
                          className={inputCls}
                          value={discountPercent !== undefined && discountPercent !== null ? discountPercent : ""}
                          onChange={(e) => handleDiscountChange(parseFloat(e.target.value) || 0)}
                          data-testid="input-discount"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="price" className={labelCls}>Sale Price (₹) *</Label>
                        <Input
                          id="price"
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0"
                          className={`${inputCls} font-bold text-primary`}
                          value={form.price !== undefined && form.price !== null ? form.price : ""}
                          onChange={(e) => handlePriceChange(parseFloat(e.target.value) || 0)}
                          required
                          data-testid="input-price"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="stock" className={labelCls}>Stock</Label>
                        <Input
                          id="stock"
                          type="number"
                          min="0"
                          placeholder="0"
                          className={inputCls}
                          value={form.stock !== undefined && form.stock !== null ? form.stock : ""}
                          onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value, 10) || 0 })}
                          data-testid="input-stock"
                        />
                      </div>
                    </div>

                    {form.mrp > 0 && form.price > 0 && (
                      <div className="flex items-center gap-2 pt-1 text-[11px]">
                        <span className="text-muted-foreground">Live Customer Price:</span>
                        <span className="font-bold text-primary">₹{Number(form.price).toLocaleString("en-IN")}</span>
                        <span className="line-through text-muted-foreground/70">₹{Number(form.mrp).toLocaleString("en-IN")}</span>
                        {discountPercent > 0 && (
                          <span className="font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded text-[10px]">
                            {discountPercent}% OFF
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 3. Specifications */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="space-y-1">
                      <Label htmlFor="material" className={labelCls}>Material</Label>
                      <Input
                        id="material"
                        placeholder="e.g. Teak Wood, Brass"
                        className={inputCls}
                        value={form.material || ""}
                        onChange={(e) => setForm({ ...form, material: e.target.value })}
                        data-testid="input-material"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="size" className={labelCls}>Size / Dimensions</Label>
                      <Input
                        id="size"
                        placeholder="e.g. 12 x 8 inches"
                        className={inputCls}
                        value={form.size || ""}
                        onChange={(e) => setForm({ ...form, size: e.target.value })}
                        data-testid="input-size"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="weight" className={labelCls}>Weight</Label>
                      <Input
                        id="weight"
                        placeholder="e.g. 850 grams"
                        className={inputCls}
                        value={form.weight || ""}
                        onChange={(e) => setForm({ ...form, weight: e.target.value })}
                        data-testid="input-weight"
                      />
                    </div>
                  </div>

                  {/* 4. Images - Compact Side-by-Side Strip */}
                  <div className="p-3 bg-stone-50/70 rounded-xl border border-stone-100 space-y-2">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <Label className="text-xs font-semibold text-stone-800">Product Images</Label>
                        <p className="text-[10px] text-muted-foreground">Upload main showcase picture and gallery shots</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <input type="file" id="main-image-input" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, true)} />
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={uploadingMain}
                          onClick={() => document.getElementById("main-image-input")?.click()}
                          className="h-7 px-2.5 rounded-md text-[11px] gap-1.5 border-stone-300 hover:bg-white"
                        >
                          {uploadingMain ? <span className="animate-spin text-xs">⌛</span> : <Upload size={12} />}
                          {uploadingMain ? "Uploading..." : form.imageUrl ? "Change Main" : "Upload Main"}
                        </Button>

                        <input type="file" id="gallery-image-input" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, false)} />
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={uploadingExtra}
                          onClick={() => document.getElementById("gallery-image-input")?.click()}
                          className="h-7 px-2.5 rounded-md text-[11px] gap-1.5 border-stone-300 hover:bg-white"
                        >
                          {uploadingExtra ? <span className="animate-spin text-xs">⌛</span> : <Plus size={12} />}
                          Add Gallery Image
                        </Button>
                      </div>
                    </div>

                    {/* Image Thumbnails Strip */}
                    <div className="flex items-center gap-2 overflow-x-auto py-1">
                      {form.imageUrl && (
                        <div className="relative group w-14 h-14 rounded-lg overflow-hidden border-2 border-primary/40 shrink-0 shadow-xs">
                          <img src={form.imageUrl} alt="Main" className="w-full h-full object-cover" />
                          <span className="absolute bottom-0 inset-x-0 bg-primary/90 text-[8px] font-bold text-white text-center py-0.5 uppercase tracking-wider">
                            Main
                          </span>
                          <button
                            type="button"
                            onClick={() => setForm({ ...form, imageUrl: "" })}
                            className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remove main image"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      )}

                      {(form.images || [])
                        .filter((img) => img && !img.startsWith("data:") && img !== form.imageUrl)
                        .map((img, idx) => (
                          <div key={idx} className="relative group w-14 h-14 rounded-lg overflow-hidden border border-stone-200 shrink-0 shadow-xs">
                            <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setForm({ ...form, images: form.images?.filter((_, i) => i !== idx) })}
                              className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Remove image"
                            >
                              <X size={10} />
                            </button>
                          </div>
                        ))}

                      {!form.imageUrl && (form.images || []).length === 0 && (
                        <div className="h-14 w-full flex items-center justify-center border border-dashed border-stone-300 rounded-lg text-[11px] text-muted-foreground/60 italic">
                          No image uploaded yet
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 5. Status & Flags - Minimal 3-Button Toggle Row */}
                  <div className="grid grid-cols-3 gap-2">
                    {/* Featured */}
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, featured: !form.featured })}
                      className={`h-9 px-3 rounded-lg border text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                        form.featured
                          ? "bg-amber-50 text-amber-800 border-amber-300 shadow-xs font-semibold"
                          : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50"
                      }`}
                    >
                      <Star size={13} className={form.featured ? "text-amber-500 fill-amber-500" : "text-stone-400"} />
                      <span>Featured</span>
                    </button>

                    {/* Visible */}
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, isVisible: !form.isVisible })}
                      className={`h-9 px-3 rounded-lg border text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                        form.isVisible
                          ? "bg-green-50 text-green-800 border-green-300 shadow-xs font-semibold"
                          : "bg-white text-stone-400 border-stone-200 hover:bg-stone-50"
                      }`}
                    >
                      {form.isVisible ? <Eye size={13} className="text-green-600" /> : <EyeOff size={13} className="text-stone-400" />}
                      <span>{form.isVisible ? "Visible" : "Hidden"}</span>
                    </button>

                    {/* New Arrival */}
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, isNewArrival: !form.isNewArrival })}
                      className={`h-9 px-3 rounded-lg border text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                        form.isNewArrival
                          ? "bg-primary/10 text-primary border-primary/30 shadow-xs font-semibold"
                          : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50"
                      }`}
                    >
                      <Sparkles size={13} className={form.isNewArrival ? "text-primary fill-primary" : "text-stone-400"} />
                      <span>New Arrival</span>
                    </button>
                  </div>
                </div>

                {/* 3. Sticky Modal Footer: ALWAYS visible at bottom, never cut off! */}
                <div className="px-5 py-3 border-t border-stone-100 flex items-center justify-between bg-stone-50/90 shrink-0">
                  <span className="text-[11px] text-muted-foreground hidden sm:inline">
                    Changes sync immediately to Supabase
                  </span>
                  <div className="flex items-center gap-2 ml-auto">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-9 px-4 text-xs font-medium rounded-lg border-stone-200 hover:bg-stone-100"
                      onClick={() => setShowForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isPending}
                      className="h-9 px-5 text-xs font-semibold rounded-lg bg-primary text-white hover:bg-primary/90 shadow-sm"
                      data-testid="button-submit-product"
                    >
                      {isPending ? (
                        <span className="flex items-center gap-1.5">
                          <svg className="animate-spin" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" strokeOpacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/></svg>
                          Saving...
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5">
                          <Check size={14} /> {editProduct ? "Save Changes" : "Create Product"}
                        </span>
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Products Archive: Sleek, compact & fast table / list ── */}
      <Card className="border border-stone-200 rounded-xl overflow-hidden shadow-xs bg-white">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-stone-100 rounded-lg animate-pulse shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 bg-stone-100 rounded animate-pulse w-1/3" />
                    <div className="h-2.5 bg-stone-100 rounded animate-pulse w-1/5" />
                  </div>
                  <div className="w-16 h-7 bg-stone-100 rounded-md animate-pulse" />
                </div>
              ))}
            </div>
          ) : (products ?? []).length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Package size={40} className="mx-auto mb-2 opacity-30" />
              <p className="font-semibold text-stone-800 text-sm mb-1">No products yet</p>
              <p className="text-xs mb-4">Add your first product to get started</p>
              <Button onClick={openAdd} size="sm" className="gap-1.5 bg-primary text-white rounded-lg text-xs">
                <Plus size={14} /> Add Product
              </Button>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-14 text-muted-foreground">
              <Search size={32} className="mx-auto mb-2 opacity-30 text-primary" />
              <p className="font-semibold text-stone-800 text-sm mb-0.5">No matching products</p>
              <p className="text-xs mb-3 text-muted-foreground">
                No items match "{searchQuery}"
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategoryFilter("all");
                }}
                className="rounded-lg text-xs"
              >
                Clear Search
              </Button>
            </div>
          ) : (
            <>
              {/* Desktop Table View (sm+) */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-stone-200 bg-stone-50/80 text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                      <th className="py-2.5 px-3.5">Product</th>
                      <th className="py-2.5 px-3 hidden md:table-cell">Category</th>
                      <th className="py-2.5 px-3">Price</th>
                      <th className="py-2.5 px-3 text-center hidden lg:table-cell">Stock</th>
                      <th className="py-2.5 px-3 hidden sm:table-cell">Status</th>
                      <th className="py-2.5 px-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {[...filteredProducts].reverse().map((product: any) => (
                      <tr
                        key={product.id}
                        className="hover:bg-stone-50/60 transition-colors group text-xs"
                        data-testid={`row-product-${product.id}`}
                      >
                        {/* Product info */}
                        <td className="py-2 px-3.5">
                          <div className="flex items-center gap-3">
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-10 h-10 rounded-lg object-cover border border-stone-200 shrink-0 bg-stone-50"
                            />
                            <div className="min-w-0 max-w-xs md:max-w-md">
                              <p className="font-semibold text-stone-900 truncate leading-snug">
                                {product.name}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[11px] text-muted-foreground md:hidden truncate">
                                  {product.categoryName}
                                </span>
                                {product.material && (
                                  <span className="text-[11px] text-stone-400 hidden sm:inline truncate">
                                    • {product.material}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-2 px-3 hidden md:table-cell text-stone-600">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-medium text-stone-700">{product.categoryName ?? "—"}</span>
                            {(product.additionalCategoryNames || []).map((name: string) => (
                              <span key={name} className="text-[10px] bg-stone-100 text-stone-600 px-1.5 py-0.2 rounded">
                                {name}
                              </span>
                            ))}
                          </div>
                        </td>

                        {/* Price */}
                        <td className="py-2 px-3 whitespace-nowrap">
                          <span className="font-bold text-stone-900">₹{Number(product.price).toLocaleString("en-IN")}</span>
                          {product.mrp && product.mrp > product.price ? (
                            <span className="text-[11px] text-muted-foreground line-through ml-1.5">
                              ₹{Number(product.mrp).toLocaleString("en-IN")}
                            </span>
                          ) : null}
                        </td>

                        {/* Stock */}
                        <td className="py-2 px-3 text-center hidden lg:table-cell">
                          <span className={`font-mono text-xs font-semibold ${product.stock <= 3 ? "text-red-600" : "text-stone-700"}`}>
                            {product.stock}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-2 px-3 hidden sm:table-cell">
                          <div className="flex items-center gap-1.5">
                            {product.featured && (
                              <span className="text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded flex items-center gap-1">
                                <Star size={9} className="fill-amber-500 text-amber-500" /> Featured
                              </span>
                            )}
                            {!product.isVisible ? (
                              <span className="text-[10px] font-medium bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded">
                                Hidden
                              </span>
                            ) : (
                              <span className="text-[10px] font-medium bg-green-50 text-green-700 border border-green-200 px-1.5 py-0.5 rounded">
                                Active
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-2 px-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openEdit(product)}
                              aria-label={`Edit ${product.name}`}
                              className="h-11 w-11 p-0 rounded-md text-stone-500 hover:text-stone-900 hover:bg-stone-100"
                              title="Edit product"
                              data-testid={`button-edit-${product.id}`}
                            >
                              <Pencil size={13} />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setDeleteId(product.id)}
                              aria-label={`Delete ${product.name}`}
                              className="h-11 w-11 p-0 rounded-md text-stone-400 hover:text-red-600 hover:bg-red-50"
                              title="Delete product"
                              data-testid={`button-delete-${product.id}`}
                            >
                              <Trash2 size={13} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View (< sm screens) */}
              <div className="sm:hidden divide-y divide-stone-100">
                {[...filteredProducts].reverse().map((product: any) => (
                  <div
                    key={product.id}
                    className="p-3 sm:p-4 flex items-center justify-between gap-2.5 hover:bg-stone-50/70 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-14 h-14 rounded-xl object-cover border border-stone-200 shrink-0 bg-stone-50 shadow-xs"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-xs text-stone-900 truncate leading-snug">{product.name}</p>
                        <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                          <span className="text-[10px] text-muted-foreground truncate">{product.categoryName}</span>
                          {product.featured && (
                            <span className="text-[9px] bg-amber-50 text-amber-700 font-bold px-1.5 py-0.2 rounded border border-amber-200/60">
                              ★ Featured
                            </span>
                          )}
                          {!product.isVisible && (
                            <span className="text-[9px] bg-stone-100 text-stone-500 font-semibold px-1.5 py-0.2 rounded">
                              Hidden
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-bold text-xs text-primary">₹{Number(product.price).toLocaleString("en-IN")}</span>
                          <span className={`text-[10px] font-mono font-medium ${product.stock <= 3 ? "text-red-600" : "text-stone-500"}`}>
                            Stock: {product.stock}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEdit(product)}
                        aria-label={`Edit ${product.name}`}
                        className="h-10 w-10 p-0 rounded-xl text-stone-600 hover:bg-stone-100 active:scale-95 transition-all"
                        data-testid={`button-mobile-edit-${product.id}`}
                      >
                        <Pencil size={15} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeleteId(product.id)}
                        aria-label={`Delete ${product.name}`}
                        className="h-10 w-10 p-0 rounded-xl text-red-500 hover:bg-red-50 active:scale-95 transition-all"
                        data-testid={`button-mobile-delete-${product.id}`}
                      >
                        <Trash2 size={15} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* ── Mobile Floating Action Button (FAB) ── */}
      <div className="sm:hidden fixed bottom-6 right-5 z-40">
        <Button
          onClick={openAdd}
          aria-label="Add New Product"
          className="w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-2xl shadow-primary/50 flex items-center justify-center p-0 border-2 border-white hover:scale-105 active:scale-95 transition-all shrink-0"
          data-testid="button-fab-add-product"
        >
          <Plus size={26} />
        </Button>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="rounded-2xl max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-semibold text-stone-900">Delete Product?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              Are you sure you want to permanently delete this product? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-lg h-9 text-xs">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white rounded-lg h-9 text-xs px-4"
              data-testid="button-confirm-delete"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
