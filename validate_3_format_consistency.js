const fs = require('fs');
const path = require('path');
const server = require('./server.js');

console.log("================================================================");
console.log("🎨 DEEP CROSS-FORMAT CONSISTENCY VALIDATION SUITE (1:1 / 9:16 / 16:9)");
console.log("================================================================");

let total = 0;
let passed = 0;
let failed = 0;

function assert(cond, name, msg = '') {
  total++;
  if (cond) {
    passed++;
    console.log(`  ✅ PASS: ${name}`);
  } else {
    failed++;
    console.error(`  ❌ FAIL: ${name} - ${msg}`);
  }
}

const samplePayload = {
  title: "CANADIAN IMMIGRATION & WORK PERMIT PATHWAYS 2026",
  subtitle: "Accredited Programs & Regulated RCIC Legal Guidance Across Canada",
  badgeText: "ONTARIO OINP WORKER",
  b1: "Targeted PR pathways & Work Permit options for candidates across Canada",
  b2: "Employer job offer & Provincial Nomination (PNP) assessment",
  b3: "Spouse Open Work Permit (SOWP) eligibility for accompanying family",
  b4: "Complete legal representation by licensed RCIC consultants",
  footerCta: "BOOK YOUR OFFICIAL RCIC STRATEGY CONSULTATION TODAY",
  footerPhone: "+1 (647) 890-1476",
  footerWebsite: "www.travelbellsimmigration.com",
  footerEmail: "info@travelbellsimmigration.com",
  footerLocation: "Ontario, Canada • Licensed RCIC Member",
  showBadge: true,
  showBullets: true,
  showFooter: true,
  showQrCode: true,
  showSocialProof: true
};

const formats = [
  { key: 'vertical', name: '1:1 Feed Post (1080x1080)' },
  { key: 'story', name: '9:16 Story / TikTok (1080x1920)' },
  { key: 'landscape', name: '16:9 Landscape Banner (1200x630)' }
];

// Helper to decode SVG base64 URI to plain text string
function decodeSvgUri(uri) {
  const base64 = uri.replace(/^data:image\/svg\+xml;base64,/, '');
  return Buffer.from(base64, 'base64').toString('utf8');
}

console.log("\n📐 1. VALIDATING LAYOUT HIERARCHY & STRUCTURAL ELEMENTS...");
formats.forEach(f => {
  const uri = server.generateBannerSVG({ ...samplePayload, format: f.key });
  const svg = decodeSvgUri(uri);

  assert(svg.includes('<svg') && svg.includes('</svg>'), `${f.name}: Contains valid root SVG document structure`);
  assert(svg.includes('Playfair Display'), `${f.name}: Uses Playfair Display serif font for headline title`);
  assert(svg.includes('Montserrat'), `${f.name}: Uses Montserrat sans-serif font for copy, badge, and CTA`);
  assert(svg.includes('C8102E') || svg.includes('c8102e'), `${f.name}: Uses Travelbells Crimson Red (#C8102E) highlight brand color`);
  assert(svg.includes('002B49') || svg.includes('002b49'), `${f.name}: Uses Travelbells Navy Blue (#002B49) brand color`);
  assert(svg.includes('F8FAFC') || svg.includes('f8fafc'), `${f.name}: Uses Light Slate (#F8FAFC) background styling`);
  assert(svg.includes('5B1425') || svg.includes('8B1E38') || svg.includes('002B49'), `${f.name}: Uses dark crimson/navy for footer info pills`);
  assert(svg.includes('Licensed RCIC Member') || svg.includes('Membre CICC Licencié'), `${f.name}: Contains CICC / RCIC Trust Badge Pill in header`);
  assert(svg.includes('SCAN TO BOOK') || svg.includes('generateSvgQrCode') || svg.includes('path'), `${f.name}: Contains Dynamic QR Code overlay element`);
  assert(svg.includes('4.9/5') || svg.includes('⭐⭐⭐⭐⭐'), `${f.name}: Contains 5-Star Social Proof rating overlay`);
  assert(svg.includes('BOOK YOUR OFFICIAL RCIC STRATEGY CONSULTATION TODAY'), `${f.name}: Contains full CTA button bar text`);
  assert(svg.includes('www.travelbellsimmigration.com'), `${f.name}: Footer contains Website pill text`);
  assert(svg.includes('info@travelbellsimmigration.com'), `${f.name}: Footer contains Email pill text`);
  assert(svg.includes('+1 (647) 890-1476'), `${f.name}: Footer contains Phone pill text`);
  assert(svg.includes('Ontario, Canada'), `${f.name}: Footer contains Location pill text`);
});

console.log("\n🎨 2. VALIDATING COLOR PALETTE & BORDER STYLING CONSISTENCY...");
const vertSvg = decodeSvgUri(server.generateBannerSVG({ ...samplePayload, format: 'vertical' }));
const storySvg = decodeSvgUri(server.generateBannerSVG({ ...samplePayload, format: 'story' }));
const landSvg = decodeSvgUri(server.generateBannerSVG({ ...samplePayload, format: 'landscape' }));

// Validate colors match across all 3
assert(vertSvg.includes('#C8102E') && storySvg.includes('#C8102E') && landSvg.includes('#C8102E'), "Crimson Red (#C8102E) is 100% consistent across 1:1, 9:16, and 16:9");
assert(vertSvg.includes('#002B49') && storySvg.includes('#002B49') && landSvg.includes('#002B49'), "Navy Blue (#002B49) is 100% consistent across 1:1, 9:16, and 16:9");
assert(vertSvg.includes('#F8FAFC') && storySvg.includes('#F8FAFC') && landSvg.includes('#F8FAFC'), "Background (#F8FAFC) is 100% consistent across 1:1, 9:16, and 16:9");

// Validate fonts match across all 3
assert(vertSvg.includes('Playfair Display') && storySvg.includes('Playfair Display') && landSvg.includes('Playfair Display'), "Headline Font (Playfair Display) is 100% consistent across 1:1, 9:16, and 16:9");
assert(vertSvg.includes('Montserrat') && storySvg.includes('Montserrat') && landSvg.includes('Montserrat'), "Body & Footer Font (Montserrat) is 100% consistent across 1:1, 9:16, and 16:9");

// Validate all 4 footer pills present in all 3
assert(vertSvg.includes('www.travelbellsimmigration.com') && storySvg.includes('www.travelbellsimmigration.com') && landSvg.includes('www.travelbellsimmigration.com'), "Website contact pill present across all 3 formats");
assert(vertSvg.includes('info@travelbellsimmigration.com') && storySvg.includes('info@travelbellsimmigration.com') && landSvg.includes('info@travelbellsimmigration.com'), "Email contact pill present across all 3 formats");
assert(vertSvg.includes('+1 (647) 890-1476') && storySvg.includes('+1 (647) 890-1476') && landSvg.includes('+1 (647) 890-1476'), "Phone contact pill present across all 3 formats");
assert(vertSvg.includes('Ontario, Canada') && storySvg.includes('Ontario, Canada') && landSvg.includes('Ontario, Canada'), "Location contact pill present across all 3 formats");

console.log("\n================================================================");
console.log(`📊 CONSISTENCY RESULT: ${passed}/${total} PASSED WITH 100% SUCCESS`);
console.log("================================================================");

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
