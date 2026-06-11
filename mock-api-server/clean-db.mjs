import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('--- Cleaning Up Database Images ---');

// 1. Delete product 25 if it exists (it's a duplicate test product with a 2.3MB image)
console.log('Deleting duplicate/test product 25...');
const { error: delErr } = await supabase.from('products').delete().eq('id', 25);
if (delErr) {
  console.error('Failed to delete product 25:', delErr);
} else {
  console.log('Deleted product 25 successfully.');
}

// 2. We'll update the database with standard URLs for products 21, 22, 23
const updates = [
  { id: 21, image_url: '/kalabham_perfume.png' },
  { id: 22, image_url: '/hero-dance-v2.png' },
  { id: 23, image_url: '/hero-brass-v2.png' }
];

for (const update of updates) {
  console.log(`Updating product ${update.id} image_url to ${update.image_url}...`);
  const { error: updErr } = await supabase
    .from('products')
    .update({ image_url: update.image_url })
    .eq('id', update.id);
  if (updErr) {
    console.error(`Failed to update product ${update.id}:`, updErr);
  } else {
    console.log(`Updated product ${update.id} successfully.`);
  }
}

// 3. Verify product query speed after updates
console.log('\nRunning query speed check...');
const start = performance.now();
const { data, error } = await supabase.from('products').select('*');
if (error) {
  console.error('Failed to query products:', error);
} else {
  console.log(`Successfully fetched ${data.length} products in ${(performance.now() - start).toFixed(2)} ms!`);
}

process.exit(0);
