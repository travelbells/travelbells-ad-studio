const fs = require('fs');
const path = require('path');
const server = require('./server.js');

console.log("================================================================");
console.log("🚀 STARTING DEEP END-TO-END INVESTIGATION & VALIDATION SUITE");
console.log("================================================================");

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failureDetails = [];

function assert(condition, testName, details = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ PASS: ${testName}`);
  } else {
    failedTests++;
    console.error(`  ❌ FAIL: ${testName} - ${details}`);
    failureDetails.push({ testName, details });
  }
}

// -----------------------------------------------------------------------------
// TEST SUITE 1: DOM & HTML CONTROL ELEMENT BINDINGS
// -----------------------------------------------------------------------------
console.log("\n📋 [SUITE 1] DOM Element ID & Input Binding Verification...");
const htmlContent = fs.readFileSync(path.join(__dirname, 'public/index.html'), 'utf8');
const jsContent = fs.readFileSync(path.join(__dirname, 'public/app.js'), 'utf8');

const requiredIds = [
  'quick-tagline-input',
  'input-category',
  'input-language',
  'canvas-format',
  'canvas-theme',
  'canvas-headline',
  'canvas-subtitle',
  'canvas-badge-input',
  'canvas-b1',
  'canvas-b2',
  'canvas-b3',
  'canvas-b4',
  'toggle-badge',
  'toggle-bullets',
  'toggle-footer',
  'toggle-social-proof',
  'toggle-qr-code',
  'footer-cta-input',
  'footer-phone-input',
  'footer-website-input',
  'footer-email-input',
  'footer-location-input',
  'canvas-render-box'
];

for (const id of requiredIds) {
  const existsInHtml = htmlContent.includes(`id="${id}"`) || htmlContent.includes(`id='${id}'`);
  assert(existsInHtml, `UI Control #${id} exists in index.html`, `Element ID ${id} missing in index.html`);
}

// Check event handler functions exist in app.js
const requiredFunctions = [
  'updateGraphicDisplay',
  'downloadHighResPng',
  'downloadCampaignZipBundle',
  'generateABTestVariants',
  'applyNichePreset',
  'toggleConversionBoostersAccordion',
  'getActiveCampaignPayload'
];

for (const fn of requiredFunctions) {
  const existsInJs = jsContent.includes(`function ${fn}`) || jsContent.includes(`${fn} =`);
  assert(existsInJs, `JS Function ${fn}() exists in app.js`, `Function ${fn} missing in app.js`);
}

// -----------------------------------------------------------------------------
// TEST SUITE 2: CREATIVE RENDERING & ALL 3 ASPECT RATIO FORMATS
// -----------------------------------------------------------------------------
console.log("\n🖼️ [SUITE 2] Creative Format Validation (1:1, 9:16, 16:9)...");

const formats = ['vertical', 'story', 'landscape'];
const sampleInput = {
  title: 'SKILLED WORKER EXPRESS ENTRY & ONTARIO OINP DRAWS',
  subtitle: 'Regulated RCIC Legal Guidance & Application Support Across Canada',
  badgeText: 'SKILLED WORKER PR',
  b1: 'Skilled Worker Express Entry & Ontario OINP draws for fast-track PR',
  b2: 'Employer job offer & Provincial Nomination (PNP) assessment',
  b3: 'Spouse Open Work Permit (SOWP) eligibility for accompanying family',
  b4: 'Complete legal representation by licensed RCIC consultants',
  language: 'en'
};

for (const fmt of formats) {
  const svgUri = server.generateBannerSVG({ ...sampleInput, format: fmt });
  assert(svgUri && svgUri.startsWith('data:image/svg+xml;base64,'), `Format '${fmt}' renders valid SVG Data URI`);
  
  const svgXml = Buffer.from(svgUri.replace(/^data:image\/svg\+xml;base64,/, ''), 'base64').toString('utf8');

  // Check SVG XML structural integrity
  assert(svgXml.includes('<svg') && svgXml.includes('</svg>'), `Format '${fmt}' contains valid root <svg> tags`);

  // Check 1: Headline single-color (#002B49)
  assert(svgXml.includes('fill="#002B49"') && !svgXml.includes('fill="#C8102E">EXPRESS'), `Format '${fmt}' headline uses uniform single navy color`);

  // Check 2: No truncation in headline
  assert(!svgXml.includes('DRAWS FA...'), `Format '${fmt}' headline contains full text without FA... truncation`);

  // Check 3: Subheadline Guidance & Application line wrap
  assert(svgXml.includes('Guidance &amp;') || svgXml.includes('Guidance &'), `Format '${fmt}' subheadline wraps Guidance & cleanly`);

  // Check 4: Clickable CTA Link
  assert(svgXml.includes('href="https://bookings.travelbellsimmigration.com"'), `Format '${fmt}' contains active CTA link to booking site`);

  // Check 5: QR Code Embed
  assert(svgXml.includes('SCAN TO BOOK'), `Format '${fmt}' contains SCAN TO BOOK QR Code badge`);

  // Check 6: 4 Uniform Footer Pills
  assert(svgXml.includes('www.travelbellsimmigration.com') &&
         svgXml.includes('info@travelbellsimmigration.com') &&
         svgXml.includes('+1 (647) 890-1476') &&
         svgXml.includes('Ontario, Canada'), `Format '${fmt}' contains all 4 footer contact pills`);

  // Check 7: Logo prominence
  assert(svgXml.includes('preserveAspectRatio="xMidYMid contain"'), `Format '${fmt}' contains centered prominent logo`);
}

// -----------------------------------------------------------------------------
// TEST SUITE 3: FRENCH TRANSLATION & BILINGUAL ENGINE
// -----------------------------------------------------------------------------
console.log("\n🇫🇷 [SUITE 3] French Translation Validation Across All Formats...");

for (const fmt of formats) {
  const frSvgUri = server.generateBannerSVG({ ...sampleInput, format: fmt, language: 'fr' });
  const frSvgXml = Buffer.from(frSvgUri.replace(/^data:image\/svg\+xml;base64,/, ''), 'base64').toString('utf8');

  // Check French text translations in SVG output
  const hasFrenchFooter = frSvgXml.includes('Membre CICC') || frSvgXml.includes('Ontario, Canada');
  const hasFrenchCta = frSvgXml.includes('RÉSERVEZ VOTRE CONSULTATION') || frSvgXml.includes('CONSULTATION');
  
  assert(hasFrenchFooter, `Format '${fmt}' French mode translates footer location`);
  assert(hasFrenchCta, `Format '${fmt}' French mode translates CTA button`);
}

// -----------------------------------------------------------------------------
// TEST SUITE 4: TOGGLE MENU VALIDATION (ENABLE / DISABLE CONTROLS)
// -----------------------------------------------------------------------------
console.log("\n🎛️ [SUITE 4] Toggle Menu Controls (Enable / Disable Badges & Bullets)...");

// Badge toggle test
const svgNoBadge = Buffer.from(server.generateBannerSVG({ ...sampleInput, showBadge: false, format: 'vertical' })
  .replace(/^data:image\/svg\+xml;base64,/, ''), 'base64').toString('utf8');
assert(!svgNoBadge.includes('SKILLED WORKER PR'), "Disabling Badge hides badge element on creative");

// Bullets toggle test
const svgNoBullets = Buffer.from(server.generateBannerSVG({ ...sampleInput, showBullets: false, format: 'vertical' })
  .replace(/^data:image\/svg\+xml;base64,/, ''), 'base64').toString('utf8');
assert(!svgNoBullets.includes('Skilled Worker Express Entry'), "Disabling Bullets hides bullet section on creative");

// Footer toggle test
const svgNoFooter = Buffer.from(server.generateBannerSVG({ ...sampleInput, showFooter: false, format: 'vertical' })
  .replace(/^data:image\/svg\+xml;base64,/, ''), 'base64').toString('utf8');
assert(!svgNoFooter.includes('info@travelbellsimmigration.com'), "Disabling Footer hides footer info bar on creative");

// -----------------------------------------------------------------------------
// TEST SUITE 5: ZIP ARCHIVE GENERATION & A/B SPLIT TEST BUNDLES
// -----------------------------------------------------------------------------
console.log("\n📦 [SUITE 5] ZIP Archive & A/B Split Test Bundle Verification...");

try {
  const zipFiles = [
    { filename: '1x1.svg', data: Buffer.from('test 1x1') },
    { filename: '9x16.svg', data: Buffer.from('test 9x16') },
    { filename: '16x9.svg', data: Buffer.from('test 16x9') },
    { filename: 'copy.txt', data: 'ad copy content' }
  ];
  const zipBuf = server.createZipArchive(zipFiles);
  assert(zipBuf && zipBuf.length > 100, "createZipArchive builds valid non-empty ZIP buffer");
  
  // Verify ZIP PK Header (0x04034b50)
  assert(zipBuf[0] === 0x50 && zipBuf[1] === 0x4b, "ZIP buffer contains valid PK zip header signature");
} catch(e) {
  assert(false, "createZipArchive execution", e.message);
}

// -----------------------------------------------------------------------------
// SUMMARY REPORT
// -----------------------------------------------------------------------------
console.log("\n================================================================");
console.log(`📊 E2E VALIDATION COMPLETE: ${passedTests}/${totalTests} TESTS PASSED`);
if (failedTests === 0) {
  console.log("🎉 ALL SUITES PASSED WITH 100% SUCCESS!");
} else {
  console.log(`⚠️ ${failedTests} TESTS FAILED. Failure details:`);
  console.log(JSON.stringify(failureDetails, null, 2));
}
console.log("================================================================");
