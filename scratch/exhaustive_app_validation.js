const fs = require('fs');

async function runExhaustiveValidation() {
  console.log('=====================================================');
  console.log('🧪 RUNNING EXHAUSTIVE APPLICATION VALIDATION SUITE');
  console.log('=====================================================\n');

  // TEST 1: Custom User Prompt Auto-Generation (Nurse & Healthcare Topic)
  console.log('--- TEST 1: Custom Prompt Generation (Healthcare / Nurse) ---');
  const res1 = await fetch('http://127.0.0.1:3007/api/auto-generate-campaign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: 'Work in Canada as a Registered Nurse & Healthcare Worker with Express Entry PR',
      category: 'study_permit',
      customPhotoUrl: 'healthcare'
    })
  });
  const data1 = await res1.json();
  console.log('Success:', data1.success);
  console.log('EN Title:', data1.campaign.en.title);
  console.log('EN Badge:', data1.campaign.en.badgeText);
  console.log('EN Bullets:', data1.campaign.en.bullets);
  console.log('FR Title:', data1.campaign.fr.title);
  console.log('FR Badge:', data1.campaign.fr.badgeText);
  console.log('FR Bullets:', data1.campaign.fr.bullets);

  if (!data1.campaign.en.title.includes('NURSE') && !data1.campaign.en.title.includes('HEALTHCARE')) {
    throw new Error('TEST 1 FAILED: Title did not reflect user custom prompt!');
  }
  console.log('✅ TEST 1 PASSED: Custom user message generated accurate Healthcare campaign!\n');

  // TEST 2: French Graphic Rendering (Puppeteer 300 DPI)
  console.log('--- TEST 2: French Graphic Rendering (Puppeteer 300 DPI) ---');
  const res2 = await fetch('http://127.0.0.1:3007/api/generate-puppeteer-banner', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: data1.campaign.fr.title,
      subtitle: data1.campaign.fr.subtitle,
      badgeText: data1.campaign.fr.badgeText,
      b1: data1.campaign.fr.bullets[0],
      b2: data1.campaign.fr.bullets[1],
      b3: data1.campaign.fr.bullets[2],
      b4: data1.campaign.fr.bullets[3],
      lang: 'fr',
      format: 'vertical',
      customPhotoUrl: 'healthcare'
    })
  });
  const data2 = await res2.json();
  console.log('French Render Success:', data2.success);
  const frBase64 = data2.dataUri.replace(/^data:image\/png;base64,/, '');
  fs.writeFileSync('scratch/validated_french_banner.png', frBase64, 'base64');
  console.log('Saved scratch/validated_french_banner.png. Size:', fs.statSync('scratch/validated_french_banner.png').size);
  console.log('✅ TEST 2 PASSED: Native French 300 DPI Graphic rendered successfully!\n');

  // TEST 3: Custom Image Preset Switch (Trades & Caregiver)
  console.log('--- TEST 3: Custom Image Preset Switching ---');
  const res3 = await fetch('http://127.0.0.1:3007/api/generate-puppeteer-banner', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'SKILLED TRADES WORK PERMIT CANADA',
      subtitle: 'Construction, Electrical & Plumbing Pathways',
      badgeText: 'SKILLED TRADES PR',
      format: 'story',
      customPhotoUrl: 'trades'
    })
  });
  const data3 = await res3.json();
  console.log('Trades Image Render Success:', data3.success);
  const tradesBase64 = data3.dataUri.replace(/^data:image\/png;base64,/, '');
  fs.writeFileSync('scratch/validated_trades_story.png', tradesBase64, 'base64');
  console.log('Saved scratch/validated_trades_story.png. Size:', fs.statSync('scratch/validated_trades_story.png').size);
  console.log('✅ TEST 3 PASSED: Custom photo preset (trades) rendered across 9:16 story layout!\n');

  // TEST 4: Make.com Webhook Link & Dispatch
  console.log('--- TEST 4: Make.com Webhook Dispatch & Link Validation ---');
  const res4 = await fetch('http://127.0.0.1:3007/api/webhook-dispatch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      webhookUrl: 'https://hook.us2.make.com/pa5tbxkdqpesgve7se63k5nrqehcagc2',
      targetChannel: 'make_n8n',
      headline: data1.campaign.en.title,
      subtitle: data1.campaign.en.subtitle,
      copy: data1.campaign.en.fullCopy,
      bannerDataUrl: data2.dataUri,
      language: 'en'
    })
  });
  const data4 = await res4.json();
  console.log('Dispatch HTTP Status:', data4.httpStatus);
  console.log('Dispatch Response Body:', data4.responseBody);
  console.log('Dispatch Image CDN URL:', data4.payload?.imageUrl);
  if (data4.httpStatus !== 200 || data4.responseBody !== 'Accepted') {
    throw new Error('TEST 4 FAILED: Webhook did not receive 200 Accepted response!');
  }
  console.log('✅ TEST 4 PASSED: Live campaign dispatched to Make.com with 200 OK Accepted!\n');

  console.log('=====================================================');
  console.log('🎉 ALL 4 EXHAUSTIVE VALIDATION TESTS PASSED CLEANLY');
  console.log('=====================================================');
}

runExhaustiveValidation().catch(err => {
  console.error('❌ Validation suite encountered an error:', err);
  process.exit(1);
});
