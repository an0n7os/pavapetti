import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: prods, error: pe } = await supabase.from('products').select('*');
  const { data: cats, error: ce } = await supabase.from('categories').select('*');
  console.log('--- Supabase DB Status ---');
  console.log('Products count:', prods ? prods.length : 'error/null', pe || '');
  if (prods && prods.length > 0) {
    console.log('Products:', prods.map(p => ({ id: p.id, name: p.name, category: p.category_name })));
  }
  console.log('Categories count:', cats ? cats.length : 'error/null', ce || '');
  if (cats && cats.length > 0) {
    console.log('Categories:', cats.map(c => ({ id: c.id, name: c.name })));
  }
  console.log('--------------------------');
}

check();
