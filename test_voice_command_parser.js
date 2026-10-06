const { parseAiCommand } = require('./server.js');

async function runVoiceCommandParserTests() {
  console.log("================================================================");
  console.log("🧪 TESTING AI VOICE & TEXT NATURAL LANGUAGE COMMAND PARSER");
  console.log("================================================================");

  const testCommands = [
    {
      input: "Generate a Punjabi ad for Brampton students whose PGWP is expiring and publish to Facebook",
      expectedLang: "pa",
      expectedCategory: "students",
      expectedRegion: "brampton",
      expectedPublish: true
    },
    {
      input: "Create a Hindi ad for Calgary tech workers on AAIP stream",
      expectedLang: "hi",
      expectedCategory: "workers",
      expectedRegion: "calgary",
      expectedPublish: false
    },
    {
      input: "Make a Tagalog creative for Manila skilled workers with Express Entry PR and dispatch",
      expectedLang: "tl",
      expectedCategory: "workers",
      expectedRegion: "brampton",
      expectedPublish: true
    },
    {
      input: "Spanish ad for Surrey trades family sponsorship post to social media",
      expectedLang: "es",
      expectedCategory: "family",
      expectedRegion: "surrey",
      expectedPublish: true
    },
    {
      input: "French ad for Montreal francophone pilot project",
      expectedLang: "fr",
      expectedCategory: "workers",
      expectedRegion: "montreal",
      expectedPublish: false
    }
  ];

  let passed = 0;

  for (const tc of testCommands) {
    const data = parseAiCommand(tc.input);

    if (data.success && data.parsed) {
      const p = data.parsed;
      const langOk = p.language === tc.expectedLang;
      const catOk = p.category === tc.expectedCategory;
      const regOk = p.region === tc.expectedRegion;
      const pubOk = p.autoPublish === tc.expectedPublish;

      if (langOk && catOk && regOk && pubOk) {
        console.log(`✅ PASS: "${tc.input.substring(0, 45)}..." -> Lang: ${p.language.toUpperCase()}, Cat: ${p.category}, Region: ${p.region}, Publish: ${p.autoPublish}`);
        passed++;
      } else {
        console.log(`❌ FAIL: "${tc.input}" -> Got: Lang=${p.language}, Cat=${p.category}, Region=${p.region}, Pub=${p.autoPublish}`);
      }
    } else {
      console.log(`❌ FAIL: Invalid response for "${tc.input}"`);
    }
  }

  console.log("================================================================");
  console.log(`📊 AI COMMAND PARSER TEST RESULT: ${passed}/${testCommands.length} PASSED`);
  console.log("================================================================");
  if (passed !== testCommands.length) {
    process.exit(1);
  }
}

runVoiceCommandParserTests();
