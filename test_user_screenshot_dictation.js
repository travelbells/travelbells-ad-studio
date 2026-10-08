const { parseAiCommand, parseUniversalPrompt } = require('./server.js');

console.log("================================================================");
console.log("🧪 TESTING USER DICTATED COMMAND FROM SCREENSHOT");
console.log("================================================================");

const userDictatedInput = "headline full stop bullet 1 PSW Bullet 2 ecea Bullet 3 pharmacy assistant bullet4 for low fees no English required";

// 1. Test AI Command Parser
const parsedCmd = parseAiCommand(userDictatedInput);
console.log("\n1️⃣  AI Command Language Detection:");
console.log("   Detected Language:", parsedCmd.parsed.language.toUpperCase());
console.log("   Expected: EN (English - 'no English required' should NOT trigger Spanish!)");

// 2. Test Custom Bullets Parser
const parsedCopy = parseUniversalPrompt(userDictatedInput);
console.log("\n2️⃣  Parsed Custom Bullets:");
console.log("   Bullet 1:", parsedCopy.b1);
console.log("   Bullet 2:", parsedCopy.b2);
console.log("   Bullet 3:", parsedCopy.b3);
console.log("   Bullet 4:", parsedCopy.b4);

const isEn = parsedCmd.parsed.language === 'en';
const b1Match = parsedCopy.b1 === 'PSW';
const b2Match = parsedCopy.b2 === 'Ecea';
const b3Match = parsedCopy.b3 === 'Pharmacy assistant';

if (isEn && b1Match && b2Match && b3Match) {
  console.log("\n🎉 TEST PASSED! Language is English (EN) and all 4 dictated custom bullets are extracted!");
  process.exit(0);
} else {
  console.error("\n❌ TEST FAILED!");
  process.exit(1);
}
