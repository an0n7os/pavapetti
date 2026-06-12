import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Uploads an image File to Supabase Storage (products bucket) and returns the public URL.
 * Resizes + compresses the image client-side first to keep file sizes small.
 */
export async function uploadImageToStorage(
  file: File,
  maxWidth = 800,
  quality = 0.8
): Promise<string> {
  // 1. Compress image via Canvas
  const compressed = await compressImage(file, maxWidth, quality);
  const blob = await fetch(compressed).then((r) => r.blob());

  // Generate a unique filename: timestamp + sanitized original name
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const safeName = file.name
    .replace(/[^a-z0-9]/gi, "-")
    .toLowerCase()
    .slice(0, 40);
  const filename = `${Date.now()}-${safeName}.${ext}`;

  // 2. Upload to Supabase Storage
  try {
    const { error } = await supabase.storage
      .from("products")
      .upload(filename, blob, { contentType: blob.type, upsert: false });

    if (error) {
      throw error;
    }

    // 3. Return the public URL
    const { data } = supabase.storage.from("products").getPublicUrl(filename);
    return data.publicUrl;
  } catch (err: any) {
    console.warn("Supabase Storage upload failed, falling back to base64 data URL:", err);
    // Fall back to the compressed base64 data URL
    return compressed;
  }
}

function compressImage(
  file: File,
  maxWidth: number,
  quality: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      let { width, height } = img;
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas context unavailable"));
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = reject;
    img.src = url;
  });
}
