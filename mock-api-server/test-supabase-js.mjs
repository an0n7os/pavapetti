import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { performance } from 'perf_hooks';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('1. Get products count and head...');
let start = performance.now();
try {
  const { count, error } = await supabase.from('products').select('*', { count: 'exact', head: true });
  console.log(`Count: ${count}, Error: ${error}, Time: ${(performance.now() - start).toFixed(2)} ms`);
} catch(e) {
  console.error(e);
}

console.log('2. Query only IDs...');
start = performance.now();
try {
  const { data, error } = await supabase.from('products').select('id');
  console.log(`Got ${data?.length} IDs, Error: ${error}, Time: ${(performance.now() - start).toFixed(2)} ms`);
} catch(e) {
  console.error(e);
}

console.log('3. Query all columns for first product...');
start = performance.now();
try {
  const { data, error } = await supabase.from('products').select('*').limit(1);
  console.log(`Got first product, Error: ${error}, Time: ${(performance.now() - start).toFixed(2)} ms`);
  if (data && data[0]) console.log('First product fields:', Object.keys(data[0]));
} catch(e) {
  console.error(e);
}

console.log('4. Query all columns without limit...');
start = performance.now();
try {
  const { data, error } = await supabase.from('products').select('*');
  console.log(`Got ${data?.length} products, Error: ${error}, Time: ${(performance.now() - start).toFixed(2)} ms`);
} catch(e) {
  console.error(e);
}

process.exit(0);
