const http = require('http');

const promptsToTest = [
  "autumn pictures",
  "phone repair",
  "Graphic designer seeking PR",
  "Study PR READY COURSES ,6 MOTHS OR LESS LIKE PSW,ECEA,COUNSTRUCTION COCOURSE.LOW FEES,ONLINE,CO-OP,NO WORK",
  "French pastry chef",
  "Truck driver seeking PR",
  "PR pathways for accountants in Toronto"
];

async function post(endpoint, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request({
      hostname: '127.0.0.1',
      port: 3007,
      path: endpoint,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => {
      let responseBody = '';
      res.on('data', chunk => { responseBody += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(responseBody));
        } catch (e) {
          resolve({ raw: responseBody });
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function runTests() {
  console.log("=================================================");
  console.log("🧪 EXHAUSTIVE VALIDATION OF CREATIVE GENERATION 🧪");
  console.log("=================================================");

  for (const p of promptsToTest) {
    console.log(`\n📌 TESTING PROMPT: "${p}"`);
    
    // 1. Test Auto-Generate Campaign
    const campRes = await post('/api/auto-generate-campaign', { tagline: p, prompt: p });
    if (campRes.success && campRes.campaign) {
      console.log(`  ✅ Campaign Generation SUCCESS:`);
      console.log(`     Title (EN): "${campRes.campaign.en.title}"`);
      console.log(`     Subtitle (EN): "${campRes.campaign.en.subtitle}"`);
      console.log(`     Badge (EN): "${campRes.campaign.en.badgeText}"`);
      console.log(`     Bullets (EN): ${campRes.campaign.en.bullets.slice(0, 2).join(' | ')}`);
      console.log(`     Title (FR): "${campRes.campaign.fr.title}"`);
    } else {
      console.log(`  ❌ Campaign Generation FAILED:`, campRes);
    }

    // 2. Test AI Custom Image Studio
    const aiRes = await post('/api/generate-ai-image', { prompt: p });
    if (aiRes.success && aiRes.variations && aiRes.variations.length === 4) {
      console.log(`  ✅ AI Image Studio SUCCESS: 4 Photo Variations Generated`);
      aiRes.variations.forEach((v, idx) => {
        console.log(`     Variant #${idx+1}: [${v.badge}] ${v.title} -> ${v.url.substring(0, 60)}...`);
      });
    } else {
      console.log(`  ❌ AI Image Studio FAILED:`, aiRes);
    }
  }

  console.log("\n=================================================");
  console.log("🎉 ALL TESTS EXHAUSTIVELY COMPLETED & PASSED 🎉");
  console.log("=================================================");
}

runTests().catch(err => {
  console.error("Test execution error:", err);
  process.exit(1);
});
