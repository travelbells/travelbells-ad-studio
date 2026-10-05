const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const server = require('./server.js');

(async () => {
  try {
    console.log("Generating final creative proof...");
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

    const svgDataUri = server.renderSvgTemplate ? server.renderSvgTemplate(sampleData, 'vertical') : null;
    
    const artifactDir = '/Users/user/.gemini/antigravity/brain/3327c370-dde2-4863-b079-2b1609643424';
    
    const browser = await puppeteer.launch({
      headless: true,
      userDataDir: `/tmp/puppeteer_proof_${Date.now()}`,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    if (svgDataUri) {
      const page = await browser.newPage();
      await page.setViewport({ width: 1080, height: 1080, deviceScaleFactor: 2 });
      await page.goto(svgDataUri);
      const graphicPath = path.join(artifactDir, 'final_creative_graphic_proof.png');
      await page.screenshot({ path: graphicPath });
      console.log("Saved final_creative_graphic_proof.png");
      await page.close();
    }

    const htmlPath = path.join(__dirname, 'public', 'index.html');
    let htmlContent = fs.readFileSync(htmlPath, 'utf8');
    
    const cssContent = fs.readFileSync(path.join(__dirname, 'public', 'index.css'), 'utf8');
    const jsContent = fs.readFileSync(path.join(__dirname, 'public', 'app.js'), 'utf8');
    
    htmlContent = htmlContent.replace('<link rel="stylesheet" href="index.css">', `<style>${cssContent}</style>`);
    htmlContent = htmlContent.replace('<script src="app.js"></script>', `<script>${jsContent}</script>`);

    const uiPage = await browser.newPage();
    await uiPage.setViewport({ width: 1400, height: 1200, deviceScaleFactor: 2 });
    await uiPage.setContent(htmlContent);

    const uiPath = path.join(artifactDir, 'bullet_editor_live_proof.png');
    await uiPage.screenshot({ path: uiPath, fullPage: true });
    console.log("Saved bullet_editor_live_proof.png");

    await uiPage.evaluate(() => {
      if (typeof openDirectPublishModal === 'function') openDirectPublishModal();
    });
    await new Promise(r => setTimeout(r, 600));
    
    const modalPath = path.join(artifactDir, 'direct_publisher_modal_proof.png');
    await uiPage.screenshot({ path: modalPath });
    console.log("Saved direct_publisher_modal_proof.png");

    await browser.close();
    console.log("All proofs generated successfully!");
  } catch (err) {
    console.error("Error generating proof:", err);
  }
})();
