const fs = require('fs');
const path = require('path');
const { generateBannerSVG } = require('./server.js');

function dataUriToBuffer(dataUri) {
  if (!dataUri) return Buffer.from('');
  if (dataUri.startsWith('data:image/svg+xml;utf8,')) {
    return Buffer.from(decodeURIComponent(dataUri.replace('data:image/svg+xml;utf8,', '')));
  }
  if (dataUri.startsWith('data:image/svg+xml;base64,')) {
    return Buffer.from(dataUri.replace('data:image/svg+xml;base64,', ''), 'base64');
  }
  if (dataUri.startsWith('data:')) {
    const parts = dataUri.split(',');
    return Buffer.from(parts[1], 'base64');
  }
  return Buffer.from(dataUri);
}

async function run() {
  console.log('🚀 Generating Punjabi (PA), Hindi (HI) & Arabic (AR) Visual SVG Proofs...');

  const baseParams = {
    title: "SKILLED WORKER EXPRESS ENTRY & ONTARIO OINP DRAWS FAST-TRACK CANADIAN PERMANENT RESIDENCY 2026",
    subtitle: "Regulated RCIC Legal Guidance & Application Support Across Canada",
    badgeText: "SURREY BC PNP TRADES",
    b1: "Targeted PR pathways & Work Permit options across Canada",
    b2: "Employer job offer & Provincial Nomination (PNP) assessment",
    b3: "Spouse Open Work Permit (SOWP) eligibility for accompanying family",
    b4: "Complete legal representation by licensed RCIC consultants",
    footerCta: "BOOK YOUR OFFICIAL RCIC STRATEGY CONSULTATION TODAY",
    format: "vertical",
    customPhotoUrl: "professional"
  };

  // 1. Punjabi (PA) Proof
  console.log('📸 Generating Punjabi (PA) Proof SVG...');
  const svgPA = generateBannerSVG({ ...baseParams, language: 'pa', lang: 'pa' });
  const rawSvgPA = dataUriToBuffer(svgPA).toString('utf-8');
  fs.writeFileSync(path.join(__dirname, 'punjabi_creative_proof.svg'), rawSvgPA);
  console.log('  ✅ Saved Punjabi Proof SVG:', path.join(__dirname, 'punjabi_creative_proof.svg'));

  // 2. Hindi (HI) Proof
  console.log('📸 Generating Hindi (HI) Proof SVG...');
  const svgHI = generateBannerSVG({ ...baseParams, language: 'hi', lang: 'hi' });
  const rawSvgHI = dataUriToBuffer(svgHI).toString('utf-8');
  fs.writeFileSync(path.join(__dirname, 'hindi_creative_proof.svg'), rawSvgHI);
  console.log('  ✅ Saved Hindi Proof SVG:', path.join(__dirname, 'hindi_creative_proof.svg'));

  // 3. Arabic (AR) Proof
  console.log('📸 Generating Arabic (AR) Proof SVG...');
  const svgAR = generateBannerSVG({ ...baseParams, language: 'ar', lang: 'ar' });
  const rawSvgAR = dataUriToBuffer(svgAR).toString('utf-8');
  fs.writeFileSync(path.join(__dirname, 'arabic_creative_proof.svg'), rawSvgAR);
  console.log('  ✅ Saved Arabic Proof SVG:', path.join(__dirname, 'arabic_creative_proof.svg'));

  console.log('🎉 All SVG proofs generated successfully!');
  process.exit(0);
}

run().catch(err => {
  console.error('Error generating proofs:', err);
  process.exit(1);
});
