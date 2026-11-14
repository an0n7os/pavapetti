import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '../mock-api-server/node_modules/@supabase/supabase-js/dist/index.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env manually
const envPath = path.join(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
    env[match[1]] = value.trim();
  }
});

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

// Extract the 129 catalog products from mock-api-server/index.mjs
const indexSrc = fs.readFileSync(path.join(__dirname, '../mock-api-server/index.mjs'), 'utf8');
const lines = indexSrc.split('\n');
const slice = lines.slice(302, 746).join('\n');

const runner = new Function('path', '__dirname', 'fs', `
  ${slice}
  return { categories, products };
`);

const mockDir = path.join(__dirname, '../mock-api-server');
const { categories: fullCats, products: fullProds } = runner(path, mockDir, fs);

async function run() {
  console.log('🚀 Starting sync to reach exactly 129 products in Supabase...');

  // 1. Fetch existing categories
  let { data: existingCats, error: catFetchErr } = await supabase.from('categories').select('*');
  if (catFetchErr) {
    console.error('❌ Error fetching categories:', catFetchErr);
    process.exit(1);
  }
  console.log(`Current Supabase categories (${existingCats.length}):`, existingCats.map(c => c.name));

  // Desired heritage categories to ensure exist
  const desiredCategories = [
    { name: 'Pooja Category', description: 'Sacred ritual oils, dhoop, and temple essentials', image_url: '/pooja_oil.webp' },
    { name: 'Elephant Heritage', description: 'Majestic Netipattams and wall-hanging elephant heads', image_url: '/elephant_head.webp' },
    { name: 'Heritage Textiles', description: 'Premium Kasavu Mundu and traditional Kerala attire', image_url: '/hero-textile.webp' },
    { name: 'Miniatures & Mini Chenda', description: 'Handcrafted miniature musical instruments and icons', image_url: '/hero-dance.webp' },
    { name: 'Fragrances & Organic Soap', description: 'Temple-inspired scents and handmade organic soaps', image_url: '/kalabham_perfume.webp' },
    { name: 'Money Boxes', description: 'Artisan handcrafted wooden festival money boxes', image_url: '/catalog/kerala-elephant-festival-wooden-money-box.webp' }
  ];

  const catMap = new Map();
  existingCats.forEach(c => catMap.set(c.name.trim().toLowerCase(), c));

  for (const desCat of desiredCategories) {
    const key = desCat.name.trim().toLowerCase();
    if (!catMap.has(key)) {
      console.log(`Creating category: "${desCat.name}"...`);
      const { data: newCat, error: insertCatErr } = await supabase.from('categories').insert({
        name: desCat.name,
        description: desCat.description,
        image_url: desCat.image_url,
        product_count: 0
      }).select();

      if (insertCatErr) {
        console.error(`Failed to insert category "${desCat.name}":`, insertCatErr);
      } else if (newCat && newCat.length > 0) {
        catMap.set(key, newCat[0]);
        console.log(`✅ Created category "${desCat.name}" (id: ${newCat[0].id})`);
      }
    }
  }

  // Refetch all categories to have fresh map
  const { data: allFreshCats } = await supabase.from('categories').select('*');
  allFreshCats.forEach(c => catMap.set(c.name.trim().toLowerCase(), c));

  // Category mapping function
  function getCategoryForProduct(prod) {
    const rawCatName = (prod.categoryName || '').trim().toLowerCase();
    if (catMap.has(rawCatName)) {
      const c = catMap.get(rawCatName);
      return { id: c.id, name: c.name };
    }

    // Fallback mappings
    if (rawCatName.includes('wall') || rawCatName.includes('decor') || rawCatName.includes('hanging') || rawCatName.includes('holder')) {
      const c = catMap.get('decors & wall hangings');
      if (c) return { id: c.id, name: c.name };
    }
    if (rawCatName.includes('statue') || rawCatName.includes('idol')) {
      const c = catMap.get('ideols & statue');
      if (c) return { id: c.id, name: c.name };
    }
    if (rawCatName.includes('chain') || rawCatName.includes('key')) {
      const c = catMap.get('key chains');
      if (c) return { id: c.id, name: c.name };
    }
    if (rawCatName.includes('jewel') || rawCatName.includes('bracelet') || rawCatName.includes('mala')) {
      const c = catMap.get('chains and bracelets');
      if (c) return { id: c.id, name: c.name };
    }

    // Default to Decors & Wall Hangings or first category
    const defaultCat = catMap.get('decors & wall hangings') || allFreshCats[0];
    return { id: defaultCat.id, name: defaultCat.name };
  }

  // 2. Fetch current products
  const { data: currentDbProds, error: prodErr } = await supabase.from('products').select('*');
  if (prodErr) {
    console.error('❌ Error fetching current products:', prodErr);
    process.exit(1);
  }

  console.log(`Current products in Supabase: ${currentDbProds.length}`);
  const targetTotal = 129;
  const countToInsert = targetTotal - currentDbProds.length;

  if (countToInsert <= 0) {
    console.log(`✅ Supabase already has ${currentDbProds.length} products (>= ${targetTotal}). No products need to be added.`);
  } else {
    console.log(`Need to insert ${countToInsert} products to reach exactly ${targetTotal}...`);

    // Match existing to find unrepresented products
    const matchedFullProdIds = new Set();
    for (const dbP of currentDbProds) {
      const dbImgBase = path.basename(dbP.image_url || '').replace(/^\d+-/, '').replace(/-p\.png$/, '').replace(/\.png$/, '').replace(/\.webp$/, '').toLowerCase().replace(/[^a-z0-9]/g, '');
      let match = fullProds.find(fp => {
        const fpImgBase = path.basename(fp.imageUrl || fp.image_url || '').replace(/\.webp$/, '').replace(/\.png$/, '').toLowerCase().replace(/[^a-z0-9]/g, '');
        return dbImgBase && fpImgBase && (dbImgBase.includes(fpImgBase) || fpImgBase.includes(dbImgBase));
      });

      if (!match) {
        const dbNameNorm = dbP.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        match = fullProds.find(fp => {
          const fpNameNorm = fp.name.toLowerCase().replace(/[^a-z0-9]/g, '');
          return dbNameNorm && fpNameNorm && (dbNameNorm.includes(fpNameNorm) || fpNameNorm.includes(dbNameNorm));
        });
      }

      if (match) {
        matchedFullProdIds.add(match.id);
      }
    }

    const unrepresented = fullProds.filter(fp => !matchedFullProdIds.has(fp.id));
    console.log(`Total unrepresented products available: ${unrepresented.length}`);

    const toInsert = unrepresented.slice(0, countToInsert);
    console.log(`Selected ${toInsert.length} products to insert.`);

    const formattedProducts = toInsert.map(p => {
      const cat = getCategoryForProduct(p);
      return {
        name: p.name,
        description: p.description || `${p.name} handcrafted authentic Kerala heritage treasure.`,
        price: Number(p.price) || 500,
        mrp: p.mrp ? Number(p.mrp) : Math.round((Number(p.price) || 500) * 1.3),
        image_url: p.imageUrl || p.image_url || '/hero-brass.webp',
        category_id: cat.id,
        category_name: cat.name,
        stock: p.stock !== undefined ? Number(p.stock) : 10,
        material: p.material || 'Authentic Handcrafted',
        size: p.size || 'Standard',
        featured: Boolean(p.featured),
        is_visible: p.isVisible !== undefined ? Boolean(p.isVisible) : true,
        is_new_arrival: Boolean(p.isNewArrival),
        additional_category_ids: '[]',
        additional_category_names: []
      };
    });

    // Batch insert in chunks of 25
    const chunkSize = 25;
    for (let i = 0; i < formattedProducts.length; i += chunkSize) {
      const chunk = formattedProducts.slice(i, i + chunkSize);
      console.log(`Inserting chunk ${Math.floor(i / chunkSize) + 1} (${chunk.length} items)...`);
      const { data: insertedData, error: chunkErr } = await supabase.from('products').insert(chunk).select();
      if (chunkErr) {
        console.error('❌ Error inserting chunk:', chunkErr);
      } else {
        console.log(`✅ Chunk inserted successfully! (${insertedData.length} items)`);
      }
    }
  }

  // 3. Recount and update category product_counts
  const { data: finalProds, count: finalCount } = await supabase.from('products').select('*', { count: 'exact' });
  console.log(`\n🎉 Final product count in Supabase: ${finalCount} / ${targetTotal}`);

  const { data: finalCats } = await supabase.from('categories').select('*');
  for (const cat of finalCats) {
    const matchingProds = finalProds.filter(p => p.category_id === cat.id);
    await supabase.from('categories').update({ product_count: matchingProds.length }).eq('id', cat.id);
  }
  console.log('✅ Updated category product counts in Supabase.');
  console.log('\nCategory breakdown:');
  for (const cat of finalCats) {
    const matchingProds = finalProds.filter(p => p.category_id === cat.id);
    console.log(`- ${cat.name} (id: ${cat.id}): ${matchingProds.length} products`);
  }
}

run();
