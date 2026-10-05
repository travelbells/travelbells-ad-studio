const { generateBannerSVG, autoGenerateBilingualCampaign } = require('../server.js');
const fs = require('fs');
const path = require('path');

const prompts = [
  "Work Permit Ending? Don't Exit, Upgrade to Study Visa with PGWP pathway in Canada",
  "Short term courses in Canada",
  "autumn pictures",
  "Phone repair tech",
  "B2B Corporate LMIA"
];

for (let i = 0; i < prompts.length; i++) {
  const prompt = prompts[i];
  console.log(`\n========================================`);
  console.log(`Testing prompt ${i+1}: "${prompt}"`);
  
  const campaignData = autoGenerateBilingualCampaign({ tagline: prompt, prompt });
  console.log("EN Title:", campaignData.en.title);
  console.log("EN Subtitle:", campaignData.en.subtitle);
  console.log("EN Bullets:", campaignData.en.bullets);

  const baseParams = {
    title: campaignData.en.title,
    subtitle: campaignData.en.subtitle,
    badgeText: campaignData.en.badgeText,
    b1: campaignData.en.bullets[0],
    b2: campaignData.en.bullets[1],
    b3: campaignData.en.bullets[2],
    b4: campaignData.en.bullets[3],
    tagline: prompt,
    language: 'en'
  };

  ['vertical', 'story', 'landscape'].forEach(fmt => {
    const dataUri = generateBannerSVG({ ...baseParams, format: fmt });
    const base64Content = dataUri.replace('data:image/svg+xml;base64,', '');
    const svgText = Buffer.from(base64Content, 'base64').toString('utf-8');

    console.log(`Format [${fmt}]: Data URI length = ${dataUri.length}, SVG length = ${svgText.length}`);

    // Check for obvious invalid XML syntax or unescaped characters in SVG
    if (svgText.includes('<foreignObject>')) {
      console.warn(`WARNING: [${fmt}] contains foreignObject! Chrome may block this in <img>!`);
    }
    
    // Save SVG file to test directory
    const fileName = `test_${i+1}_${fmt}.svg`;
    fs.writeFileSync(path.join(__dirname, fileName), svgText);
  });
}

console.log("\nAll test SVGs generated in scratch/");
