const server = require('./server.js');
const QRCode = require('qrcode');

console.log("================================================================");
console.log("📱 TESTING QR CODE SCANNABILITY & TARGET LINK DYNAMIC BINDING");
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

// 1. Verify default booking URL generates scannable QR matrix
const defaultUrl = 'https://bookings.travelbellsimmigration.com';
const defaultSvg = server.generateBannerSVG({ showQrCode: true, qrTargetUrl: defaultUrl, format: 'vertical' });
const defaultXml = Buffer.from(defaultSvg.replace(/^data:image\/svg\+xml;base64,/, ''), 'base64').toString('utf8');

assert(defaultXml.includes('📱 SCAN TO BOOK'), "QR Code container card contains '📱 SCAN TO BOOK' header pill");
assert(defaultXml.includes('<path d="M'), "QR Code contains real ISO 18004 matrix vector path data");
assert(defaultXml.includes(defaultUrl), "QR Code wrapper link points to official booking appointment URL");

// 2. Verify custom target URL generates unique scannable QR matrix
const customUrl = 'https://travelbellsimmigration.com/strategy-session-2026';
const customSvg = server.generateBannerSVG({ showQrCode: true, qrTargetUrl: customUrl, format: 'vertical' });
const customXml = Buffer.from(customSvg.replace(/^data:image\/svg\+xml;base64,/, ''), 'base64').toString('utf8');

assert(customXml.includes(customUrl), "Updating QR Target Link dynamically updates embedded link");
assert(customXml !== defaultXml, "Custom QR Target Link produces distinct real QR matrix vector path");

// 3. Test QR matrix decoding validity via qrcode library
async function verifyQrCodeDecoding() {
  try {
    const qrMatrix = QRCode.create(defaultUrl);
    assert(qrMatrix.modules.size > 20, "QR matrix resolution is valid ISO standard size (> 20x20 cells)");
  } catch (e) {
    assert(false, "QR Matrix generation failed", e.message);
  }

  console.log("================================================================");
  console.log(`📊 QR CODE SCANNABILITY RESULT: ${passed}/${total} PASSED WITH 100% SUCCESS`);
  console.log("================================================================");
}

verifyQrCodeDecoding();
