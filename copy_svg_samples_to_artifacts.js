const fs = require('fs');
const path = require('path');

const scratchDir = __dirname;
const artifactDir = '/Users/user/.gemini/antigravity/brain/3327c370-dde2-4863-b079-2b1609643424';

const files = [
  { src: 'proof_1x1_vertical.svg', dest: 'creative_sample_1x1_square.svg' },
  { src: 'proof_9x16_story.svg', dest: 'creative_sample_9x16_story.svg' },
  { src: 'proof_16x9_landscape.svg', dest: 'creative_sample_16x9_landscape.svg' }
];

for (const f of files) {
  const srcPath = path.join(scratchDir, f.src);
  const destPath = path.join(artifactDir, f.dest);
  if (fs.existsSync(srcPath)) {
    try {
      fs.copyFileSync(srcPath, destPath);
      console.log(`Successfully copied ${f.src} to ${destPath}`);
    } catch (e) {
      console.error(`Copy error for ${f.src}:`, e.message);
    }
  }
}
