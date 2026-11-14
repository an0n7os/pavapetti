import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const indexSrc = fs.readFileSync(path.join(__dirname, '../mock-api-server/index.mjs'), 'utf8');
const lines = indexSrc.split('\n');
const slice = lines.slice(302, 746).join('\n');

const runner = new Function('path', '__dirname', 'fs', `
  ${slice}
  return { categories, products };
`);

const mockDir = path.join(__dirname, '../mock-api-server');
const { categories, products } = runner(path, mockDir, fs);

console.log('Sample product images:');
products.slice(0, 10).forEach(p => console.log(p.id, p.name, '=>', p.imageUrl || p.image_url));

console.log('Image types count:');
const types = {};
products.forEach(p => {
  const img = p.imageUrl || p.image_url || 'none';
  const prefix = img.startsWith('http') ? 'remote_url' : img.startsWith('/catalog/') ? '/catalog/' : img.startsWith('/') ? 'root_slash' : 'other';
  types[prefix] = (types[prefix] || 0) + 1;
});
console.log(types);

// Check if /catalog/ images exist in website/public/catalog
let missingImgs = 0;
products.forEach(p => {
  const img = (p.imageUrl || p.image_url || '').replace(/^\//, '');
  const localFile = path.join(__dirname, '../website/public', img);
  if (!fs.existsSync(localFile)) {
    missingImgs++;
    // console.log('Missing local image:', img);
  }
});
console.log('Total missing local images in website/public:', missingImgs);
