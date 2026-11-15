import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Grid3X3, X, Check, Trash2, Upload, Pencil } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import DashboardLayout from "@/components/DashboardLayout";
import {
  useListCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  getListCategoriesQueryKey,
  getListProductsQueryKey,
  getGetDashboardStatsQueryKey,
  type CreateCategoryBody,
  type Category,
} from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { uploadImageToStorage } from "@/lib/supabase";

const emptyForm: CreateCategoryBody = {
  name: "",
  description: "",
  imageUrl: "",
};

export default function DashboardCategories() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateCategoryBody>(emptyForm);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [passcode, setPasscode] = useState("");
  const [uploadingImg, setUploadingImg] = useState(false);

  // Lock background window scroll when any modal is open
  const isModalOpen = showForm || editCategory !== null || deleteId !== null;

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalOpen]);

  const { data: categories, isLoading } = useListCategories({
    query: { queryKey: getListCategoriesQueryKey() },
  });
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const openAdd = () => {
    setEditCategory(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (cat: Category) => {
    setEditCategory(cat);
    setForm({
      name: cat.name,
      description: cat.description || "",
      imageUrl: cat.imageUrl || "",
    });
    setShowForm(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImg(true);
    try {
      const publicUrl = await uploadImageToStorage(file);
      setForm(prev => ({ ...prev, imageUrl: publicUrl }));
      toast({ title: "✅ Category image uploaded to CDN" });
    } catch (err: any) {
      toast({
        title: "Image upload failed",
        description: err?.message ?? "Check Supabase Storage bucket permissions.",
        variant: "destructive",
      });
    } finally {
      setUploadingImg(false);
    }
  };

  const invalidate = () => {
    try {
      localStorage.removeItem("cached-products");
      localStorage.removeItem("cached-categories");
    } catch {}
    queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
    queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetDashboardStatsQueryKey() });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editCategory) {
      updateCategory.mutate(
        { id: editCategory.id, data: form },
        {
          onSuccess: () => {
            toast({ title: "Category updated successfully" });
            setShowForm(false);
            setForm(emptyForm);
            setEditCategory(null);
            invalidate();
          },
          onError: () => toast({ title: "Failed to update category", variant: "destructive" }),
        }
      );
    } else {
      createCategory.mutate(
        { data: form },
        {
          onSuccess: () => {
            toast({ title: "Category created successfully" });
            setShowForm(false);
            setForm(emptyForm);
            invalidate();
          },
          onError: () => toast({ title: "Failed to create category", variant: "destructive" }),
        }
      );
    }
  };

  const handleDelete = () => {
    if (deleteId == null) return;
    if (passcode !== "0000") {
      toast({ title: "Incorrect passcode", variant: "destructive" });
      return;
    }
    deleteCategory.mutate(
      { id: deleteId },
      {
        onSuccess: () => {
          toast({ title: "Category deleted" });
          setDeleteId(null);
          setPasscode("");
          invalidate();
        },
        onError: () => toast({ title: "Failed to delete category", variant: "destructive" }),
      }
    );
  };

  return (
    <DashboardLayout title="Categories" subtitle="Manage your product categories">
      {/* ── Toolbar: Category count badge + Prominent Add Category CTA ── */}
      <div className="flex flex-row items-center justify-between gap-3 mb-6 bg-[#faf7f2]/80 backdrop-blur-xs p-3.5 sm:p-4 rounded-2xl border border-primary/10 shadow-xs">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="font-mono text-xs px-2.5 py-1 bg-stone-100 text-stone-700 border-stone-200">
            {(categories ?? []).length} {(categories ?? []).length === 1 ? "Category" : "Categories"}
          </Badge>
        </div>

        <Button
          onClick={openAdd}
          className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-4 h-10 text-xs font-semibold shadow-sm shrink-0"
          data-testid="button-add-category"
        >
          <Plus size={16} /> <span>Add Category</span>
        </Button>
      </div>

      {/* ── Modal Add / Edit Category: Mobile-First, Scrollable, Clean ── */}
      <AnimatePresence>
        {showForm && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-5 bg-black/65 backdrop-blur-sm"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-xl bg-[#fdfbf7] rounded-2xl sm:rounded-3xl shadow-2xl border border-primary/10 overflow-hidden my-auto h-[88dvh] max-h-[88dvh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Sticky Header */}
              <CardHeader className="pb-3.5 pt-4 px-4 sm:px-6 border-b border-primary/10 flex-row items-center justify-between bg-[#faf7f2] shrink-0">
                <div className="min-w-0 pr-2">
                  <span className="text-[9px] tracking-[0.35em] text-primary/80 uppercase font-black block mb-0.5">Collection Taxonomy</span>
                  <CardTitle className="font-serif text-lg sm:text-xl font-light text-foreground truncate">{editCategory ? "Modify Category" : "Archive New Category"}</CardTitle>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    type="submit"
                    form="category-modal-form"
                    disabled={createCategory.isPending || updateCategory.isPending}
                    size="sm"
                    className="h-8 px-3 text-xs font-bold rounded-lg bg-primary text-white hover:bg-primary/90 shadow-xs flex items-center gap-1"
                  >
                    {createCategory.isPending || updateCategory.isPending ? "Saving..." : (
                      <>
                        <Check size={13} strokeWidth={2.5} />
                        <span>{editCategory ? "Save" : "Create"}</span>
                      </>
                    )}
                  </Button>
                  <Button size="sm" variant="ghost" aria-label="Close category form" className="rounded-full hover:bg-primary/10 text-muted-foreground hover:text-foreground p-1.5 h-8 w-8" onClick={() => setShowForm(false)} data-testid="button-close-category-form">
                    <X size={16} />
                  </Button>
                </div>
              </CardHeader>

              {/* Scrollable Form Body */}
              <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6">
                <form id="category-modal-form" onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="cat-name" className="text-[10px] font-black tracking-[0.2em] uppercase text-primary/80 font-semibold">Category Name *</Label>
                    <Input id="cat-name" placeholder="e.g. Pooja Essentials" className="bg-white border border-primary/15 hover:border-primary/25 rounded-xl py-3 px-4 text-sm focus:border-primary/40 focus:ring-1 focus:ring-primary/20 shadow-xs outline-none" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required data-testid="input-category-name" />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="cat-desc" className="text-[10px] font-black tracking-[0.2em] uppercase text-primary/80 font-semibold">Description</Label>
                    <Input id="cat-desc" placeholder="Short description of this category" className="bg-white border border-primary/15 hover:border-primary/25 rounded-xl py-3 px-4 text-sm focus:border-primary/40 focus:ring-1 focus:ring-primary/20 shadow-xs outline-none" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required data-testid="input-category-description" />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black tracking-[0.2em] uppercase text-primary/80 font-semibold">Category Banner Image</Label>
                    <div className="flex flex-col sm:flex-row gap-4 items-start">
                      <div className="flex-1 w-full space-y-3">
                        <div className="relative">
                          <input
                            type="file"
                            id="category-image-upload"
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageUpload}
                          />
                          <Button
                            type="button"
                            variant="secondary"
                            disabled={uploadingImg}
                            className="w-full border-2 border-dashed border-primary/25 bg-white hover:bg-[#faf7f2] hover:border-primary/50 rounded-2xl py-6 flex flex-col h-auto justify-center items-center cursor-pointer transition-all duration-200 shadow-xs group disabled:opacity-70 disabled:cursor-not-allowed"
                            onClick={() => document.getElementById("category-image-upload")?.click()}
                          >
                            <div className="w-9 h-9 rounded-full bg-primary/5 group-hover:bg-primary/10 flex items-center justify-center mb-1.5 transition-colors">
                              {uploadingImg ? (
                                <svg className="animate-spin text-primary" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeOpacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/></svg>
                              ) : (
                                <Upload size={16} className="text-primary opacity-75 group-hover:scale-110 transition-transform" />
                              )}
                            </div>
                            <span className="text-[10px] font-black tracking-[0.18em] uppercase text-primary/80 group-hover:text-primary">
                              {uploadingImg ? "Uploading to CDN…" : "Select Banner Photo"}
                            </span>
                            <span className="text-[9px] font-serif italic text-muted-foreground/60 tracking-wider">supports png, jpg, webp</span>
                          </Button>
                        </div>
                        
                        <div className="space-y-1">
                          <span className="text-[9px] font-black tracking-[0.15em] uppercase text-muted-foreground/60 block">Or Paste Image URL</span>
                          <Input 
                            id="cat-image" 
                            placeholder="https://..." 
                            className="bg-white border border-primary/15 hover:border-primary/25 rounded-xl py-2 px-3 text-xs focus:border-primary/40 focus:ring-1 focus:ring-primary/20 shadow-xs"
                            value={form.imageUrl} 
                            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} 
                            required={!form.imageUrl}
                            data-testid="input-category-image" 
                          />
                        </div>
                      </div>
                      
                      {form.imageUrl && (
                        <div className="relative group w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border border-primary/20 shadow-md shrink-0">
                          <img src={form.imageUrl} alt="Category Banner" className="w-full h-full object-cover" />
                          <button 
                            type="button"
                            onClick={() => setForm({ ...form, imageUrl: "" })}
                            className="absolute top-1.5 right-1.5 bg-red-600 text-white p-1 rounded-full shadow-md hover:bg-red-700"
                            title="Remove image"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </form>
              </div>

              {/* Sticky Footer */}
              <div className="px-4 sm:px-6 py-3 border-t border-primary/10 flex items-center justify-between gap-3 bg-[#faf7f2] shrink-0">
                <Button type="button" variant="outline" className="rounded-xl px-4 py-2.5 h-10 text-xs font-bold tracking-wider uppercase border-primary/20 hover:bg-primary/5" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit" form="category-modal-form" disabled={createCategory.isPending || updateCategory.isPending} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-5 py-2.5 h-10 text-xs font-bold tracking-wider uppercase shadow-sm" data-testid="button-submit-category">
                  {createCategory.isPending || updateCategory.isPending ? "Saving..." : (<><Check size={14} /> {editCategory ? "Save Changes" : "Create Category"}</>)}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Categories grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-44 bg-muted rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (categories ?? []).length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Grid3X3 size={40} className="mx-auto mb-3 opacity-40" />
          <p className="font-serif text-lg mb-2">No categories yet</p>
          <p className="text-sm mb-4">Create your first category to organize products</p>
          <Button onClick={openAdd} className="gap-2 bg-primary text-primary-foreground rounded-xl">
            <Plus size={14} /> Add Category
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {(categories ?? []).map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.35 }}
              data-testid={`card-category-${cat.id}`}
              className="relative group"
            >
              <Card className="border-border hover:border-primary/40 hover:shadow-md transition-all overflow-hidden rounded-2xl bg-white flex flex-col h-full">
                <div className="aspect-video bg-muted overflow-hidden relative">
                  <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute top-2 right-2 flex gap-1.5 bg-black/60 backdrop-blur-md p-1 rounded-xl">
                    <Button
                      aria-label={`Edit ${cat.name}`}
                      size="sm"
                      variant="ghost"
                      onClick={() => openEdit(cat)}
                      className="h-8 w-8 p-0 text-white hover:text-white hover:bg-white/20 shrink-0 rounded-lg"
                      data-testid={`button-edit-category-${cat.id}`}
                    >
                      <Pencil size={13} />
                    </Button>
                    <Button
                      aria-label={`Delete ${cat.name}`}
                      size="sm"
                      variant="ghost"
                      onClick={() => setDeleteId(cat.id)}
                      className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/20 shrink-0 rounded-lg"
                      data-testid={`button-delete-category-${cat.id}`}
                    >
                      <Trash2 size={13} />
                    </Button>
                  </div>
                </div>
                <CardContent className="p-4 flex-1 flex flex-col justify-between">
                  <div className="min-w-0">
                    <h3 className="font-serif font-semibold text-foreground text-base mb-1 truncate">{cat.name}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2 leading-relaxed">{cat.description}</p>
                  </div>
                  <p className="text-xs font-semibold text-primary">{cat.productCount} product{cat.productCount !== 1 ? "s" : ""}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── Mobile Floating Action Button (FAB) ── */}
      <div className="sm:hidden fixed bottom-6 right-5 z-40">
        <Button
          onClick={openAdd}
          aria-label="Add New Category"
          className="w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-2xl shadow-primary/50 flex items-center justify-center p-0 border-2 border-white hover:scale-105 active:scale-95 transition-all shrink-0"
          data-testid="button-fab-add-category"
        >
          <Plus size={26} />
        </Button>
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={deleteId !== null} onOpenChange={(open) => {
        if (!open) {
          setDeleteId(null);
          setPasscode("");
        }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif">Delete Category?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The category will be permanently removed. Products in this category will not be deleted but will become uncategorized.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-1.5 my-4">
            <Label htmlFor="delete-passcode" className="text-[10px] font-black tracking-widest uppercase text-muted-foreground">Admin Passcode *</Label>
            <Input
              id="delete-passcode"
              type="password"
              placeholder="Enter passcode to confirm (Hint: 0000)..."
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="rounded-xl border-border"
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPasscode("")}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={passcode !== "0000"}
              className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="button-confirm-delete-category"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
