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

console.log('Querying products column lengths...');
const { data, error } = await supabase.from('products').select('id, name, image_url, description');
if (error) {
  console.error(error);
} else {
  data.forEach(p => {
    const imgLen = p.image_url ? p.image_url.length : 0;
    const descLen = p.description ? p.description.length : 0;
    const isBase64 = p.image_url && p.image_url.startsWith('data:image');
    console.log(`Product ID ${p.id}: "${p.name.substring(0, 30)}..." | Image Length: ${imgLen} bytes (base64: ${isBase64}) | Description Length: ${descLen} bytes`);
  });
}
process.exit(0);
