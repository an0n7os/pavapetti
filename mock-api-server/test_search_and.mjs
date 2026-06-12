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
  console.log('Seeding temporary products...');
  const seedUrl = `${supabaseUrl}/rest/v1/products`;
  
  const testProduct = {
    name: "Traditional Bhudha Frame",
    price: 300,
    category_name: "Leather Category",
    description: "Handcrafted leather wall decor of meditating Buddha",
    material: "Leather"
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

  // Search words: 'buddha' (we will handle buddha/bhudha as a special case matching either)
  const queryText = "buddha leather";
  const words = queryText.toLowerCase().split(/\s+/).filter(Boolean);
  
  const andClauses = [];
  for (const word of words) {
    // Standard columns to check for the word
    const cols = ['name', 'description', 'material', 'category_name'];
    const colClauses = [];
    
    // Support spelling variation buddha <-> bhudha
    if (word === 'buddha' || word === 'bhudha') {
      cols.forEach(col => {
        colClauses.push(`${col}.ilike.*buddha*`);
        colClauses.push(`${col}.ilike.*bhudha*`);
      });
    } else {
      cols.forEach(col => {
        colClauses.push(`${col}.ilike.*${word}*`);
      });
    }
    
    andClauses.push(`or(${colClauses.join(',')})`);
  }
  
  const andFilter = `and=(${andClauses.join(',')})`;
  const url = `${supabaseUrl}/rest/v1/products?${andFilter}`;
  console.log('Query URL:', url);

  const res = await fetch(url, { headers: getSupabaseHeaders() });
  const data = await res.json();
  console.log(`Search results count: ${data.length}`);
  console.log('Results:', data.map(p => p.name));

  // Clean up
  console.log('Cleaning up test product...');
  await fetch(`${supabaseUrl}/rest/v1/products?name=eq.Traditional%20Bhudha%20Frame`, {
    method: 'DELETE',
    headers: getSupabaseHeaders()
  });
}

runTest();
