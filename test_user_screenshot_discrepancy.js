const { parseUniversalPrompt } = require('./server.js');

console.log("================================================================");
console.log("🧪 TESTING USER SCREENSHOT DISCREPANCY PARSER");
console.log("================================================================");

const inputFromScreenshot = "create a image for headline shorter courses bullet one DSW bullet to ECE bullet 3 pharmacy assistant bullet for low fees no English";

const result = parseUniversalPrompt(inputFromScreenshot);

console.log("\nParsed Result:");
console.log("  Title:", result.title);
console.log("  Badge:", result.badge);
console.log("  Bullet 1:", result.b1);
console.log("  Bullet 2:", result.b2);
console.log("  Bullet 3:", result.b3);
console.log("  Bullet 4:", result.b4);

// Assertions:
// 1. Title should NOT contain "CREATE A IMAGE HEADLINE"
const noFillerTitle = !result.title.includes('CREATE') && !result.title.includes('IMAGE');

// 2. Badge should NOT contain "CREATE A IMAGE HEADLINE SHORTER PR"
const cleanBadge = !result.badge.includes('CREATE') && !result.badge.includes('IMAGE');

// 3. Bullets should be extracted cleanly
const b1Ok = result.b1.toLowerCase().includes('dsw');
const b2Ok = result.b2.toLowerCase().includes('ece');
const b3Ok = result.b3.toLowerCase().includes('pharmacy');

console.log("\nCheck Results:");
console.log("  Clean Title (no conversational filler):", noFillerTitle ? "✅ PASS" : "❌ FAIL");
console.log("  Clean Badge (no filler words):", cleanBadge ? "✅ PASS" : "❌ FAIL");
console.log("  Bullet 1 is DSW:", b1Ok ? "✅ PASS" : "❌ FAIL");
console.log("  Bullet 2 is ECE:", b2Ok ? "✅ PASS" : "❌ FAIL");
console.log("  Bullet 3 is Pharmacy Assistant:", b3Ok ? "✅ PASS" : "❌ FAIL");

if (noFillerTitle && cleanBadge && b1Ok && b2Ok && b3Ok) {
  console.log("\n🎉 ALL DISCREPANCIES SOLVED SUCCESSFULLY!");
  process.exit(0);
} else {
  console.error("\n❌ DISCREPANCY TEST FAILED!");
  process.exit(1);
}
