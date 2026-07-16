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
const csvPath = path.join(__dirname, '../products_import.csv');
const queueDir = path.join(__dirname, 'upload-queue');

// Quote-aware CSV line parser
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim().replace(/^"|"$/g, ''));
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim().replace(/^"|"$/g, ''));
  return result;
}

async function runImport() {
  console.log('🏁 Starting Bulk Product Import Script...');

  // 1. Upload Images from upload-queue first
  const imageMap = {}; // maps fileName -> publicUrl
  if (fs.existsSync(queueDir)) {
    const files = fs.readdirSync(queueDir).filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'].includes(ext);
    });

    if (files.length > 0) {
      console.log(`📸 Found ${files.length} images in upload-queue. Uploading to Supabase storage...`);
      const bucketName = 'products';

      // Check if bucket exists, try to locate it
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(b => b.name === bucketName);
      if (!bucketExists) {
        console.warn(`⚠️ Warning: Storage bucket "${bucketName}" not found. Please create it in your Supabase Dashboard.`);
      }

      for (const file of files) {
        const filePath = path.join(queueDir, file);
        const fileBuffer = fs.readFileSync(filePath);
        
        console.log(`⏳ Uploading image: ${file}...`);
        const { error } = await supabase.storage
          .from(bucketName)
          .upload(file, fileBuffer, { upsert: true });

        if (error) {
          console.error(`❌ Failed to upload ${file}:`, error.message);
        } else {
          const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(file);
          imageMap[file.toLowerCase()] = urlData.publicUrl;
          console.log(`✅ Uploaded ${file} -> ${urlData.publicUrl}`);
        }
      }
    } else {
      console.log('ℹ️ No images found in upload-queue. Moving to product data parsing...');
    }
  }

  // 2. Check and Read products_import.csv
  if (!fs.existsSync(csvPath)) {
    console.error(`❌ Error: "products_import.csv" file not found at project root: ${csvPath}`);
    console.log('👉 Creating a template for you now. Please fill it out and run this script again.');
    createTemplate();
    process.exit(0);
  }

  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvContent.split(/\r?\n/).filter(line => line.trim() !== '');
  if (lines.length < 2) {
    console.error('❌ Error: The CSV file is empty or only contains headers.');
    process.exit(1);
  }

  const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase());
  console.log('📋 Headers detected:', headers);

  // Helper to get index by header name
  const getIndex = (name) => headers.indexOf(name.toLowerCase());

  const nameIdx = getIndex('name');
  const priceIdx = getIndex('price');
  const mrpIdx = getIndex('mrp');
  const descIdx = getIndex('description');
  const categoryIdx = getIndex('category_name');
  const stockIdx = getIndex('stock');
  const materialIdx = getIndex('material');
  const sizeIdx = getIndex('size');
  const featuredIdx = getIndex('featured');
  const newArrivalIdx = getIndex('is_new_arrival');
  const imageNameIdx = getIndex('image_name');

  if (nameIdx === -1 || priceIdx === -1) {
    console.error('❌ Error: CSV must at least contain "name" and "price" columns.');
    process.exit(1);
  }

  // Cache existing categories to avoid redundant queries
  const { data: dbCategories } = await supabase.from('categories').select('id, name');
  const categoryCache = {};
  dbCategories?.forEach(c => {
    categoryCache[c.name.toLowerCase()] = c.id;
  });

  console.log(`📦 Starting import of ${lines.length - 1} products...`);

  let successCount = 0;
  for (let i = 1; i < lines.length; i++) {
    const row = parseCSVLine(lines[i]);
    if (row.length < headers.length) continue; // Skip incomplete lines

    const name = row[nameIdx];
    const price = parseFloat(row[priceIdx]);
    if (!name || isNaN(price)) {
      console.warn(`⚠️ Skipping row ${i + 1}: Name is empty or Price is invalid.`);
      continue;
    }

    const mrp = mrpIdx !== -1 && row[mrpIdx] ? parseFloat(row[mrpIdx]) : null;
    const description = descIdx !== -1 ? row[descIdx] : '';
    const categoryName = categoryIdx !== -1 ? row[categoryIdx] : 'Uncategorized';
    const stock = stockIdx !== -1 && row[stockIdx] ? parseInt(row[stockIdx]) : 10;
    const material = materialIdx !== -1 ? row[materialIdx] : '';
    const size = sizeIdx !== -1 ? row[sizeIdx] : '';
    const featured = featuredIdx !== -1 ? row[featuredIdx].toLowerCase() === 'true' : false;
    const isNewArrival = newArrivalIdx !== -1 ? row[newArrivalIdx].toLowerCase() === 'true' : false;
    const imageName = imageNameIdx !== -1 ? row[imageNameIdx] : '';

    // Determine Image URL
    let imageUrl = '';
    if (imageName) {
      if (imageName.startsWith('http') || imageName.startsWith('/')) {
        imageUrl = imageName; // Already a URL
      } else {
        // Find in upload-queue mapping
        imageUrl = imageMap[imageName.toLowerCase()] || '';
        if (!imageUrl) {
          console.warn(`⚠️ Warning: Image "${imageName}" was not found in upload-queue. URL will be empty.`);
        }
      }
    }

    // Resolve Category ID
    let categoryId = null;
    if (categoryName) {
      const lowerCatName = categoryName.toLowerCase();
      if (categoryCache[lowerCatName]) {
        categoryId = categoryCache[lowerCatName];
      } else {
        // Create new category in Supabase
        console.log(`📁 Creating new category: "${categoryName}"...`);
        const { data: newCat, error: catError } = await supabase
          .from('categories')
          .insert([{ name: categoryName }])
          .select()
          .single();

        if (catError) {
          console.error(`❌ Failed to create category "${categoryName}":`, catError.message);
        } else {
          categoryId = newCat.id;
          categoryCache[lowerCatName] = newCat.id;
          console.log(`✅ Category "${categoryName}" created with ID: ${newCat.id}`);
        }
      }
    }

    // Insert Product into Supabase
    const { error: prodError } = await supabase.from('products').insert([{
      name,
      description,
      price,
      mrp: mrp || undefined,
      image_url: imageUrl || undefined,
      category_id: categoryId,
      category_name: categoryName,
      stock,
      material,
      size,
      featured,
      is_visible: true,
      is_new_arrival: isNewArrival
    }]);

    if (prodError) {
      console.error(`❌ Failed to import product "${name}":`, prodError.message);
    } else {
      successCount++;
      console.log(`✨ Imported (${successCount}/${lines.length - 1}): ${name}`);
    }
  }

  console.log(`\n🎉 Import completed successfully! Imported ${successCount} products.`);
}

function createTemplate() {
  const headers = 'name,price,mrp,description,category_name,stock,material,size,featured,is_new_arrival,image_name\n';
  const sample1 = 'Pure Pooja Oil (700ml),250,300,Premium smoke-free pooja oil,Pooja Category,50,Natural Oils,700ml,true,false,pooja_oil.webp\n';
  const sample2 = 'Golden Netipattam,1600,2500,Traditional home decor elephant caparison,Elephant Heritage,20,Brass,Standard,false,true,\n';
  
  fs.writeFileSync(csvPath, headers + sample1 + sample2, 'utf-8');
  console.log(`📁 Created template CSV file at: ${csvPath}`);
}

runImport();
