const fs = require('fs');
const path = require('path');
const server = require('./server.js');

const ARTIFACT_DIR = path.join(__dirname, 'proof_svgs');
if (!fs.existsSync(ARTIFACT_DIR)) fs.mkdirSync(ARTIFACT_DIR, { recursive: true });

async function generateProofImages() {
  console.log("🎨 GENERATING PROOF IMAGES FOR VISUAL VERIFICATION...");

  const formats = ['vertical', 'story', 'landscape'];

  for (const fmt of formats) {
    const svgUri = server.generateBannerSVG({
      title: "MOBILITÉ FRANCOPHONE WORK PERMIT WITHOUT LMIA FRENCH",
      subtitle: "Regulated RCIC Legal Guidance & Application Support Across Canada",
      badgeText: "MOBILITÉ FRANCOPHONE PR",
      b1: "Mobilité Francophone work permit without LMIA for French speakers",
      b2: "Employer job offer & Provincial Nomination (PNP) assessment",
      b3: "Spouse Open Work Permit (SOWP) eligibility included",
      b4: "Complete legal representation by licensed RCIC consultants",
      showQrCode: true,
      qrTargetUrl: "https://bookings.travelbellsimmigration.com",
      showSocialProof: true,
      showBadge: true,
      showBullets: true,
      showFooter: true,
      trustBadge: "cicc",
      format: fmt
    });

    const base64Data = svgUri.replace(/^data:image\/svg\+xml;base64,/, '');
    const svgBuffer = Buffer.from(base64Data, 'base64');
    const outPath = path.join(ARTIFACT_DIR, `qr_proof_${fmt}.svg`);
    fs.writeFileSync(outPath, svgBuffer);
    console.log(` Saved ${fmt} proof SVG to: ${outPath}`);
  }

  console.log("✨ All proof SVGs generated successfully!");
}

generateProofImages();
