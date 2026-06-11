import fetch from 'node-fetch';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing env vars');
  process.exit(1);
}

const headers = {
  'apikey': supabaseKey,
  'Authorization': `Bearer ${supabaseKey}`,
  'Content-Type': 'application/json'
};

console.log('Fetching products count...');
try {
  const res = await fetch(`${supabaseUrl}/rest/v1/products?select=id`, { headers });
  if (res.ok) {
    const data = await res.json();
    console.log(`HTTP Fetch Success! Total products: ${data.length}`);
  } else {
    console.error(`HTTP Fetch Failed: ${res.status}`);
  }
} catch (e) {
  console.error('HTTP Exception:', e);
}

console.log('Fetching first 5 products details...');
try {
  const res = await fetch(`${supabaseUrl}/rest/v1/products?select=*&limit=5`, { headers });
  if (res.ok) {
    const data = await res.json();
    console.log(`HTTP Fetch Success! Got ${data.length} products:`, data.map(p => p.name));
  } else {
    console.error(`HTTP Fetch Failed: ${res.status}`);
  }
} catch (e) {
  console.error('HTTP Exception:', e);
}

process.exit(0);
