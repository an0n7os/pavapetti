const base = "https://rtjgsjkptshythmfmqoq.supabase.co/rest/v1";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0amdzamtwdHNoeXRobWZtcW9xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyNjMzMTksImV4cCI6MjA5NjgzOTMxOX0.9HoMwKhAtqPhmS5kmuyDArz8pNad19TOIs9RhTmxAvc";

const headers = {
  apikey: key,
  Authorization: `Bearer ${key}`,
  "Content-Type": "application/json",
  Prefer: "return=representation"
};

// 1. Get first product
const getRes = await fetch(`${base}/products?select=*&limit=1`, { headers });
const products = await getRes.json();
console.log("Get status:", getRes.status);
console.log("Product:", products[0]);

if (products[0]) {
  const p = products[0];
  // 2. Try PATCH
  const patchRes = await fetch(`${base}/products?id=eq.${p.id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ description: p.description || "Test update" })
  });
  console.log("PATCH status:", patchRes.status);
  const patchResult = await patchRes.text();
  console.log("PATCH result:", patchResult);
}
