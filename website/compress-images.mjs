import sharp from "sharp";
import { readdir, stat, rename } from "fs/promises";
import { join, extname, basename } from "path";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "public");

const IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg"];

async function getFileSizeKB(filePath) {
  const s = await stat(filePath);
  return (s.size / 1024).toFixed(1);
}

async function compressImages() {
  const files = await readdir(publicDir);
  const imageFiles = files.filter((f) =>
    IMAGE_EXTENSIONS.includes(extname(f).toLowerCase())
  );

  console.log(`\n🔍 Found ${imageFiles.length} images in public/\n`);

  let totalSavedKB = 0;
  let processedCount = 0;

  for (const file of imageFiles) {
    const inputPath = join(publicDir, file);
    const ext = extname(file).toLowerCase();
    const nameWithoutExt = basename(file, ext);
    const outputPath = join(publicDir, `${nameWithoutExt}.webp`);

    // Skip if already a webp
    if (ext === ".webp") {
      console.log(`⏭️  Skipping (already WebP): ${file}`);
      continue;
    }

    const beforeKB = await getFileSizeKB(inputPath);

    try {
      await sharp(inputPath)
        .webp({ quality: 80, effort: 6 })
        .toFile(outputPath);

      const afterKB = await getFileSizeKB(outputPath);
      const savedKB = parseFloat(beforeKB) - parseFloat(afterKB);
      totalSavedKB += savedKB;
      processedCount++;

      const savePct = ((savedKB / parseFloat(beforeKB)) * 100).toFixed(0);
      const arrow = savedKB > 0 ? "✅" : "⚠️";
      console.log(
        `${arrow} ${file}\n   ${beforeKB} KB → ${afterKB} KB  (saved ${savePct}%)`
      );
    } catch (err) {
      console.error(`❌ Failed: ${file} — ${err.message}`);
    }
  }

  console.log(`\n🎉 Done! Compressed ${processedCount} images.`);
  console.log(
    `💾 Total saved: ${(totalSavedKB / 1024).toFixed(2)} MB\n`
  );
  console.log(
    `⚠️  Original PNG/JPG files still exist. Update your <img> src to use .webp extensions, or delete originals manually.\n`
  );
}

compressImages().catch(console.error);
