const fs = require('fs');

(async () => {
  const url = 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80';
  console.log("Fetching fallback photo from Unsplash...");
  try {
    const res = await fetch(url);
    if (res.ok) {
      const buffer = await res.arrayBuffer();
      const base64 = 'data:image/jpeg;base64,' + Buffer.from(buffer).toString('base64');
      console.log("Generated Base64 fallback photo. Length:", base64.length);
      fs.writeFileSync('/Users/user/.gemini/antigravity/scratch/fallback_photo_base64.txt', base64);
    }
  } catch (err) {
    console.error("Fetch error:", err);
  }
})();
