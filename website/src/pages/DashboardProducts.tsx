import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, X, Check, Package, Upload, Image as ImageIcon } from "lucide-react";
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
  getGetDashboardStatsQueryKey,
  type Product,
  type CreateProductBody,
} from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

const emptyForm: CreateProductBody = {
  name: "",
  description: "",
  price: 0,
  mrp: 0,
  imageUrl: "",
  images: [],
  categoryId: 0,
  stock: 0,
  featured: false,
  isVisible: true,
  isNewArrival: false,
  material: "",
  size: "",
  weight: "",
};

export default function DashboardProducts() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState<CreateProductBody>(emptyForm);

  const { data: products, isLoading } = useListProducts(undefined, {
    query: { queryKey: getListProductsQueryKey() },
  });
  const { data: categories } = useListCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetDashboardStatsQueryKey() });
  };

  const openAdd = () => {
    setEditProduct(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (product: Product) => {
    setEditProduct(product);
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      mrp: product.mrp || Math.round(product.price * 1.2),
      imageUrl: product.imageUrl,
      images: product.images || [product.imageUrl],
      categoryId: product.categoryId,
      stock: product.stock,
      featured: product.featured,
      isVisible: product.isVisible !== undefined ? product.isVisible : true,
      isNewArrival: product.isNewArrival || false,
      material: product.material || "",
      size: product.size || "",
      weight: product.weight || "",
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editProduct) {
      updateProduct.mutate(
        { id: editProduct.id, data: form },
        {
          onSuccess: () => {
            toast({ title: "Product updated successfully" });
            setShowForm(false);
            invalidate();
          },
          onError: () => toast({ title: "Failed to update product", variant: "destructive" }),
        }
      );
    } else {
      createProduct.mutate(
        { data: form },
        {
          onSuccess: () => {
            toast({ title: "Product created successfully" });
            setShowForm(false);
            invalidate();
          },
          onError: () => toast({ title: "Failed to create product", variant: "destructive" }),
        }
      );
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isMain: boolean = true) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      if (isMain) {
        setForm(prev => ({ ...prev, imageUrl: base64String }));
      } else {
        setForm(prev => ({ ...prev, images: [...(prev.images || []), base64String] }));
      }
      toast({ title: "Image uploaded successfully" });
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = () => {
    if (deleteId == null) return;
    deleteProduct.mutate(
      { id: deleteId },
      {
        onSuccess: () => {
          toast({ title: "Product deleted" });
          setDeleteId(null);
          invalidate();
        },
        onError: () => toast({ title: "Failed to delete product", variant: "destructive" }),
      }
    );
  };

  const isPending = createProduct.isPending || updateProduct.isPending;

  return (
    <DashboardLayout title="Products" subtitle="Manage your product catalog">
      <div className="flex justify-end mb-6">
        <Button onClick={openAdd} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90" data-testid="button-add-product">
          <Plus size={16} /> Add Product
        </Button>
      </div>

      {/* Form panel */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="mb-6"
          >
            <Card className="border-primary/30">
              <CardHeader className="pb-3 flex-row items-center justify-between">
                <CardTitle className="font-serif text-lg">{editProduct ? "Edit Product" : "Add New Product"}</CardTitle>
                <Button size="sm" variant="ghost" onClick={() => setShowForm(false)} data-testid="button-close-form"><X size={16} /></Button>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name</Label>
                    <Input id="name" placeholder="e.g. Brass Nilavilakku" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required data-testid="input-product-name" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={form.categoryId ? String(form.categoryId) : ""} onValueChange={(v) => setForm({ ...form, categoryId: parseInt(v, 10) })}>
                      <SelectTrigger data-testid="select-category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {(categories ?? []).map((cat: any) => (
                          <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Price (₹)</Label>
                    <Input id="price" type="number" min="0" step="0.01" placeholder="0.00" value={form.price || ""} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} required data-testid="input-price" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stock">Stock Quantity</Label>
                    <Input id="stock" type="number" min="0" placeholder="0" value={form.stock || ""} onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value, 10) || 0 })} required data-testid="input-stock" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mrp">MRP (₹)</Label>
                    <Input id="mrp" type="number" min="0" step="0.01" placeholder="0.00" value={form.mrp || ""} onChange={(e) => setForm({ ...form, mrp: parseFloat(e.target.value) || 0 })} data-testid="input-mrp" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="material">Material</Label>
                    <Input id="material" placeholder="e.g. Pure Brass" value={form.material || ""} onChange={(e) => setForm({ ...form, material: e.target.value })} data-testid="input-material" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="size">Size / Dimensions</Label>
                    <Input id="size" placeholder="e.g. 12 inches" value={form.size || ""} onChange={(e) => setForm({ ...form, size: e.target.value })} data-testid="input-size" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight</Label>
                    <Input id="weight" placeholder="e.g. 1.2 kg" value={form.weight || ""} onChange={(e) => setForm({ ...form, weight: e.target.value })} data-testid="input-weight" />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="imageUrl">Main Product Image</Label>
                    <div className="flex flex-col md:flex-row gap-4 items-start">
                      <div className="flex-1 w-full space-y-2">
                        <Input id="imageUrl" placeholder="https://... or upload below" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} required data-testid="input-image-url" />
                        <div className="relative">
                          <input
                            type="file"
                            id="image-upload"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, true)}
                          />
                          <Button
                            type="button"
                            variant="secondary"
                            className="w-full gap-2 border-dashed border-2 py-8 hover:border-primary/50"
                            onClick={() => document.getElementById("image-upload")?.click()}
                          >
                            <Upload size={16} />
                            Choose Local Image
                          </Button>
                        </div>
                      </div>
                      
                      {form.imageUrl && (
                        <div className="relative group w-32 h-32 rounded-2xl overflow-hidden border border-border shadow-md shrink-0">
                          <img src={form.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                          <button 
                            type="button"
                            onClick={() => setForm({ ...form, imageUrl: "" })}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label>Gallery Images</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 mb-3">
                      {(form.images || []).map((img, idx) => (
                        <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-border shadow-sm">
                          <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                          <button 
                            type="button"
                            onClick={() => setForm({ ...form, images: form.images?.filter((_, i) => i !== idx) })}
                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                      <label className="flex flex-col items-center justify-center aspect-square rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all">
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, false)}
                        />
                        <Plus size={20} className="text-muted-foreground" />
                        <span className="text-[9px] font-bold uppercase mt-1 opacity-60 text-muted-foreground">Add</span>
                      </label>
                    </div>
                    <Textarea 
                      id="images" 
                      placeholder="Or paste URLs here (one per line)" 
                      value={form.images?.join("\n")} 
                      onChange={(e) => setForm({ ...form, images: e.target.value.split("\n").filter(l => l.trim() !== "") })} 
                      rows={2} 
                      className="text-xs"
                      data-testid="input-images" 
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" placeholder="Describe the product..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required rows={3} data-testid="input-description" />
                  </div>

                  <div className="flex flex-wrap gap-8 md:col-span-2 py-4">
                    <div className="flex items-center gap-3">
                      <Switch id="featured" checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} data-testid="switch-featured" />
                      <Label htmlFor="featured" className="cursor-pointer">Featured</Label>
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch id="isVisible" checked={form.isVisible} onCheckedChange={(v) => setForm({ ...form, isVisible: v })} data-testid="switch-visible" />
                      <Label htmlFor="isVisible" className="cursor-pointer">Visible in Store</Label>
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch id="isNewArrival" checked={form.isNewArrival} onCheckedChange={(v) => setForm({ ...form, isNewArrival: v })} data-testid="switch-new-arrival" />
                      <Label htmlFor="isNewArrival" className="cursor-pointer">New Arrival</Label>
                    </div>
                  </div>

                  <div className="md:col-span-2 flex gap-3 justify-end">
                    <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                    <Button type="submit" disabled={isPending} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90" data-testid="button-submit-product">
                      {isPending ? "Saving..." : (<><Check size={15} /> {editProduct ? "Update Product" : "Create Product"}</>)}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Products table */}
      <Card className="border-border">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-14 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : (products ?? []).length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Package size={40} className="mx-auto mb-3 opacity-40" />
              <p className="font-serif text-lg mb-2">No products yet</p>
              <p className="text-sm mb-4">Add your first product to get started</p>
              <Button onClick={openAdd} className="gap-2 bg-primary text-primary-foreground">
                <Plus size={14} /> Add Product
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Product</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider hidden md:table-cell">Category</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Price</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider hidden sm:table-cell">Stock</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider hidden sm:table-cell">Status</th>
                    <th className="text-right px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(products ?? []).map((product: any) => (
                    <motion.tr
                      key={product.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
                      data-testid={`row-product-${product.id}`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img src={product.imageUrl} alt={product.name} className="w-10 h-10 rounded-lg object-cover border border-border" />
                          <div>
                            <p className="font-medium text-foreground line-clamp-1">{product.name}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1 md:hidden">{product.categoryName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{product.categoryName ?? "—"}</td>
                      <td className="px-4 py-3 font-semibold text-primary">₹{product.price.toLocaleString("en-IN")}</td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className={product.stock <= 5 ? "text-red-600 font-semibold" : "text-foreground"}>{product.stock}</span>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {product.featured && <Badge className="bg-primary/10 text-primary text-[9px]">Featured</Badge>}
                          {product.isNewArrival && <Badge className="bg-amber-100 text-amber-700 text-[9px]">New</Badge>}
                          {!product.isVisible && <Badge variant="outline" className="text-[9px] opacity-50">Hidden</Badge>}
                          {product.isVisible && product.stock > 0 && <Badge variant="secondary" className="text-[9px] bg-green-50 text-green-700">Active</Badge>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button size="sm" variant="ghost" onClick={() => openEdit(product)} className="h-8 w-8 p-0" data-testid={`button-edit-${product.id}`}>
                            <Pencil size={14} />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setDeleteId(product.id)} className="h-8 w-8 p-0 text-destructive hover:text-destructive" data-testid={`button-delete-${product.id}`}>
                            <Trash2 size={14} />
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif">Delete Product?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The product will be permanently removed from your store.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" data-testid="button-confirm-delete">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
