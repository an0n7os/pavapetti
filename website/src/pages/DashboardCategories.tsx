import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Grid3X3, X, Check, Trash2 } from "lucide-react";
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
  useDeleteCategory,
  getListCategoriesQueryKey,
  getGetDashboardStatsQueryKey,
  type CreateCategoryBody,
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

  const { data: categories, isLoading } = useListCategories({
    query: { queryKey: getListCategoriesQueryKey() },
  });
  const createCategory = useCreateCategory();
  const deleteCategory = useDeleteCategory();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetDashboardStatsQueryKey() });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
  };

  const handleDelete = () => {
    if (deleteId == null) return;
    deleteCategory.mutate(
      { id: deleteId },
      {
        onSuccess: () => {
          toast({ title: "Category deleted" });
          setDeleteId(null);
          invalidate();
        },
        onError: () => toast({ title: "Failed to delete category", variant: "destructive" }),
      }
    );
  };

  return (
    <DashboardLayout title="Categories" subtitle="Manage your product categories">
      <div className="flex justify-end mb-6">
        <Button onClick={() => setShowForm(true)} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90" data-testid="button-add-category">
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
            <Card className="border-primary/30">
              <CardHeader className="pb-3 flex-row items-center justify-between">
                <CardTitle className="font-serif text-lg">Add New Category</CardTitle>
                <Button size="sm" variant="ghost" onClick={() => setShowForm(false)} data-testid="button-close-category-form"><X size={16} /></Button>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cat-name">Category Name</Label>
                    <Input id="cat-name" placeholder="e.g. Pooja Category" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required data-testid="input-category-name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cat-image">Image URL</Label>
                    <Input id="cat-image" placeholder="https://..." value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} required data-testid="input-category-image" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="cat-desc">Description</Label>
                    <Input id="cat-desc" placeholder="Short description of this category" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required data-testid="input-category-description" />
                  </div>
                  <div className="md:col-span-2 flex gap-3 justify-end">
                    <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                    <Button type="submit" disabled={createCategory.isPending} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90" data-testid="button-submit-category">
                      {createCategory.isPending ? "Creating..." : (<><Check size={15} /> Create Category</>)}
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
          <Button onClick={() => setShowForm(true)} className="gap-2 bg-primary text-primary-foreground">
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
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDeleteId(cat.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                      data-testid={`button-delete-category-${cat.id}`}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Delete confirmation */}
      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif">Delete Category?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The category will be permanently removed. Products in this category will not be deleted but will become uncategorized.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
