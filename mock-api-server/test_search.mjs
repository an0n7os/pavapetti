import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const getSupabaseHeaders = () => ({
  "apikey": supabaseKey,
  "Authorization": `Bearer ${supabaseKey}`,
  "Content-Type": "application/json"
});

async function runTest() {
  // First seed some products if empty so we can test search
  console.log('Seeding temporary products...');
  const seedUrl = `${supabaseUrl}/rest/v1/products`;
  
  // Let's insert a test product
  const testProduct = {
    name: "Search Test Buddha Frame",
    price: 300,
    category_name: "Pooja Category",
    description: "A testing product"
  };
  
  const insertRes = await fetch(seedUrl, {
    method: 'POST',
    headers: {
      ...getSupabaseHeaders(),
      "Prefer": "return=representation"
    },
    body: JSON.stringify(testProduct)
  });
  const inserted = await insertRes.json();
  console.log('Inserted:', inserted);

  const searchTerms = ['Buddha', 'buddha', 'Search', 'test'];
  for (const term of searchTerms) {
    // Test with *
    const url1 = `${supabaseUrl}/rest/v1/products?name=ilike.*${term}*`;
    const res1 = await fetch(url1, { headers: getSupabaseHeaders() });
    const data1 = await res1.json();
    console.log(`Search for "${term}" with *: count = ${data1.length}`);

    // Test with %
    const url2 = `${supabaseUrl}/rest/v1/products?name=ilike.%25${term}%25`;
    const res2 = await fetch(url2, { headers: getSupabaseHeaders() });
    const data2 = await res2.json();
    console.log(`Search for "${term}" with %: count = ${data2.length}`);
  }

  // Clean up
  console.log('Cleaning up test product...');
  await fetch(`${supabaseUrl}/rest/v1/products?name=eq.Search%20Test%20Buddha%20Frame`, {
    method: 'DELETE',
    headers: getSupabaseHeaders()
  });
}

runTest();
