const { autoGenerateBilingualCampaign, translateToLanguage } = require('./server.js');

console.log("================================================================");
console.log("🧪 TESTING TOPIC RELEVANCE & LINE-BY-LINE MULTI-LINGUAL ENGINE");
console.log("================================================================");

let passed = 0;
let total = 0;

function assert(cond, title, detail = '') {
  total++;
  if (cond) {
    passed++;
    console.log(`  ✅ PASS: ${title}`);
  } else {
    console.error(`  ❌ FAIL: ${title} - ${detail}`);
  }
}

// 1. Test Family Sponsorship Preset Topic Relevance
console.log("\n1️⃣  Testing 'Family Sponsorship' Preset...");
const familyResult = autoGenerateBilingualCampaign({ prompt: "Spouse & Parents Family Sponsorship with Super Visa and fast approval consultation Ontario" });

assert(familyResult.en.title.includes('FAMILY') || familyResult.en.title.includes('SPOUSE'), "Family Campaign Headline is relevant", familyResult.en.title);
assert(familyResult.en.bullets[0].toLowerCase().includes('spousal') || familyResult.en.bullets[0].toLowerCase().includes('partner'), "Family Bullet 1 is relevant", familyResult.en.bullets[0]);
assert(familyResult.en.bullets[1].toLowerCase().includes('spousal') || familyResult.en.bullets[1].toLowerCase().includes('sowp'), "Family Bullet 2 is relevant", familyResult.en.bullets[1]);
assert(familyResult.en.bullets[2].toLowerCase().includes('super visa') || familyResult.en.bullets[2].toLowerCase().includes('parents'), "Family Bullet 3 is relevant", familyResult.en.bullets[2]);
assert(!familyResult.en.bullets[1].toLowerCase().includes('pnp') && !familyResult.en.bullets[0].toLowerCase().includes('pgwp expiry'), "Family Bullets do NOT contain work permit expiry/PNP noise");

// 2. Test International Students Preset Topic Relevance
console.log("\n2️⃣  Testing 'International Students' Preset...");
const studentResult = autoGenerateBilingualCampaign({ prompt: "Work Permit Ending? Don't Exit Canada, Upgrade to Study Visa with PGWP & Spouse Work Permit pathway" });

assert(studentResult.en.title.includes('STUDY') || studentResult.en.title.includes('WORK PERMIT'), "Student Campaign Headline is relevant", studentResult.en.title);
assert(studentResult.en.bullets[0].toLowerCase().includes('diploma') || studentResult.en.bullets[0].toLowerCase().includes('degree'), "Student Bullet 1 is relevant", studentResult.en.bullets[0]);
assert(studentResult.en.bullets[1].toLowerCase().includes('ielts') || studentResult.en.bullets[1].toLowerCase().includes('admission'), "Student Bullet 2 is relevant", studentResult.en.bullets[1]);

// 3. Test Visitor to Work Permit Transition Preset
console.log("\n3️⃣  Testing 'Visitor to Work Permit' Preset...");
const visitorResult = autoGenerateBilingualCampaign({ prompt: "Convert Visitor Visa to Open Work Permit without LMIA under new 2026 Canadian IRCC public policy" });

assert(visitorResult.en.title.includes('VISITOR'), "Visitor Campaign Headline is relevant", visitorResult.en.title);
assert(visitorResult.en.bullets[0].toLowerCase().includes('visitor') || visitorResult.en.bullets[0].toLowerCase().includes('conversion'), "Visitor Bullet 1 is relevant", visitorResult.en.bullets[0]);

// 4. Test Line-by-Line Translation Engine across all 7 Languages
console.log("\n4️⃣  Testing Line-by-Line Translation Engine across 7 Languages...");
const languages = ['en', 'fr', 'pa', 'hi', 'tl', 'es', 'ar'];

for (const lang of languages) {
  const data = familyResult[lang];
  assert(data && data.title && data.subtitle && data.bullets && data.bullets.length === 4, `Campaign generated cleanly for language '${lang.toUpperCase()}'`);
  assert(data.bullets[0].length > 0 && data.bullets[1].length > 0, `Line-by-line bullets translated for '${lang.toUpperCase()}'`);
}

console.log("\n================================================================");
console.log(`📊 RESULTS: ${passed}/${total} TESTS PASSED (${Math.round(passed/total*100)}% SUCCESS RATE)`);
console.log("================================================================");

if (passed === total) process.exit(0);
else process.exit(1);
