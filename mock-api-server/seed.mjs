import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load dotenv from root directory
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your-project-id')) {
  console.error('❌ Error: Please specify valid SUPABASE_URL and SUPABASE_ANON_KEY in your .env file at the project root.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const categories = [
  { id: 1, name: "Pooja Category", description: "Sacred ritual oils, dhoop, and temple essentials", image_url: "/hero-brass.png", product_count: 12 },
  { id: 2, name: "Chains and Bracelets", description: "Sacred Karungali and Rudraksha silver-capped jewelry", image_url: "/karungali_mala.png", product_count: 15 },
  { id: 3, name: "Elephant Heritage", description: "Majestic Netipattams and wall-hanging elephant heads", image_url: "/elephant_head.png", product_count: 8 },
  { id: 4, name: "Heritage Textiles", description: "Premium Kasavu Mundu and traditional Kerala attire", image_url: "/hero-textile.png", product_count: 10 },
  { id: 5, name: "Miniatures & Mini Chenda", description: "Handcrafted miniature musical instruments and icons", image_url: "/hero-dance.png", product_count: 20 },
  { id: 6, name: "Fragrances & Organic Soap", description: "Temple-inspired scents and handmade organic soaps", image_url: "/kalabham_perfume.png", product_count: 8 },
];

const products = [
  // --- Pooja Category ---
  {
    id: 1,
    name: "Pure Pooja Oil (700ml)",
    description: "Premium blend pooja oil for daily temple rituals and lamp lighting. Smoke-free and long-lasting.",
    price: 250,
    mrp: 300,
    image_url: "/pooja_oil.png",
    category_id: 1,
    category_name: "Pooja Category",
    stock: 50,
    material: "Natural Oils",
    size: "700ml",
    featured: true,
    is_visible: true,
    is_new_arrival: false
  },
  {
    id: 2,
    name: "Nithya Agnihotra Dhoop",
    description: "Traditional dhoop for daily pooja. 18 pieces per box. Purifies the atmosphere with a divine fragrance.",
    price: 250,
    mrp: 300,
    image_url: "/dhoop.png",
    category_id: 1,
    category_name: "Pooja Category",
    stock: 100,
    material: "Herbal Extract",
    size: "18 pcs",
    featured: false,
    is_visible: true,
    is_new_arrival: true
  },

  // --- Chains and Bracelets ---
  {
    id: 3,
    name: "Karungali Pure Silver Mala (8mm)",
    description: "Original Karungali (Ebony wood) beads capped with 925 pure silver. A sacred shield for protection and clarity.",
    price: 9000,
    mrp: 9500,
    image_url: "/karungali_mala.png",
    category_id: 2,
    category_name: "Chains and Bracelets",
    stock: 5,
    material: "Ebony Wood & 925 Silver",
    size: "30 inch",
    featured: true,
    is_visible: true,
    is_new_arrival: true
  },
  {
    id: 4,
    name: "Rudraksha Pure Silver Bracelet",
    description: "Authentic Rudraksha beads with pure silver casing. Designed for spiritual balance and modern elegance.",
    price: 4500,
    mrp: 5000,
    image_url: "/rudraksha_bracelet.png",
    category_id: 2,
    category_name: "Chains and Bracelets",
    stock: 15,
    material: "Rudraksha & 925 Silver",
    size: "Standard",
    featured: true,
    is_visible: true,
    is_new_arrival: false
  },

  // --- Elephant Heritage ---
  {
    id: 5,
    name: "Ramachandran Wall Hanging Elephant Head",
    description: "Stunning 30-inch wall-hanging elephant head inspired by the legendary 'Thechikkottukavu Ramachandran'. Hand-painted with authentic textures.",
    price: 10000,
    mrp: 11000,
    image_url: "/elephant_head.png",
    category_id: 3,
    category_name: "Elephant Heritage",
    stock: 3,
    material: "High-density Fiber",
    size: "30 inch",
    featured: true,
    is_visible: true,
    is_new_arrival: true
  },
  {
    id: 6,
    name: "Golden Netipattam (Small)",
    description: "Traditional elephant caparison for home decor. Handcrafted with shimmering gold-finish details and colorful tassels.",
    price: 1600,
    mrp: 2500,
    image_url: "/netipattam.png",
    category_id: 3,
    category_name: "Elephant Heritage",
    stock: 20,
    material: "Gold-finish Copper & Fabric",
    size: "14x10 inch",
    featured: false,
    is_visible: true,
    is_new_arrival: false
  },

  // --- Heritage Textiles ---
  {
    id: 7,
    name: "Premium Blue Border Mundu",
    description: "Traditional Kerala Mundu with a sophisticated deep blue border. Woven from ultra-soft fine cotton for maximum comfort.",
    price: 550,
    mrp: 600,
    image_url: "/hero-textile.png",
    category_id: 4,
    category_name: "Heritage Textiles",
    stock: 40,
    material: "Fine Cotton",
    size: "4 meters",
    featured: true,
    is_visible: true,
    is_new_arrival: true
  },
  {
    id: 8,
    name: "Black Theyyam Printed Mundu",
    description: "A bold statement piece featuring traditional Theyyam motifs. Perfect for cultural events and heritage gatherings.",
    price: 600,
    mrp: 700,
    image_url: "/theyyam_mundu.png",
    category_id: 4,
    category_name: "Heritage Textiles",
    stock: 25,
    material: "Hand-printed Cotton",
    size: "4 meters",
    featured: false,
    is_visible: true,
    is_new_arrival: false
  },

  // --- Miniatures ---
  {
    id: 9,
    name: "Miniature Chenda (Traditional Drum)",
    description: "Perfectly detailed miniature of Kerala's iconic 'Chenda'. Hand-carved wood with authentic skin tensioning.",
    price: 650,
    mrp: 750,
    image_url: "/chenda.png",
    category_id: 5,
    category_name: "Miniatures & Mini Chenda",
    stock: 30,
    material: "Wood & Leather",
    size: "3 inch",
    featured: true,
    is_visible: true,
    is_new_arrival: true
  },
  {
    id: 10,
    name: "Kathakali Face Stand (Small)",
    description: "Miniature hand-painted Kathakali face on a wooden stand. A classic Kerala souvenir for your bookshelf.",
    price: 850,
    mrp: 1000,
    image_url: "/hero-dance.png",
    category_id: 5,
    category_name: "Miniatures & Mini Chenda",
    stock: 50,
    material: "Painted Wood",
    size: "12 inch",
    featured: true,
    is_visible: true,
    is_new_arrival: false
  },

  // --- Fragrances ---
  {
    id: 11,
    name: "Divine Kalabham Perfume (50ml)",
    description: "A signature temple fragrance capturing the essence of sandalwood and divine rituals. Long-lasting and pure.",
    price: 1350,
    mrp: 1500,
    image_url: "/kalabham_perfume.png",
    category_id: 6,
    category_name: "Fragrances & Organic Soap",
    stock: 12,
    material: "Essential Oils",
    size: "50ml",
    featured: true,
    is_visible: true,
    is_new_arrival: true
  },
  {
    id: 12,
    name: "Charcoal Organic Handmade Soap",
    description: "Detoxifying handmade soap with activated charcoal and traditional oils. Chemical-free and skin-friendly.",
    price: 200,
    mrp: 250,
    image_url: "/charcoal_soap.png",
    category_id: 6,
    category_name: "Fragrances & Organic Soap",
    stock: 40,
    material: "Activated Charcoal & Coconut Oil",
    size: "100g",
    featured: false,
    is_visible: true,
    is_new_arrival: false
  },
  {
    id: 13,
    name: "Aranmula Kannadi Hand-Held",
    description: "Authentic metal mirror from Aranmula. A sacred object for prosperity and beauty. Hand-held model with traditional patterns.",
    price: 4500,
    mrp: 5500,
    image_url: "/aranmula_kannadi.png",
    category_id: 3,
    category_name: "Elephant Heritage",
    stock: 5,
    material: "Aranmula Metal Alloy",
    size: "5 inch",
    featured: true,
    is_visible: true,
    is_new_arrival: true
  }
];

async function seed() {
  console.log('🌱 Starting Supabase Seeding...');

  // 1. Seed Categories
  console.log('Inserting categories...');
  const { data: catData, error: catError } = await supabase
    .from('categories')
    .upsert(categories, { onConflict: 'id' });

  if (catError) {
    console.error('❌ Error seeding categories:', catError);
    return;
  }
  console.log('✅ Categories seeded successfully!');

  // 2. Seed Products
  console.log('Inserting products...');
  const { data: prodData, error: prodError } = await supabase
    .from('products')
    .upsert(products, { onConflict: 'id' });

  if (prodError) {
    console.error('❌ Error seeding products:', prodError);
    return;
  }
  console.log('✅ Products seeded successfully!');
  console.log('🎉 Seeding completed successfully!');
}

seed();
