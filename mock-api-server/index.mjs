import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the root .env file
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Supabase Client Setup
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
let supabase = null;
let isSupabaseConfigured = false;

if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project-id')) {
  supabase = createClient(supabaseUrl, supabaseKey);
  isSupabaseConfigured = true;
  console.log('✅ Supabase connected successfully!');
} else {
  console.log('⚠️ Supabase URL/Key not found or using default placeholders. Falling back to In-Memory mock data.');
}

// --- Mappings between Local CamelCase and Supabase snake_case ---
function mapProductFromDb(p) {
  if (!p) return null;
  return {
    id: Number(p.id),
    name: p.name,
    description: p.description,
    price: Number(p.price),
    mrp: p.mrp ? Number(p.mrp) : undefined,
    imageUrl: p.image_url,
    categoryId: Number(p.category_id),
    categoryName: p.category_name,
    stock: Number(p.stock),
    material: p.material,
    size: p.size,
    featured: Boolean(p.featured),
    isVisible: Boolean(p.is_visible),
    isNewArrival: Boolean(p.is_new_arrival),
    createdAt: p.created_at
  };
}

function mapProductToDb(p) {
  if (!p) return null;
  const mapped = {};
  if (p.name !== undefined) mapped.name = p.name;
  if (p.description !== undefined) mapped.description = p.description;
  if (p.price !== undefined) mapped.price = p.price;
  if (p.mrp !== undefined) mapped.mrp = p.mrp;
  if (p.imageUrl !== undefined) mapped.image_url = p.imageUrl;
  if (p.categoryId !== undefined) mapped.category_id = p.categoryId;
  if (p.categoryName !== undefined) mapped.category_name = p.categoryName;
  if (p.stock !== undefined) mapped.stock = p.stock;
  if (p.material !== undefined) mapped.material = p.material;
  if (p.size !== undefined) mapped.size = p.size;
  if (p.featured !== undefined) mapped.featured = p.featured;
  if (p.isVisible !== undefined) mapped.is_visible = p.isVisible;
  if (p.isNewArrival !== undefined) mapped.is_new_arrival = p.isNewArrival;
  return mapped;
}

function mapCategoryFromDb(c) {
  if (!c) return null;
  return {
    id: Number(c.id),
    name: c.name,
    description: c.description,
    imageUrl: c.image_url,
    productCount: Number(c.product_count || 0)
  };
}

function mapCategoryToDb(c) {
  if (!c) return null;
  const mapped = {};
  if (c.name !== undefined) mapped.name = c.name;
  if (c.description !== undefined) mapped.description = c.description;
  if (c.imageUrl !== undefined) mapped.image_url = c.imageUrl;
  if (c.productCount !== undefined) mapped.product_count = c.productCount;
  return mapped;
}

// --- In-Memory Fallback Arrays ---
let categories = [
  { id: 1, name: "Pooja Category", description: "Sacred ritual oils, dhoop, and temple essentials", imageUrl: "/hero-brass.png", productCount: 12 },
  { id: 2, name: "Chains and Bracelets", description: "Sacred Karungali and Rudraksha silver-capped jewelry", imageUrl: "/karungali_mala.png", productCount: 15 },
  { id: 3, name: "Elephant Heritage", description: "Majestic Netipattams and wall-hanging elephant heads", imageUrl: "/elephant_head.png", productCount: 8 },
  { id: 4, name: "Heritage Textiles", description: "Premium Kasavu Mundu and traditional Kerala attire", imageUrl: "/hero-textile.png", productCount: 10 },
  { id: 5, name: "Miniatures & Mini Chenda", description: "Handcrafted miniature musical instruments and icons", imageUrl: "/hero-dance.png", productCount: 20 },
  { id: 6, name: "Fragrances & Organic Soap", description: "Temple-inspired scents and handmade organic soaps", imageUrl: "/kalabham_perfume.png", productCount: 8 },
];

let products = [
  // --- Pooja Category ---
  {
    id: 1,
    name: "Pure Pooja Oil (700ml)",
    description: "Premium blend pooja oil for daily temple rituals and lamp lighting. Smoke-free and long-lasting.",
    price: 250,
    mrp: 300,
    imageUrl: "/pooja_oil.png",
    categoryId: 1,
    categoryName: "Pooja Category",
    stock: 50,
    material: "Natural Oils",
    size: "700ml",
    featured: true,
    isVisible: true,
    isNewArrival: false
  },
  {
    id: 2,
    name: "Nithya Agnihotra Dhoop",
    description: "Traditional dhoop for daily pooja. 18 pieces per box. Purifies the atmosphere with a divine fragrance.",
    price: 250,
    mrp: 300,
    imageUrl: "/dhoop.png",
    categoryId: 1,
    categoryName: "Pooja Category",
    stock: 100,
    material: "Herbal Extract",
    size: "18 pcs",
    featured: false,
    isVisible: true,
    isNewArrival: true
  },

  // --- Chains and Bracelets ---
  {
    id: 3,
    name: "Karungali Pure Silver Mala (8mm)",
    description: "Original Karungali (Ebony wood) beads capped with 925 pure silver. A sacred shield for protection and clarity.",
    price: 9000,
    mrp: 9500,
    imageUrl: "/karungali_mala.png",
    categoryId: 2,
    categoryName: "Chains and Bracelets",
    stock: 5,
    material: "Ebony Wood & 925 Silver",
    size: "30 inch",
    featured: true,
    isVisible: true,
    isNewArrival: true
  },
  {
    id: 4,
    name: "Rudraksha Pure Silver Bracelet",
    description: "Authentic Rudraksha beads with pure silver casing. Designed for spiritual balance and modern elegance.",
    price: 4500,
    mrp: 5000,
    imageUrl: "/rudraksha_bracelet.png",
    categoryId: 2,
    categoryName: "Chains and Bracelets",
    stock: 15,
    material: "Rudraksha & 925 Silver",
    size: "Standard",
    featured: true,
    isVisible: true,
    isNewArrival: false
  },

  // --- Elephant Heritage ---
  {
    id: 5,
    name: "Ramachandran Wall Hanging Elephant Head",
    description: "Stunning 30-inch wall-hanging elephant head inspired by the legendary 'Thechikkottukavu Ramachandran'. Hand-painted with authentic textures.",
    price: 10000,
    mrp: 11000,
    imageUrl: "/elephant_head.png",
    categoryId: 3,
    categoryName: "Elephant Heritage",
    stock: 3,
    material: "High-density Fiber",
    size: "30 inch",
    featured: true,
    isVisible: true,
    isNewArrival: true
  },
  {
    id: 6,
    name: "Golden Netipattam (Small)",
    description: "Traditional elephant caparison for home decor. Handcrafted with shimmering gold-finish details and colorful tassels.",
    price: 1600,
    mrp: 2500,
    imageUrl: "/netipattam.png",
    categoryId: 3,
    categoryName: "Elephant Heritage",
    stock: 20,
    material: "Gold-finish Copper & Fabric",
    size: "14x10 inch",
    featured: false,
    isVisible: true,
    isNewArrival: false
  },

  // --- Heritage Textiles ---
  {
    id: 7,
    name: "Premium Blue Border Mundu",
    description: "Traditional Kerala Mundu with a sophisticated deep blue border. Woven from ultra-soft fine cotton for maximum comfort.",
    price: 550,
    mrp: 600,
    imageUrl: "/hero-textile.png",
    categoryId: 4,
    categoryName: "Heritage Textiles",
    stock: 40,
    material: "Fine Cotton",
    size: "4 meters",
    featured: true,
    isVisible: true,
    isNewArrival: true
  },
  {
    id: 8,
    name: "Black Theyyam Printed Mundu",
    description: "A bold statement piece featuring traditional Theyyam motifs. Perfect for cultural events and heritage gatherings.",
    price: 600,
    mrp: 700,
    imageUrl: "/theyyam_mundu.png",
    categoryId: 4,
    categoryName: "Heritage Textiles",
    stock: 25,
    material: "Hand-printed Cotton",
    size: "4 meters",
    featured: false,
    isVisible: true,
    isNewArrival: false
  },

  // --- Miniatures ---
  {
    id: 9,
    name: "Miniature Chenda (Traditional Drum)",
    description: "Perfectly detailed miniature of Kerala's iconic 'Chenda'. Hand-carved wood with authentic skin tensioning.",
    price: 650,
    mrp: 750,
    imageUrl: "/chenda.png",
    categoryId: 5,
    categoryName: "Miniatures & Mini Chenda",
    stock: 30,
    material: "Wood & Leather",
    size: "3 inch",
    featured: true,
    isVisible: true,
    isNewArrival: true
  },
  {
    id: 10,
    name: "Kathakali Face Stand (Small)",
    description: "Miniature hand-painted Kathakali face on a wooden stand. A classic Kerala souvenir for your bookshelf.",
    price: 850,
    mrp: 1000,
    imageUrl: "/hero-dance.png",
    categoryId: 5,
    categoryName: "Miniatures & Mini Chenda",
    stock: 50,
    material: "Painted Wood",
    size: "12 inch",
    featured: true,
    isVisible: true,
    isNewArrival: false
  },

  // --- Fragrances ---
  {
    id: 11,
    name: "Divine Kalabham Perfume (50ml)",
    description: "A signature temple fragrance capturing the essence of sandalwood and divine rituals. Long-lasting and pure.",
    price: 1350,
    mrp: 1500,
    imageUrl: "/kalabham_perfume.png",
    categoryId: 6,
    categoryName: "Fragrances & Organic Soap",
    stock: 12,
    material: "Essential Oils",
    size: "50ml",
    featured: true,
    isVisible: true,
    isNewArrival: true
  },
  {
    id: 12,
    name: "Charcoal Organic Handmade Soap",
    description: "Detoxifying handmade soap with activated charcoal and traditional oils. Chemical-free and skin-friendly.",
    price: 200,
    mrp: 250,
    imageUrl: "/charcoal_soap.png",
    categoryId: 6,
    categoryName: "Fragrances & Organic Soap",
    stock: 40,
    material: "Activated Charcoal & Coconut Oil",
    size: "100g",
    featured: false,
    isVisible: true,
    isNewArrival: false
  },
  {
    id: 13,
    name: "Aranmula Kannadi Hand-Held",
    description: "Authentic metal mirror from Aranmula. A sacred object for prosperity and beauty. Hand-held model with traditional patterns.",
    price: 4500,
    mrp: 5500,
    imageUrl: "/aranmula_kannadi.png",
    categoryId: 3,
    categoryName: "Elephant Heritage",
    stock: 5,
    material: "Aranmula Metal Alloy",
    size: "5 inch",
    featured: true,
    isVisible: true,
    isNewArrival: true
  }
];

// --- Endpoints ---
app.get('/api/healthz', (req, res) => {
  res.json({ status: 'ok', database: isSupabaseConfigured ? 'supabase' : 'in-memory' });
});

app.get('/api/categories', async (req, res) => {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;
      return res.json(data.map(mapCategoryFromDb));
    } catch (err) {
      console.error('Database query error on categories:', err);
      return res.status(500).json({ error: err.message });
    }
  } else {
    return res.json(categories);
  }
});

app.post('/api/categories', async (req, res) => {
  if (isSupabaseConfigured) {
    try {
      const dbCategory = mapCategoryToDb({
        ...req.body,
        productCount: 0
      });

      const { data, error } = await supabase
        .from('categories')
        .insert([dbCategory])
        .select()
        .single();

      if (error) throw error;
      return res.status(201).json(mapCategoryFromDb(data));
    } catch (err) {
      console.error('Database error on category creation:', err);
      return res.status(500).json({ error: err.message });
    }
  } else {
    const newCat = {
      ...req.body,
      id: categories.reduce((max, c) => Math.max(max, c.id), 0) + 1,
      productCount: 0
    };
    categories.push(newCat);
    res.status(201).json(newCat);
  }
});

app.delete('/api/categories/:id', async (req, res) => {
  const idStr = req.params.id;
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', idStr);

      if (error) throw error;
      return res.sendStatus(204);
    } catch (err) {
      console.error('Database error on category deletion:', err);
      return res.status(500).json({ error: err.message });
    }
  } else {
    categories = categories.filter(c => c.id !== parseInt(idStr));
    res.sendStatus(204);
  }
});

app.put('/api/categories/:id', async (req, res) => {
  const idStr = req.params.id;
  if (isSupabaseConfigured) {
    try {
      const dbCategory = mapCategoryToDb(req.body);

      const { data, error } = await supabase
        .from('categories')
        .update(dbCategory)
        .eq('id', idStr)
        .select()
        .single();

      if (error) throw error;
      return res.json(mapCategoryFromDb(data));
    } catch (err) {
      console.error('Database error on category update:', err);
      return res.status(500).json({ error: err.message });
    }
  } else {
    const idx = categories.findIndex(c => c.id === parseInt(idStr));
    if (idx !== -1) {
      categories[idx] = { ...categories[idx], ...req.body };
      res.json(categories[idx]);
    } else {
      res.status(404).json({ error: 'Not found' });
    }
  }
});

app.get('/api/products', async (req, res) => {
  const { category, search, featured } = req.query;

  if (isSupabaseConfigured) {
    try {
      let query = supabase.from('products').select('*');

      if (category) {
        query = query.eq('category_name', category);
      }
      if (search) {
        query = query.ilike('name', `%${search}%`);
      }
      if (featured === 'true') {
        query = query.eq('featured', true);
      }

      const { data, error } = await query.order('id', { ascending: true });
      if (error) throw error;

      return res.json(data.map(mapProductFromDb));
    } catch (err) {
      console.error('Database query error on products:', err);
      return res.status(500).json({ error: err.message });
    }
  } else {
    let filtered = [...products];
    if (category) filtered = filtered.filter(p => p.categoryName === category);
    if (search) filtered = filtered.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    if (featured === 'true') filtered = filtered.filter(p => p.featured);
    return res.json(filtered);
  }
});

app.get('/api/products/:id', async (req, res) => {
  const idStr = req.params.id;

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', idStr)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({ error: 'Not found' });
        }
        throw error;
      }
      return res.json(mapProductFromDb(data));
    } catch (err) {
      console.error('Database query error on product detail:', err);
      return res.status(500).json({ error: err.message });
    }
  } else {
    const p = products.find(p => p.id === parseInt(idStr));
    return p ? res.json(p) : res.status(404).json({ error: 'Not found' });
  }
});

app.post('/api/products', async (req, res) => {
  if (isSupabaseConfigured) {
    try {
      let catName = "Uncategorized";
      const hasCategory = req.body.categoryId !== undefined && req.body.categoryId !== null && req.body.categoryId !== 0;
      
      if (hasCategory) {
        const { data: catData } = await supabase
          .from('categories')
          .select('name')
          .eq('id', req.body.categoryId)
          .single();
        catName = catData?.name || "Uncategorized";
      }

      const dbProduct = mapProductToDb({
        ...req.body,
        categoryId: hasCategory ? req.body.categoryId : null,
        categoryName: catName
      });

      const { data, error } = await supabase
        .from('products')
        .insert([dbProduct])
        .select()
        .single();

      if (error) throw error;

      // Increment category count
      if (hasCategory) {
        await supabase.rpc('increment_category_count', { row_id: req.body.categoryId });
      }

      return res.status(201).json(mapProductFromDb(data));
    } catch (err) {
      console.error('Database error on product creation:', err);
      return res.status(500).json({ error: err.message });
    }
  } else {
    const newP = { 
      ...req.body, 
      id: products.length + 1, 
      createdAt: new Date().toISOString(),
      categoryName: categories.find(c => c.id === req.body.categoryId)?.name || "Uncategorized"
    };
    products.push(newP);
    res.status(201).json(newP);
  }
});

app.put('/api/products/:id', async (req, res) => {
  const idStr = req.params.id;

  if (isSupabaseConfigured) {
    try {
      let catName = undefined;
      const hasCategory = req.body.categoryId !== undefined && req.body.categoryId !== null && req.body.categoryId !== 0;
      
      if (hasCategory) {
        const { data: catData } = await supabase
          .from('categories')
          .select('name')
          .eq('id', req.body.categoryId)
          .single();
        catName = catData?.name || "Uncategorized";
      } else if (req.body.categoryId === 0 || req.body.categoryId === null) {
        catName = "Uncategorized";
      }

      const dbProduct = mapProductToDb({
        ...req.body,
        categoryId: hasCategory ? req.body.categoryId : (req.body.categoryId === 0 || req.body.categoryId === null ? null : undefined),
        ...(catName !== undefined ? { categoryName: catName } : {})
      });

      const { data, error } = await supabase
        .from('products')
        .update(dbProduct)
        .eq('id', idStr)
        .select()
        .single();

      if (error) throw error;
      return res.json(mapProductFromDb(data));
    } catch (err) {
      console.error('Database error on product update:', err);
      return res.status(500).json({ error: err.message });
    }
  } else {
    const idx = products.findIndex(p => p.id === parseInt(idStr));
    if (idx !== -1) {
      products[idx] = { ...products[idx], ...req.body };
      res.json(products[idx]);
    } else {
      res.status(404).json({ error: 'Not found' });
    }
  }
});

app.delete('/api/products/:id', async (req, res) => {
  const idStr = req.params.id;

  if (isSupabaseConfigured) {
    try {
      // Get category ID first to decrement count later if wanted
      const { data: prodData } = await supabase
        .from('products')
        .select('category_id')
        .eq('id', idStr)
        .single();

      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', idStr);

      if (error) throw error;

      if (prodData?.category_id) {
        await supabase.rpc('decrement_category_count', { row_id: prodData.category_id });
      }

      return res.sendStatus(204);
    } catch (err) {
      console.error('Database error on product deletion:', err);
      return res.status(500).json({ error: err.message });
    }
  } else {
    products = products.filter(p => p.id !== parseInt(idStr));
    res.sendStatus(204);
  }
});

app.get('/api/dashboard/stats', async (req, res) => {
  if (isSupabaseConfigured) {
    try {
      const { count: totalProducts } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      const { count: totalCategories } = await supabase
        .from('categories')
        .select('*', { count: 'exact', head: true });

      const { count: featuredProducts } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('featured', true);

      const { count: lowStockProducts } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .lt('stock', 5);

      const { data: recentProductsRaw } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: false })
        .limit(5);

      return res.json({
        totalProducts: totalProducts || 0,
        totalCategories: totalCategories || 0,
        featuredProducts: featuredProducts || 0,
        lowStockProducts: lowStockProducts || 0,
        recentProducts: (recentProductsRaw || []).map(mapProductFromDb)
      });
    } catch (err) {
      console.error('Database query error on dashboard stats:', err);
      return res.status(500).json({ error: err.message });
    }
  } else {
    res.json({
      totalProducts: products.length,
      totalCategories: categories.length,
      featuredProducts: products.filter(p => p.featured).length,
      lowStockProducts: products.filter(p => p.stock < 5).length,
      recentProducts: products.slice(-5).reverse()
    });
  }
});

app.get('/api/dashboard/featured', async (req, res) => {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('featured', true)
        .order('id', { ascending: true });

      if (error) throw error;
      return res.json(data.map(mapProductFromDb));
    } catch (err) {
      console.error('Database query error on featured products:', err);
      return res.status(500).json({ error: err.message });
    }
  } else {
    res.json(products.filter(p => p.featured));
  }
});

const PORT = 8081;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Mock API Server listening on port ${PORT}`);
});

