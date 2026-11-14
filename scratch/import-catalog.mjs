import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

const ROOT = process.cwd();
const require = createRequire(path.join(ROOT, 'website', 'package.json'));
const sharp = require('sharp');

const CATALOG_DIR = 'C:\\Users\\aswin\\Downloads\\pavapetty catalog';
const CSV_PATH = path.join(ROOT, 'products_import.csv');
const OUT_IMG_DIR = path.join(ROOT, 'website', 'public', 'catalog');
const OUT_JSON_PATH = path.join(ROOT, 'mock-api-server', 'catalog-data.json');

fs.mkdirSync(OUT_IMG_DIR, { recursive: true });

// Simple RFC-4180 CSV parser
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        field += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        field += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        row.push(field.trim());
        field = '';
      } else if (ch === '\r' && next === '\n') {
        row.push(field.trim());
        rows.push(row);
        row = [];
        field = '';
        i++;
      } else if (ch === '\n') {
        row.push(field.trim());
        rows.push(row);
        row = [];
        field = '';
      } else {
        field += ch;
      }
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field.trim());
    rows.push(row);
  }
  return rows;
}

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

const csvText = fs.readFileSync(CSV_PATH, 'utf8');
const rows = parseCsv(csvText).filter(r => r.length >= 11 && r[0]);
const header = rows[0];
const dataRows = rows.slice(1);

console.log(`Parsed ${dataRows.length} rows from products_import.csv`);

const catalogFiles = new Map();
for (const file of fs.readdirSync(CATALOG_DIR)) {
  catalogFiles.set(file.toLowerCase(), path.join(CATALOG_DIR, file));
}

const categoryMap = new Map();
const products = [];
let totalRawBytes = 0;
let totalWebpBytes = 0;
let missingImages = 0;

for (let i = 0; i < dataRows.length; i++) {
  const [
    name,
    priceStr,
    mrpStr,
    description,
    categoryName,
    stockStr,
    material,
    size,
    featuredStr,
    isNewArrivalStr,
    imageName
  ] = dataRows[i];

  const slug = slugify(imageName || name) || `product-${i + 1}`;
  const outFileName = `${slug}.webp`;
  const outFilePath = path.join(OUT_IMG_DIR, outFileName);

  const srcPath = imageName ? catalogFiles.get(imageName.toLowerCase()) : null;
  let imageUrl = `/catalog/${outFileName}`;

  if (srcPath && fs.existsSync(srcPath)) {
    const stat = fs.statSync(srcPath);
    totalRawBytes += stat.size;

    if (!fs.existsSync(outFilePath)) {
      await sharp(srcPath)
        .resize({ width: 720, height: 900, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 72, effort: 4 })
        .toFile(outFilePath);
    }
    totalWebpBytes += fs.statSync(outFilePath).size;
  } else {
    missingImages++;
    console.warn(`Missing image for "${name}": ${imageName}`);
  }

  const catKey = categoryName.trim();
  if (!categoryMap.has(catKey)) {
    categoryMap.set(catKey, {
      name: catKey,
      description: `${catKey} — handcrafted Kerala heritage collection`,
      imageUrl,
      productCount: 0
    });
  }
  const catObj = categoryMap.get(catKey);
  catObj.productCount++;

  products.push({
    name,
    description,
    price: Number(priceStr) || 0,
    mrp: mrpStr ? Number(mrpStr) : undefined,
    imageUrl,
    categoryName: catKey,
    stock: Number(stockStr) || 10,
    material: material || 'Handcrafted',
    size: size || 'Standard',
    featured: featuredStr === 'true',
    isVisible: true,
    isNewArrival: isNewArrivalStr === 'true'
  });
}

const categories = Array.from(categoryMap.values());
fs.writeFileSync(OUT_JSON_PATH, JSON.stringify({ categories, products }, null, 2), 'utf8');

console.log(`Done!`);
console.log(`Categories: ${categories.length}`);
console.log(`Products: ${products.length} (missing images: ${missingImages})`);
console.log(`Raw size: ${(totalRawBytes / 1024 / 1024).toFixed(2)} MB -> Compressed WebP: ${(totalWebpBytes / 1024 / 1024).toFixed(2)} MB`);
