import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. mock-api-server/catalog-data.json
const catJsonPath = path.join(__dirname, '../mock-api-server/catalog-data.json');
if (fs.existsSync(catJsonPath)) {
  const data = JSON.parse(fs.readFileSync(catJsonPath, 'utf8'));
  if (data.products) {
    data.products = data.products.map(p => ({ ...p, price: 0, mrp: 0 }));
    fs.writeFileSync(catJsonPath, JSON.stringify(data, null, 2), 'utf8');
    console.log('✅ Updated mock-api-server/catalog-data.json products price to 0');
  }
}

// 2. lib/api-client-react/src/catalog-data.ts
const catTsPath = path.join(__dirname, '../lib/api-client-react/src/catalog-data.ts');
if (fs.existsSync(catTsPath)) {
  let content = fs.readFileSync(catTsPath, 'utf8');
  // replace "price": \d+ and "mrp": \d+
  content = content.replace(/"price":\s*\d+/g, '"price": 0');
  content = content.replace(/"mrp":\s*\d+/g, '"mrp": 0');
  fs.writeFileSync(catTsPath, content, 'utf8');
  console.log('✅ Updated lib/api-client-react/src/catalog-data.ts products price to 0');
}
