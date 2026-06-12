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
  { id: 1, name: "Pooja Category", description: "Sacred ritual oils, dhoop, and temple essentials", image_url: "/hero-brass.webp", product_count: 12 },
  { id: 2, name: "Chains and Bracelets", description: "Sacred Karungali and Rudraksha silver-capped jewelry", image_url: "/karungali_mala.webp", product_count: 15 },
  { id: 3, name: "Elephant Heritage", description: "Majestic Netipattams and wall-hanging elephant heads", image_url: "/elephant_head.webp", product_count: 8 },
  { id: 4, name: "Heritage Textiles", description: "Premium Kasavu Mundu and traditional Kerala attire", image_url: "/hero-textile.webp", product_count: 10 },
  { id: 5, name: "Miniatures & Mini Chenda", description: "Handcrafted miniature musical instruments and icons", image_url: "/hero-dance.webp", product_count: 20 },
  { id: 6, name: "Fragrances & Organic Soap", description: "Temple-inspired scents and handmade organic soaps", image_url: "/kalabham_perfume.webp", product_count: 8 },
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
    image_url: "/rudraksha_bracelet.webp",
    category_id: 2,
    category_name: "Chains and Bracelets",
    additional_category_ids: [1],
    additional_category_names: ["Pooja Category"],
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
  },
  {
    id: 14,
    name: "Valkannadi (Brass Hand Mirror)",
    description: "Hand-cast brass Valkannadi mirror, a symbol of prosperity and divine feminine energy, perfect for pooja rooms and wedding trousseaus.",
    price: 1850,
    mrp: 2200,
    image_url: "/hero-brass-v2.png",
    category_id: 1,
    category_name: "Pooja Category",
    stock: 15,
    material: "Hand-cast Brass",
    size: "8x4 inches",
    featured: false,
    is_visible: true,
    is_new_arrival: true
  },
  {
    id: 15,
    name: "Premium Kasavu Saree (Silver Zari)",
    description: "Fine handwoven Kerala Kasavu saree with exquisite silver zari border. Crafted by traditional weavers of Balaramapuram.",
    price: 4200,
    mrp: 4800,
    image_url: "/kasavu-textile.png",
    category_id: 4,
    category_name: "Heritage Textiles",
    stock: 8,
    material: "Handloom Cotton & Silver Zari",
    size: "Free Size",
    featured: true,
    is_visible: true,
    is_new_arrival: false
  },
  {
    id: 16,
    name: "Teakwood Kathakali Mask (Medium)",
    description: "Exquisitely hand-carved teakwood Kathakali mask showing the Pachha (noble) character, painted with natural pigments.",
    price: 3800,
    mrp: 4500,
    image_url: "/hero-dance-v2.png",
    category_id: 5,
    category_name: "Miniatures & Mini Chenda",
    stock: 6,
    material: "Teakwood",
    size: "15 inches",
    featured: false,
    is_visible: true,
    is_new_arrival: true
  },
  {
    id: 17,
    name: "Nettoor Petti Royal Casket (Medium)",
    description: "Handcrafted rosewood Nettoor Petti with ornate brass work and velvet lining. A replica of royal Kerala jewelry boxes.",
    price: 8500,
    mrp: 9500,
    image_url: "/hero-box-v2.png",
    category_id: 3,
    category_name: "Elephant Heritage",
    stock: 4,
    material: "Rosewood & Brass",
    size: "12x8x8 inches",
    featured: true,
    is_visible: true,
    is_new_arrival: false
  },
  {
    id: 18,
    name: "Traditional Brass Nilavilakku (Aduku Vilakku)",
    description: "Multi-layered traditional brass lamp (Nilavilakku) for auspicious occasions. Hand-polished to a warm golden glow.",
    price: 3200,
    mrp: 3800,
    image_url: "/hero-brass.png",
    category_id: 1,
    category_name: "Pooja Category",
    stock: 12,
    material: "Pure Brass",
    size: "18 inches",
    featured: false,
    is_visible: true,
    is_new_arrival: true
  },
  {
    id: 19,
    name: "Spiritual Karungali Bracelet with Silver Beads",
    description: "Natural ebony wood (Karungali) beads bracelet accented with pure silver beads. Attracts positive energy and focus.",
    price: 2200,
    mrp: 2500,
    image_url: "/karungali_mala.png",
    category_id: 2,
    category_name: "Chains and Bracelets",
    stock: 25,
    material: "Ebony Wood & 925 Silver",
    size: "Elastic (Standard)",
    featured: true,
    is_visible: true,
    is_new_arrival: true
  },
  {
    id: 20,
    name: "Handcrafted Miniature Snake Boat (Chundan Vallam)",
    description: "Miniature wooden replica of Kerala's famous snake boat (Chundan Vallam), detailed with tiny oarsmen and golden parasols.",
    price: 2400,
    mrp: 2800,
    image_url: "/hero-dance.png",
    category_id: 5,
    category_name: "Miniatures & Mini Chenda",
    stock: 10,
    material: "Rosewood",
    size: "24 inches",
    featured: false,
    is_visible: true,
    is_new_arrival: true
  },
  {
    id: 21,
    name: "Divine Sandalwood (Chandan) Incense Cones",
    description: "Organic hand-rolled incense cones made from pure forest-sourced sandalwood paste and natural herbs.",
    price: 350,
    mrp: 400,
    image_url: "/kalabham_perfume.png",
    category_id: 6,
    category_name: "Fragrances & Organic Soap",
    stock: 80,
    material: "Sandalwood Paste & Herbs",
    size: "30 cones",
    featured: true,
    is_visible: true,
    is_new_arrival: false
  },
  {
    id: 22,
    name: "Golden Theyyam Face Sculpture (Wall Mount)",
    description: "Magnificent Theyyam face wall sculpture, capturing the fierce divine expression with vibrant red and golden metal leaf detailing.",
    price: 4800,
    mrp: 5500,
    image_url: "/hero-dance-v2.png",
    category_id: 5,
    category_name: "Miniatures & Mini Chenda",
    stock: 5,
    material: "Terracotta & Metal Foil",
    size: "16x10 inches",
    featured: false,
    is_visible: true,
    is_new_arrival: true
  },
  {
    id: 23,
    name: "Traditional Bell Metal Uruli (10 inch)",
    description: "Traditional bell metal Uruli vessel, ideal for floating flowers (Oottupura style) or traditional Ayurvedic preparations.",
    price: 2900,
    mrp: 3400,
    image_url: "/hero-brass-v2.png",
    category_id: 1,
    category_name: "Pooja Category",
    stock: 8,
    material: "Bell Metal (Bronze)",
    size: "10 inches diameter",
    featured: true,
    is_visible: true,
    is_new_arrival: false
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
  const seededProducts = products.map(p => ({
    ...p,
    image_url: p.image_url ? p.image_url.replace('.png', '.webp') : p.image_url,
    additional_category_ids: p.additional_category_ids || [],
    additional_category_names: p.additional_category_names || []
  }));
  const { data: prodData, error: prodError } = await supabase
    .from('products')
    .upsert(seededProducts, { onConflict: 'id' });

  if (prodError) {
    console.error('❌ Error seeding products:', prodError);
    return;
  }
  console.log('✅ Products seeded successfully!');
  console.log('🎉 Seeding completed successfully!');
}

seed();
