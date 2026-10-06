const fs = require('fs');
const path = require('path');

const srcDir = __dirname;
const targetDir = '/Users/user/.gemini/antigravity/brain/3327c370-dde2-4863-b079-2b1609643424';

const files = ['punjabi_creative_proof.svg', 'hindi_creative_proof.svg', 'arabic_creative_proof.svg'];

for (const f of files) {
  const src = path.join(srcDir, f);
  const dest = path.join(targetDir, f);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`Copied ${f} to artifacts directory!`);
  }
}
