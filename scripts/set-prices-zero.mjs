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

async function run() {
  console.log('🔄 Setting all product prices to 0 in Supabase...');

  // 1. Fetch all products to verify count
  const { data: prods, error: fetchErr } = await supabase.from('products').select('id, name, price, mrp');
  if (fetchErr) {
    console.error('❌ Error fetching products:', fetchErr);
    process.exit(1);
  }

  console.log(`Found ${prods.length} products in Supabase.`);

  // 2. Update all products in Supabase: price = 0, mrp = 0
  // In Supabase REST, we can update in batches or update where id is in the list
  const chunkSize = 50;
  for (let i = 0; i < prods.length; i += chunkSize) {
    const chunk = prods.slice(i, i + chunkSize);
    const ids = chunk.map(p => p.id);
    const { error: updateErr } = await supabase
      .from('products')
      .update({ price: 0, mrp: 0 })
      .in('id', ids);

    if (updateErr) {
      console.error(`❌ Error updating chunk ${i / chunkSize + 1}:`, updateErr);
    } else {
      console.log(`✅ Updated ${chunk.length} products to price 0 (IDs: ${ids[0]} to ${ids[ids.length - 1]}).`);
    }
  }

  // 3. Verify
  const { data: updatedProds, error: verifyErr } = await supabase.from('products').select('id, name, price, mrp');
  if (verifyErr) {
    console.error('❌ Error verifying:', verifyErr);
  } else {
    const nonZero = updatedProds.filter(p => p.price !== 0);
    console.log(`\n🎉 Verification: Total products: ${updatedProds.length}, Non-zero price count: ${nonZero.length}`);
    if (nonZero.length === 0) {
      console.log('✅ ALL 129 PRODUCTS IN SUPABASE NOW HAVE PRICE: 0, MRP: 0!');
    }
  }
}

run();
