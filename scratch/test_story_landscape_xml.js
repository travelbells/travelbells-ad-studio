const { generateBannerSVG, autoGenerateBilingualCampaign } = require('../server.js');
const fs = require('fs');

const prompt = "Work Permit Ending? Don't Exit, Upgrade to Study Visa with PGWP pathway in Canada";
const campaignData = autoGenerateBilingualCampaign({ tagline: prompt, prompt });

const baseEnParams = {
  title: campaignData.en.title,
  subtitle: campaignData.en.subtitle,
  badgeText: campaignData.en.badgeText,
  language: 'en',
  b1: campaignData.en.bullets[0],
  b2: campaignData.en.bullets[1],
  b3: campaignData.en.bullets[2],
  b4: campaignData.en.bullets[3],
  tagline: prompt
};

['vertical', 'story', 'landscape'].forEach(fmt => {
  const dataUri = generateBannerSVG({ ...baseEnParams, format: fmt });
  const base64Content = dataUri.replace('data:image/svg+xml;base64,', '');
  const svgText = Buffer.from(base64Content, 'base64').toString('utf-8');

  fs.writeFileSync(`/Users/user/.gemini/antigravity/scratch/test_${fmt}.svg`, svgText);
  
  const unescapedAmp = (svgText.match(/&(?!amp;|lt;|gt;|quot;|apos;|#\d+;)/g) || []);
  console.log(`Format [${fmt}]: SVG length = ${svgText.length}, Unescaped ampersands = ${unescapedAmp.length}`);
  if (unescapedAmp.length > 0) {
    console.log(`Unescaped ampersand matches in ${fmt}:`, unescapedAmp);
  }
});
