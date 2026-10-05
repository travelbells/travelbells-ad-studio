const fs = require('fs');

async function testMakeDispatch() {
  console.log('1. Requesting generated mobile banner image...');
  const bannerRes = await fetch('http://127.0.0.1:3007/api/generate-puppeteer-banner', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'WORK IN CANADA AS A REGISTERED NURSE',
      subtitle: 'Express Entry & Provincial Nominee Pathway Available',
      badge: 'HEALTHCARE LMIA & PR',
      bullet1: 'Direct PR Pathway for Nurses',
      bullet2: 'Fast Track Visa Processing',
      bullet3: 'Family Sponsorship Included',
      phone: '+1 (647) 890-1476',
      email: 'info@travelbellsimmigration.com',
      website: 'www.travelbellsimmigration.com',
      ratio: '1:1',
      topicPhotoUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&auto=format&fit=crop&q=80'
    })
  });

  const bannerJson = await bannerRes.json();
  const bannerDataUrl = bannerJson.dataUri;

  console.log('2. Dispatching complete campaign to Make.com scenario webhook...');
  const dispatchRes = await fetch('http://127.0.0.1:3007/api/webhook-dispatch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      webhookUrl: 'https://hook.us2.make.com/pa5tbxkdqpesgve7se63k5nrqehcagc2',
      targetChannel: 'make_n8n',
      headline: 'WORK IN CANADA AS A REGISTERED NURSE',
      subtitle: 'Express Entry & Provincial Nominee Pathway Available',
      bannerDataUrl: bannerDataUrl,
      copy: `🇨🇦 WORK IN CANADA AS A REGISTERED NURSE\n\nExpress Entry & Provincial Nominee Pathway Available!\n\nKey Highlights:\n• Accredited Diploma & Master's Degree options across Canada\n• Flexible admission options for low IELTS / CELPIP scores\n• Spouse Open Work Permit (SOWP) eligibility included\n• Maintain legal status & transition to Permanent Residency (PR)\n\n👉 Book Your Official RCIC Strategy Consultation Today: https://bookings.travelbellsimmigration.com\n\n📞 Phone: +1 (647) 890-1476\n📧 Email: info@travelbellsimmigration.com\n🇨🇦 Licensed RCIC CICC Member Firm`,
      language: 'en'
    })
  });

  const dispatchJson = await dispatchRes.json();
  console.log('Dispatch Response:', JSON.stringify(dispatchJson, null, 2));
}

testMakeDispatch().catch(err => {
  console.error('Error in Make.com dispatch test:', err);
  process.exit(1);
});
