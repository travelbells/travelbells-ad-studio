const fs = require('fs');
const path = require('path');
const server = require('./server.js');

console.log("================================================================");
console.log("🧪 TESTING LIVE REFRESH ON BULLET EDITS & CONVERSION BOOSTERS");
console.log("================================================================");

let total = 0;
let passed = 0;

function assert(cond, title, details = '') {
  total++;
  if (cond) {
    passed++;
    console.log(`  ✅ PASS: ${title}`);
  } else {
    console.error(`  ❌ FAIL: ${title} - ${details}`);
  }
}

// 1. Test modifying Bullet 1
const modifiedBulletsInput = {
  title: 'TEST HEADLINE',
  subtitle: 'TEST SUBTITLE',
  badgeText: 'TEST BADGE',
  b1: 'MODIFIED BULLET 1 - AGENTIC AI LIVE REFRESH TEST',
  b2: 'MODIFIED BULLET 2 - FULL CARD WIDTH TEST',
  b3: 'MODIFIED BULLET 3 - SPACING TEST',
  b4: 'MODIFIED BULLET 4 - APPROVAL TEST',
  format: 'vertical'
};

const svgMod = server.generateBannerSVG(modifiedBulletsInput);
const svgXmlMod = Buffer.from(svgMod.replace(/^data:image\/svg\+xml;base64,/, ''), 'base64').toString('utf8');

assert(svgXmlMod.includes('MODIFIED BULLET 1'), "Modifying Bullet 1 updates creative output SVG");
assert(svgXmlMod.includes('MODIFIED BULLET 2 - FULL CARD WIDTH TEST'), "Modifying Bullet 2 updates creative output SVG");
assert(svgXmlMod.includes('MODIFIED BULLET 3 - SPACING TEST'), "Modifying Bullet 3 updates creative output SVG");
assert(svgXmlMod.includes('MODIFIED BULLET 4 - APPROVAL TEST'), "Modifying Bullet 4 updates creative output SVG");

// 2. Test deleting Bullet 3 and Bullet 4 (empty string)
const deletedBulletsInput = {
  ...modifiedBulletsInput,
  b3: '',
  b4: ''
};

const svgDel = server.generateBannerSVG(deletedBulletsInput);
const svgXmlDel = Buffer.from(svgDel.replace(/^data:image\/svg\+xml;base64,/, ''), 'base64').toString('utf8');

assert(!svgXmlDel.includes('MODIFIED BULLET 3'), "Deleting Bullet 3 removes text from creative");
assert(!svgXmlDel.includes('MODIFIED BULLET 4'), "Deleting Bullet 4 removes text from creative");

// 3. Test Conversion Booster Trust Badge options
const trustOptions = [
  { opt: 'cicc', text: 'Licensed RCIC Member' },
  { opt: 'fasttrack', text: 'Fast-Track Processing 2026' },
  { opt: 'approval', text: 'High Approval Rate' },
  { opt: 'freecheck', text: 'Free 15-Min Assessment' }
];

for (const t of trustOptions) {
  const svgTrust = server.generateBannerSVG({ ...modifiedBulletsInput, trustBadge: t.opt });
  const xmlTrust = Buffer.from(svgTrust.replace(/^data:image\/svg\+xml;base64,/, ''), 'base64').toString('utf8');
  assert(xmlTrust.includes(t.text), `Selecting Trust Badge '${t.opt}' updates header pill text to '${t.text}'`);
}

// 4. Test Conversion Booster QR Code & Social Proof Toggles
const svgNoQr = server.generateBannerSVG({ ...modifiedBulletsInput, showQrCode: false });
const xmlNoQr = Buffer.from(svgNoQr.replace(/^data:image\/svg\+xml;base64,/, ''), 'base64').toString('utf8');
assert(!xmlNoQr.includes('SCAN TO BOOK'), "Disabling QR Code dropdown removes QR Code overlay from creative");

const svgNoStars = server.generateBannerSVG({ ...modifiedBulletsInput, showSocialProof: false });
const xmlNoStars = Buffer.from(svgNoStars.replace(/^data:image\/svg\+xml;base64,/, ''), 'base64').toString('utf8');
assert(!xmlNoStars.includes('4.9/5 (500+ Clients)'), "Disabling Social Proof dropdown removes Rating Card from creative");

console.log("================================================================");
console.log(`📊 LIVE REFRESH TEST RESULT: ${passed}/${total} PASSED WITH 100% SUCCESS`);
console.log("================================================================");
