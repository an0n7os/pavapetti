import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the root .env file
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Supabase credentials missing.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function linkRemaining() {
  console.log('🔍 Starting Fuzzy Image Linker...');

  // 1. Fetch all products from the database
  const { data: products, error: prodError } = await supabase
    .from('products')
    .select('id, name, image_url');

  if (prodError) {
    console.error('❌ Failed to fetch products:', prodError.message);
    process.exit(1);
  }

  // Filter products that don't have an image_url linked yet
  const productsWithoutImages = products.filter(p => !p.image_url);
  console.log(`📋 Found ${productsWithoutImages.length} products currently missing images.`);

  if (productsWithoutImages.length === 0) {
    console.log('🎉 All products already have images linked!');
    return;
  }

  // 2. List all files in the Supabase 'products' storage bucket
  const bucketName = 'products';
  const { data: storageFiles, error: storageError } = await supabase.storage
    .from(bucketName)
    .list('', { limit: 250 }); // Fetch up to 250 files

  if (storageError) {
    console.error('❌ Failed to list files in storage:', storageError.message);
    process.exit(1);
  }

  console.log(`📸 Found ${storageFiles.length} files in Supabase storage.`);

  let linkCount = 0;
  for (const product of productsWithoutImages) {
    const cleanProductName = product.name.trim().toLowerCase();
    
    // Find a matching file in storage by checking sub-string matches and ignoring common suffixes
    const matchedFile = storageFiles.find(file => {
      const cleanFileName = path.basename(file.name, path.extname(file.name)).trim().toLowerCase();
      
      // Clean names by removing trailing numbers, "Front", "Side", "Set of X", "1", "2"
      const cleanFileNameNoSuffix = cleanFileName
        .replace(/\s+(?:[0-9]+|front|side|back|set of [0-9]+|[0-9]+)$/g, '')
        .trim();
        
      const cleanProdNameNoSuffix = cleanProductName
        .replace(/\s+(?:[0-9]+|front|side|back|set of [0-9]+|[0-9]+)$/g, '')
        .trim();
      
      return (
        cleanFileName.includes(cleanProductName) ||
        cleanProductName.includes(cleanFileName) ||
        cleanFileNameNoSuffix === cleanProductName ||
        cleanFileName === cleanProdNameNoSuffix ||
        cleanFileNameNoSuffix === cleanProdNameNoSuffix
      );
    });

    if (matchedFile) {
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(matchedFile.name);
      
      const publicUrl = urlData.publicUrl;
      console.log(`🔗 Matching product "${product.name}" with file "${matchedFile.name}"...`);

      // Update the product record in Supabase
      const { error: updateError } = await supabase
        .from('products')
        .update({ image_url: publicUrl })
        .eq('id', product.id);

      if (updateError) {
        console.error(`❌ Failed to link "${product.name}":`, updateError.message);
      } else {
        linkCount++;
        console.log(`✨ Successfully linked "${product.name}" -> ${publicUrl}`);
      }
    } else {
      console.log(`❓ Could not find any matching image for: "${product.name}"`);
    }
  }

  console.log(`\n🎉 Completed! Fuzzy linked ${linkCount} remaining products to their images.`);
}

linkRemaining();
