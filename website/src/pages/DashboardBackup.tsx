import React, { useState } from "react";
import { motion } from "framer-motion";
import { Database, Download, Upload, CheckCircle2, AlertCircle, RefreshCw, FileJson } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/DashboardLayout";

export default function DashboardBackup() {
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [importMode, setImportMode] = useState<"merge" | "overwrite">("merge");
  const [file, setFile] = useState<File | null>(null);

  const handleExport = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    setStatusText("Preparing your database backup...");
    try {
      // 1. Fetch Categories
      const catRes = await fetch("/api/categories");
      if (!catRes.ok) throw new Error("Failed to fetch categories");
      const categories = await catRes.json();

      // 2. Fetch Products
      const prodRes = await fetch("/api/products");
      if (!prodRes.ok) throw new Error("Failed to fetch products");
      const products = await prodRes.json();

      // 3. Create Backup Payload
      const backupData = {
        appName: "Pavapetti Heritage Store",
        version: "1.0",
        timestamp: new Date().toISOString(),
        categoriesCount: categories.length,
        productsCount: products.length,
        categories,
        products,
      };

      // 4. Download JSON file
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `pavapetti_vault_backup_${new Date().toISOString().split("T")[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);

      setSuccess(`Exported successfully! Saved ${products.length} products and ${categories.length} categories.`);
    } catch (err: any) {
      setError(err.message || "An error occurred during export.");
    } finally {
      setLoading(false);
      setStatusText("");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError("");
      setSuccess("");
    }
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a valid backup JSON file first.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const text = await file.text();
      const backup = JSON.parse(text);

      if (!backup.categories || !backup.products) {
        throw new Error("Invalid backup file format. Must contain both categories and products.");
      }

      const confirmMessage =
        importMode === "overwrite"
          ? "⚠️ WARNING: This will DELETE all existing products and categories in your database before restoring. Are you absolutely sure?"
          : "Are you sure you want to import and merge these products and categories into your database?";

      if (!window.confirm(confirmMessage)) {
        setLoading(false);
        return;
      }

      // 1. Clear database first if overwrite mode
      if (importMode === "overwrite") {
        setStatusText("Clearing existing products from database...");
        const prodRes = await fetch("/api/products");
        const existingProds = await prodRes.json();
        let deletedProdCount = 0;
        for (const p of existingProds) {
          deletedProdCount++;
          setStatusText(`Deleting existing product ${deletedProdCount}/${existingProds.length}...`);
          await fetch(`/api/products/${p.id}`, { method: "DELETE" });
        }

        setStatusText("Clearing existing categories from database...");
        const catRes = await fetch("/api/categories");
        const existingCats = await catRes.json();
        let deletedCatCount = 0;
        for (const c of existingCats) {
          deletedCatCount++;
          setStatusText(`Deleting existing category ${deletedCatCount}/${existingCats.length}...`);
          await fetch(`/api/categories/${c.id}`, { method: "DELETE" });
        }
      }

      // 2. Import Categories & build mapping
      setStatusText("Importing categories...");
      const catMap: Record<number, number> = {};
      let importedCats = 0;
      for (const cat of backup.categories) {
        importedCats++;
        setStatusText(`Importing category ${importedCats}/${backup.categories.length}: ${cat.name}...`);
        
        const res = await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: cat.name,
            description: cat.description,
            imageUrl: cat.imageUrl,
          }),
        });

        if (res.ok) {
          const newCat = await res.json();
          catMap[cat.id] = newCat.id; // Map original ID to newly generated database ID
        } else {
          console.error(`Failed to import category: ${cat.name}`);
        }
      }

      // 3. Import Products
      setStatusText("Importing products...");
      let importedProds = 0;
      for (const prod of backup.products) {
        importedProds++;
        setStatusText(`Importing product ${importedProds}/${backup.products.length}: ${prod.name}...`);

        const mappedCatId = prod.categoryId ? (catMap[prod.categoryId] || null) : null;
        const mappedAdditionalCatIds = (prod.additionalCategoryIds || [])
          .map((oldId: number) => catMap[oldId])
          .filter(Boolean);

        await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: prod.name,
            description: prod.description,
            price: prod.price,
            mrp: prod.mrp,
            imageUrl: prod.imageUrl,
            categoryId: mappedCatId,
            stock: prod.stock || 0,
            material: prod.material,
            size: prod.size,
            featured: prod.featured || false,
            isVisible: prod.isVisible ?? true,
            isNewArrival: prod.isNewArrival || false,
            additionalCategoryIds: mappedAdditionalCatIds,
          }),
        });
      }

      setSuccess(
        `Import completed successfully! Restored ${backup.categories.length} categories and ${backup.products.length} products in ${importMode} mode.`
      );
      setFile(null);
    } catch (err: any) {
      setError(err.message || "An error occurred during import. Check if file is valid JSON.");
    } finally {
      setLoading(false);
      setStatusText("");
    }
  };

  return (
    <DashboardLayout title="Data Vault & Backups" subtitle="Securely backup, export, and import your heritage artifacts database">
      <div className="max-w-4xl space-y-8">
        
        {/* Status Messages */}
        {statusText && (
          <div className="bg-[#fcf8f2] border border-primary/20 rounded-2xl p-5 flex items-center gap-4 text-primary shadow-sm">
            <RefreshCw className="animate-spin text-primary flex-shrink-0" size={20} />
            <div className="text-sm font-semibold tracking-wide">{statusText}</div>
          </div>
        )}

        {success && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-5 flex items-start gap-4 text-green-700 shadow-sm">
            <CheckCircle2 className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="font-bold text-sm">Success</p>
              <p className="text-xs mt-1 text-green-600/90 leading-relaxed">{success}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5 flex items-start gap-4 text-red-700 shadow-sm">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="font-bold text-sm">Operation Failed</p>
              <p className="text-xs mt-1 text-red-600/90 leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Card: Export Database */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white p-8 rounded-[2rem] border border-primary/5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                <Download size={22} />
              </div>
              <h3 className="font-serif text-2xl mb-3">Export Collection</h3>
              <p className="text-xs text-muted-foreground leading-relaxed mb-6">
                Download a complete secure snapshot of your current database including all categories, products, stock levels, materials, and settings as a standard JSON file.
              </p>
            </div>
            <Button
              onClick={handleExport}
              disabled={loading}
              className="w-full py-6 rounded-2xl font-black text-xs uppercase tracking-widest bg-primary text-white hover:bg-primary/95 shadow-lg shadow-primary/10 transition-all duration-300"
            >
              <Download size={14} className="mr-2" />
              Download Backup JSON
            </Button>
          </motion.div>

          {/* Card: Import Database */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="bg-white p-8 rounded-[2rem] border border-primary/5 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#c18326]/10 flex items-center justify-center text-[#c18326] mb-6">
              <Upload size={22} />
            </div>
            <h3 className="font-serif text-2xl mb-3">Import & Restore</h3>
            <p className="text-xs text-muted-foreground leading-relaxed mb-6">
              Restore categories and products from a previously exported Pavapetti backup file.
            </p>

            <form onSubmit={handleImport} className="space-y-6">
              {/* File Selector */}
              <div className="relative border-2 border-dashed border-primary/10 rounded-2xl p-6 text-center hover:border-primary/45 transition-colors cursor-pointer bg-[#fdfcfb]">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={loading}
                />
                <FileJson size={28} className="mx-auto text-primary/30 mb-3" />
                {file ? (
                  <div>
                    <p className="text-xs font-bold text-primary truncate max-w-xs mx-auto">{file.name}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{(file.size / 1024).toFixed(2)} KB</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-bold text-foreground">Click to upload backup file</p>
                    <p className="text-[10px] text-muted-foreground mt-1">Supports Pavapetti JSON backups only</p>
                  </div>
                )}
              </div>

              {/* Import Options */}
              <div className="space-y-3">
                <label className="block text-[10px] font-black tracking-wider uppercase text-muted-foreground">Import Mode</label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => !loading && setImportMode("merge")}
                    className={`p-3 rounded-xl border text-center cursor-pointer transition-all duration-200 ${
                      importMode === "merge"
                        ? "bg-primary/5 border-primary text-primary"
                        : "border-border/50 text-muted-foreground hover:bg-neutral-50"
                    }`}
                  >
                    <p className="text-xs font-bold">Merge</p>
                    <p className="text-[9px] mt-0.5 leading-tight opacity-75">Add only, don't delete</p>
                  </div>
                  <div
                    onClick={() => !loading && setImportMode("overwrite")}
                    className={`p-3 rounded-xl border text-center cursor-pointer transition-all duration-200 ${
                      importMode === "overwrite"
                        ? "bg-red-500/5 border-red-500/40 text-red-600"
                        : "border-border/50 text-muted-foreground hover:bg-neutral-50"
                    }`}
                  >
                    <p className="text-xs font-bold">Overwrite</p>
                    <p className="text-[9px] mt-0.5 leading-tight opacity-75">Wipe database first</p>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={loading || !file}
                className={`w-full py-6 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 ${
                  importMode === "overwrite"
                    ? "bg-red-600 hover:bg-red-500 text-white shadow-red-500/10"
                    : "bg-primary hover:bg-primary/95 text-white shadow-primary/10"
                }`}
              >
                <Upload size={14} className="mr-2" />
                Upload & Restore Database
              </Button>
            </form>
          </motion.div>
        </div>

        {/* Database Stats Information */}
        <div className="bg-[#fbf9f6] border border-primary/5 rounded-[2rem] p-8 text-muted-foreground">
          <h4 className="font-serif text-lg text-foreground mb-4">🗄️ Backup Safeguard Tips</h4>
          <ul className="text-xs space-y-2.5 leading-relaxed list-disc pl-5">
            <li><strong>Double-check your Database Connection:</strong> Ensure your local configuration is pointing to the correct Supabase project before performing operations.</li>
            <li><strong>Image Attachments:</strong> Backups store product details and image links, but they don't host physical images. Verify that your images remain uploaded on your Supabase Storage.</li>
            <li><strong>Security:</strong> Backups do not contain private keys or passwords, making them safe to store on your local computer.</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}
