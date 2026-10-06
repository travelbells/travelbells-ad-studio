const fs = require('fs');
const path = require('path');
const { generateBannerSVG } = require('./server.js');

function dataUriToBuffer(dataUri) {
  if (!dataUri) return Buffer.from('');
  if (dataUri.startsWith('data:image/svg+xml;utf8,')) {
    return Buffer.from(decodeURIComponent(dataUri.replace('data:image/svg+xml;utf8,', '')));
  }
  if (dataUri.startsWith('data:image/svg+xml;base64,')) {
    return Buffer.from(dataUri.replace('data:image/svg+xml;base64,', ''), 'base64');
  }
  if (dataUri.startsWith('data:')) {
    const parts = dataUri.split(',');
    return Buffer.from(parts[1], 'base64');
  }
  return Buffer.from(dataUri);
}

async function run() {
  console.log("Generating EXACT CURRENT CREATIVE rendered in Punjabi via server.js SVG engine...");

  // The EXACT text from the user's current creative screenshot:
  const currentCreativeParams = {
    title: "SKILLED WORKER EXPRESS ENTRY & ONTARIO OINP DRAWS FAST-TRACK CANADIAN PERMANENT RESIDENCY 2026",
    subtitle: "Regulated RCIC Legal Guidance & Application Support Across Canada",
    badgeText: "SURREY BC PNP TRADES",
    b1: "Targeted PR pathways & Work Permit options across Canada",
    b2: "Employer job offer & Provincial Nomination (PNP) assessment",
    b3: "Spouse Open Work Permit (SOWP) eligibility for accompanying family",
    b4: "Complete legal representation by licensed RCIC consultants",
    footerCta: "BOOK YOUR OFFICIAL RCIC STRATEGY CONSULTATION TODAY",
    footerWebsite: "www.travelbellsimmigration.com",
    footerEmail: "info@travelbellsimmigration.com",
    footerPhone: "+1 (647) 890-1476",
    footerLocation: "Ontario, Canada • Licensed CICC Member",
    format: "vertical",
    language: "pa",
    lang: "pa",
    customPhotoUrl: "professional"
  };

  // 1. Generate 1:1 Feed Punjabi SVG
  const dataUriPA_1x1 = generateBannerSVG({ ...currentCreativeParams, format: 'vertical' });
  const rawSvgPA_1x1 = dataUriToBuffer(dataUriPA_1x1).toString('utf-8');
  fs.writeFileSync(path.join(__dirname, 'exact_current_creative_punjabi_1x1.svg'), rawSvgPA_1x1);
  console.log('✅ Saved 1:1 Feed Punjabi SVG:', path.join(__dirname, 'exact_current_creative_punjabi_1x1.svg'));

  // 2. Generate 9:16 Story Punjabi SVG
  const dataUriPA_9x16 = generateBannerSVG({ ...currentCreativeParams, format: 'story' });
  const rawSvgPA_9x16 = dataUriToBuffer(dataUriPA_9x16).toString('utf-8');
  fs.writeFileSync(path.join(__dirname, 'exact_current_creative_punjabi_9x16.svg'), rawSvgPA_9x16);
  console.log('✅ Saved 9:16 Story Punjabi SVG:', path.join(__dirname, 'exact_current_creative_punjabi_9x16.svg'));

  // 3. Generate 16:9 Landscape Punjabi SVG
  const dataUriPA_16x9 = generateBannerSVG({ ...currentCreativeParams, format: 'landscape' });
  const rawSvgPA_16x9 = dataUriToBuffer(dataUriPA_16x9).toString('utf-8');
  fs.writeFileSync(path.join(__dirname, 'exact_current_creative_punjabi_16x9.svg'), rawSvgPA_16x9);
  console.log('✅ Saved 16:9 Landscape Punjabi SVG:', path.join(__dirname, 'exact_current_creative_punjabi_16x9.svg'));

  // Also HTML viewer proof
  const htmlProof = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Travelbells Immigration Ad Studio - Exact Punjabi Creative Proof</title>
<style>
  body { font-family: sans-serif; background: #0F172A; color: #F8FAFC; margin: 0; padding: 40px; text-align: center; }
  h1 { color: #FF4D6D; margin-bottom: 8px; }
  p { color: #94A3B8; font-size: 16px; margin-bottom: 30px; }
  .grid { display: flex; flex-wrap: wrap; gap: 30px; justify-content: center; align-items: flex-start; }
  .card { background: #1E293B; border: 1px solid #334155; border-radius: 16px; padding: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
  .card h3 { color: #38BDF8; margin-top: 0; }
  .svg-wrap { border-radius: 12px; overflow: hidden; max-width: 450px; margin: 0 auto; }
  svg { width: 100%; height: auto; display: block; }
</style>
</head>
<body>
  <h1>🇵🇰 Travelbells Ad Studio — Live Punjabi Translation Engine Proof</h1>
  <p>Rendered directly by the application server engine for the exact creative inputs in Gurmukhi Punjabi script.</p>
  <div class="grid">
    <div class="card">
      <h3>📷 1:1 Feed Post (1080×1080) — 🇵🇰 Punjabi</h3>
      <div class="svg-wrap">${rawSvgPA_1x1}</div>
    </div>
    <div class="card">
      <h3>💼 16:9 Banner (1200×630) — 🇵🇰 Punjabi</h3>
      <div class="svg-wrap" style="max-width: 600px;">${rawSvgPA_16x9}</div>
    </div>
  </div>
</body>
</html>`;

  fs.writeFileSync(path.join(__dirname, 'exact_current_creative_punjabi_proof.html'), htmlProof);
  console.log('✅ Saved HTML Proof Page:', path.join(__dirname, 'exact_current_creative_punjabi_proof.html'));

  console.log("🎉 All exact current creative Punjabi proofs generated successfully!");
  process.exit(0);
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
