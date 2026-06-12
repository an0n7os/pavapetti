import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

console.log('SUPABASE_URL:', supabaseUrl);
console.log('SUPABASE_ANON_KEY Length:', supabaseKey ? supabaseKey.length : 0);
console.log('SUPABASE_ANON_KEY starts with:', supabaseKey ? supabaseKey.substring(0, 20) : 'none');
console.log('SUPABASE_ANON_KEY ends with:', supabaseKey ? supabaseKey.substring(supabaseKey.length - 20) : 'none');

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing env variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log('Running test query...');
  try {
    const { data, error } = await supabase.from('categories').select('*').limit(1);
    if (error) {
      console.error('Query returned error:', error);
    } else {
      console.log('Query succeeded! Categories:', data);
    }
  } catch (err) {
    console.error('Exception during query:', err);
  }
}

check();
