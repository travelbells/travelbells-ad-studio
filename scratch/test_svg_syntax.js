const fs = require('fs');
const vm = require('vm');

const serverCode = fs.readFileSync('server.js', 'utf-8');

const sandbox = { console, Buffer, Map, fetch: global.fetch, require, module, exports, process, __dirname, setTimeout, clearTimeout };
vm.createContext(sandbox);

vm.runInContext(serverCode, sandbox);

const svgDataUri = sandbox.generateBannerSVG({
  title: "Work Permit Ending? Don't Exit, Upgrade",
  subtitle: "Your time in Canada doesn't have to stop here",
  badgeText: "STUDY VISA UPGRADE",
  format: "story",
  theme: "travelbells-signature-light"
});

console.log("SVG Data URI Start:", svgDataUri.substring(0, 100));

const rawSvg = Buffer.from(svgDataUri.replace('data:image/svg+xml;base64,', ''), 'base64').toString('utf-8');
fs.writeFileSync('scratch/test_out_story.svg', rawSvg);
console.log("Wrote raw SVG to scratch/test_out_story.svg, length:", rawSvg.length);
