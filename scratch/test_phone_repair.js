const fs = require('fs');

async function testPhoneRepairCreative() {
  console.log('--- Testing Phone Repair Creative Generation ---');

  // 1. Auto-generate campaign with Phone Repair prompt
  const res = await fetch('http://127.0.0.1:3007/api/auto-generate-campaign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: 'Work in Canada as a Phone & Cellphone Repair Technician with Work Permit',
      customPhotoUrl: 'phone_repair'
    })
  });
  const data = await res.json();
  console.log('Success:', data.success);
  console.log('EN Headline:', data.campaign.en.title);
  console.log('EN Badge:', data.campaign.en.badgeText);
  console.log('EN Bullets:', data.campaign.en.bullets);

  // 2. Render 300 DPI Puppeteer Banner
  const res2 = await fetch('http://127.0.0.1:3007/api/generate-puppeteer-banner', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: data.campaign.en.title,
      subtitle: data.campaign.en.subtitle,
      badgeText: data.campaign.en.badgeText,
      b1: data.campaign.en.bullets[0],
      b2: data.campaign.en.bullets[1],
      b3: data.campaign.en.bullets[2],
      b4: data.campaign.en.bullets[3],
      format: 'vertical',
      customPhotoUrl: 'phone_repair'
    })
  });
  const data2 = await res2.json();
  const base64 = data2.dataUri.replace(/^data:image\/png;base64,/, '');
  fs.writeFileSync('scratch/phone_repair_creative.png', base64, 'base64');
  console.log('Saved scratch/phone_repair_creative.png. File size:', fs.statSync('scratch/phone_repair_creative.png').size);
}

testPhoneRepairCreative().catch(console.error);
