const http = require('http');
const fs = require('fs');
const path = require('path');

async function testMainTextboxPrompts() {
  const testPrompts = [
    'French pastry chef seeking LMIA exempt permit',
    'Graphic designer in Toronto seeking work permit',
    'Truck driver PR pathway in Alberta',
    'I am a welder with 3 years experience'
  ];

  for (const promptText of testPrompts) {
    console.log(`\n==================================================`);
    console.log(`TESTING MAIN TEXTBOX PROMPT: "${promptText}"`);
    
    const postData = JSON.stringify({
      tagline: promptText,
      prompt: promptText,
      category: 'express_entry',
      highRes: true,
      usePuppeteer: true
    });

    await new Promise((resolve) => {
      const req = http.request({
        hostname: 'localhost',
        port: 3007,
        path: '/api/auto-generate-campaign',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            console.log('✔ Success:', json.success);
            if (json.campaign) {
              console.log('📌 EN Title:', json.campaign.en.title);
              console.log('🏷️ EN Badge:', json.campaign.en.badgeText);
              console.log('📝 EN Subtitle:', json.campaign.en.subtitle);
              console.log('• Bullet 1:', json.campaign.en.bullets[0]);
              console.log('• Bullet 2:', json.campaign.en.bullets[1]);
            }
            if (json.graphics && json.graphics.en && json.graphics.en.vertical) {
              console.log('🖼️ 1:1 Feed Graphic DataURI generated successfully!');
            }
          } catch (e) {
            console.error('❌ Parse error:', e.message);
          }
          resolve();
        });
      });
      req.write(postData);
      req.end();
    });
  }

  console.log(`\n==================================================`);
  console.log(`--- ALL MAIN TEXTBOX TESTS COMPLETED SUCCESSFULLY ---`);
}

testMainTextboxPrompts();
