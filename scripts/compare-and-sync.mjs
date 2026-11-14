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

const supabaseUrl = env.SUPABASE_URL;
const supabaseKey = env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

// 1. Get the 129 products and 16 categories
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
  console.log(`Local catalog has ${fullProds.length} products and ${fullCats.length} categories.`);

  // 2. Query Supabase
  const { data: dbCats, error: catErr } = await supabase.from('categories').select('*');
  const { data: dbProds, error: prodErr } = await supabase.from('products').select('*');

  if (catErr || prodErr) {
    console.error('DB fetch error:', catErr || prodErr);
    return;
  }

  console.log(`Supabase currently has ${dbProds.length} products and ${dbCats.length} categories.`);

  // Compare categories
  console.log('\n--- Supabase Categories ---');
  dbCats.forEach(c => console.log(`[${c.id}] ${c.name} (product_count: ${c.product_count})`));

  // Match products by name (normalized lowercase)
  const dbProdNameMap = new Map();
  dbProds.forEach(p => {
    dbProdNameMap.set((p.name || '').trim().toLowerCase(), p);
  });

  const missingProducts = [];
  const existingProducts = [];

  fullProds.forEach(p => {
    const key = (p.name || '').trim().toLowerCase();
    if (dbProdNameMap.has(key)) {
      existingProducts.push({ local: p, db: dbProdNameMap.get(key) });
    } else {
      missingProducts.push(p);
    }
  });

  console.log(`\nExisting in DB: ${existingProducts.length}`);
  console.log(`Missing in DB: ${missingProducts.length}`);

  if (missingProducts.length > 0) {
    console.log('\nSample missing products:');
    missingProducts.slice(0, 10).forEach(p => console.log(`- ${p.name} (${p.categoryName})`));
  }
}

run();
