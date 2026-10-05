const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

(async () => {
  try {
    console.log("Exporting high-resolution PNG & SVG samples for all 3 formats...");
    const scratchDir = __dirname;
    const artifactDir = '/Users/user/.gemini/antigravity/brain/3327c370-dde2-4863-b079-2b1609643424';

    const formats = [
      { name: '1x1_square', fileSvg: 'proof_1x1_vertical.svg', width: 1080, height: 1080 },
      { name: '9x16_story', fileSvg: 'proof_9x16_story.svg', width: 1080, height: 1920 },
      { name: '16x9_landscape', fileSvg: 'proof_16x9_landscape.svg', width: 1200, height: 630 }
    ];

    const browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        `--user-data-dir=/tmp/puppeteer_export_${Date.now()}`
      ]
    });

    for (const fmt of formats) {
      const svgPath = path.join(scratchDir, fmt.fileSvg);
      const svgContent = fs.readFileSync(svgPath, 'utf8');

      // Save SVG directly to artifact folder
      const artifactSvgPath = path.join(artifactDir, `creative_sample_${fmt.name}.svg`);
      fs.writeFileSync(artifactSvgPath, svgContent);
      console.log(`Saved ${artifactSvgPath}`);

      // Convert SVG to high-res PNG
      const page = await browser.newPage();
      await page.setViewport({ width: fmt.width, height: fmt.height, deviceScaleFactor: 2 });
      const svgDataUri = 'data:image/svg+xml;base64,' + Buffer.from(svgContent).toString('base64');
      await page.goto(svgDataUri);

      const artifactPngPath = path.join(artifactDir, `creative_sample_${fmt.name}.png`);
      await page.screenshot({ path: artifactPngPath });
      console.log(`Saved ${artifactPngPath}`);
      await page.close();
    }

    await browser.close();
    console.log("ALL 3 CREATIVE SAMPLES EXPORTED SUCCESSFULLY!");
  } catch (err) {
    console.error("Export error:", err);
  }
})();
