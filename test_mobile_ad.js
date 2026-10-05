const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const { autoGenerateBilingualCampaign } = require('./server.js');

async function testMobileCreative() {
  console.log('Requesting puppeteer banner generation from server...');

  const response = await fetch('http://127.0.0.1:3007/api/generate-puppeteer-banner', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'WORK IN CANADA AS A REGISTERED NURSE',
      subtitle: 'Express Entry & Provincial Nominee Pathway Available',
      badge: 'HEALTHCARE LMIA & PR',
      bullet1: 'Direct PR Pathway for Nurses',
      bullet2: 'Fast Track Visa Processing',
      bullet3: 'Family Sponsorship Included',
      phone: '+1 (416) 854-6016',
      email: 'info@travelbells.ca',
      website: 'www.travelbells.ca',
      ratio: '1:1',
      topicPhotoUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&auto=format&fit=crop&q=80'
    })
  });

  const json = await response.json();
  if (!json.success || !json.dataUri) {
    throw new Error('Failed to generate banner: ' + JSON.stringify(json));
  }

  const base64Data = json.dataUri.replace(/^data:image\/png;base64,/, '');
  const buffer = Buffer.from(base64Data, 'base64');

  const output1 = path.join(__dirname, 'mobile_ad_1x1.png');
  fs.writeFileSync(output1, buffer);
  console.log('Saved 1:1 mobile ad image to:', output1);

  const artifactDir = '/Users/user/.gemini/antigravity/brain/3327c370-dde2-4863-b079-2b1609643424';
  const artifactPath = path.join(artifactDir, 'mobile_ad_creative_preview.png');
  fs.writeFileSync(artifactPath, buffer);
  console.log('Copied screenshot to artifact path:', artifactPath);
}

testMobileCreative().catch(err => {
  console.error('Error running test:', err);
  process.exit(1);
});
