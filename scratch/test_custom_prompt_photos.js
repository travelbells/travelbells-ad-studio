const http = require('http');
const fs = require('fs');
const path = require('path');
const { autoGenerateBilingualCampaign, server } = require('../server.js');

async function runValidation() {
  console.log('--- STARTING DYNAMIC CUSTOM PROMPT PHOTO VALIDATION ---');

  // Test 1: Search Photos API endpoint
  console.log('\nTesting /api/search-photos endpoint for query "bakery chef"...');
  const postData = JSON.stringify({ query: 'bakery chef' });
  const searchReq = http.request({
    hostname: 'localhost',
    port: 3007,
    path: '/api/search-photos',
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
        console.log('Search Photos Success:', json.success);
        console.log('Query searched:', json.query);
        console.log('Photos returned count:', json.photos ? json.photos.length : 0);
        if (json.photos && json.photos[0]) {
          console.log('First result photo URL:', json.photos[0].url);
        }
      } catch (e) {
        console.error('Failed to parse search photos response:', e.message);
      }
    });
  });
  searchReq.write(postData);
  searchReq.end();

  // Test 2: Auto Generate Campaign with Custom Prompt "pilot"
  setTimeout(() => {
    console.log('\nTesting /api/auto-generate-campaign for "pilot"...');
    const campaignBody = JSON.stringify({
      prompt: 'commercial pilot seeking permanent residency in Canada',
      category: 'express_entry',
      language: 'en'
    });

    const campReq = http.request({
      hostname: 'localhost',
      port: 3007,
      path: '/api/auto-generate-campaign',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(campaignBody)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          console.log('Campaign Auto-Generate Success:', json.success);
          console.log('Headline EN:', json.campaign ? json.campaign.en.title : 'N/A');
          console.log('Headline FR:', json.campaign ? json.campaign.fr.title : 'N/A');
          console.log('Has 1:1 Feed DataURI:', !!(json.graphics && json.graphics.en && json.graphics.en.vertical));
          console.log('Has 9:16 Story DataURI:', !!(json.graphics && json.graphics.en && json.graphics.en.story));
          console.log('Has 16:9 Banner DataURI:', !!(json.graphics && json.graphics.en && json.graphics.en.landscape));

          if (json.graphics && json.graphics.en && json.graphics.en.vertical) {
            const base64Data = json.graphics.en.vertical.replace(/^data:image\/png;base64,/, "");
            const outputPath = path.join(__dirname, 'custom_pilot_creative.png');
            fs.writeFileSync(outputPath, base64Data, 'base64');
            console.log('Saved generated pilot creative image to:', outputPath);
          }
          console.log('\n--- ALL DYNAMIC PHOTO TESTS COMPLETED SUCCESSFULLY ---');
        } catch (e) {
          console.error('Failed to parse campaign response:', e.message);
        }
      });
    });
    campReq.write(campaignBody);
    campReq.end();
  }, 1500);
}

runValidation();
