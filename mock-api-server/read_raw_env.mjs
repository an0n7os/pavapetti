import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf8');

console.log('--- Raw Env File ---');
console.log(JSON.stringify(envContent));
console.log('--------------------');

const lines = envContent.split(/\r?\n/);
lines.forEach((line, idx) => {
  console.log(`Line ${idx + 1}: length ${line.length}`);
  console.log(`  content: ${JSON.stringify(line)}`);
  if (line.startsWith('SUPABASE_ANON_KEY=')) {
    const val = line.substring('SUPABASE_ANON_KEY='.length);
    console.log(`  SUPABASE_ANON_KEY value length: ${val.length}`);
    console.log(`  value: ${JSON.stringify(val)}`);
  }
});
