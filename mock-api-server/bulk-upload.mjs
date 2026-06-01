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

if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your-project-id')) {
  console.error('❌ Error: Please specify valid SUPABASE_URL and SUPABASE_ANON_KEY in your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Directory where users should place images they want to upload
const queueDir = path.join(__dirname, 'upload-queue');

// Ensure the queue directory exists
if (!fs.existsSync(queueDir)) {
  fs.mkdirSync(queueDir);
  console.log(`📁 Created folder: ${queueDir}`);
  console.log('👉 Please put all your images inside this folder and run the script again!');
  process.exit(0);
}

async function bulkUpload() {
  const files = fs.readdirSync(queueDir).filter(file => {
    const ext = path.extname(file).toLowerCase();
    return ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'].includes(ext);
  });

  if (files.length === 0) {
    console.log(`ℹ️ No images found in: ${queueDir}`);
    console.log('👉 Put the images you want to upload in this folder first.');
    return;
  }

  console.log(`🚀 Found ${files.length} images to upload...`);

  // Target bucket name in Supabase Storage
  const bucketName = 'products';

  // Check if bucket exists, if not warn the user to create it
  const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
  
  if (bucketError) {
    console.error('❌ Error listing buckets. Make sure your storage permissions or policies allow reading buckets:', bucketError.message);
  }

  const bucketExists = buckets?.some(b => b.name === bucketName);
  if (!bucketExists) {
    console.log(`\n⚠️ Warning: The Storage Bucket named "${bucketName}" was not detected.`);
    console.log(`👉 Please go to your Supabase Dashboard > Storage, and click "New Bucket" to create a PUBLIC bucket named "${bucketName}".`);
    console.log(`Make sure you set the bucket access to "Public".\n`);
  }

  console.log(`Uploading to bucket "${bucketName}"...\n`);
  
  const results = [];

  for (const file of files) {
    const filePath = path.join(queueDir, file);
    const fileBuffer = fs.readFileSync(filePath);
    const contentType = getContentType(file);

    console.log(`⏳ Uploading ${file}...`);

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(file, fileBuffer, {
        contentType,
        upsert: true
      });

    if (error) {
      console.error(`❌ Failed to upload ${file}:`, error.message);
      results.push({ file, status: 'FAILED', url: error.message });
    } else {
      // Construct the public URL
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(file);

      console.log(`✅ Uploaded ${file} successfully!`);
      results.push({ file, status: 'SUCCESS', url: urlData.publicUrl });
    }
  }

  console.log('\n======================================================');
  console.log('🎉 BULK UPLOAD SUMMARY');
  console.log('======================================================\n');
  console.log('| File Name | Status | Public URL |');
  console.log('|-----------|--------|------------|');
  results.forEach(res => {
    console.log(`| ${res.file} | ${res.status} | ${res.url} |`);
  });
  console.log('\n👉 You can copy these public URLs and use them in your products!');
}

function getContentType(filename) {
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case '.png': return 'image/png';
    case '.jpg':
    case '.jpeg': return 'image/jpeg';
    case '.webp': return 'image/webp';
    case '.gif': return 'image/gif';
    case '.svg': return 'image/svg+xml';
    default: return 'application/octet-stream';
  }
}

bulkUpload();
