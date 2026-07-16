import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
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
const queueDir = path.join(__dirname, 'upload-queue');

async function uploadAndLinkImages() {
  if (!fs.existsSync(queueDir)) {
    console.error(`❌ Error: Folder "mock-api-server/upload-queue" does not exist.`);
    process.exit(1);
  }

  const files = fs.readdirSync(queueDir).filter(file => {
    const ext = path.extname(file).toLowerCase();
    return ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'].includes(ext);
  });

  if (files.length === 0) {
    console.log('ℹ️ No images found in mock-api-server/upload-queue. Please place your product images there and run this script again.');
    return;
  }

  console.log(`🚀 Found ${files.length} images to upload and link to products...`);
  const bucketName = 'products';

  // Ensure storage bucket is active
  const { data: buckets } = await supabase.storage.listBuckets();
  const bucketExists = buckets?.some(b => b.name === bucketName);
  if (!bucketExists) {
    console.warn(`⚠️ Warning: Storage bucket "${bucketName}" not found. Please create a public bucket named "products" via your Supabase dashboard.`);
  }

  let updatedCount = 0;
  for (const file of files) {
    const filePath = path.join(queueDir, file);
    const fileBuffer = fs.readFileSync(filePath);
    
    console.log(`⏳ Uploading ${file} to storage...`);
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(file, fileBuffer, { upsert: true });

    if (uploadError) {
      console.error(`❌ Failed to upload image ${file}:`, uploadError.message);
      continue;
    }

    const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(file);
    const publicUrl = urlData.publicUrl;
    console.log(`✅ Uploaded ${file} successfully.`);

    // Match product name by removing the extension
    const productName = path.basename(file, path.extname(file)).trim();
    console.log(`🔍 Searching and linking to product named: "${productName}"...`);

    // Update product in Supabase where name matches
    const { data: updatedProducts, error: updateError } = await supabase
      .from('products')
      .update({ image_url: publicUrl })
      .eq('name', productName)
      .select();

    if (updateError) {
      console.error(`❌ Failed to link image for "${productName}":`, updateError.message);
    } else if (updatedProducts && updatedProducts.length > 0) {
      updatedCount++;
      console.log(`✨ Successfully linked image to product: "${productName}"`);
    } else {
      console.log(`⚠️ No matching product found in database with name: "${productName}"`);
    }
  }

  console.log(`\n🎉 Image upload & linking completed! Linked ${updatedCount} images to products.`);
}

uploadAndLinkImages();
