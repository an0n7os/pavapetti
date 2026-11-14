const SUPABASE_URL = "https://rtjgsjkptshythmfmqoq.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0amdzamtwdHNoeXRobWZtcW9xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyNjMzMTksImV4cCI6MjA5NjgzOTMxOX0.9HoMwKhAtqPhmS5kmuyDArz8pNad19TOIs9RhTmxAvc";

async function main() {
  const headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json",
    "Prefer": "return=representation"
  };

  // Get categories
  const catRes = await fetch(`${SUPABASE_URL}/rest/v1/categories?select=*`, { headers });
  const categories = await catRes.json();
  const primaryCat = categories.find(c => c.name.toLowerCase().includes("statue") || c.name.toLowerCase().includes("decor")) || categories[0];
  console.log("Selected Category:", primaryCat.name, "ID:", primaryCat.id);

  const demoName = "Demo Masterpiece: Royal Kathakali Wooden Mask (Handcrafted)";

  // Check if demo product already exists
  const checkRes = await fetch(`${SUPABASE_URL}/rest/v1/products?name=eq.${encodeURIComponent(demoName)}&select=id,name`, { headers });
  const existing = await checkRes.json();

  const demoProduct = {
    name: demoName,
    description: "An authentic handcrafted Royal Kathakali Wooden Mask sculpted from seasoned Kumbil wood by master Kerala artisans. Features rich natural pigment lacquering, intricate gold leaf detailing, and traditional Paccha vesham sacred iconography. Perfect luxury cultural heirloom for art connoisseurs.",
    price: 1899,
    mrp: 2499,
    image_url: "/hero-dance-v2.webp",
    category_id: primaryCat.id,
    category_name: primaryCat.name,
    stock: 12,
    material: "Seasoned Kumbil Wood & Organic Lacquer",
    size: "16 x 11 x 4 inches",
    featured: true,
    is_visible: true,
    is_new_arrival: true,
    additional_category_ids: categories.slice(1, 3).map(c => c.id),
    additional_category_names: categories.slice(1, 3).map(c => c.name),
  };

  if (existing && existing.length > 0) {
    const patchRes = await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${existing[0].id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(demoProduct)
    });
    const updated = await patchRes.json();
    console.log("✅ Demo product updated:", updated[0]?.id, updated[0]?.name, "Price: ₹" + updated[0]?.price);
  } else {
    const postRes = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
      method: "POST",
      headers,
      body: JSON.stringify(demoProduct)
    });
    const inserted = await postRes.json();
    console.log("✅ Demo product inserted:", inserted[0]?.id, inserted[0]?.name, "Price: ₹" + inserted[0]?.price, "MRP: ₹" + inserted[0]?.mrp);
  }

  // Count total products
  const countRes = await fetch(`${SUPABASE_URL}/rest/v1/products?select=id`, {
    headers: { ...headers, "Range-Unit": "items", "Prefer": "count=exact" }
  });
  const countHeader = countRes.headers.get("content-range");
  console.log("📦 Total products in Supabase now:", countHeader);
}

main().catch(console.error);
