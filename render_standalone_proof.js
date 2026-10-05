const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

(async () => {
  try {
    const artifactDir = '/Users/user/.gemini/antigravity/brain/3327c370-dde2-4863-b079-2b1609643424';
    
    // Read html, css, js
    const htmlPath = path.join(__dirname, 'public', 'index.html');
    let htmlContent = fs.readFileSync(htmlPath, 'utf8');
    
    const cssContent = fs.readFileSync(path.join(__dirname, 'public', 'styles.css'), 'utf8');
    const jsContent = fs.readFileSync(path.join(__dirname, 'public', 'app.js'), 'utf8');
    
    htmlContent = htmlContent.replace('<link rel="stylesheet" href="styles.css">', `<style>${cssContent}</style>`);
    htmlContent = htmlContent.replace('<script src="app.js"></script>', `<script>${jsContent}</script>`);

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', `--user-data-dir=/tmp/chrome_data_${Date.now()}`]
    });

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
    console.log("All UI proofs captured!");
  } catch (err) {
    console.error("Error generating standalone proof:", err);
  }
})();
