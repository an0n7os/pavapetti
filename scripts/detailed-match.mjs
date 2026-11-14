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
  
  // For each db product, see if we can find its image or name in fullProds
  const matchedFullProdIds = new Set();
  const matchedPairs = [];

  for (const dbP of dbProds) {
    // 1. try match by image file name
    const dbImgBase = path.basename(dbP.image_url || '').replace(/^\d+-/, '').replace(/-p\.png$/, '').replace(/\.png$/, '').replace(/\.webp$/, '').toLowerCase().replace(/[^a-z0-9]/g, '');
    let match = fullProds.find(fp => {
      const fpImgBase = path.basename(fp.imageUrl || fp.image_url || '').replace(/\.webp$/, '').replace(/\.png$/, '').toLowerCase().replace(/[^a-z0-9]/g, '');
      return dbImgBase && fpImgBase && (dbImgBase.includes(fpImgBase) || fpImgBase.includes(dbImgBase));
    });

    // 2. if not, try by normalized name
    if (!match) {
      const dbNameNorm = dbP.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      match = fullProds.find(fp => {
        const fpNameNorm = fp.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        return dbNameNorm && fpNameNorm && (dbNameNorm.includes(fpNameNorm) || fpNameNorm.includes(dbNameNorm));
      });
    }

    if (match) {
      matchedFullProdIds.add(match.id);
      matchedPairs.push({ dbId: dbP.id, dbName: dbP.name, fpId: match.id, fpName: match.name });
    } else {
      matchedPairs.push({ dbId: dbP.id, dbName: dbP.name, fpId: null, fpName: null });
    }
  }

  console.log(`dbProds total: ${dbProds.length}`);
  console.log(`Matched to fullProds: ${matchedFullProdIds.size}`);
  
  const unrepresentedInDb = fullProds.filter(fp => !matchedFullProdIds.has(fp.id));
  console.log(`Unrepresented fullProds: ${unrepresentedInDb.length}`);
  console.log(`Sum: ${dbProds.length} + ${unrepresentedInDb.length} = ${dbProds.length + unrepresentedInDb.length}`);

  console.log('\nSample unrepresented:');
  unrepresentedInDb.slice(0, 15).forEach(p => console.log(`- [${p.id}] ${p.name} (${p.categoryName})`));
}

run();
