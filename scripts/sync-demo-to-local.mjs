import fs from "fs";

const catalogPath = "mock-api-server/catalog-data.json";
const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf-8"));

const demoItem = {
  id: 143,
  name: "Demo Masterpiece: Royal Kathakali Wooden Mask (Handcrafted)",
  description: "An authentic handcrafted Royal Kathakali Wooden Mask sculpted from seasoned Kumbil wood by master Kerala artisans. Features rich natural pigment lacquering, intricate gold leaf detailing, and traditional Paccha vesham sacred iconography. Perfect luxury cultural heirloom for art connoisseurs.",
  price: 1899,
  mrp: 2499,
  imageUrl: "/hero-dance-v2.webp",
  images: ["/hero-dance-v2.webp", "/hero-mural-v2.webp"],
  categoryId: 3,
  categoryName: "Ideols & Statue",
  stock: 12,
  material: "Seasoned Kumbil Wood & Organic Lacquer",
  size: "16 x 11 x 4 inches",
  weight: "1.4 kg",
  featured: true,
  isVisible: true,
  isNewArrival: true,
  additionalCategoryIds: [1, 2],
  additionalCategoryNames: ["Chains and Bracelets", "Leather Category"],
  createdAt: new Date().toISOString()
};

// Check if already in products
const idx = catalog.products.findIndex(p => p.id === 143 || p.name.includes("Demo Masterpiece"));
if (idx >= 0) {
  catalog.products[idx] = demoItem;
} else {
  catalog.products.unshift(demoItem);
}

fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2));

// Also update lib/api-client-react/src/catalog-data.ts
const tsContent = `// Auto-generated catalog data
export const CATALOG_DATA = ${JSON.stringify(catalog, null, 2)} as const;
`;
fs.writeFileSync("lib/api-client-react/src/catalog-data.ts", tsContent);

console.log("✅ Catalog data files updated with demo product! Total items:", catalog.products.length);
