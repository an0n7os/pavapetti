import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Grid3X3, X, Check, Trash2, Upload, Pencil } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
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
  getGetDashboardStatsQueryKey,
  type CreateCategoryBody,
  type Category,
} from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setForm(prev => ({ ...prev, imageUrl: base64String }));
      toast({ title: "Category image selected" });
    };
    reader.readAsDataURL(file);
  };

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
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
      <div className="flex justify-end mb-6">
        <Button onClick={openAdd} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90" data-testid="button-add-category">
          <Plus size={16} /> Add Category
        </Button>
      </div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="mb-6"
          >
            <Card className="border border-primary/10 rounded-[2.5rem] bg-[#fdfbf7] shadow-2xl shadow-primary/5 overflow-hidden">
              <CardHeader className="pb-5 pt-8 px-8 border-b border-primary/5 flex-row items-center justify-between bg-[#faf7f2]">
                <div>
                  <span className="text-[9px] tracking-[0.4em] text-primary/80 uppercase font-black block mb-1">Collection Taxonomy</span>
                  <CardTitle className="font-serif text-2xl font-light text-foreground">{editCategory ? "Modify Category Details" : "Archive New Category"}</CardTitle>
                </div>
                <Button size="sm" variant="ghost" className="rounded-full hover:bg-primary/5 text-muted-foreground hover:text-foreground p-2" onClick={() => setShowForm(false)} data-testid="button-close-category-form">
                  <X size={18} />
                </Button>
              </CardHeader>
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="cat-name" className="text-[10px] font-black tracking-[0.2em] uppercase text-primary/80 font-semibold">Category Name</Label>
                    <Input id="cat-name" placeholder="e.g. Pooja Category" className="bg-white border border-primary/10 hover:border-primary/20 rounded-2xl py-6 px-5 text-sm tracking-wide focus:border-primary/30 focus:ring-1 focus:ring-primary/10 transition-all shadow-sm outline-none placeholder:text-muted-foreground/35" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required data-testid="input-category-name" />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="cat-desc" className="text-[10px] font-black tracking-[0.2em] uppercase text-primary/80 font-semibold">Description</Label>
                    <Input id="cat-desc" placeholder="Short description of this category" className="bg-white border border-primary/10 hover:border-primary/20 rounded-2xl py-6 px-5 text-sm tracking-wide focus:border-primary/30 focus:ring-1 focus:ring-primary/10 transition-all shadow-sm outline-none placeholder:text-muted-foreground/35" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required data-testid="input-category-description" />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-[10px] font-black tracking-[0.2em] uppercase text-primary/80 font-semibold">Category Banner Image</Label>
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                      <div className="flex-1 w-full space-y-4">
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
                            className="w-full border-2 border-dashed border-primary/20 bg-gradient-to-br from-white/90 to-[#faf8f5]/90 hover:from-white hover:to-[#faf6ee] hover:border-primary/45 rounded-3xl py-10 flex flex-col h-auto justify-center items-center cursor-pointer transition-all duration-300 shadow-md shadow-primary/5 hover:shadow-lg hover:shadow-primary/5 group"
                            onClick={() => document.getElementById("category-image-upload")?.click()}
                          >
                            <div className="w-10 h-10 rounded-full bg-primary/5 group-hover:bg-primary/10 flex items-center justify-center mb-2 transition-colors duration-300">
                              <Upload size={16} className="text-primary opacity-70 group-hover:scale-110 transition-transform duration-300" />
                            </div>
                            <div className="flex flex-col items-center">
                              <span className="text-[10px] font-black tracking-[0.2em] uppercase text-primary/80 group-hover:text-primary transition-colors duration-300">Select Banner Photo</span>
                              <span className="text-[9px] font-serif italic text-muted-foreground/60 tracking-wider mt-0.5">supports png, jpg, webp</span>
                            </div>
                          </Button>
                        </div>
                        
                        <div className="space-y-1">
                          <span className="text-[9px] font-black tracking-[0.15em] uppercase text-muted-foreground/50 block">Or Paste Image URL</span>
                          <Input 
                            id="cat-image" 
                            placeholder="https://..." 
                            className="bg-white border border-primary/10 hover:border-primary/20 rounded-2xl py-5 px-5 text-xs focus:border-primary/30 focus:ring-1 focus:ring-primary/10 transition-all shadow-sm outline-none placeholder:text-muted-foreground/35"
                            value={form.imageUrl} 
                            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} 
                            required={!form.imageUrl}
                            data-testid="input-category-image" 
                          />
                        </div>
                      </div>
                      
                      {form.imageUrl && (
                        <div className="relative group w-32 h-32 rounded-3xl overflow-hidden border border-primary/10 shadow-lg shadow-primary/5 shrink-0 transition-transform duration-300 hover:scale-[1.02]">
                          <img src={form.imageUrl} alt="Category Portrait" className="w-full h-full object-cover" />
                          <button 
                            type="button"
                            onClick={() => setForm({ ...form, imageUrl: "" })}
                            className="absolute top-2 right-2 bg-red-500/90 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="md:col-span-2 flex gap-3 justify-end mt-2">
                    <Button type="button" variant="outline" className="rounded-2xl px-6 py-5 h-auto text-xs font-black tracking-[0.2em] uppercase border-primary/15 hover:bg-primary/5 transition-all outline-none" onClick={() => setShowForm(false)}>Cancel</Button>
                    <Button type="submit" disabled={createCategory.isPending || updateCategory.isPending} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl px-6 py-5 h-auto text-xs font-black tracking-[0.2em] uppercase transition-all shadow-md shadow-primary/10 outline-none" data-testid="button-submit-category">
                      {createCategory.isPending || updateCategory.isPending ? "Saving..." : (<><Check size={14} /> {editCategory ? "Save Changes" : "Create Category"}</>)}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Categories grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-40 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (categories ?? []).length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Grid3X3 size={40} className="mx-auto mb-3 opacity-40" />
          <p className="font-serif text-lg mb-2">No categories yet</p>
          <p className="text-sm mb-4">Create your first category to organize products</p>
          <Button onClick={openAdd} className="gap-2 bg-primary text-primary-foreground">
            <Plus size={14} /> Add Category
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {(categories ?? []).map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.35 }}
              data-testid={`card-category-${cat.id}`}
              className="relative group"
            >
              <Card className="border-border hover:border-primary/40 hover:shadow-md transition-all overflow-hidden">
                <div className="aspect-video bg-muted overflow-hidden">
                  <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-serif font-semibold text-foreground mb-1 truncate">{cat.name}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{cat.description}</p>
                      <p className="text-xs font-medium text-primary">{cat.productCount} product{cat.productCount !== 1 ? "s" : ""}</p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEdit(cat)}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground shrink-0"
                        data-testid={`button-edit-category-${cat.id}`}
                      >
                        <Pencil size={14} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeleteId(cat.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 shrink-0"
                        data-testid={`button-delete-category-${cat.id}`}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

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
