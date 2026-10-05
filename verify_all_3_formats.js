const fs = require('fs');
const path = require('path');
const server = require('./server.js');

(async () => {
  try {
    console.log("Generating visual proof for ALL 3 FORMATS (1:1, 9:16, 16:9)...");
    const sampleData = {
      headline: "MOBILITÉ FRANCOPHONE WORK PERMIT WITHOUT LMIA FRENCH...",
      badgeText: "MOBILITÉ FRANCOPHONE PR",
      subtitle: "Regulated RCIC Legal Guidance & Application Support Across Canada",
      bullet1: "Mobilité Francophone work permit without LMIA for French speak...",
      bullet2: "Employer job offer & Provincial Nomination (PNP) assessment",
      bullet3: "Spouse Open Work Permit (SOWP) eligibility for accompanying fa...",
      bullet4: "Complete legal representation by licensed RCIC consultants",
      ctaText: "👉 BOOK YOUR OFFICIAL CONSULTATION TODAY"
    };

    // Render 1:1 Vertical
    const svg1x1Uri = server.generateBannerSVG({ ...sampleData, format: 'vertical' });
    const svg1x1Buf = Buffer.from(svg1x1Uri.replace(/^data:image\/svg\+xml;base64,/, ''), 'base64');
    fs.writeFileSync(path.join(__dirname, 'proof_1x1_vertical.svg'), svg1x1Buf);
    console.log("Saved proof_1x1_vertical.svg");

    // Render 9:16 Story
    const svgStoryUri = server.generateBannerSVG({ ...sampleData, format: 'story' });
    const svgStoryBuf = Buffer.from(svgStoryUri.replace(/^data:image\/svg\+xml;base64,/, ''), 'base64');
    fs.writeFileSync(path.join(__dirname, 'proof_9x16_story.svg'), svgStoryBuf);
    console.log("Saved proof_9x16_story.svg");

    // Render 16:9 Landscape
    const svgLandUri = server.generateBannerSVG({ ...sampleData, format: 'landscape' });
    const svgLandBuf = Buffer.from(svgLandUri.replace(/^data:image\/svg\+xml;base64,/, ''), 'base64');
    fs.writeFileSync(path.join(__dirname, 'proof_16x9_landscape.svg'), svgLandBuf);
    console.log("Saved proof_16x9_landscape.svg");

    console.log("ALL 3 FORMATS GENERATED SUCCESSFULLY!");
  } catch (err) {
    console.error("Verification error:", err);
  }
})();
