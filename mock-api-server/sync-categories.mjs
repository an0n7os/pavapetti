import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase credentials missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function syncCategories() {
  console.log('🔄 Fetching products from Supabase...');
  const { data: prods, error: pErr } = await supabase
    .from('products')
    .select('id, category_id, category_name, additional_category_names');
    
  if (pErr) {
    console.error('❌ Error fetching products:', pErr);
    process.exit(1);
  }

  // Calculate actual category counts from live products
  const catCounts = {};
  prods.forEach(p => {
    if (p.category_name && p.category_name.trim()) {
      const cName = p.category_name.trim();
      catCounts[cName] = (catCounts[cName] || 0) + 1;
    }
    if (p.additional_category_names) {
      let add = p.additional_category_names;
      if (typeof add === 'string') {
        try { add = JSON.parse(add); } catch {}
      }
      if (Array.isArray(add)) {
        add.forEach(ac => {
          if (ac && ac.trim()) {
            const acName = ac.trim();
            catCounts[acName] = (catCounts[acName] || 0) + 1;
          }
        });
      }
    }
  });

  console.log('📊 Actual Category Counts in Products:', catCounts);

  // Fetch current categories in table
  const { data: existingCats, error: cErr } = await supabase.from('categories').select('*');
  if (cErr) {
    console.error('❌ Error fetching categories:', cErr);
    process.exit(1);
  }

  const existingMap = new Map();
  existingCats.forEach(c => existingMap.set(c.name.trim().toLowerCase(), c));

  let nextId = existingCats.reduce((max, c) => Math.max(max, Number(c.id) || 0), 0) + 1;

  for (const [catName, count] of Object.entries(catCounts)) {
    const key = catName.toLowerCase();
    if (existingMap.has(key)) {
      const cat = existingMap.get(key);
      const { error: upErr } = await supabase
        .from('categories')
        .update({ product_count: count, name: catName })
        .eq('id', cat.id);
      if (upErr) console.error(`❌ Update err for ${catName}:`, upErr);
      else console.log(`✅ Updated existing category "${catName}" (ID ${cat.id}): ${count} products`);
    } else {
      const newCat = {
        id: nextId++,
        name: catName,
        description: `${catName} collection of authentic products.`,
        image_url: null,
        product_count: count
      };
      const { error: insErr } = await supabase.from('categories').insert([newCat]);
      if (insErr) console.error(`❌ Insert err for ${catName}:`, insErr);
      else console.log(`✨ Inserted new category "${catName}" (ID ${newCat.id}): ${count} products`);
    }
  }

  // Clean up orphan categories with 0 products
  for (const cat of existingCats) {
    const catNameLower = cat.name.trim().toLowerCase();
    const isPresent = Object.keys(catCounts).some(k => k.toLowerCase() === catNameLower);
    if (!isPresent) {
      console.log(`🗑️ Deleting orphan empty category "${cat.name}" (ID ${cat.id})`);
      const { error: delErr } = await supabase.from('categories').delete().eq('id', cat.id);
      if (delErr) console.warn(`⚠️ Delete err for ${cat.name}:`, delErr.message);
    }
  }

  console.log('🎉 Category sync complete!');
  process.exit(0);
}

syncCategories();
