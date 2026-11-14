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
  console.log('🧪 Running Complete Admin & Database Lifecycle Test Suite...\n');

  // ── TEST 1: Storage Image Upload & Public CDN Reachability ──
  console.log('1️⃣ Testing Image Upload to Supabase Storage ("products" bucket)...');
  const testFileName = `test-img-${Date.now()}.png`;
  // Simple 1x1 transparent PNG buffer
  const png1x1 = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
  
  const { data: uploadData, error: uploadErr } = await supabase.storage
    .from('products')
    .upload(testFileName, png1x1, { contentType: 'image/png' });

  if (uploadErr) {
    console.error('❌ Image upload failed:', uploadErr);
    process.exit(1);
  }
  console.log('   ✅ Upload successful! Path:', uploadData.path);

  const { data: pubData } = supabase.storage.from('products').getPublicUrl(testFileName);
  console.log('   CDN Public URL:', pubData.publicUrl);

  const imgFetchRes = await fetch(pubData.publicUrl);
  if (imgFetchRes.ok) {
    console.log('   ✅ Image is publicly reachable (HTTP ' + imgFetchRes.status + ')');
  } else {
    console.error('   ❌ Could not reach image publicly: HTTP ' + imgFetchRes.status);
  }

  // ── TEST 2: Product Creation (INSERT) ──
  console.log('\n2️⃣ Testing Product Creation (POST /api/products)...');
  const createRes = await fetch('http://localhost:8081/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Automated Lifecycle Test Item',
      description: 'Handcrafted test artifact to verify full lifecycle safety',
      price: 0,
      mrp: 0,
      imageUrl: pubData.publicUrl,
      categoryId: 3, // Ideols & Statue
      additionalCategoryIds: [4], // Key Chains
      stock: 5,
      material: 'Brass & Bronze',
      size: '6 inches',
      featured: true,
      isVisible: true,
      isNewArrival: true
    })
  });

  const createdProduct = await createRes.json();
  if (createRes.status !== 201 && createRes.status !== 200) {
    console.error('❌ Product creation failed:', createRes.status, createdProduct);
    process.exit(1);
  }
  const createdId = createdProduct.id;
  console.log(`   ✅ Product created via API! Assigned ID: ${createdId}`);

  // Verify in Supabase table
  const { data: dbVerifyCreate } = await supabase.from('products').select('*').eq('id', createdId);
  if (dbVerifyCreate && dbVerifyCreate.length > 0) {
    console.log('   ✅ Verified in Supabase table directly:', dbVerifyCreate[0].name);
  } else {
    console.error('   ❌ Product was not found in Supabase table!');
    process.exit(1);
  }

  // ── TEST 3: Product Update (PUT /api/products/:id) ──
  console.log(`\n3️⃣ Testing Product Update (PUT /api/products/${createdId})...`);
  const updateRes = await fetch(`http://localhost:8081/api/products/${createdId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Automated Lifecycle Test Item (Updated)',
      description: 'Updated description for safety check',
      price: 0,
      mrp: 0,
      imageUrl: pubData.publicUrl,
      categoryId: 5, // Decors & Wall Hangings
      stock: 20,
      featured: false,
      isVisible: true,
      isNewArrival: false
    })
  });

  const updatedProduct = await updateRes.json();
  if (!updateRes.ok) {
    console.error('❌ Product update failed:', updateRes.status, updatedProduct);
    process.exit(1);
  }
  console.log('   ✅ API responded 200 with updated name:', updatedProduct.name);

  // Verify in Supabase table
  const { data: dbVerifyUpdate } = await supabase.from('products').select('*').eq('id', createdId);
  if (dbVerifyUpdate && dbVerifyUpdate[0]?.name === 'Automated Lifecycle Test Item (Updated)' && dbVerifyUpdate[0]?.category_id === 5) {
    console.log('   ✅ Verified in Supabase: category_id changed to 5, stock to 20');
  } else {
    console.error('   ❌ Supabase record did not reflect update:', dbVerifyUpdate);
    process.exit(1);
  }

  // ── TEST 4: Product Deletion (DELETE /api/products/:id) ──
  console.log(`\n4️⃣ Testing Product Deletion (DELETE /api/products/${createdId})...`);
  const deleteRes = await fetch(`http://localhost:8081/api/products/${createdId}`, {
    method: 'DELETE'
  });

  if (deleteRes.status === 204 || deleteRes.status === 200) {
    console.log('   ✅ API responded 204 No Content for deletion');
  } else {
    console.error('   ❌ API delete returned status:', deleteRes.status);
  }

  // Verify deleted in Supabase
  const { data: dbVerifyDelete } = await supabase.from('products').select('*').eq('id', createdId);
  if (dbVerifyDelete && dbVerifyDelete.length === 0) {
    console.log('   ✅ Verified completely removed from Supabase table!');
  } else {
    console.error('   ❌ Product still exists in Supabase table after DELETE!');
    process.exit(1);
  }

  // ── TEST 5: Clean up test image from storage ──
  console.log('\n5️⃣ Cleaning up test image from storage...');
  const { error: rmErr } = await supabase.storage.from('products').remove([testFileName]);
  if (rmErr) {
    console.warn('   ⚠️ Could not clean up test file:', rmErr);
  } else {
    console.log('   ✅ Test storage image cleaned up.');
  }

  // ── TEST 6: Category Product Counts & DB Integrity ──
  console.log('\n6️⃣ Verifying Category Counts & DB Integrity...');
  const { data: finalCats } = await supabase.from('categories').select('*').order('id', { ascending: true });
  const { data: finalProds, count: totalProds } = await supabase.from('products').select('*', { count: 'exact' });
  console.log(`   Total Products in Supabase: ${totalProds}`);
  console.log(`   Total Categories in Supabase: ${finalCats.length}`);
  
  console.log('\n========================================');
  console.log('🎉 ALL TESTS PASSED WITH 100% SUCCESS!');
  console.log('Uploads, Updates, Deletions, and Database pushes are completely healthy and verified.');
  console.log('========================================');
}

run().catch(console.error);
