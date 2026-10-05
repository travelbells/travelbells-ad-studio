const http = require('http');
const fs = require('fs');
const path = require('path');

async function testAutumnPictures() {
  console.log('Testing /api/generate-ai-image for prompt: "autumn pictures"...');
  
  const postData = JSON.stringify({ prompt: 'autumn pictures' });
  const req = http.request({
    hostname: 'localhost',
    port: 3007,
    path: '/api/generate-ai-image',
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
        console.log('API Response Success:', json.success);
        console.log('Variations returned count:', json.variations ? json.variations.length : 0);
        if (json.variations) {
          json.variations.forEach((v, idx) => {
            console.log(`Variation #${idx+1} (${v.badge}):`, v.url);
          });
        }
      } catch (e) {
        console.error('Error parsing response:', e.message);
      }
    });
  });

  req.write(postData);
  req.end();
}

testAutumnPictures();
