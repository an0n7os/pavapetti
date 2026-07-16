import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
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
const optimizedDir = path.join(__dirname, 'upload-queue-optimized');

async function optimizeAndUpload() {
  console.log('🏁 Starting WebP Image Optimization and Upload...');

  if (!fs.existsSync(queueDir)) {
    console.error(`❌ Error: Folder "${queueDir}" not found.`);
    process.exit(1);
  }

  // Ensure optimized temp directory exists
  if (!fs.existsSync(optimizedDir)) {
    fs.mkdirSync(optimizedDir);
  }

  const files = fs.readdirSync(queueDir).filter(file => {
    const ext = path.extname(file).toLowerCase();
    return ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'].includes(ext);
  });

  if (files.length === 0) {
    console.log('ℹ️ No images found in upload-queue.');
    return;
  }

  console.log(`📸 Found ${files.length} images. Processing and compressing to WebP...`);

  const optimizedFiles = [];

  for (const file of files) {
    const inputPath = path.join(queueDir, file);
    const outputFileName = path.basename(file, path.extname(file)) + '.webp';
    const outputPath = path.join(optimizedDir, outputFileName);

    console.log(`⚙️ Optimizing: ${file} -> ${outputFileName}...`);

    try {
      // Resize to max width 800px, quality 80 WebP
      await sharp(inputPath)
        .resize({ width: 800, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(outputPath);

      const oldSize = fs.statSync(inputPath).size;
      const newSize = fs.statSync(outputPath).size;
      const savings = ((oldSize - newSize) / oldSize * 100).toFixed(1);
      console.log(`  📊 Size: ${(oldSize / 1024).toFixed(0)} KB -> ${(newSize / 1024).toFixed(0)} KB (${savings}% smaller)`);

      optimizedFiles.push(outputFileName);
    } catch (err) {
      console.error(`❌ Failed to optimize ${file}:`, err.message);
    }
  }

  // Upload to Supabase Storage and link
  console.log(`\n☁️ Uploading optimized WebP images to Supabase...`);
  const bucketName = 'products';

  const imageMap = {}; // maps fileName -> publicUrl

  for (const file of optimizedFiles) {
    const filePath = path.join(optimizedDir, file);
    const fileBuffer = fs.readFileSync(filePath);

    console.log(`⏳ Uploading optimized ${file}...`);
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(file, fileBuffer, { upsert: true });

    if (uploadError) {
      console.error(`❌ Failed to upload ${file}:`, uploadError.message);
    } else {
      const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(file);
      imageMap[file.toLowerCase()] = urlData.publicUrl;
      console.log(`✅ Uploaded successfully.`);
    }
  }

  // Link updated images to products
  console.log(`\n🔗 Linking optimized WebP images to database products...`);
  
  const { data: products, error: prodError } = await supabase
    .from('products')
    .select('id, name');

  if (prodError) {
    console.error('❌ Failed to fetch products:', prodError.message);
    process.exit(1);
  }

  let updatedCount = 0;

  for (const product of products) {
    const cleanProductName = product.name.trim().toLowerCase();
    
    // Find matching WebP URL
    const matchedFileName = Object.keys(imageMap).find(fileName => {
      const cleanFileName = path.basename(fileName, '.webp').trim().toLowerCase();
      
      const cleanFileNameNoSuffix = cleanFileName
        .replace(/\s+(?:[0-9]+|front|side|back|set of [0-9]+|[0-9]+)$/g, '')
        .trim();
        
      const cleanProdNameNoSuffix = cleanProductName
        .replace(/\s+(?:[0-9]+|front|side|back|set of [0-9]+|[0-9]+)$/g, '')
        .trim();

      return (
        cleanFileName === cleanProductName ||
        cleanFileName.includes(cleanProductName) ||
        cleanProductName.includes(cleanFileName) ||
        cleanFileNameNoSuffix === cleanProductName ||
        cleanFileName === cleanProdNameNoSuffix ||
        cleanFileNameNoSuffix === cleanProdNameNoSuffix
      );
    });

    if (matchedFileName) {
      const publicUrl = imageMap[matchedFileName];
      
      const { error: updateError } = await supabase
        .from('products')
        .update({ image_url: publicUrl })
        .eq('id', product.id);

      if (updateError) {
        console.error(`❌ Failed to link "${product.name}":`, updateError.message);
      } else {
        updatedCount++;
        console.log(`✨ Linked "${product.name}" -> ${publicUrl}`);
      }
    }
  }

  // Clean up temp folder
  console.log('\n🧹 Cleaning up temporary optimized files...');
  try {
    fs.rmSync(optimizedDir, { recursive: true, force: true });
    console.log('✅ Temporary folder cleaned.');
  } catch (err) {
    console.warn('⚠️ Warning: Failed to delete temporary optimized folder:', err.message);
  }

  console.log(`\n🎉 WebP optimization completed! Optimized and linked ${updatedCount} products.`);
}

optimizeAndUpload();
