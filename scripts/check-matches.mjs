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

const indexSrc = fs.readFileSync(path.join(__dirname, '../mock-api-server/index.mjs'), 'utf8');
const lines = indexSrc.split('\n');
const slice = lines.slice(302, 746).join('\n');

const runner = new Function('path', '__dirname', 'fs', `
  ${slice}
  return { categories, products };
`);

const mockDir = path.join(__dirname, '../mock-api-server');
const { categories: fullCats, products: fullProds } = runner(path, mockDir, fs);

async function run() {
  const { data: dbProds } = await supabase.from('products').select('*');
  console.log('dbProds count:', dbProds.length);

  // Check how many of dbProds match fullProds loosely or tightly
  const matched = [];
  const unmatchedDb = [];

  for (const dbP of dbProds) {
    const dbNameNorm = dbP.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const found = fullProds.find(fp => {
      const fpNameNorm = fp.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      return dbNameNorm.includes(fpNameNorm) || fpNameNorm.includes(dbNameNorm);
    });

    if (found) {
      matched.push({ dbId: dbP.id, dbName: dbP.name, fpId: found.id, fpName: found.name });
    } else {
      unmatchedDb.push(dbP);
    }
  }

  console.log('Fuzzy matched:', matched.length);
  console.log('Unmatched in DB:', unmatchedDb.length);
  if (unmatchedDb.length > 0) {
    console.log('Unmatched DB names:', unmatchedDb.map(p => p.name));
  }
}

run();
