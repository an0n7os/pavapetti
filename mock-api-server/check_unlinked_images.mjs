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

async function run() {
  const { data: products, error: prodError } = await supabase
    .from('products')
    .select('name, image_url');

  if (prodError) {
    console.error('Error fetching products:', prodError.message);
    return;
  }

  const { data: storageFiles, error: storageError } = await supabase.storage
    .from('products')
    .list('', { limit: 500 });

  if (storageError) {
    console.error('Error listing storage:', storageError.message);
    return;
  }

  const linkedUrls = new Set(products.map(p => p.image_url).filter(Boolean));
  const unlinkedFiles = [];

  for (const file of storageFiles) {
    // Generate public url
    const { data: urlData } = supabase.storage.from('products').getPublicUrl(file.name);
    const publicUrl = urlData.publicUrl;

    if (!linkedUrls.has(publicUrl)) {
      unlinkedFiles.push(file.name);
    }
  }

  console.log(`📋 Total files in storage: ${storageFiles.length}`);
  console.log(`📋 Linked products: ${products.length}`);
  console.log(`📋 Unlinked files in storage (${unlinkedFiles.length}):`);
  console.log(unlinkedFiles.slice(0, 50)); // Print first 50 unlinked files
}

run();
