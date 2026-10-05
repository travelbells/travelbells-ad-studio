const fs = require('fs');

async function testDirectBanner() {
  const res = await fetch('http://127.0.0.1:3007/api/generate-puppeteer-banner', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'WORK IN CANADA AS A REGISTERED NURSE',
      subtitle: 'Express Entry & Provincial Nominee Pathway Available',
      badge: 'HEALTHCARE LMIA & PR',
      bullet1: 'Accredited Diploma & Master\'s Degree options across Canada',
      bullet2: 'Flexible admission options for low IELTS / CELPIP scores',
      bullet3: 'Spouse Open Work Permit (SOWP) eligibility included',
      phone: '+1 (647) 890-1476',
      email: 'info@travelbellsimmigration.com',
      website: 'www.travelbellsimmigration.com',
      locationText: 'Ontario, Canada • Licensed CICC Member',
      ratio: '1:1',
      topicPhotoUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&auto=format&fit=crop&q=80'
    })
  });

  const json = await res.json();
  const base64Data = json.dataUri.replace(/^data:image\/png;base64,/, '');
  fs.writeFileSync('scratch/direct_banner.png', base64Data, 'base64');
  console.log('Successfully saved scratch/direct_banner.png. Size:', fs.statSync('scratch/direct_banner.png').size);
}

testDirectBanner().catch(console.error);
