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

const dataUri = generateBannerSVG({ ...baseEnParams, format: 'vertical' });
const base64Content = dataUri.replace('data:image/svg+xml;base64,', '');
const svgText = Buffer.from(base64Content, 'base64').toString('utf-8');

fs.writeFileSync('/Users/user/.gemini/antigravity/scratch/test1_debug.svg', svgText);
console.log("Saved test1_debug.svg. Length:", svgText.length);

// Check if XML has any syntax errors or unescaped characters
const unescapedAmp = (svgText.match(/&(?!amp;|lt;|gt;|quot;|apos;|#\d+;)/g) || []);
console.log("Unescaped ampersands found:", unescapedAmp.length);

const unescapedLt = (svgText.match(/<(?!\/?(svg|defs|style|clipPath|rect|filter|feDropShadow|g|image|text|tspan|circle|path)\b)/gi) || []);
console.log("Unexpected tags found:", unescapedLt);
