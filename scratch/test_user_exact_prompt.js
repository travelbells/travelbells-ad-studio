const http = require('http');
const fs = require('fs');
const path = require('path');

const userExactPrompt = "Study short courses; PSW,ECEA,PHARMACY ASSISTANT ,PHILABOTOMY, DURATIOIN 4 TO 6 MONTHS.PR READY";

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

async function testUserPrompt() {
  console.log("=================================================");
  console.log("🧪 TESTING USER'S EXACT SCREENSHOT MESSAGE 🧪");
  console.log(`Prompt: "${userExactPrompt}"`);
  console.log("=================================================");

  const start = Date.now();
  const res = await post('/api/auto-generate-campaign', { tagline: userExactPrompt, prompt: userExactPrompt });
  const duration = Date.now() - start;

  console.log(`⏱️ Response Time: ${duration} ms (Lightning Fast!)`);
  
  if (res.success && res.campaign) {
    console.log(`✅ SUCCESS: Campaign Generated!`);
    console.log(`   Title (EN): "${res.campaign.en.title}"`);
    console.log(`   Subtitle (EN): "${res.campaign.en.subtitle}"`);
    console.log(`   Badge (EN): "${res.campaign.en.badgeText}"`);
    console.log(`   Bullets (EN):\n     - ${res.campaign.en.bullets.join('\n     - ')}`);
    console.log(`\n   Title (FR): "${res.campaign.fr.title}"`);
    console.log(`   Subtitle (FR): "${res.campaign.fr.subtitle}"`);
    console.log(`\n   Graphics Data URIs Generated:`);
    console.log(`     - Feed (1:1): ${res.graphics.en.vertical.substring(0, 50)}...`);
    console.log(`     - Story (9:16): ${res.graphics.en.story.substring(0, 50)}...`);
    console.log(`     - Banner (16:9): ${res.graphics.en.landscape.substring(0, 50)}...`);

    // Write generated graphic URI to scratch artifact image for preview
    const svgData = decodeURIComponent(res.graphics.en.vertical.replace('data:image/svg+xml;charset=utf-8,', ''));
    fs.writeFileSync(path.join(__dirname, 'user_exact_prompt_creative.svg'), svgData);
    console.log(`💾 Saved preview SVG graphic to scratch/user_exact_prompt_creative.svg`);
  } else {
    console.log(`❌ FAILED:`, res);
  }
}

testUserPrompt().catch(err => {
  console.error("Test execution error:", err);
});
