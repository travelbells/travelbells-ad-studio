const fs = require('fs');
const path = require('path');
const { autoGenerateBilingualCampaign, generateBannerSVG } = require('./server.js');

function dataUriToBuffer(dataUri) {
  if (!dataUri) return Buffer.from('');
  if (dataUri.startsWith('data:')) {
    const parts = dataUri.split(',');
    return Buffer.from(parts[1], 'base64');
  }
  return Buffer.from(dataUri);
}

async function generateCalgaryProofs() {
  console.log('🚀 Rendering Clean Decoded SVG Visual Proofs for Calgary Preset...');

  const campaign = autoGenerateBilingualCampaign({
    tagline: "Calgary & Alberta AAIP Accelerated Tech Stream - Direct PR for Skilled Professionals",
    category: "pnp_stream"
  });

  const baseParams = {
    prompt: "Calgary Alberta AAIP Tech Stream",
    title: campaign.en.title,
    subtitle: campaign.en.subtitle,
    badgeText: "CALGARY AAIP TECH STREAM",
    b1: campaign.en.bullets[0],
    b2: campaign.en.bullets[1],
    b3: campaign.en.bullets[2],
    b4: campaign.en.bullets[3],
    language: 'en',
    photoUrl: 'graduate'
  };

  console.log('📸 Rendering 1:1 Feed Post (1080x1080)...');
  const uri1x1 = generateBannerSVG({ ...baseParams, format: 'vertical' });
  const buf1x1 = dataUriToBuffer(uri1x1);
  fs.writeFileSync(path.join(__dirname, 'calgary_proof_1x1_feed.svg'), buf1x1);
  console.log('  ✅ Saved Decoded SVG 1:1:', path.join(__dirname, 'calgary_proof_1x1_feed.svg'));

  console.log('📸 Rendering 9:16 Story (1080x1920)...');
  const uri9x16 = generateBannerSVG({ ...baseParams, format: 'story' });
  const buf9x16 = dataUriToBuffer(uri9x16);
  fs.writeFileSync(path.join(__dirname, 'calgary_proof_9x16_story.svg'), buf9x16);
  console.log('  ✅ Saved Decoded SVG 9:16:', path.join(__dirname, 'calgary_proof_9x16_story.svg'));

  console.log('📸 Rendering 16:9 Landscape Banner (1200x630)...');
  const uri16x9 = generateBannerSVG({ ...baseParams, format: 'landscape' });
  const buf16x9 = dataUriToBuffer(uri16x9);
  fs.writeFileSync(path.join(__dirname, 'calgary_proof_16x9_banner.svg'), buf16x9);
  console.log('  ✅ Saved Decoded SVG 16:9:', path.join(__dirname, 'calgary_proof_16x9_banner.svg'));

  console.log('🎉 All Calgary Decoded Visual Proof SVGs Successfully Generated!');
  process.exit(0);
}

generateCalgaryProofs().catch(err => {
  console.error('Error generating Calgary proofs:', err);
  process.exit(1);
});
